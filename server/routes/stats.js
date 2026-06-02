/**
 * Stats routes: aggregated metrics for dashboards.
 *
 * Kept generic and authenticated (any staff) since counts are not sensitive and
 * are reused across the ERP overview and other module headers.
 */

import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

/** GET /api/stats/overview - high level counters for the global dashboard. */
router.get('/overview', (_req, res) => {
    const totalClientes = db.prepare("SELECT COUNT(*) AS c FROM users WHERE type = 'customer'").get().c;
    const totalStaff = db.prepare("SELECT COUNT(*) AS c FROM users WHERE type = 'staff'").get().c;
    const totalProductos = db.prepare('SELECT COUNT(*) AS c FROM products WHERE active = 1').get().c;
    const totalInventario = db.prepare('SELECT COALESCE(SUM(stock_actual), 0) AS s FROM inventory').get().s;
    const totalPedidos = db.prepare('SELECT COUNT(*) AS c FROM orders').get().c;
    const alertasStock = db.prepare('SELECT COUNT(*) AS c FROM inventory WHERE stock_actual <= stock_minimo').get().c;
    const ventasMes = db.prepare(`
        SELECT COALESCE(SUM(total), 0) AS s FROM orders
        WHERE estado != 'Cancelado' AND created_at >= datetime('now', '-30 days')
    `).get().s;

    res.json({
        success: true,
        data: { totalClientes, totalStaff, totalProductos, totalInventario, totalPedidos, alertasStock, ventasMes },
    });
});

export default router;
