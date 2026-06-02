# DVL Supply Co. - ERP / SCM / CRM

Plataforma integrada de tienda y back-office (CRM, SCM, ERP) construida con
React + Vite en el frontend y una API REST en Express respaldada por SQLite.

## Stack

- **Frontend**: React 19, Vite, React Router, Tailwind CSS, react-hook-form, Zod, Sonner.
- **Backend**: Node + Express, better-sqlite3, bcryptjs, JSON Web Tokens.
- **Base de datos**: SQLite (archivo local `data.db`, regenerable con el seed).

Consulta `ARCHITECTURE.md` para el diseno y `IMPLEMENTATION_PLAN.md` para el avance.

## Requisitos

- Node.js 20 o superior (probado en Node 22).

## Puesta en marcha (desarrollo)

```bash
# 1. Instalar dependencias
npm install

# 2. Crear y poblar la base de datos (genera data.db)
npm run seed

# 3. Levantar frontend (5173) y API (3001) en paralelo
npm run dev
```

El frontend proxya las llamadas `/api` hacia el backend, asi que basta con abrir
`http://localhost:5173`.

### Scripts disponibles

| Script | Descripcion |
|--------|-------------|
| `npm run dev` | Frontend + API en paralelo (concurrently). |
| `npm run dev:client` | Solo el frontend (Vite). |
| `npm run dev:server` | Solo la API con recarga (`node --watch`). |
| `npm run seed` | Resetea y puebla la base de datos. |
| `npm run build` | Build de produccion del frontend. |

## Credenciales de prueba

| Rol | Email | Contrasena |
|-----|-------|-----------|
| Administrador | `saidhdzdno@gmail.com` | `admin123` |
| Gerente CRM | `crm@dvl.com` | `demo123` |
| Gerente SCM | `scm@dvl.com` | `demo123` |
| Cliente | `cliente@dvl.com` | `demo123` |
