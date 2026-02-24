# SmartSMEs VAT-Ready Bookkeeping & Invoicing SaaS

Production-oriented multi-tenant SaaS platform for Nigerian SMEs with bookkeeping, VAT-compliant invoicing, and audit-ready records aligned to NRS e-invoicing evolution.

## 1) Architecture Overview
- **Frontend**: Next.js + TypeScript + Tailwind + Zustand for fast dashboards and operator workflows.
- **Backend**: Express + TypeScript REST API with JWT auth, RBAC, tenant isolation, immutable audit logs.
- **Database**: PostgreSQL + Prisma with strict `tenantId` partitioning, soft-delete for financial records, indexes for reporting speed.
- **Infrastructure**: Dockerized frontend/backend/postgres with Nginx reverse proxy and GitHub Actions CI.

### Multi-tenant security model
- All operational entities include `tenantId`.
- API middleware injects JWT claims (`sub`, `tenantId`, `role`) and enforces role access.
- Data access patterns always filter by `tenantId`.

### VAT engine (Nigeria)
- Default standard VAT rate: **7.5%**.
- Categories: `STANDARD`, `ZERO_RATED`, `EXEMPT`.
- Output VAT (sales) captured at invoice line level.
- Input VAT (expenses) captured at expense creation.
- Monthly VAT record persisted with `outputVat`, `inputVat`, and `netVatPayable`.

## 2) Folder Structure

```bash
.
├── backend
│   ├── prisma
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── routes
│   │   ├── services
│   │   └── utils
│   └── Dockerfile
├── frontend
│   ├── src/app
│   ├── src/components
│   ├── src/lib
│   ├── src/store
│   └── Dockerfile
├── nginx/default.conf
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## 3) Core Modules
1. Authentication + Tenant Management
2. Business Profile (`Tenant` with TIN and VAT number)
3. Customer and Vendor master data
4. Invoicing engine (Draft → Issued → Paid ready)
5. Expense recording with input VAT
6. VAT engine and monthly summaries
7. Dashboard analytics and VAT compliance signal
8. Subscription abstraction (Free/SME/Accountant)
9. Immutable audit logging

## 4) Database
- Full Prisma schema in `backend/prisma/schema.prisma`.
- Includes: `User`, `Tenant`, `Subscription`, `Customer`, `Vendor`, `Invoice`, `InvoiceItem`, `Expense`, `VATRecord`, `AuditLog`.
- Every financial model stores creation metadata (`createdAt`, `updatedAt`, `createdBy`).

## 5) REST API (v1)
### Auth
- `POST /api/v1/auth/login`

### Invoices
- `GET /api/v1/invoices`
- `POST /api/v1/invoices`
- `GET /api/v1/invoices/:id/pdf`

### Expenses
- `GET /api/v1/expenses`
- `POST /api/v1/expenses`

### VAT reports
- `GET /api/v1/reports/vat/monthly?period=YYYY-MM`
- `GET /api/v1/reports/vat/monthly.csv?period=YYYY-MM`

### Dashboard
- `GET /api/v1/dashboard/metrics`

### Subscription
- `GET /api/v1/subscriptions/current`

## 6) Subscription Model
- **FREE**: set `invoicesLimit` (e.g. 20/month).
- **SME**: unlimited invoices + VAT report access.
- **ACCOUNTANT**: multi-business managed via separate tenant links (extension-ready).
- Stripe IDs already included in schema for live integration.

## 7) Run Locally

```bash
# 1. start containers
docker compose up --build

# 2. in backend container or local shell
cd backend
npx prisma migrate dev --name init
npx prisma db seed

# 3. visit app
http://localhost
```

## 8) Deployment (AWS or DigitalOcean)
1. Build and push container images.
2. Provision managed Postgres.
3. Set environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_API_URL`
4. Terminate TLS at load balancer or Nginx.
5. Enforce HTTPS and secure headers.

## 9) Performance & Scale Notes
- Pagination implemented for invoices API.
- DB indexes on tenant/date/status fields.
- VAT aggregation done in DB via Prisma aggregate APIs.
- Design supports horizontal API scaling and >100k SMEs by tenant-keyed query paths.
