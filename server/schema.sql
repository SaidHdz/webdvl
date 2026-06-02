-- DVL Supply Co. - Database schema (SQLite)
--
-- Design notes:
-- - Module-level permissions are stored as a JSON array on the role
--   (e.g. ["crm","scm","erp"]). Authorization is enforced server-side so it
--   cannot be bypassed from the browser.
-- - Catalog (products) and stock (inventory) are kept in separate tables to
--   preserve the original domain separation: the storefront reads the catalog
--   while SCM manages stock levels and supplier links.
-- - Orders/order_items mirror the structured payload the frontend already
--   produces at checkout (id_producto + cantidad), enabling sales analytics.

PRAGMA foreign_keys = ON;

-- Roles with module-level permissions.
CREATE TABLE IF NOT EXISTS roles (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL UNIQUE,
    description   TEXT,
    -- JSON array of module keys the role can access: crm | scm | erp.
    permissions   TEXT NOT NULL DEFAULT '[]',
    -- System roles cannot be deleted to avoid locking out the platform.
    is_system     INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Users covers both storefront customers and internal staff.
-- type = 'customer' has no staff role; type = 'staff' must reference a role.
CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role_id       INTEGER REFERENCES roles(id) ON DELETE SET NULL,
    type          TEXT NOT NULL DEFAULT 'customer' CHECK (type IN ('customer','staff')),
    status        TEXT NOT NULL DEFAULT 'Activo' CHECK (status IN ('Activo','Inactivo')),
    -- HR metadata, only relevant for staff.
    puesto        TEXT,
    departamento  TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Storefront catalog. images stored as JSON ({ white: [...], black: [...] }).
CREATE TABLE IF NOT EXISTS products (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    id_producto   TEXT NOT NULL UNIQUE,
    name          TEXT NOT NULL,
    price         REAL NOT NULL,
    description   TEXT,
    category      TEXT,
    images        TEXT NOT NULL DEFAULT '{}',
    active        INTEGER NOT NULL DEFAULT 1,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS suppliers (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_taller TEXT NOT NULL,
    contacto      TEXT,
    correo        TEXT,
    telefono      TEXT,
    insumo        TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Stock per product. supplier_id is the default supplier to reorder from.
CREATE TABLE IF NOT EXISTS inventory (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id    INTEGER NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    stock_actual  INTEGER NOT NULL DEFAULT 0,
    stock_minimo  INTEGER NOT NULL DEFAULT 5,
    supplier_id   INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Manual messages sent to a supplier (e.g. low-stock reorder requests).
-- Simulated: persisted here and shown in the supplier history.
CREATE TABLE IF NOT EXISTS supplier_messages (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_id   INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    product_id    INTEGER REFERENCES products(id) ON DELETE SET NULL,
    asunto        TEXT NOT NULL,
    mensaje       TEXT NOT NULL,
    motivo        TEXT NOT NULL DEFAULT 'stock_bajo',
    sent_by       INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pedido     TEXT NOT NULL UNIQUE,
    user_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
    -- Denormalized client label kept for guest/legacy orders and quick display.
    id_cliente    TEXT,
    nombre        TEXT,
    telefono      TEXT,
    total         REAL NOT NULL DEFAULT 0,
    estado        TEXT NOT NULL DEFAULT 'Pendiente'
                  CHECK (estado IN ('Pendiente','Enviado','Entregado','Cancelado')),
    tipo_envio    TEXT,
    direccion     TEXT,
    punto_entrega TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id        INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      INTEGER REFERENCES products(id) ON DELETE SET NULL,
    id_producto     TEXT NOT NULL,
    cantidad        INTEGER NOT NULL DEFAULT 1,
    precio_unitario REAL NOT NULL DEFAULT 0
);

-- Purchase orders: what we order/buy FROM a supplier (restocks). When a PO is
-- received it increments the corresponding inventory stock. This is the
-- supplier-side counterpart of customer orders and powers the supplier history.
CREATE TABLE IF NOT EXISTS purchase_orders (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    folio         TEXT NOT NULL UNIQUE,
    supplier_id   INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    estado        TEXT NOT NULL DEFAULT 'Solicitado'
                  CHECK (estado IN ('Solicitado','Recibido','Cancelado')),
    total         REAL NOT NULL DEFAULT 0,
    notas         TEXT,
    created_by    INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    received_at   TEXT
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_order_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id        INTEGER REFERENCES products(id) ON DELETE SET NULL,
    id_producto       TEXT NOT NULL,
    cantidad          INTEGER NOT NULL DEFAULT 1,
    costo_unitario    REAL NOT NULL DEFAULT 0
);

-- Indexes for the most frequent lookups (sales analytics, joins).
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_po_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_po_items_po ON purchase_order_items(purchase_order_id);
