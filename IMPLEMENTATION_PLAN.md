# Plan de Implementacion - DVL Supply Co.

Registro incremental de las fases de desarrollo. Cada fase se cierra cuando el
proyecto compila y la funcionalidad es verificable.

## Decisiones de arquitectura

- Persistencia: **SQLite** via better-sqlite3.
- Backend: **Express** (procesos separados de Vite, orquestados con concurrently).
- Se **reemplazan** los webhooks de n8n por la API local.
- Mensajes a proveedor: **simulados y guardados** en `supplier_messages`.
- Modulos post-login: **CRM / SCM / ERP**.

## Fases

### Fase 1 - Cimientos backend [COMPLETADA]
- [x] Dependencias (express, better-sqlite3, bcryptjs, jsonwebtoken, cors, concurrently).
- [x] Esquema SQLite (`server/schema.sql`) e inicializacion (`server/db.js`).
- [x] Seeder con roles, admin, staff, cliente, catalogo, proveedores, inventario y pedidos.
- [x] Auth real: bcrypt + JWT (`server/auth.js`).
- [x] Middleware `requireAuth` y `requirePermission` por modulo.
- [x] Rutas de auth: register / login / me.
- [x] Scripts npm (`dev`, `dev:server`, `seed`) y proxy de Vite hacia `/api`.
- [x] Documentacion: ARCHITECTURE.md e IMPLEMENTATION_PLAN.md.

### Fase 2 - Auth real + Hub de modulos [COMPLETADA]
- [x] Reescribir `apiService` (token + helpers CRUD).
- [x] `AuthContext` real contra la API; rehidratacion con `/me`.
- [x] `ProtectedRoute` por permiso de modulo y `staffOnly`.
- [x] Pagina Hub (selector CRM/SCM/ERP filtrado por permisos).
- [x] Reestructurar rutas a `/crm/*`, `/scm/*`, `/erp/*` con armazon ModuleShell.
- [x] Login/registro redirigen segun tipo (staff -> hub, cliente -> tienda).

### Fase 3 - ERP (personal y roles) [COMPLETADA]
- [x] CRUD de personal (crear/editar/borrar staff, asignar rol, buscar, activar/desactivar).
- [x] CRUD de roles + permisos de modulo (roles de sistema protegidos, bloqueo si estan en uso).
- [x] Dashboard global (metricas via /api/stats/overview).
- [x] Salvaguardas: no auto-eliminacion ni auto-desactivacion; cuenta inactiva no inicia sesion.

### Fase 4 - SCM (inventario, proveedores, envios) [COMPLETADA]
- [x] CRUD de inventario (ajuste de stock/minimo/proveedor) con filtros y alertas Pull.
- [x] CRUD de productos (catalogo) con creacion de inventario en transaccion.
- [x] CRUD de proveedores + historial (productos suministrados + timeline de mensajes).
- [x] Envio de mensaje a proveedor por stock bajo (simulado, guardado en BD).
- [x] Vista de envios a detalle (master-detail: cliente, direccion, items, cambio de estado).
- [x] Permisos: recursos SCM bloqueados a roles sin SCM; pedidos compartidos scm/crm.

### Fase 5 - CRM (clientes, historial, ventas) [COMPLETADA]
- [x] Lista de clientes con total invertido, pedidos y puntos; busqueda y export CSV.
- [x] Historial real del cliente con pedidos e items (vista integrada CRM/SCM).
- [x] Analitica de ventas con filtro dia/semana/mes (totales, grafica diaria, top productos).
- [x] Permisos: recursos CRM bloqueados a roles sin CRM.

### Fase 6 - Tienda (stock + filtros) [COMPLETADA]
- [x] Catalogo desde la API con stock en vivo (productos ya no estaticos en el front).
- [x] Filtros de busqueda: texto, categoria, rango de precio y disponibilidad.
- [x] Avisos de stock: badge "Agotado" / "Ultimas piezas" y "X disponibles" en detalle.
- [x] Carrito limitado al stock; no permite agregar mas unidades de las disponibles.
- [x] Checkout real: POST /api/orders valida stock y descuenta inventario en transaccion
      (rollback si falta stock), suma envio nacional y registra el pedido.
- [x] Limpieza: eliminados los componentes admin antiguos huerfanos.

### Mejora post-verificacion - Ordenes de compra a proveedor [COMPLETADA]
- [x] Tablas purchase_orders / purchase_order_items.
- [x] Endpoints: crear orden, recibir (incrementa stock en transaccion), cancelar.
- [x] Historial de proveedor ampliado: ordenes de compra con items, total comprado,
      unidades y numero de ordenes (lo que les pedimos y nos han vendido).
- [x] UI en SCM: ver ordenes, crear nueva orden, marcar recibida / cancelar.
- [x] Seed con ordenes de ejemplo (una Recibida, una Solicitada).
- Nota CRM: el historial de cliente ya cubre el caso analogo (todas sus compras con items).

## Credenciales de prueba (seed)

- Admin:   `saidhdzdno@gmail.com` / `admin123`
- CRM:     `crm@dvl.com` / `demo123`
- SCM:     `scm@dvl.com` / `demo123`
- Cliente: `cliente@dvl.com` / `demo123`
