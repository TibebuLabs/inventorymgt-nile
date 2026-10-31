# Store Management System — Frontend

A modern, responsive React SPA for managing store inventory with role-based dashboards.

---

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build**: Vite 6
- **Styling**: TailwindCSS v4
- **Routing**: React Router v7
- **HTTP**: Axios
- **Real-time**: Socket.IO client

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

Edit `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/
VITE_WS_URL=http://localhost:3000
```

### 3. Start development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Role-Based Access

After login, the app automatically routes to the correct dashboard based on the user's role:

| Role | Dashboard |
|------|-----------|
| `admin` | Employee, Department, Role management |
| `store-keeper` | GRN creation and viewing |
| `store-manager` | SIV management, Stock Control Card |
| `employee` | Store Requisition (SRN) submission |
| `department-head` | Requisition review and approval |

---

## Production Build

```bash
npm run build
```

The output is in `dist/`. Serve it with any static file server.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base URL (must end with `/`) |
| `VITE_WS_URL` | WebSocket server URL for real-time notifications |
