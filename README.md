# DEALPORT Admin Dashboard + Products API

Full-stack take-home implementation: a NestJS + Prisma + PostgreSQL products
API and a Next.js (App Router) admin frontend implementing the scoped
DEALPORT screens (Dashboard, Add Product, Product List).

## Stack

- **Backend:** NestJS 11, TypeScript, Prisma 6, PostgreSQL, JWT (Passport), class-validator, Helmet, rate limiting
- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **Monorepo layout:** `apps/api` (NestJS) + `apps/web` (Next.js), no shared package manager workspace required — each app has its own `node_modules`

```
dealport-admin/
├── apps/
│   ├── api/     NestJS + Prisma products API
│   └── web/     Next.js admin dashboard
└── README.md
```

## 1. Prerequisites

- Node.js 20+
- PostgreSQL 14+ running locally (or any reachable Postgres instance)

## 2. Backend setup (`apps/api`)

```bash
cd apps/api
npm install
cp .env.example .env   # then edit DATABASE_URL / JWT_SECRET / seed creds
```

Create the database and a role that can create databases (needed for
Prisma's shadow database during `migrate dev`):

```sql
CREATE DATABASE dealport;
CREATE USER dealport_user WITH PASSWORD 'change-me' CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE dealport TO dealport_user;
```

Run migrations and seed data:

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

Start the API:

```bash
npm run start:dev   # http://localhost:4000/api
```

### Environment variables (`apps/api/.env.example`)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | HMAC secret for signing access tokens — **must** be replaced in any non-local environment |
| `JWT_EXPIRES_IN` | Access token lifetime (default `1d`) |
| `PORT` | API port (default `4000`) |
| `CORS_ORIGIN` | Comma-separated list of allowed frontend origins |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Credentials created by the seed script |
| `GEMINI_API_KEY` | Required only for the "Generate description with AI" button (the magic-wand icon next to Product Description on the Add Product form). Get a free key from [Google AI Studio](https://aistudio.google.com/apikey). Without it, that one button returns a clean error — everything else in the app works normally. |

### Seed credentials (local dev only — rotate before any real deployment)

```
email:    imesh@gmail.com
password: 123456
```

## 3. Frontend setup (`apps/web`)

```bash
cd apps/web
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL
npm run dev   # http://localhost:3000
```

`.env.local`:

```
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

Log in at `/login` with the seed credentials above.

## 4. Architecture notes

### Backend

- **Controller → Service → Prisma.** Controllers never touch `PrismaService`
  directly; all persistence goes through a service (`ProductsService`,
  `CategoriesService`, `AuthService`).
- **DTO validation.** Every mutable endpoint validates via `class-validator`
  DTOs with a global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`,
  `transform`) — unexpected fields are rejected, not silently dropped.
- **Auth.** `POST /api/auth/login` verifies a bcrypt password hash and issues
  a signed JWT (`passport-jwt` Bearer strategy). All `products` and
  `categories` routes require a valid Bearer token (`JwtAuthGuard`).
- **Rate limiting.** Global throttling (60 req/min) plus a stricter 5/min
  limit on `/auth/login` to blunt credential-stuffing attempts.
- **Security headers & CORS.** `helmet()` is applied globally; CORS is
  restricted to the configured frontend origin(s) instead of `*`.
- **Data model.** `User`, `Category`, `Tag`, `Product` (Prisma + Postgres).
  Product price fields use `Decimal` to avoid floating-point drift on money.
- **Pagination & search.** `GET /products` supports `page`, `limit` (capped
  at 100), `search` (case-insensitive `name` match), `categoryId`, `status`,
  and sorting — implemented with a single `$transaction` (`findMany` +
  `count`) so the total matches the filtered result set.
- **Dashboard widgets** (`GET /products/top`, `GET /products/best-selling`)
  are real API endpoints backed by Prisma — per the brief, product widgets
  must not be mock-only.

### Frontend

- **App Router + TypeScript + Tailwind v4**, desktop-first (~1440px), matching
  the DEALPORT emerald/green admin shell from the Figma community kit.
- **Sidebar** is scoped to the three in-scope screens only (Dashboard / Add
  Products / Product List) with active-route highlighting — everything else
  in the kit (Order Management, Customers, Coupon Code, Brand, Admin role,
  etc.) is intentionally out of scope per the brief.
- **Typed API client** (`src/lib/api.ts`) wraps `fetch`, attaches the Bearer
  token from `localStorage`, and centralizes error handling (`ApiError`),
  including an automatic redirect to `/login` on `401`.
- **Auth** is a lightweight React context (`AuthContext`) that hydrates from
  `GET /auth/me` on load; `AuthGuard` protects the dashboard/product routes
  client-side. The JWT is kept in `localStorage`, matching the brief's
  "Bearer token after login" requirement. **Note:** for a production
  deployment, prefer an httpOnly cookie set by a same-site API route to
  reduce XSS blast radius — documented here rather than implemented, since
  the brief specifies Bearer-token auth.
- **Dashboard:**
  - Stat cards, "Report for this week" (Recharts area chart, static
    weekly series), and the Transaction table are **static/documented data**
    — explicitly allowed by the brief since Order Management/Transactions
    are out of scope.
  - **Top Products** and **Best selling product** widgets call
    `GET /products/top` and `GET /products/best-selling` — real API data,
    per the "MUST load from NestJS product APIs" requirement.
- **Add Product:** basic details, pricing (with optional discount + tax
  toggle), inventory (quantity / unlimited / stock status / featured),
  category + comma-separated tags, and a color swatch — matching the
  reference screenshot's field set. "Publish Product" and "Save to draft"
  map directly to the `status` field (`PUBLISHED` / `DRAFT`).
  - **Image upload** is a real file upload: `POST /api/uploads/image`
    (`apps/api/src/uploads`) accepts a `multipart/form-data` file behind the
    same JWT guard as the rest of the API, validates MIME type (JPEG/PNG/
    WEBP/GIF) and a 5MB size cap, stores it on disk under `apps/api/uploads/`
    with a random filename, and serves it back via Express static assets at
    `/uploads/:filename`. The form uploads the main image plus up to 10
    gallery images (drag-and-drop or browse), previews them inline, and
    saves the returned URLs on `imageUrl` / `images`.
  - **AI description generation** (extra, not in the original brief): the
    magic-wand icon next to Product Description calls `POST
    /api/products/generate-description` (`apps/api/src/products`), which
    builds a short prompt from the current name/category/price and calls the
    real Gemini API (`gemini-2.0-flash`, native `fetch`, ~10s timeout).
    Requires `GEMINI_API_KEY` — see env vars above; without it the endpoint
    returns a clean 503 and the rest of the form is unaffected. The pencil
    icon just toggles the textarea between read-only and editable; no API
    call.
- **Product List:** API-integrated table with search, category filter,
  status filter, and pagination; edit and delete actions call
  `PATCH`/`DELETE /products/:id` (edit reuses the same form component as Add
  Product, since the API explicitly exposes update/delete and leaving them
  unreachable from the UI would be dead functionality).

## 5. Out of scope (per brief)

Order Management, Customers, Coupon Code, Brand, Product Media/Reviews,
Admin role/Control Authority, and any screen in the Figma kit beyond
Dashboard / Add Product / Product List.

## 6. Deliverables checklist

- [x] GitHub repo — monorepo (`apps/api` + `apps/web`)
- [ ] Deployed demo URL(s) — deploy `apps/api` (e.g. Render/Railway) and
      `apps/web` (e.g. Vercel) and fill in below
- [x] README with setup, env vars, architecture notes, seed credentials
- [x] Seed script (`npx prisma db seed`)

| | URL |
|---|---|
| Live frontend | _fill in after deploy_ |
| Live API | _fill in after deploy_ |
