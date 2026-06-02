/**
 * Inventory routes (SCM module).
 *
 * Exposes stock levels joined with product and supplier data, and lets the SCM
 * team adjust stock, reorder thresholds and the default supplier.
 */

import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requirePermission('scm'));

const SELECT_INVENTORY = `
    SELECT i.id, i.product_id, i.stock_actual, i.stock_minimo, i.supplier_id, i.updated_at,
           p.id_producto, p.name, p.category,
           s.nombre_taller AS supplier_name, s.correo AS supplier_email
    FROM inventory i
    JOIN products p ON p.id = i.product_id
    LEFT JOIN suppliers s ON s.id = i.supplier_id
`;

const toInventory = (row) => ({
    id: row.id,
    product_id: row.product_id,
    id_producto: row.id_producto,
    name: row.name,
    category: row.category,
    stock_actual: row.stock_actual,
    stock_minimo: row.stock_minimo,
    supplier_id: row.supplier_id,
    supplier_name: row.supplier_name,
    supplier_email: row.supplier_email,
    is_low: row.stock_actual <= row.stock_minimo,
    updated_at: row.updated_at,
});

/** GET /api/inventory?lowOnly=1&search= */
router.get('/', (req, res) => {
    const { lowOnly, search } = req.query;
    const clauses = [];
    const params = [];

    if (search) {
        clauses.push('(p.name LIKE ? OR p.id_producto LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
    }
    if (lowOnly === '1') clauses.push('i.stock_actual <= i.stock_minimo');

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const rows = db.prepare(`${SELECT_INVENTORY} ${where} ORDER BY (i.stock_actual <= i.stock_minimo) DESC, p.name`).all(...params);
    res.json({ success: true, data: rows.map(toInventory) });
});

/** PUT /api/inventory/:id - adjust stock, threshold and supplier. */
router.put('/:id', (req, res) => {
    const inv = db.prepare('SELECT * FROM inventory WHERE id = ?').get(req.params.id);
    if (!inv) return res.status(404).json({ success: false, message: 'Registro de inventario no encontrado' });

    const { stock_actual, stock_minimo, supplier_id } = req.body || {};
    const nextStock = stock_actual === undefined ? inv.stock_actual : Number(stock_actual);
    const nextMin = stock_minimo === undefined ? inv.stock_minimo : Number(stock_minimo);

    if (Number.isNaN(nextStock) || nextStock < 0) {
        return res.status(400).json({ success: false, message: 'Stock actual invalido' });
    }
    if (Number.isNaN(nextMin) || nextMin < 0) {
        return res.status(400).json({ success: false, message: 'Stock minimo invalido' });
    }
    if (supplier_id) {
        const supplier = db.prepare('SELECT id FROM suppliers WHERE id = ?').get(supplier_id);
        if (!supplier) return res.status(400).json({ success: false, message: 'Proveedor invalido' });
    }

    db.prepare(`
        UPDATE inventory SET stock_actual = ?, stock_minimo = ?, supplier_id = ?, updated_at = datetime('now')
        WHERE id = ?
    `).run(nextStock, nextMin, supplier_id || null, inv.id);

    const row = db.prepare(`${SELECT_INVENTORY} WHERE i.id = ?`).get(inv.id);
    res.json({ success: true, data: toInventory(row) });
});

export default router;
