/**
 * Authentication routes: register (customers), login and session info.
 *
 * The token returned here is consumed by the frontend AuthContext and sent as
 * a Bearer header on every subsequent request.
 */

import { Router } from 'express';
import db from '../db.js';
import { hashPassword, verifyPassword, signToken } from '../auth.js';
import { requireAuth, getHydratedUser } from '../middleware/auth.js';

const router = Router();

/**
 * Shapes a user row plus permissions into the public payload sent to the client.
 * Never includes the password hash.
 * @param {Object} user - A hydrated user from getHydratedUser.
 * @returns {Object} The safe public user object.
 */
const toPublicUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    type: user.type,
    role: user.role,
    role_id: user.role_id,
    permissions: user.permissions
});

/**
 * POST /api/auth/register
 * Registers a storefront customer. Staff accounts are created from the ERP.
 */
router.post('/register', (req, res) => {
    const { nombre, name, email, password } = req.body || {};
    const finalName = (nombre || name || '').trim();

    if (!finalName || finalName.length < 2) {
        return res.status(400).json({ success: false, message: 'Nombre invalido' });
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ success: false, message: 'Email invalido' });
    }
    if (!password || password.length < 6) {
        return res.status(400).json({ success: false, message: 'La contrasena debe tener al menos 6 caracteres' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
        return res.status(409).json({ success: false, message: 'El correo ya esta registrado' });
    }

    const info = db.prepare(`
        INSERT INTO users (name, email, password_hash, type, status)
        VALUES (?, ?, ?, 'customer', 'Activo')
    `).run(finalName, email.toLowerCase(), hashPassword(password));

    const user = getHydratedUser(info.lastInsertRowid);
    const token = signToken(user.id);

    return res.status(201).json({ success: true, token, user: toPublicUser(user) });
});

/**
 * POST /api/auth/login
 * Validates credentials and returns a session token.
 */
router.post('/login', (req, res) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Credenciales incompletas' });
    }

    const row = db.prepare('SELECT id, password_hash, status FROM users WHERE email = ?').get(email.toLowerCase());
    if (!row || !verifyPassword(password, row.password_hash)) {
        return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
    if (row.status !== 'Activo') {
        return res.status(403).json({ success: false, message: 'Cuenta inactiva. Contacta al administrador.' });
    }

    const user = getHydratedUser(row.id);
    const token = signToken(user.id);

    return res.json({ success: true, token, user: toPublicUser(user) });
});

/**
 * GET /api/auth/me
 * Returns the current session user (used to rehydrate the app on reload).
 */
router.get('/me', requireAuth, (req, res) => {
    return res.json({ success: true, user: toPublicUser(req.user) });
});

export default router;
