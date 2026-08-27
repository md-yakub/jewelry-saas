# Jewelry SaaS (`jewelry-saas`)

Full-stack multi-tenant Jewelry Shop SaaS built with:

- Backend: NestJS + TypeScript + Prisma + PostgreSQL
- Auth: JWT access token + refresh token (hashed in DB)
- Authorization: RBAC + shop-level access guard
- Frontend: React + Vite + TypeScript + Tailwind
- Docs: Swagger/OpenAPI at `/api/docs`
- Deployment: Docker + docker-compose
- Observability: Prometheus metrics + provisioned Grafana dashboard

---

## Project Structure

```text
jewelry-saas/
  backend/
  frontend/
  docker-compose.yml
  README.md
```

---

## Backend Features

- NestJS modular architecture with:
  - Modules, Controllers, Services, DTOs
  - Global ValidationPipe
  - Global exception filter
  - JWT auth guard, role guard, shop access guard
  - Global response interceptor
- Multi-tenant data model with `shopId` isolation
- Prisma schema includes:
  - User, Shop, ShopMember, Role
  - Customer, GoldRate, JewelryItem, JewelryCategory
  - Sale, SaleItem, Invoice, Payment
  - OldGoldExchange, CustomOrder, Craftsman, AuditLog
- Auth endpoints:
  - `POST /auth/register-shop`
  - `POST /auth/login`
  - `POST /auth/refresh`
  - `POST /auth/logout`
  - `GET /auth/me`
- Domain modules:
  - Inventory (`/shops/:shopId/items`)
  - Gold Rates (`/shops/:shopId/gold-rates`)
  - Calculator (`/shops/:shopId/calculator/price`)
  - Sales + Invoice + Refund (`/shops/:shopId/sales`)
  - Old Gold Exchange (`/shops/:shopId/old-gold-exchanges`)
  - Customers (`/shops/:shopId/customers`)
  - Custom Orders + Craftsmen (`/shops/:shopId/custom-orders`, `/shops/:shopId/craftsmen`)
  - Reports (`/shops/:shopId/reports/...`)
  - Audit Logs (`/shops/:shopId/audit-logs`)

---

## Frontend Features

- Auth screens:
  - Login
  - Register shop
- Protected app shell:
  - Role-aware sidebar menu
  - Shop selector
- Pages:
  - Dashboard
  - Inventory list
  - Add/Edit inventory item
  - Gold rates page
  - Customers page
  - Sales/POS page
  - Price calculator page
  - Custom orders page
  - Reports page
- Uses React Hook Form + Zod validation and Axios API client

---

## Local Setup (Without Docker)

### 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed:roles
npm run start:dev
```

Backend runs on `http://localhost:3000`
Swagger docs: `http://localhost:3000/api/docs`

### 2) Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## Docker Setup

```bash
cp backend/.env.example backend/.env
docker-compose up --build
```

Services:

- NGINX/API entrypoint: `http://localhost:3000`
- Three internal NestJS replicas: `api-1`, `api-2`, and `api-3`
- One-shot Prisma migration service: `migrate`
- PostgreSQL: `127.0.0.1:5433`
- Redis: `127.0.0.1:6379`
- RabbitMQ management UI: `http://localhost:15672`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001`

NGINX distributes requests across the three API replicas. Responses include an
`X-Instance-Id` header so the selected replica can be observed.

### Known horizontal-scaling limitation

Invoice numbers are currently generated from the shop's invoice count. Concurrent
sale creation can therefore attempt the same invoice number and trigger the
database uniqueness constraint. This write path requires separate concurrency
hardening; it is intentionally unchanged in the initial replica setup.

## Monitoring

Each NestJS replica exposes Prometheus-format metrics at `/metrics`. Prometheus
scrapes `api-1:3000`, `api-2:3000`, and `api-3:3000` directly over the Docker
network; NGINX is not part of the scrape path. Grafana is provisioned with the
Prometheus datasource and the **Jewelry SaaS API Overview** dashboard.

The dashboard includes:

- Requests per second
- P95 and P99 HTTP latency
- HTTP error rate
- Request count and request rate by API replica
- Node.js resident memory and CPU usage by replica

HTTP metrics use normalized NestJS route templates, such as
`/shops/:shopId/items`. Tenant identifiers, user identifiers, emails, and raw URL
IDs are not used as labels.

After starting the Docker stack, open Grafana at `http://localhost:3001` (the
initial local login is `admin` / `admin`) and select the provisioned dashboard.
Run the existing inventory benchmark in another terminal while watching it:

```bash
cd backend
API_BASE_URL=http://localhost:3000 \
LOGIN_EMAIL=benchmark@example.local \
LOGIN_PASSWORD=your-benchmark-password \
npm run loadtest:inventory
```

Replace the example credentials with the dedicated performance user. Prometheus
targets and raw queries can be inspected at `http://localhost:9090`.

---

## API Notes

- Most responses are wrapped as:

```json
{
  "data": {},
  "timestamp": "2026-01-01T10:00:00.000Z"
}
```

- Multi-tenancy is enforced by `shopId` route params + guard validation.
- `SUPER_ADMIN` bypasses shop membership checks.
- Important actions are written into `AuditLog`.

---

## Continuous Integration

GitHub Actions validates every pull request and every push to `main`. Separate
jobs install dependencies from the committed lockfiles, generate and validate
the Prisma client/schema, run the backend Jest and frontend Vitest suites, run a
non-mutating backend TypeScript static check, and build both applications. A dependent
Docker job also builds the shared production backend image from
`backend/Dockerfile` without publishing it.

CI intentionally does not run k6, start infrastructure containers, deploy the
application, or push images to a registry. The current frontend has no configured
lint script, so its CI job runs tests and the TypeScript/Vite production build.

The backend's existing ESLint fix command has no repository ESLint configuration
or TypeScript parser yet. CI therefore uses the configured TypeScript compiler for
its non-mutating check rather than relying on machine-specific ESLint state.

---

## Next Enhancements

- Add unit/integration tests (Jest + Supertest)
- Add PostgreSQL and infrastructure exporters where justified
- Continue connection-pool and inventory-query performance analysis
- Add RBAC permission matrix table and policy engine
- Add CI pipeline and infrastructure manifests
