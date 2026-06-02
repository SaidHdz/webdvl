/**
 * Users routes (ERP module): staff management.
 *
 * Handles creating, editing and deleting internal staff accounts and assigning
 * them a role. Self-deletion is blocked so an admin cannot lock themselves out.
 * Customer accounts are read here for reference but are managed via the CRM.
 */

import { Router } from 'express';
import db from '../db.js';
import { hashPassword } from '../auth.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requirePermission('erp'));

const SELECT_USERS = `
    SELECT u.id, u.name, u.email, u.type, u.status, u.role_id,
           u.puesto, u.departamento, u.created_at,
           r.name AS role_name
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
`;

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

/** GET /api/users?type=staff|customer&search= */
router.get('/', (req, res) => {
    const { type, search } = req.query;
    const clauses = [];
    const params = [];

    if (type === 'staff' || type === 'customer') {
        clauses.push('u.type = ?');
        params.push(type);
    }
    if (search) {
        clauses.push('(u.name LIKE ? OR u.email LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const rows = db.prepare(`${SELECT_USERS} ${where} ORDER BY u.created_at DESC`).all(...params);
    res.json({ success: true, data: rows });
});

/** GET /api/users/:id */
router.get('/:id', (req, res) => {
    const row = db.prepare(`${SELECT_USERS} WHERE u.id = ?`).get(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    res.json({ success: true, data: row });
});

/** POST /api/users - create a staff account. */
router.post('/', (req, res) => {
    const { name, email, password, role_id, puesto, departamento, status } = req.body || {};

    if (!name || name.trim().length < 2) {
        return res.status(400).json({ success: false, message: 'Nombre invalido' });
    }
    if (!email || !isValidEmail(email)) {
        return res.status(400).json({ success: false, message: 'Email invalido' });
    }
    if (!password || password.length < 6) {
        return res.status(400).json({ success: false, message: 'La contrasena debe tener al menos 6 caracteres' });
    }

    const role = db.prepare('SELECT id FROM roles WHERE id = ?').get(role_id);
    if (!role) return res.status(400).json({ success: false, message: 'Rol invalido' });

    const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (exists) return res.status(409).json({ success: false, message: 'El correo ya esta registrado' });

    const info = db.prepare(`
        INSERT INTO users (name, email, password_hash, role_id, type, status, puesto, departamento)
        VALUES (?, ?, ?, ?, 'staff', ?, ?, ?)
    `).run(
        name.trim(), email.toLowerCase(), hashPassword(password), role_id,
        status === 'Inactivo' ? 'Inactivo' : 'Activo',
        puesto?.trim() || null, departamento?.trim() || null
    );

    const row = db.prepare(`${SELECT_USERS} WHERE u.id = ?`).get(info.lastInsertRowid);
    res.status(201).json({ success: true, data: row });
});

/** PUT /api/users/:id - update a staff account (password optional). */
router.put('/:id', (req, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    const { name, email, password, role_id, puesto, departamento, status } = req.body || {};

    if (!name || name.trim().length < 2) {
        return res.status(400).json({ success: false, message: 'Nombre invalido' });
    }
    if (!email || !isValidEmail(email)) {
        return res.status(400).json({ success: false, message: 'Email invalido' });
    }
    const role = db.prepare('SELECT id FROM roles WHERE id = ?').get(role_id);
    if (!role) return res.status(400).json({ success: false, message: 'Rol invalido' });

    const clash = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email.toLowerCase(), user.id);
    if (clash) return res.status(409).json({ success: false, message: 'El correo ya esta en uso' });

    // Prevent deactivating your own account, which would end your session.
    const finalStatus = status === 'Inactivo' ? 'Inactivo' : 'Activo';
    if (user.id === req.user.id && finalStatus === 'Inactivo') {
        return res.status(400).json({ success: false, message: 'No puedes desactivar tu propia cuenta' });
    }

    db.prepare(`
        UPDATE users SET name = ?, email = ?, role_id = ?, status = ?, puesto = ?, departamento = ?
        WHERE id = ?
    `).run(
        name.trim(), email.toLowerCase(), role_id, finalStatus,
        puesto?.trim() || null, departamento?.trim() || null, user.id
    );

    if (password) {
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'La contrasena debe tener al menos 6 caracteres' });
        }
        db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(password), user.id);
    }

    const row = db.prepare(`${SELECT_USERS} WHERE u.id = ?`).get(user.id);
    res.json({ success: true, data: row });
});

/** DELETE /api/users/:id - delete a staff account (not your own). */
router.delete('/:id', (req, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    if (user.id === req.user.id) {
        return res.status(400).json({ success: false, message: 'No puedes eliminar tu propia cuenta' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
    res.json({ success: true });
});

export default router;
