/**
 * Authentication and authorization middleware.
 *
 * requireAuth resolves the Bearer token into a hydrated user (including the
 * role and its module permissions) and attaches it to req.user.
 * requirePermission gates a route by a module key (crm | scm | erp).
 */

import db from '../db.js';
import { verifyToken } from '../auth.js';

/**
 * Loads a user with its role name and parsed permission list.
 * @param {number} userId - The user id to hydrate.
 * @returns {Object|null} The user with { permissions: string[] } or null.
 */
export const getHydratedUser = (userId) => {
    const row = db.prepare(`
        SELECT u.id, u.name, u.email, u.type, u.status, u.role_id,
               u.puesto, u.departamento,
               r.name AS role_name, r.permissions AS role_permissions
        FROM users u
        LEFT JOIN roles r ON r.id = u.role_id
        WHERE u.id = ?
    `).get(userId);

    if (!row) return null;

    let permissions = [];
    try {
        permissions = row.role_permissions ? JSON.parse(row.role_permissions) : [];
    } catch {
        // A corrupted permissions blob must not crash auth; treat as no access.
        permissions = [];
    }

    return {
        id: row.id,
        name: row.name,
        email: row.email,
        type: row.type,
        status: row.status,
        role_id: row.role_id,
        role: row.role_name || null,
        puesto: row.puesto,
        departamento: row.departamento,
        permissions
    };
};

/**
 * Express middleware that requires a valid Bearer token.
 * Attaches the hydrated user to req.user.
 */
export const requireAuth = (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    try {
        const payload = verifyToken(token);
        const user = getHydratedUser(payload.sub);

        if (!user || user.status !== 'Activo') {
            return res.status(401).json({ success: false, message: 'Sesión inválida' });
        }

        req.user = user;
        next();
    } catch {
        return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
    }
};

/**
 * Express middleware factory that requires access to a specific module.
 * Must run after requireAuth.
 * @param {string} module - The module key to gate on (crm | scm | erp).
 */
export const requirePermission = (module) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    if (!req.user.permissions.includes(module)) {
        return res.status(403).json({ success: false, message: `Sin acceso al módulo ${module.toUpperCase()}` });
    }
    next();
};

/**
 * Express middleware factory that allows access if the user has ANY of the
 * given modules. Used by resources shared across modules (e.g. orders are read
 * by both SCM logistics and CRM sales).
 * @param {string[]} modules - Accepted module keys.
 */
export const requireAnyPermission = (modules) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    if (!modules.some((m) => req.user.permissions.includes(m))) {
        return res.status(403).json({ success: false, message: 'Sin acceso a este recurso' });
    }
    next();
};
