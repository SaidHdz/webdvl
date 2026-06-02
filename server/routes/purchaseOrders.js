/**
 * Purchase orders routes (SCM module).
 *
 * A purchase order records what we buy FROM a supplier (a restock). Receiving a
 * purchase order increments the corresponding inventory stock in a transaction,
 * so the supplier history reflects exactly what they have sold us and the stock
 * stays consistent.
 */

import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requirePermission('scm'));

/**
 * Loads the line items of a purchase order joined with product names.
 * @param {number} poId
 */
const itemsForPO = (poId) => db.prepare(`
    SELECT poi.id, poi.id_producto, poi.cantidad, poi.costo_unitario, p.name AS product_name
    FROM purchase_order_items poi
    LEFT JOIN products p ON p.id = poi.product_id
    WHERE poi.purchase_order_id = ?
`).all(poId);

/**
 * POST /api/purchase-orders
 * Body: { supplier_id, notas, items: [{ id_producto, cantidad, costo_unitario }] }
 * Creates a 'Solicitado' purchase order. Stock is only affected on receipt.
 */
router.post('/', (req, res) => {
    const { supplier_id, notas, items, receive } = req.body || {};

    const supplier = db.prepare('SELECT id FROM suppliers WHERE id = ?').get(supplier_id);
    if (!supplier) return res.status(400).json({ success: false, message: 'Proveedor invalido' });

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Agrega al menos un producto' });
    }

    // Resolve and validate each line against the catalog.
    const resolved = [];
    for (const line of items) {
        const cantidad = Number(line.cantidad) || 0;
        const costo = Number(line.costo_unitario) || 0;
        if (cantidad <= 0) {
            return res.status(400).json({ success: false, message: 'Cantidad invalida en una linea' });
        }
        const product = db.prepare('SELECT id, id_producto FROM products WHERE id_producto = ?').get(line.id_producto);
        if (!product) {
            return res.status(400).json({ success: false, message: `Producto invalido: ${line.id_producto}` });
        }
        resolved.push({ product, cantidad, costo });
    }

    const total = resolved.reduce((sum, r) => sum + r.cantidad * r.costo, 0);

    // receive=true creates the order already received, applying the stock in the
    // same transaction. Used by the inventory quick-restock flow.
    const estado = receive ? 'Recibido' : 'Solicitado';

    const create = db.transaction(() => {
        const info = db.prepare(`
            INSERT INTO purchase_orders (folio, supplier_id, estado, total, notas, created_by, received_at)
            VALUES ('PENDING', ?, ?, ?, ?, ?, ${receive ? "datetime('now')" : 'NULL'})
        `).run(supplier_id, estado, total, notas?.trim() || null, req.user.id);
        const poId = info.lastInsertRowid;
        db.prepare('UPDATE purchase_orders SET folio = ? WHERE id = ?').run(`OC-${1000 + Number(poId)}`, poId);

        const insertItem = db.prepare(`
            INSERT INTO purchase_order_items (purchase_order_id, product_id, id_producto, cantidad, costo_unitario)
            VALUES (?, ?, ?, ?, ?)
        `);
        const addStock = db.prepare("UPDATE inventory SET stock_actual = stock_actual + ?, updated_at = datetime('now') WHERE product_id = ?");
        for (const r of resolved) {
            insertItem.run(poId, r.product.id, r.product.id_producto, r.cantidad, r.costo);
            if (receive) addStock.run(r.cantidad, r.product.id);
        }
        return poId;
    });

    const poId = create();
    const po = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(poId);
    res.status(201).json({ success: true, data: { ...po, items: itemsForPO(poId) } });
});

/**
 * PUT /api/purchase-orders/:id/receive
 * Marks a purchase order as received and adds the ordered quantities to stock.
 */
router.put('/:id/receive', (req, res) => {
    const po = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(req.params.id);
    if (!po) return res.status(404).json({ success: false, message: 'Orden de compra no encontrada' });
    if (po.estado !== 'Solicitado') {
        return res.status(409).json({ success: false, message: `La orden ya esta ${po.estado}` });
    }

    const receive = db.transaction(() => {
        db.prepare("UPDATE purchase_orders SET estado = 'Recibido', received_at = datetime('now') WHERE id = ?").run(po.id);
        const items = db.prepare('SELECT product_id, cantidad FROM purchase_order_items WHERE purchase_order_id = ?').all(po.id);
        const addStock = db.prepare('UPDATE inventory SET stock_actual = stock_actual + ?, updated_at = datetime(\'now\') WHERE product_id = ?');
        for (const it of items) {
            if (it.product_id) addStock.run(it.cantidad, it.product_id);
        }
    });
    receive();

    const updated = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(po.id);
    res.json({ success: true, data: { ...updated, items: itemsForPO(po.id) } });
});

/** PUT /api/purchase-orders/:id/cancel - cancel a still-open purchase order. */
router.put('/:id/cancel', (req, res) => {
    const po = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(req.params.id);
    if (!po) return res.status(404).json({ success: false, message: 'Orden de compra no encontrada' });
    if (po.estado !== 'Solicitado') {
        return res.status(409).json({ success: false, message: `La orden ya esta ${po.estado}` });
    }
    db.prepare("UPDATE purchase_orders SET estado = 'Cancelado' WHERE id = ?").run(po.id);
    const updated = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(po.id);
    res.json({ success: true, data: { ...updated, items: itemsForPO(po.id) } });
});

export default router;
