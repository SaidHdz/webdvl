/**
 * Products routes (catalog).
 *
 * Reads are public so the storefront can list the catalog with live stock.
 * Writes (create/update/delete) belong to the SCM module. Creating a product
 * also creates its inventory row so stock is always tracked.
 */

import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';

const router = Router();

/**
 * Maps a joined product row into the API shape, parsing the images JSON and
 * exposing stock and a low-stock flag.
 */
const toProduct = (row) => ({
    id: row.id,
    id_producto: row.id_producto,
    name: row.name,
    price: row.price,
    description: row.description,
    category: row.category,
    images: row.images ? JSON.parse(row.images) : {},
    active: Boolean(row.active),
    stock_actual: row.stock_actual ?? 0,
    stock_minimo: row.stock_minimo ?? 0,
    supplier_id: row.supplier_id ?? null,
    is_low: (row.stock_actual ?? 0) <= (row.stock_minimo ?? 0),
});

const SELECT_PRODUCTS = `
    SELECT p.*, i.stock_actual, i.stock_minimo, i.supplier_id
    FROM products p
    LEFT JOIN inventory i ON i.product_id = p.id
`;

/**
 * GET /api/products - public catalog.
 * Query: includeInactive=1 (SCM use), search, category, inStock=1.
 */
router.get('/', (req, res) => {
    const { includeInactive, search, category, inStock } = req.query;
    const clauses = [];
    const params = [];

    if (includeInactive !== '1') clauses.push('p.active = 1');
    if (search) {
        clauses.push('(p.name LIKE ? OR p.id_producto LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
        clauses.push('p.category = ?');
        params.push(category);
    }
    if (inStock === '1') clauses.push('i.stock_actual > 0');

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const rows = db.prepare(`${SELECT_PRODUCTS} ${where} ORDER BY p.id`).all(...params);
    res.json({ success: true, data: rows.map(toProduct) });
});

/** GET /api/products/:id - public single product. */
router.get('/:id', (req, res) => {
    const row = db.prepare(`${SELECT_PRODUCTS} WHERE p.id = ?`).get(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    res.json({ success: true, data: toProduct(row) });
});

// --- Write operations require the SCM module ----------------------------------
router.use(requireAuth, requirePermission('scm'));

/** POST /api/products - create a product and its inventory row. */
router.post('/', (req, res) => {
    const { id_producto, name, price, description, category, images, stock_actual, stock_minimo, supplier_id } = req.body || {};

    if (!id_producto || !id_producto.trim()) {
        return res.status(400).json({ success: false, message: 'SKU (id_producto) requerido' });
    }
    if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Nombre requerido' });
    }
    if (price === undefined || Number(price) < 0) {
        return res.status(400).json({ success: false, message: 'Precio invalido' });
    }

    const exists = db.prepare('SELECT id FROM products WHERE id_producto = ?').get(id_producto.trim());
    if (exists) return res.status(409).json({ success: false, message: 'Ya existe un producto con ese SKU' });

    const create = db.transaction(() => {
        const info = db.prepare(`
            INSERT INTO products (id_producto, name, price, description, category, images, active)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        `).run(
            id_producto.trim(), name.trim(), Number(price),
            description?.trim() || null, category?.trim() || null,
            JSON.stringify(images || {})
        );
        db.prepare(`
            INSERT INTO inventory (product_id, stock_actual, stock_minimo, supplier_id)
            VALUES (?, ?, ?, ?)
        `).run(info.lastInsertRowid, Number(stock_actual) || 0, Number(stock_minimo) || 5, supplier_id || null);
        return info.lastInsertRowid;
    });

    const id = create();
    const row = db.prepare(`${SELECT_PRODUCTS} WHERE p.id = ?`).get(id);
    res.status(201).json({ success: true, data: toProduct(row) });
});

/** PUT /api/products/:id - update catalog fields (not stock). */
router.put('/:id', (req, res) => {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

    const { name, price, description, category, images, active } = req.body || {};
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Nombre requerido' });
    if (price === undefined || Number(price) < 0) return res.status(400).json({ success: false, message: 'Precio invalido' });

    db.prepare(`
        UPDATE products SET name = ?, price = ?, description = ?, category = ?, images = ?, active = ?
        WHERE id = ?
    `).run(
        name.trim(), Number(price), description?.trim() || null, category?.trim() || null,
        JSON.stringify(images || JSON.parse(product.images || '{}')),
        active === false ? 0 : 1, product.id
    );

    const row = db.prepare(`${SELECT_PRODUCTS} WHERE p.id = ?`).get(product.id);
    res.json({ success: true, data: toProduct(row) });
});

/** DELETE /api/products/:id - remove a product (inventory cascades). */
router.delete('/:id', (req, res) => {
    const product = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    db.prepare('DELETE FROM products WHERE id = ?').run(product.id);
    res.json({ success: true });
});

export default router;
