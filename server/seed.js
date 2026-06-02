/**
 * Database seeder.
 *
 * Populates a fresh database with: base roles, an admin account, sample staff
 * and a customer, the storefront catalog (reused from the frontend data file),
 * suppliers, inventory levels and a few historical orders so the dashboards
 * have something to show. Running it resets all domain tables, so it is meant
 * for development only.
 *
 * Usage: npm run seed
 */

import db, { initSchema } from './db.js';
import { hashPassword } from './auth.js';
import { products as catalog } from '../src/data/products.js';

initSchema();

/**
 * Infers a human-readable category from the SKU prefix.
 * @param {string} sku - The product SKU (id_producto).
 * @returns {string} The category label.
 */
const categoryFromSku = (sku) => {
    if (sku.includes('TEE')) return 'Playera';
    if (sku.includes('BNI')) return 'Gorro';
    return 'Otro';
};

const reset = db.transaction(() => {
    // Order matters due to foreign keys; children first.
    db.exec(`
        DELETE FROM order_items;
        DELETE FROM orders;
        DELETE FROM supplier_messages;
        DELETE FROM inventory;
        DELETE FROM suppliers;
        DELETE FROM products;
        DELETE FROM users;
        DELETE FROM roles;
        DELETE FROM sqlite_sequence;
    `);

    // --- Roles -------------------------------------------------------------
    const insertRole = db.prepare(
        'INSERT INTO roles (name, description, permissions, is_system) VALUES (?, ?, ?, ?)'
    );
    const adminRoleId = insertRole.run(
        'Administrador', 'Acceso total a todos los modulos',
        JSON.stringify(['crm', 'scm', 'erp']), 1
    ).lastInsertRowid;
    const crmRoleId = insertRole.run(
        'Gerente CRM', 'Gestion de clientes y ventas',
        JSON.stringify(['crm']), 0
    ).lastInsertRowid;
    const scmRoleId = insertRole.run(
        'Gerente SCM', 'Inventario, proveedores y logistica',
        JSON.stringify(['scm']), 0
    ).lastInsertRowid;
    const rhRoleId = insertRole.run(
        'Recursos Humanos', 'Gestion de personal y roles',
        JSON.stringify(['erp']), 0
    ).lastInsertRowid;

    // --- Users -------------------------------------------------------------
    const insertUser = db.prepare(`
        INSERT INTO users (name, email, password_hash, role_id, type, status, puesto, departamento)
        VALUES (@name, @email, @password_hash, @role_id, @type, @status, @puesto, @departamento)
    `);

    // Default admin. Password kept simple for the academic demo.
    insertUser.run({
        name: 'Said Alejandro Hernandez',
        email: 'saidhdzdno@gmail.com',
        password_hash: hashPassword('admin123'),
        role_id: adminRoleId,
        type: 'staff',
        status: 'Activo',
        puesto: 'Director General',
        departamento: 'Direccion'
    });
    insertUser.run({
        name: 'Laura Mendez',
        email: 'crm@dvl.com',
        password_hash: hashPassword('demo123'),
        role_id: crmRoleId,
        type: 'staff',
        status: 'Activo',
        puesto: 'Ejecutiva de Cuenta',
        departamento: 'Ventas'
    });
    insertUser.run({
        name: 'Diego Ramos',
        email: 'scm@dvl.com',
        password_hash: hashPassword('demo123'),
        role_id: scmRoleId,
        type: 'staff',
        status: 'Activo',
        puesto: 'Coordinador de Almacen',
        departamento: 'Operaciones'
    });
    const customerId = insertUser.run({
        name: 'Cliente Demo',
        email: 'cliente@dvl.com',
        password_hash: hashPassword('demo123'),
        role_id: null,
        type: 'customer',
        status: 'Activo',
        puesto: null,
        departamento: null
    }).lastInsertRowid;

    // --- Suppliers ---------------------------------------------------------
    const insertSupplier = db.prepare(`
        INSERT INTO suppliers (nombre_taller, contacto, correo, telefono, insumo)
        VALUES (?, ?, ?, ?, ?)
    `);
    const supplierIds = [
        insertSupplier.run('Textiles del Norte', 'Marco Lopez', 'ventas@textilesnorte.mx', '8991112233', 'Algodon').lastInsertRowid,
        insertSupplier.run('Estampados Premium', 'Sofia Cruz', 'contacto@estampados.mx', '8994445566', 'Serigrafia').lastInsertRowid,
        insertSupplier.run('Tejidos Acrilicos SA', 'Hugo Vega', 'pedidos@tejidos.mx', '8997778899', 'Acrilico').lastInsertRowid
    ];

    // --- Products + Inventory ---------------------------------------------
    const insertProduct = db.prepare(`
        INSERT INTO products (id_producto, name, price, description, category, images, active)
        VALUES (@id_producto, @name, @price, @description, @category, @images, 1)
    `);
    const insertInventory = db.prepare(`
        INSERT INTO inventory (product_id, stock_actual, stock_minimo, supplier_id)
        VALUES (?, ?, ?, ?)
    `);

    catalog.forEach((product, index) => {
        const productId = insertProduct.run({
            id_producto: product.id_producto,
            name: product.name,
            price: product.price,
            description: product.description,
            category: categoryFromSku(product.id_producto),
            images: JSON.stringify(product.images)
        }).lastInsertRowid;

        // Seed varied stock levels so low-stock alerts are demonstrable:
        // the 3rd and 6th items start below their minimum on purpose.
        const lowStock = index === 2 || index === 5;
        const stockActual = lowStock ? 2 : 10 + index * 3;
        const supplierId = supplierIds[index % supplierIds.length];
        insertInventory.run(productId, stockActual, 5, supplierId);
    });

    // --- Sample orders -----------------------------------------------------
    const insertItem = db.prepare(`
        INSERT INTO order_items (order_id, product_id, id_producto, cantidad, precio_unitario)
        VALUES (?, ?, ?, ?, ?)
    `);
    const productByIndex = db.prepare('SELECT id, id_producto, price FROM products ORDER BY id LIMIT 1 OFFSET ?');

    // Spread orders across recent days to make day/week/month filters meaningful.
    const sampleOrders = [
        { daysAgo: 0, estado: 'Pendiente', tipo: 'Local', items: [0, 1] },
        { daysAgo: 1, estado: 'Enviado', tipo: 'Nacional', items: [3] },
        { daysAgo: 4, estado: 'Entregado', tipo: 'Local', items: [4, 6] },
        { daysAgo: 10, estado: 'Entregado', tipo: 'Nacional', items: [7] },
        { daysAgo: 25, estado: 'Entregado', tipo: 'Local', items: [0, 8] }
    ];

    sampleOrders.forEach((spec, i) => {
        const items = spec.items.map((offset) => productByIndex.get(offset)).filter(Boolean);
        const total = items.reduce((sum, p) => sum + p.price, 0);
        const createdAt = `datetime('now', '-${spec.daysAgo} days')`;

        const orderId = db.prepare(`
            INSERT INTO orders (id_pedido, user_id, id_cliente, nombre, telefono, total, estado, tipo_envio, direccion, punto_entrega, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ${createdAt})
        `).run(
            `ORD-${1000 + i}`,
            customerId,
            'cliente@dvl.com',
            'Cliente Demo',
            '8990001122',
            total,
            spec.estado,
            spec.tipo,
            spec.tipo === 'Nacional' ? 'Av. Revolucion 123, Centro, Reynosa, CP: 88000' : null,
            spec.tipo === 'Local' ? 'Citadina' : null
        ).lastInsertRowid;

        items.forEach((p) => insertItem.run(orderId, p.id, p.id_producto, 1, p.price));
    });

    // --- Sample purchase orders -------------------------------------------
    // Historical restocks for the first supplier so the supplier history shows
    // what we have ordered/received. Stock is left as seeded (these are records
    // of past receipts, not re-applied here).
    const productBySku = db.prepare('SELECT id, id_producto, name FROM products WHERE id_producto = ?');
    const seedPO = (supplierId, estado, lines, daysAgo) => {
        const total = lines.reduce((sum, l) => sum + l.cantidad * l.costo, 0);
        const received = estado === 'Recibido' ? `datetime('now', '-${daysAgo} days')` : 'NULL';
        const poId = db.prepare(`
            INSERT INTO purchase_orders (folio, supplier_id, estado, total, notas, created_by, created_at, received_at)
            VALUES (?, ?, ?, ?, ?, NULL, datetime('now', '-${daysAgo} days'), ${received})
        `).run('TMP', supplierId, estado, total, 'Reabastecimiento programado').lastInsertRowid;
        db.prepare('UPDATE purchase_orders SET folio = ? WHERE id = ?').run(`OC-${1000 + Number(poId)}`, poId);
        const insertPOItem = db.prepare(`
            INSERT INTO purchase_order_items (purchase_order_id, product_id, id_producto, cantidad, costo_unitario)
            VALUES (?, ?, ?, ?, ?)
        `);
        for (const l of lines) {
            const p = productBySku.get(l.sku);
            if (p) insertPOItem.run(poId, p.id, p.id_producto, l.cantidad, l.costo);
        }
    };
    seedPO(supplierIds[0], 'Recibido', [
        { sku: 'SKU-TEE-SLIME-01', cantidad: 20, costo: 150 },
        { sku: 'SKU-TEE-DEVIL-04', cantidad: 10, costo: 150 },
    ], 20);
    seedPO(supplierIds[0], 'Solicitado', [
        { sku: 'SKU-TEE-DIAVLOO-07', cantidad: 15, costo: 150 },
    ], 2);

    // --- Sample supplier message ------------------------------------------
    const lowProduct = db.prepare("SELECT id FROM products WHERE id_producto LIKE '%HEART%'").get();
    if (lowProduct) {
        const supplierForLow = db.prepare('SELECT supplier_id FROM inventory WHERE product_id = ?').get(lowProduct.id);
        if (supplierForLow?.supplier_id) {
            db.prepare(`
                INSERT INTO supplier_messages (supplier_id, product_id, asunto, mensaje, motivo, sent_by)
                VALUES (?, ?, ?, ?, 'stock_bajo', NULL)
            `).run(
                supplierForLow.supplier_id,
                lowProduct.id,
                'Solicitud de reabastecimiento',
                'Stock por debajo del minimo. Favor de cotizar reposicion urgente.'
            );
        }
    }
});

reset();

const counts = {
    roles: db.prepare('SELECT COUNT(*) AS c FROM roles').get().c,
    users: db.prepare('SELECT COUNT(*) AS c FROM users').get().c,
    products: db.prepare('SELECT COUNT(*) AS c FROM products').get().c,
    suppliers: db.prepare('SELECT COUNT(*) AS c FROM suppliers').get().c,
    orders: db.prepare('SELECT COUNT(*) AS c FROM orders').get().c
};

console.log('Seed completado:', counts);
console.log('Admin: saidhdzdno@gmail.com / admin123');
console.log('CRM:   crm@dvl.com / demo123');
console.log('SCM:   scm@dvl.com / demo123');
console.log('Cliente: cliente@dvl.com / demo123');
