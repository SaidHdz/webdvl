/**
 * Clients routes (CRM module).
 *
 * Customers are users with type = 'customer'. Purchase totals are aggregated
 * from their non-cancelled orders. The history endpoint returns the full order
 * timeline with line items for the integrated CRM/SCM view.
 */

import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requirePermission('crm'));

// Loyalty points are a simple derived metric: one point per $100 spent.
const POINTS_PER_PESO = 1 / 100;

/**
 * Shapes a client row, adding derived loyalty points.
 */
const toClient = (row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    status: row.status,
    created_at: row.created_at,
    total_compras: row.total_compras || 0,
    num_pedidos: row.num_pedidos || 0,
    puntos_lealtad: Math.floor((row.total_compras || 0) * POINTS_PER_PESO),
});

const SELECT_CLIENTS = `
    SELECT u.id, u.name, u.email, u.status, u.created_at,
           COALESCE(SUM(CASE WHEN o.estado != 'Cancelado' THEN o.total END), 0) AS total_compras,
           COUNT(DISTINCT CASE WHEN o.estado != 'Cancelado' THEN o.id END) AS num_pedidos
    FROM users u
    LEFT JOIN orders o ON o.user_id = u.id
    WHERE u.type = 'customer'
`;

/** GET /api/clients?search= */
router.get('/', (req, res) => {
    const { search } = req.query;
    let rows;
    if (search) {
        rows = db.prepare(`
            ${SELECT_CLIENTS} AND (u.name LIKE ? OR u.email LIKE ?)
            GROUP BY u.id ORDER BY total_compras DESC
        `).all(`%${search}%`, `%${search}%`);
    } else {
        rows = db.prepare(`${SELECT_CLIENTS} GROUP BY u.id ORDER BY total_compras DESC`).all();
    }
    res.json({ success: true, data: rows.map(toClient) });
});

/** GET /api/clients/:id/history - client profile with full order detail. */
router.get('/:id/history', (req, res) => {
    const row = db.prepare(`${SELECT_CLIENTS} AND u.id = ? GROUP BY u.id`).get(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Cliente no encontrado' });

    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(row.id);
    const withItems = orders.map((o) => ({
        ...o,
        items: db.prepare(`
            SELECT oi.id_producto, oi.cantidad, oi.precio_unitario, p.name AS product_name
            FROM order_items oi LEFT JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = ?
        `).all(o.id),
    }));

    res.json({ success: true, data: { client: toClient(row), orders: withItems } });
});

export default router;
