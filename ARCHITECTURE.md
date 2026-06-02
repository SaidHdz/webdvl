# Arquitectura - DVL Supply Co.

Documento de alto nivel sobre la separacion de responsabilidades, el modelo de
datos y los patrones usados. Es documentacion viva: se actualiza junto con el
codigo.

## Vision general

El sistema se divide en tres capas desacopladas:

```
+-----------------------------+        HTTP / JSON         +--------------------------+
|        Frontend (SPA)       |  <---------------------->  |     API REST (Express)   |
|  React 19 + Vite + Tailwind |     Bearer token (JWT)     |  Node + better-sqlite3   |
+-----------------------------+                            +-----------+--------------+
                                                                       |
                                                                       v
                                                            +----------------------+
                                                            |   SQLite (data.db)   |
                                                            +----------------------+
```

- **Frontend**: SPA en React. No contiene reglas de negocio sensibles; consume
  la API. Corre en Vite (puerto 5173) y proxya `/api` al backend.
- **Backend**: API REST en Express. Centraliza autenticacion, autorizacion por
  modulo y reglas de negocio (validacion de stock, descuento de inventario en
  transaccion, analitica de ventas). Corre en el puerto 3001.
- **Base de datos**: SQLite via better-sqlite3 (sincrono). Un solo archivo
  `data.db` en la raiz, ignorado por git y regenerable con el seed.

Sustituye los webhooks de n8n previos por una API autocontenida.

## Autenticacion y autorizacion

- Las contrasenas se almacenan con bcrypt.
- La sesion es un JWT firmado (stateless) que el frontend guarda y envia como
  `Authorization: Bearer <token>`.
- Los permisos son **a nivel de modulo** (`crm`, `scm`, `erp`) y se guardan como
  arreglo JSON en el rol. El backend los valida con el middleware
  `requirePermission`, de modo que no se pueden burlar desde el navegador.
- `users.type` distingue `customer` (tienda) de `staff` (paneles internos).

## Modelo de datos

| Tabla | Proposito |
|-------|-----------|
| `roles` | Roles con permisos de modulo (JSON). `is_system` protege los base. |
| `users` | Clientes y staff. Staff referencia un rol. |
| `products` | Catalogo de la tienda. `images` como JSON. |
| `inventory` | Stock por producto (`stock_actual`, `stock_minimo`, proveedor). |
| `suppliers` | Talleres / proveedores. |
| `supplier_messages` | Mensajes manuales al proveedor (reabastecimiento). |
| `orders` / `order_items` | Pedidos y su detalle, base de la analitica. |

Catalogo (`products`) e inventario (`inventory`) se mantienen separados para
conservar la separacion de dominios original: la tienda lee el catalogo y el
modulo SCM gestiona el stock.

## Estructura del backend

```
server/
  index.js            App Express, CORS, monta routers, health check
  db.js               Conexion SQLite + aplicacion del esquema
  schema.sql          Definicion de tablas e indices
  seed.js             Datos iniciales (dev)
  auth.js             bcrypt + JWT
  middleware/auth.js  requireAuth, requirePermission(modulo)
  routes/             Routers por dominio (auth, y modulos por fase)
```

## Modulos del frontend (post-login)

Al iniciar sesion, el staff ve un Hub que ofrece los modulos a los que su rol
tiene acceso:

- **CRM**: clientes, historial de compra, analitica de ventas (dia/semana/mes).
- **SCM**: inventario, proveedores (historial + mensajes), logistica/envios.
- **ERP**: personal (RH), roles y permisos, configuracion y vista global.

Los clientes (`type=customer`) solo acceden a la tienda publica.

## Convenciones

- Comentarios de codigo en ingles; documentacion y comunicacion en espanol.
- Sin emojis en codigo ni documentacion tecnica.
- JSDoc en servicios y endpoints; manejo de errores explicito (sin happy path).
