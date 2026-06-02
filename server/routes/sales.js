/**
 * Sales analytics routes (CRM module).
 *
 * Provides aggregated sales for a selectable window: day (today), week (last 7
 * days) or month (last 30 days). Cancelled orders are excluded. Returns window
 * totals, a daily series for charting and the top-selling products.
 */

import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requirePermission('crm'));

// Maps a range key to the SQLite lower-bound expression for created_at.
const RANGE_BOUNDS = {
    day: "date('now')",
    week: "datetime('now', '-7 days')",
    month: "datetime('now', '-30 days')",
};

/**
 * GET /api/sales/summary?range=day|week|month
 * Returns totals, a per-day series and the top products for the window.
 */
router.get('/summary', (req, res) => {
    const range = ['day', 'week', 'month'].includes(req.query.range) ? req.query.range : 'week';
    const bound = RANGE_BOUNDS[range];

    const totals = db.prepare(`
        SELECT COALESCE(SUM(total), 0) AS total_ventas, COUNT(*) AS num_pedidos
        FROM orders
        WHERE estado != 'Cancelado' AND created_at >= ${bound}
    `).get();

    const series = db.prepare(`
        SELECT date(created_at) AS fecha, SUM(total) AS total, COUNT(*) AS pedidos
        FROM orders
        WHERE estado != 'Cancelado' AND created_at >= ${bound}
        GROUP BY date(created_at)
        ORDER BY fecha
    `).all();

    const topProducts = db.prepare(`
        SELECT oi.id_producto, COALESCE(p.name, oi.id_producto) AS name,
               SUM(oi.cantidad) AS unidades,
               SUM(oi.cantidad * oi.precio_unitario) AS ingresos
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        LEFT JOIN products p ON p.id = oi.product_id
        WHERE o.estado != 'Cancelado' AND o.created_at >= ${bound}
        GROUP BY oi.id_producto
        ORDER BY unidades DESC
        LIMIT 5
    `).all();

    const ticketPromedio = totals.num_pedidos > 0 ? totals.total_ventas / totals.num_pedidos : 0;

    res.json({
        success: true,
        data: {
            range,
            total_ventas: totals.total_ventas,
            num_pedidos: totals.num_pedidos,
            ticket_promedio: Math.round(ticketPromedio * 100) / 100,
            series,
            top_products: topProducts,
        },
    });
});

export default router;
