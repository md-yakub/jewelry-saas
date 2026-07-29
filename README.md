# Jewelry SaaS (`jewelry-saas`)

Full-stack multi-tenant Jewelry Shop SaaS built with:

- Backend: NestJS + TypeScript + Prisma + PostgreSQL
- Auth: JWT access token + refresh token (hashed in DB)
- Authorization: RBAC + shop-level access guard
- Frontend: React + Vite + TypeScript + Tailwind
- Docs: Swagger/OpenAPI at `/api/docs`
- Deployment: Docker + docker-compose

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
cp frontend/.env.example frontend/.env
docker-compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

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

## Next Enhancements

- Add unit/integration tests (Jest + Supertest)
- Add PDF invoice rendering service
- Add Redis + BullMQ for heavy reports/background tasks
- Add RBAC permission matrix table and policy engine
- Add CI pipeline and infrastructure manifests
