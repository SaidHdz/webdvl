/**
 * Suppliers routes (SCM module).
 *
 * Standard CRUD plus a history endpoint (products supplied + messages sent) and
 * a messaging endpoint. Messages are simulated: persisted in supplier_messages
 * and surfaced in the supplier history, with no external delivery.
 */

import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requirePermission('scm'));

/** GET /api/suppliers?search= */
router.get('/', (req, res) => {
    const { search } = req.query;
    let rows;
    if (search) {
        rows = db.prepare(`
            SELECT * FROM suppliers
            WHERE nombre_taller LIKE ? OR contacto LIKE ? OR insumo LIKE ?
            ORDER BY nombre_taller
        `).all(`%${search}%`, `%${search}%`, `%${search}%`);
    } else {
        rows = db.prepare('SELECT * FROM suppliers ORDER BY nombre_taller').all();
    }
    res.json({ success: true, data: rows });
});

/** GET /api/suppliers/:id */
router.get('/:id', (req, res) => {
    const row = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
    res.json({ success: true, data: row });
});

/**
 * GET /api/suppliers/:id/history
 * Aggregates everything known about a supplier: the products it supplies (with
 * current stock) and the chronological list of messages sent to it.
 */
router.get('/:id/history', (req, res) => {
    const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });

    const products = db.prepare(`
        SELECT p.id, p.id_producto, p.name, i.stock_actual, i.stock_minimo,
               (i.stock_actual <= i.stock_minimo) AS is_low
        FROM inventory i
        JOIN products p ON p.id = i.product_id
        WHERE i.supplier_id = ?
        ORDER BY p.name
    `).all(supplier.id);

    const messages = db.prepare(`
        SELECT m.id, m.asunto, m.mensaje, m.motivo, m.created_at,
               p.name AS product_name, u.name AS sent_by_name
        FROM supplier_messages m
        LEFT JOIN products p ON p.id = m.product_id
        LEFT JOIN users u ON u.id = m.sent_by
        WHERE m.supplier_id = ?
        ORDER BY m.created_at DESC
    `).all(supplier.id);

    // Purchase orders we have placed with this supplier (what we buy from them).
    const purchaseOrders = db.prepare(`
        SELECT po.id, po.folio, po.estado, po.total, po.notas, po.created_at, po.received_at,
               u.name AS created_by_name
        FROM purchase_orders po
        LEFT JOIN users u ON u.id = po.created_by
        WHERE po.supplier_id = ?
        ORDER BY po.created_at DESC
    `).all(supplier.id);

    const ordersWithItems = purchaseOrders.map((po) => ({
        ...po,
        items: db.prepare(`
            SELECT poi.id_producto, poi.cantidad, poi.costo_unitario, p.name AS product_name
            FROM purchase_order_items poi LEFT JOIN products p ON p.id = poi.product_id
            WHERE poi.purchase_order_id = ?
        `).all(po.id),
    }));

    // "Comprado" only counts received orders: what they have actually sold us.
    const totalComprado = purchaseOrders
        .filter((po) => po.estado === 'Recibido')
        .reduce((sum, po) => sum + po.total, 0);
    const unidadesCompradas = db.prepare(`
        SELECT COALESCE(SUM(poi.cantidad), 0) AS u
        FROM purchase_order_items poi
        JOIN purchase_orders po ON po.id = poi.purchase_order_id
        WHERE po.supplier_id = ? AND po.estado = 'Recibido'
    `).get(supplier.id).u;

    res.json({
        success: true,
        data: {
            supplier,
            products: products.map((p) => ({ ...p, is_low: Boolean(p.is_low) })),
            messages,
            purchase_orders: ordersWithItems,
            stats: {
                total_productos: products.length,
                productos_bajos: products.filter((p) => p.is_low).length,
                total_mensajes: messages.length,
                total_ordenes: purchaseOrders.length,
                total_comprado: totalComprado,
                unidades_compradas: unidadesCompradas,
            },
        },
    });
});

/** POST /api/suppliers/:id/messages - send (store) a manual message. */
router.post('/:id/messages', (req, res) => {
    const supplier = db.prepare('SELECT id FROM suppliers WHERE id = ?').get(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });

    const { asunto, mensaje, motivo, product_id } = req.body || {};
    if (!asunto || !asunto.trim()) return res.status(400).json({ success: false, message: 'Asunto requerido' });
    if (!mensaje || !mensaje.trim()) return res.status(400).json({ success: false, message: 'Mensaje requerido' });

    if (product_id) {
        const product = db.prepare('SELECT id FROM products WHERE id = ?').get(product_id);
        if (!product) return res.status(400).json({ success: false, message: 'Producto invalido' });
    }

    const info = db.prepare(`
        INSERT INTO supplier_messages (supplier_id, product_id, asunto, mensaje, motivo, sent_by)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(
        supplier.id, product_id || null, asunto.trim(), mensaje.trim(),
        motivo?.trim() || 'manual', req.user.id
    );

    const row = db.prepare('SELECT * FROM supplier_messages WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ success: true, data: row });
});

/** POST /api/suppliers - create a supplier. */
router.post('/', (req, res) => {
    const { nombre_taller, contacto, correo, telefono, insumo } = req.body || {};
    if (!nombre_taller || !nombre_taller.trim()) {
        return res.status(400).json({ success: false, message: 'Nombre del taller requerido' });
    }
    const info = db.prepare(`
        INSERT INTO suppliers (nombre_taller, contacto, correo, telefono, insumo)
        VALUES (?, ?, ?, ?, ?)
    `).run(
        nombre_taller.trim(), contacto?.trim() || null, correo?.trim() || null,
        telefono?.trim() || null, insumo?.trim() || null
    );
    const row = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ success: true, data: row });
});

/** PUT /api/suppliers/:id - update a supplier. */
router.put('/:id', (req, res) => {
    const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });

    const { nombre_taller, contacto, correo, telefono, insumo } = req.body || {};
    if (!nombre_taller || !nombre_taller.trim()) {
        return res.status(400).json({ success: false, message: 'Nombre del taller requerido' });
    }
    db.prepare(`
        UPDATE suppliers SET nombre_taller = ?, contacto = ?, correo = ?, telefono = ?, insumo = ?
        WHERE id = ?
    `).run(
        nombre_taller.trim(), contacto?.trim() || null, correo?.trim() || null,
        telefono?.trim() || null, insumo?.trim() || null, supplier.id
    );
    const row = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(supplier.id);
    res.json({ success: true, data: row });
});

/** DELETE /api/suppliers/:id - remove a supplier (inventory link set null). */
router.delete('/:id', (req, res) => {
    const supplier = db.prepare('SELECT id FROM suppliers WHERE id = ?').get(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
    db.prepare('DELETE FROM suppliers WHERE id = ?').run(supplier.id);
    res.json({ success: true });
});

export default router;
