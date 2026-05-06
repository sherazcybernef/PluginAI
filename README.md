# PluginAI

Unified **SEO**, **Core Web Vitals / speed**, and **AIO-oriented content hygiene** dashboard — MVP implementation aligned with [`docs/product-requirements-unified-seo-speed-aio-platform.md`](docs/product-requirements-unified-seo-speed-aio-platform.md).

**Canonical repo:** [github.com/sherazcybernef/PluginAI](https://github.com/sherazcybernef/PluginAI)

## Stack

| Area | Choice |
| --- | --- |
| API | NestJS 11, Prisma 6, JWT auth |
| DB (local default) | **SQLite** (`apps/api/prisma/dev.db`) — no Docker required |
| Jobs | Optional **BullMQ + Redis**; default local uses **`SYNC_SCANS=1`** (inline scans, no Redis) |
| Web | Next.js 15 (App Router), React 19, Tailwind CSS |

## Run on localhost (fastest)

### 1. Env files

```bash
copy apps\api\.env.example apps\api\.env
copy apps\web\.env.example apps\web\.env.local
```

(`apps/api/.env` sets `DATABASE_URL=file:./dev.db` and `SYNC_SCANS=1`.)

### 2. Database

```bash
cd apps\api
npx prisma db push
```

### 3. Dev servers (repo root)

```bash
npm install
npm run dev
```

Open **http://localhost:3000** — API **http://localhost:4000/v1**.

Register → workspace → site → **Run scan**.

## Optional: PostgreSQL + Redis (Docker)

If Docker is installed:

```bash
docker compose up -d
```

Use a Postgres `DATABASE_URL`, set `provider = "postgresql"` in `apps/api/prisma/schema.prisma`, run migrations or `db push`, unset **`SYNC_SCANS`** (or set `0`), and point **`REDIS_URL`** at Redis so scans use the queue.

## API (PRD §17 subset)

| Method | Path |
| --- | --- |
| `POST` | `/v1/auth/register`, `/v1/auth/login` |
| `GET` | `/v1/me` |
| `POST` | `/v1/workspaces` |
| `GET` | `/v1/workspaces/:workspaceId` |
| `GET` / `POST` | `/v1/workspaces/:workspaceId/sites` |
| `POST` | `/v1/sites/:siteId/scans?kind=full` |
| `GET` | `/v1/scans/:scanId` |
| `GET` | `/v1/sites/:siteId/issues`, `/scores/latest`, `/scores` |

Use `Authorization: Bearer <accessToken>`.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | API + Web concurrently |
| `npm run build` | Production build both apps |
| `npm run db:push` | `prisma db push` (API workspace) |
