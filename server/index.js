/**
 * DVL Supply Co. - API server entry point.
 *
 * A small Express app backed by SQLite. It replaces the previous n8n webhooks
 * with a self-contained REST API. Routers are mounted by domain; module routers
 * (crm/scm/erp) are added in their respective phases.
 */

import express from 'express';
import cors from 'cors';

import { initSchema } from './db.js';
import authRoutes from './routes/auth.js';
import rolesRoutes from './routes/roles.js';
import usersRoutes from './routes/users.js';
import statsRoutes from './routes/stats.js';
import productsRoutes from './routes/products.js';
import inventoryRoutes from './routes/inventory.js';
import suppliersRoutes from './routes/suppliers.js';
import ordersRoutes from './routes/orders.js';
import clientsRoutes from './routes/clients.js';
import salesRoutes from './routes/sales.js';
import purchaseOrdersRoutes from './routes/purchaseOrders.js';

const PORT = process.env.PORT || 3001;

// Ensure the schema exists before serving any request.
initSchema();

const app = express();
app.use(cors());
app.use(express.json());

// Lightweight health check, handy to confirm the API is up.
app.get('/api/health', (_req, res) => res.json({ success: true, status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/purchase-orders', purchaseOrdersRoutes);

// Centralized fallback so unexpected errors return JSON, not HTML.
app.use((err, _req, res, _next) => {
    console.error('Unhandled API error:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

app.listen(PORT, () => {
    console.log(`API DVL escuchando en http://localhost:${PORT}`);
});
