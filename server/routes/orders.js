/**
 * Orders routes.
 *
 * Reads are shared by SCM (logistics/shipping) and CRM (sales/history), so they
 * are gated by "any of scm/crm". Status changes belong to SCM logistics. Order
 * creation (storefront checkout) is added in Phase 6.
 */

import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requirePermission, requireAnyPermission } from '../middleware/auth.js';

const router = Router();

const VALID_STATES = ['Pendiente', 'Enviado', 'Entregado', 'Cancelado'];

// Flat shipping fee applied to national orders, mirrored on the storefront.
const NATIONAL_SHIPPING_FEE = 150;

/**
 * Loads the line items for an order.
 * @param {number} orderId
 * @returns {Array} The order items joined with product names.
 */
const itemsForOrder = (orderId) => db.prepare(`
    SELECT oi.id, oi.id_producto, oi.cantidad, oi.precio_unitario, p.name AS product_name
    FROM order_items oi
    LEFT JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
`).all(orderId);

/**
 * POST /api/orders - storefront checkout.
 *
 * Available to any authenticated user (customers). Validates stock and prices
 * server-side and decrements inventory atomically: if any line lacks stock the
 * whole transaction rolls back so an order never oversells.
 */
router.post('/', requireAuth, (req, res) => {
    const { items, tipo_envio, direccion, punto_entrega, nombre, telefono } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: 'El carrito esta vacio' });
    }

    // Resolve each line against the catalog + stock before touching anything.
    const resolved = [];
    const insufficient = [];
    for (const line of items) {
        const cantidad = Number(line.cantidad) || 0;
        if (cantidad <= 0) continue;

        const row = db.prepare(`
            SELECT p.id, p.id_producto, p.name, p.price, p.active, i.stock_actual
            FROM products p LEFT JOIN inventory i ON i.product_id = p.id
            WHERE p.id_producto = ?
        `).get(line.id_producto);

        if (!row || !row.active) {
            return res.status(400).json({ success: false, message: `Producto no disponible: ${line.id_producto}` });
        }
        if ((row.stock_actual ?? 0) < cantidad) {
            insufficient.push({ id_producto: row.id_producto, name: row.name, disponible: row.stock_actual ?? 0, solicitado: cantidad });
            continue;
        }
        resolved.push({ ...row, cantidad });
    }

    if (insufficient.length > 0) {
        return res.status(409).json({
            success: false,
            message: 'Stock insuficiente para algunos productos',
            insufficient,
        });
    }
    if (resolved.length === 0) {
        return res.status(400).json({ success: false, message: 'No hay productos validos en el carrito' });
    }

    const subtotal = resolved.reduce((sum, r) => sum + r.price * r.cantidad, 0);
    const shipping = tipo_envio === 'Nacional' ? NATIONAL_SHIPPING_FEE : 0;
    const total = subtotal + shipping;

    const create = db.transaction(() => {
        const info = db.prepare(`
            INSERT INTO orders (id_pedido, user_id, id_cliente, nombre, telefono, total, estado, tipo_envio, direccion, punto_entrega)
            VALUES ('PENDING', ?, ?, ?, ?, ?, 'Pendiente', ?, ?, ?)
        `).run(
            req.user.id, req.user.email,
            nombre?.trim() || req.user.name, telefono?.trim() || null,
            total, tipo_envio || 'Local', direccion?.trim() || null, punto_entrega?.trim() || null
        );
        const orderId = info.lastInsertRowid;

        // Human-friendly order number derived from the row id.
        const idPedido = `ORD-${1000 + Number(orderId)}`;
        db.prepare('UPDATE orders SET id_pedido = ? WHERE id = ?').run(idPedido, orderId);

        const insertItem = db.prepare(`
            INSERT INTO order_items (order_id, product_id, id_producto, cantidad, precio_unitario)
            VALUES (?, ?, ?, ?, ?)
        `);
        const decrement = db.prepare('UPDATE inventory SET stock_actual = stock_actual - ? WHERE product_id = ?');
        for (const r of resolved) {
            insertItem.run(orderId, r.id, r.id_producto, r.cantidad, r.price);
            decrement.run(r.cantidad, r.id);
        }
        return orderId;
    });

    const orderId = create();
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    res.status(201).json({ success: true, data: { ...order, items: itemsForOrder(orderId) } });
});

router.use(requireAuth, requireAnyPermission(['scm', 'crm']));

/**
 * GET /api/orders
 * Query: estado, search (id_pedido/cliente), from, to (ISO dates).
 */
router.get('/', (req, res) => {
    const { estado, search, from, to } = req.query;
    const clauses = [];
    const params = [];

    if (estado && VALID_STATES.includes(estado)) {
        clauses.push('estado = ?');
        params.push(estado);
    }
    if (search) {
        clauses.push('(id_pedido LIKE ? OR id_cliente LIKE ? OR nombre LIKE ?)');
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (from) {
        clauses.push('created_at >= ?');
        params.push(from);
    }
    if (to) {
        clauses.push('created_at <= ?');
        params.push(to);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const orders = db.prepare(`SELECT * FROM orders ${where} ORDER BY created_at DESC`).all(...params);
    const withItems = orders.map((o) => ({ ...o, items: itemsForOrder(o.id) }));
    res.json({ success: true, data: withItems });
});

/** GET /api/orders/:id - full order detail. */
router.get('/:id', (req, res) => {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    res.json({ success: true, data: { ...order, items: itemsForOrder(order.id) } });
});

/** PUT /api/orders/:id/status - SCM logistics state transition. */
router.put('/:id/status', requirePermission('scm'), (req, res) => {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Pedido no encontrado' });

    const { estado } = req.body || {};
    if (!VALID_STATES.includes(estado)) {
        return res.status(400).json({ success: false, message: 'Estado invalido' });
    }

    db.prepare('UPDATE orders SET estado = ? WHERE id = ?').run(estado, order.id);
    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(order.id);
    res.json({ success: true, data: { ...updated, items: itemsForOrder(updated.id) } });
});

export default router;
