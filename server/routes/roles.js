/**
 * Roles routes (ERP module).
 *
 * Roles carry module-level permissions as a JSON array. System roles cannot be
 * modified or deleted to avoid locking the platform out of a module. A role in
 * use by staff cannot be deleted; the caller must reassign those users first.
 */

import { Router } from 'express';
import db from '../db.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';

const router = Router();
const VALID_MODULES = ['crm', 'scm', 'erp'];

// Every roles endpoint requires an authenticated user with ERP access.
router.use(requireAuth, requirePermission('erp'));

/**
 * Parses and validates a permissions array from the request body.
 * @param {*} input - Raw permissions value.
 * @returns {string[]|null} A clean list, or null if invalid.
 */
const sanitizePermissions = (input) => {
    if (!Array.isArray(input)) return null;
    const clean = [...new Set(input)].filter((p) => VALID_MODULES.includes(p));
    if (clean.length !== new Set(input).size) return null;
    return clean;
};

/**
 * Maps a role row into its API shape, parsing the permissions JSON and adding
 * the count of users assigned to it.
 */
const toRole = (row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    permissions: row.permissions ? JSON.parse(row.permissions) : [],
    is_system: Boolean(row.is_system),
    user_count: row.user_count ?? 0,
    created_at: row.created_at,
});

const SELECT_ROLES = `
    SELECT r.*, (SELECT COUNT(*) FROM users u WHERE u.role_id = r.id) AS user_count
    FROM roles r
`;

/** GET /api/roles - list all roles with usage counts. */
router.get('/', (_req, res) => {
    const rows = db.prepare(`${SELECT_ROLES} ORDER BY r.is_system DESC, r.name`).all();
    res.json({ success: true, data: rows.map(toRole) });
});

/** GET /api/roles/:id */
router.get('/:id', (req, res) => {
    const row = db.prepare(`${SELECT_ROLES} WHERE r.id = ?`).get(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Rol no encontrado' });
    res.json({ success: true, data: toRole(row) });
});

/** POST /api/roles - create a custom role. */
router.post('/', (req, res) => {
    const { name, description, permissions } = req.body || {};

    if (!name || name.trim().length < 3) {
        return res.status(400).json({ success: false, message: 'El nombre del rol debe tener al menos 3 caracteres' });
    }
    const perms = sanitizePermissions(permissions);
    if (perms === null) {
        return res.status(400).json({ success: false, message: 'Permisos invalidos (usa crm, scm, erp)' });
    }

    const exists = db.prepare('SELECT id FROM roles WHERE name = ?').get(name.trim());
    if (exists) return res.status(409).json({ success: false, message: 'Ya existe un rol con ese nombre' });

    const info = db.prepare(
        'INSERT INTO roles (name, description, permissions, is_system) VALUES (?, ?, ?, 0)'
    ).run(name.trim(), description?.trim() || null, JSON.stringify(perms));

    const row = db.prepare(`${SELECT_ROLES} WHERE r.id = ?`).get(info.lastInsertRowid);
    res.status(201).json({ success: true, data: toRole(row) });
});

/** PUT /api/roles/:id - update a non-system role. */
router.put('/:id', (req, res) => {
    const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Rol no encontrado' });
    if (role.is_system) {
        return res.status(403).json({ success: false, message: 'Los roles del sistema no se pueden modificar' });
    }

    const { name, description, permissions } = req.body || {};
    if (!name || name.trim().length < 3) {
        return res.status(400).json({ success: false, message: 'El nombre del rol debe tener al menos 3 caracteres' });
    }
    const perms = sanitizePermissions(permissions);
    if (perms === null) {
        return res.status(400).json({ success: false, message: 'Permisos invalidos (usa crm, scm, erp)' });
    }

    const clash = db.prepare('SELECT id FROM roles WHERE name = ? AND id != ?').get(name.trim(), role.id);
    if (clash) return res.status(409).json({ success: false, message: 'Ya existe un rol con ese nombre' });

    db.prepare('UPDATE roles SET name = ?, description = ?, permissions = ? WHERE id = ?')
        .run(name.trim(), description?.trim() || null, JSON.stringify(perms), role.id);

    const row = db.prepare(`${SELECT_ROLES} WHERE r.id = ?`).get(role.id);
    res.json({ success: true, data: toRole(row) });
});

/** DELETE /api/roles/:id - delete a non-system, unused role. */
router.delete('/:id', (req, res) => {
    const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Rol no encontrado' });
    if (role.is_system) {
        return res.status(403).json({ success: false, message: 'Los roles del sistema no se pueden eliminar' });
    }

    const inUse = db.prepare('SELECT COUNT(*) AS c FROM users WHERE role_id = ?').get(role.id).c;
    if (inUse > 0) {
        return res.status(409).json({ success: false, message: `El rol tiene ${inUse} usuario(s) asignado(s). Reasignalos primero.` });
    }

    db.prepare('DELETE FROM roles WHERE id = ?').run(role.id);
    res.json({ success: true });
});

export default router;
