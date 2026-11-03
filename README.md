# Nile Store Management System

A full-stack store management system for Nile Insurance Company: NestJS backend + React/Vite frontend, PostgreSQL (Supabase) via Prisma, real-time notifications over Socket.IO.

## Structure

- `store-backend/` — NestJS 11 API (Prisma, PostgreSQL, JWT + role guards)
- `store-frontend/Store_managmet_sms-main/` — React 19 + Vite SPA

## Local development

```bash
# Backend
cd store-backend
npm install
cp .env.example .env   # fill in DATABASE_URL, DIRECT_URL, JWT_SECRET
npm run start:dev

# Frontend (in another terminal)
cd store-frontend/Store_managmet_sms-main
npm install
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:3000/
npm run dev
```

Backend: http://localhost:3000 — Swagger UI at `/api`.
Frontend: http://localhost:5173.

## Environment variables

Backend (see `store-backend/.env.example`): `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `NODE_ENV`, `ALLOWED_ORIGINS`.
Frontend (see `store-frontend/Store_managmet_sms-main/.env.example`): `VITE_API_BASE_URL`, `VITE_WS_URL`.

## Production build

```bash
# Backend
cd store-backend && npm run build && npx prisma generate && node prisma/apply-schema.js
# Frontend
cd store-frontend/Store_managmet_sms-main && npm run build
```

## Deploy (Render)

This repo ships a `render.yaml` blueprint. In the Render dashboard: **New → Blueprint**, connect this repo, and set the secret env vars (`DATABASE_URL`, `DIRECT_URL`) when prompted. Render generates `JWT_SECRET` automatically and injects `VITE_API_BASE_URL` at frontend build time. The backend exposes `/health` for readiness checks.

## Security notes

- All mutating endpoints are guarded by `JwtAuthGuard` + `RolesGuard`.
- `JWT_SECRET` is required in production; the app refuses to boot without it.
- Login is rate-limited (5 attempts / 60s / IP).
- Prisma errors are mapped to proper HTTP status codes via a global exception filter.
