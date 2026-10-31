# Store Management System — Backend

A production-ready NestJS API for managing store inventory, GRNs, SRNs, stock movements, and role-based access.

---

## Tech Stack

- **Framework**: NestJS 11 (TypeScript)
- **Database**: Supabase (PostgreSQL) via Prisma ORM
- **Auth**: JWT (passport-jwt) + bcryptjs
- **Real-time**: Socket.IO (WebSocket notifications)
- **Docs**: Swagger UI at `/api`

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

- Go to [Supabase Dashboard](https://supabase.com) → Your Project → Settings → Database
- Copy the **Connection String** (URI format, port 5432) for `DATABASE_URL`
- Use the same URL for `DIRECT_URL`
- Generate a strong JWT secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### 3. Push schema to Supabase

```bash
npx prisma db push
```

Or if you want versioned migrations:

```bash
npx prisma migrate dev --name init
```

### 4. Generate Prisma client

```bash
npx prisma generate
```

### 5. Seed initial roles (run once)

Connect to your Supabase SQL editor and insert the required roles:

```sql
INSERT INTO roles (role) VALUES
  ('admin'),
  ('store-manager'),
  ('store-keeper'),
  ('employee'),
  ('department-head')
ON CONFLICT DO NOTHING;
```

### 6. Start development server

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`.  
Swagger docs: `http://localhost:3000/api`

---

## Roles

| Role | Access |
|------|--------|
| `admin` | Full system access — employees, departments, roles |
| `store-keeper` | Create and manage GRNs, add to stock |
| `store-manager` | Approve requests, issue SIVs, view stock |
| `department-head` | Review and approve SRNs |
| `employee` | Submit store requisition notes (SRNs) |

---

## Production Build

```bash
npm run build
npm run start:prod
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `DIRECT_URL` | Direct DB URL for Prisma migrations |
| `JWT_SECRET` | Strong random secret for JWT signing |
| `JWT_EXPIRES_IN` | JWT expiry (default: `8h`) |
| `PORT` | HTTP port (default: `3000`) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |
