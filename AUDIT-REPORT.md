# DEALPORT Admin Dashboard + Products API — Compliance Audit

**Audited:** 2026-08-06 · Monorepo `apps/api` (NestJS) + `apps/web` (Next.js) · Read-only audit against the take-home spec.

## Stack sanity check

- **Backend**: NestJS 11 (`@nestjs/core`, `@nestjs/common` in `apps/api/package.json`), TypeScript, `@prisma/client` + `prisma` 6.19, `bcrypt`, `class-validator`/`class-transformer`. `apps/api/prisma/schema.prisma` → `datasource db { provider = "postgresql" }`. **Confirmed: real NestJS + Prisma + PostgreSQL, nothing substituted.**
- **Frontend**: `apps/web/src/app/` exists (App Router, no `pages/` dir), `next: 16.3.0`, `typescript`, `tailwindcss: ^4` + `@tailwindcss/postcss`, imported via `@import "tailwindcss"` in `globals.css` (Tailwind v4's CSS-first config — no `tailwind.config.js` is expected or missing for this version). **Confirmed: Next.js App Router + TypeScript + Tailwind v4, nothing substituted.**

---

## A. Backend — Auth

- **[DONE]** `auth` module with own controller + service — `apps/api/src/auth/auth.controller.ts`, `auth.service.ts`, `auth.module.ts`.
- **[DONE]** `POST /auth/login` accepts credentials, returns a JWT — `auth.controller.ts:18-21`, `auth.service.ts:16-47`. Runtime-verified: `curl -X POST /api/auth/login` with seeded credentials returned a signed `accessToken` + user object.
- **[DONE]** Seeded admin user with documented credentials exists — `apps/api/prisma/seed.ts:7-19` (see **Blocking Issues** — the documented credentials disagree across files).
- **[DONE]** Password checked via bcrypt hash comparison, never plaintext — `auth.service.ts:26-29` (`bcrypt.compare`), `User.passwordHash` field in schema, plaintext password never persisted or logged (`auth.service.ts:22,31` explicitly log only the email).
- **[DONE]** `JwtAuthGuard` actually applied to product-mutating routes — `@UseGuards(JwtAuthGuard)` at the controller level in `products.controller.ts:19`, `categories.controller.ts:5`, `uploads.controller.ts:20`. Runtime-verified: `GET /api/products` and `POST /api/products` without a Bearer token both returned `401`.

## B. Backend — Products

- **[DONE]** `products` module split into controller/service/DTOs — `products.controller.ts`, `products.service.ts`, `dto/{create,update,query}-product.dto.ts`.
- **[DONE]** `GET /products` list endpoint. **Search verified live**: `?search=iphone` → 1 result (`Apple iPhone 15`); `?search=zzzznomatch` → 0 results. **Pagination verified live**: `?limit=2&page=1` and `?limit=2&page=2` returned disjoint, correctly-ordered item sets; `meta.total`/`meta.totalPages` computed from a real `count()` in the same `$transaction` (`products.service.ts:31-40`).
- **[DONE]** `POST /products` creates + validates via `CreateProductDto` — `products.controller.ts:49-52`, `products.service.ts:64-83`. Static review only for the write path itself (no destructive/mutating verification performed per audit rules); validation pipe behavior was verified live (see Section E).
- **[DONE]** `GET /products/:id` returns one product, 404s correctly — `products.service.ts:53-62` (`NotFoundException`). Runtime-verified: a syntactically valid but non-existent UUID → `404`; a malformed id → `400` (`ParseUUIDPipe`); a real id → `200`.
- **[DONE]** `PATCH /products/:id` updates, validated via `UpdateProductDto` (`PartialType(CreateProductDto)`) — `products.controller.ts:54-60`, `products.service.ts:85-110`. Static review only (no mutating call made).
- **[DONE]** `DELETE /products/:id` deletes, returns `{ id, deleted: true }` — `products.controller.ts:62-65`, `products.service.ts:112-116`. Static review only (no mutating call made).
- **[DONE]** Zero direct Prisma calls in controllers — `grep -rl "PrismaService\|PrismaClient\|this.prisma" --include="*.controller.ts"` across `apps/api/src` returned **no matches**. All DB access goes through services.

## C. Backend — Categories (+ Tags)

- **[DONE]** `GET /categories` exists, returns seeded categories — `categories.controller.ts`, `categories.service.ts`. Runtime-verified: returned `Beauty, Electronic, Fashion, Home, Sports`.
- **[DONE, noted]** Tags are backed by a real `Tag` model/relation (`schema.prisma:37-41`, `Product.tags` many-to-many), not plain strings server-side — `products.service.ts` uses `connectOrCreate` on create/update. The Add Product **form** takes tags as a comma-separated text input (`ProductForm.tsx:454-465`) and splits them client-side before sending an array to the API, so the UX is string-based but the persistence is a real relational model. Either is spec-acceptable; this is the stronger of the two options.

## D. Backend — Data layer (Prisma)

- **[DONE]** `User` model with auth fields incl. `passwordHash` — `schema.prisma:20-28`.
- **[DONE]** `Product` model — name, price (`Decimal(10,2)`), stock fields, `category` relation, `status` enum (`DRAFT`/`PUBLISHED`), `imageUrl` + `images[]` — `schema.prisma:43-68`.
- **[DONE]** `Category` model — `schema.prisma:30-35`.
- **[DONE]** `Tag` model present (not omitted) — `schema.prisma:37-41`.
- **[DONE]** Migrations committed — `apps/api/prisma/migrations/20260804073140_init/migration.sql` and `migration_lock.toml` are tracked in git (`git ls-files` confirms), not gitignored.
- **[DONE]** Seed script populates admin user, 5 categories, and 8 sample products with varied status/stock — `apps/api/prisma/seed.ts`. Runtime-verified by actually running `npx prisma migrate dev` + `npx prisma db seed` against a fresh local Postgres: migration applied cleanly, seed completed, dashboard/list endpoints returned non-empty data immediately.

## E. Backend — Validation & architecture

- **[DONE]** Every `POST`/`PATCH` body typed via a DTO class — `CreateProductDto`, `UpdateProductDto`, `LoginDto`.
- **[DONE]** DTOs use `class-validator` decorators, and a global `ValidationPipe` is registered in `main.ts:21-28` with `whitelist: true, forbidNonWhitelisted: true, transform: true`. Runtime-verified: `POST /products` with an unknown field (`{"nonexistentField":"x"}`) → `400` before touching the DB; `POST /products` missing the required `name` → `400` with the specific `class-validator` messages, not a Prisma error.
- **[DONE]** Controllers contain no business logic or direct Prisma access, only delegate to services — confirmed by reading every controller file (Section B) and the same grep as above.

## F. Frontend — Shell & layout

- **[DONE]** App Router + TypeScript + Tailwind confirmed (see stack sanity check above).
- **[DONE]** Sidebar contains Dashboard / Add Products / Product List with visible active-route highlighting — `Sidebar.tsx:30-45` (nav arrays), `Sidebar.tsx:72-89` (`active` class applied via `usePathname()` comparison, `bg-emerald-600 text-white` on the active item).
- **[DONE]** Emerald/green applied as the primary color throughout — `bg-emerald-600`/`text-emerald-*` used for the active nav item, primary buttons, focus rings, and chart line color (`ReportChart.tsx:91,123` `#059669`).
- **[Note, not a gap]** The sidebar additionally renders full nav sections for Order Management, Customers, Coupon Code, Categories, Transaction, Brand, Product Media, Product Reviews, Admin role, and Control Authority (`Sidebar.tsx:30-50`), each routing to a real page (mostly `ComingSoon.tsx` or mock-data pages added in the `5f19e81` commit). Per Section L these extra screens are not required and are not flagged as a gap here — but see **Blocking Issues** for a documentation-accuracy problem this creates.

## G. Frontend — Dashboard

- **[DONE, documented]** Stat cards (Total Sales / Total Orders / Pending & Canceled) — `app/dashboard/page.tsx:16-39`, `StatCard.tsx`. Values are static, which is spec-allowed since Order Management/Transactions are out of scope; the README documents this (`README.md:136-140`).
- **[DONE, documented]** "Report for this week" chart — `ReportChart.tsx`, Recharts `AreaChart` with a this-week/last-week toggle. Static series, documented in README as allowed.
- **[DONE, documented]** Transaction table — `TransactionTable.tsx:3-11`, static array with an in-code comment explicitly citing the brief ("out of scope for the Products API per the assessment brief"), and also documented in the README.
- **[DONE — hard requirement met]** Best Selling / Top Products widgets make **real fetches** to the NestJS API, not hardcoded arrays: `TopProductsWidget.tsx:13-18` calls `api.products.top(4)` → `GET /products/top`; `BestSellingWidget.tsx:13-18` calls `api.products.bestSelling(4)` → `GET /products/best-selling`. Runtime-verified: both endpoints return live Prisma-backed data ordered by `totalOrders`, and the widgets render loading skeletons + an error state on fetch failure (no fallback to mock data).

## H. Frontend — Add Product

- **[DONE]** Fields for basic details, pricing (+ discount + tax toggle), inventory (quantity / unlimited / stock status / featured), category + tags — `ProductForm.tsx:203-345, 433-465`.
- **[DONE, documented]** Real image upload, not a stub: `handleMainImageSelect`/`handleGalleryImageSelect` (`ProductForm.tsx:55-95`) call `api.uploads.image()` → `POST /api/uploads/image`, a real Multer disk-storage endpoint (`uploads.controller.ts`) behind the same JWT guard, with MIME allow-list and 5MB cap enforced both client-side (`ProductForm.tsx:45-53`) and server-side (`uploads.controller.ts:17-39`). Documented in README.
- **[DONE]** "Publish Product" sets `status: "PUBLISHED"` which reaches `Product.status` via the API — `ProductForm.tsx:189` → `handleSubmit(e, "PUBLISHED")` → `buildPayload` → `api.products.create/update`.
- **[DONE]** "Save to draft" sets `status: "DRAFT"` the same way — `ProductForm.tsx:181` → `handleSubmit(e, "DRAFT")`.
- **[DONE]** Form submits to real `POST /products` (create) / `PATCH /products/:id` (edit) — `ProductForm.tsx:146-158`, no `console.log`/no-op path.
- **[DONE]** Category select populated from `GET /categories`, not hardcoded — `ProductForm.tsx:101-103` (`api.categories().then(setCategories)`), rendered at `ProductForm.tsx:446-450`.

## I. Frontend — Product List

- **[DONE]** Table populated via real `GET /products` call — `app/products/page.tsx:27-41` (`api.products.list(...)` in a `useCallback`, re-run on filter/page change), not a static array.
- **[DONE]** Search input triggers a real filtered API call — `search` state is passed straight into `api.products.list({..., search})`, hitting the server-side `contains`/`insensitive` filter verified in Section B.
- **[DONE]** Category **and** status filters present (exceeds the "minimal" bar) — `app/products/page.tsx:75-101`, both wired into the same `api.products.list` call and both server-side filters (verified live in Section B).
- **[DONE, extra]** Edit/Delete/Preview actions wired to `PATCH`/`DELETE /products/:id` and a customer-preview route — `app/products/page.tsx:47-58, 175-199`.

## J. Frontend — API integration

- **[DONE]** Typed API client with per-endpoint typed functions, not scattered ad hoc `fetch` — `lib/api.ts` (single `request<T>()` wrapper + `api.{login,me,categories,products.*,uploads.image}`), backed by full interfaces in `lib/types.ts` (`Product`, `Category`, `ProductInput`, `PaginatedProducts`, `LoginResponse`, `AuthUser`).
- **[DONE]** JWT stored after login (`localStorage`, `lib/api.ts:20-31`) and attached as `Bearer <token>` on every request via the shared `request()` wrapper (`lib/api.ts:34-37`), including product mutation calls (create/update/delete all go through the same wrapper) and the multipart upload call (`lib/api.ts:110-113`).
- **[DONE]** Unauthenticated users handled: `AuthGuard.tsx` redirects to `/login` when there's no authenticated user; `lib/api.ts:41-49` also force-clears the token and hard-redirects to `/login` on any `401` response from the API, independent of the client-side guard.

## K. Deliverables & submission readiness

- **[DONE]** GitHub repo accessible — `git remote -v` → `https://github.com/Imesh-Bandara/Dealport-admin-dashboard.git`, monorepo layout (`apps/api` + `apps/web`), working tree clean and in sync with `origin/main` at audit time.
- **[DONE]** README setup/run instructions — root `README.md` covers both apps, DB setup SQL, migrate/seed commands, and env vars.
- **[DONE]** `.env.example` present for both apps documenting all required vars (`apps/api/.env.example`, `apps/web/.env.example`); no real secrets committed — `git grep` for password/secret/API-key literal patterns across tracked `.ts`/`.tsx` returned nothing, and both `.gitignore` files exclude `.env*` while explicitly allowing `.env.example`.
- **[DONE]** README architecture notes — root `README.md` "Architecture notes" section (backend + frontend subsections) is detailed and largely matches the code (see Blocking Issues for the one place it doesn't).
- **[PARTIAL]** README documents seed credentials for immediate login, but the credentials it documents (and that the login page pre-fills/displays) **do not match** what the seed script actually creates when set up per the README's own instructions. See **Blocking Issues**.
- **[DONE]** Seed script runs with one documented command — `npx prisma db seed` (wired via `package.json`'s `"prisma": { "seed": "ts-node --transpile-only prisma/seed.ts" }`), runtime-verified.
- **[N/A]** No deployed URLs are documented — the README's deliverables table has both Live frontend/API rows as `_fill in after deploy_`, and the checklist item above them is explicitly unchecked. Nothing to reach-test.
- **[N/A]** "Hours spent" — out of scope per instructions.

## L. Explicitly out of scope (confirmed not flagged as gaps)

Order Management, Customers, Coupon Code, Brand, Product Media/Reviews, Admin role/Control Authority screens are present in the repo (added in commit `5f19e81`) as mock-data/`ComingSoon` pages, but per the brief none of this is required and none of it is treated as a gap in this audit.

---

## Blocking Issues

Ranked by risk to the assessment outcome.

1. **Seed credentials documented in three places disagree with each other, and the one an out-of-the-box setup actually produces is the one nobody advertises.** Root `README.md` states seed credentials are `imesh@gmail.com` / `123456`; `apps/web/src/app/login/page.tsx` pre-fills the email field with `imesh@gmail.com` and displays the caption "Seed credentials: imesh@gmail.com / 123456". But `apps/api/.env.example` (the file the README itself tells a reviewer to `cp` into `.env`) defaults `SEED_ADMIN_EMAIL="admin@dealport.dev"` / `SEED_ADMIN_PASSWORD="ChangeMe123!"`, and the seed script (`prisma/seed.ts:7-8`) falls back to exactly those values when the env vars aren't overridden. This was runtime-verified directly: following the README's setup steps literally (copy `.env.example`, only touch `DATABASE_URL`/`JWT_SECRET`, run `npx prisma db seed`) produces a user with email `admin@dealport.dev` and password `ChangeMe123!` — printed by the seed script itself — not `imesh@gmail.com` / `123456`. A reviewer following the documented steps without noticing the README's own "then edit ... seed creds" aside will get a login page whose pre-filled credentials do not work against their own freshly-seeded database.
2. **README claims the sidebar is scoped to only the three in-scope screens; the shipped sidebar is not.** `README.md`'s frontend architecture notes state: "Sidebar is scoped to the three in-scope screens only (Dashboard / Add Products / Product List)... everything else in the kit... is intentionally out of scope." `Sidebar.tsx:30-50` in fact renders three full nav sections (Main menu / Product / Admin) totaling ~13 links, including Order Management, Customers, Coupon Code, Categories, Transaction, Brand, Product Media, Product Reviews, Admin role, and Control Authority. Having the extra screens is not itself a spec violation (Section L), but the README's specific, falsifiable claim about the sidebar's contents is incorrect as written, and it's the kind of statement a reviewer checks first.

## Minor / Polish Gaps

- `apps/api/README.md` and `apps/web/README.md` are unedited framework boilerplate (`nest new` / `create-next-app` defaults) rather than being customized or removed in favor of the root README. Not misleading, just noise for a reviewer opening either subfolder README directly.
- Dashboard total product count in the running local DB (9) doesn't match the 8 products the seed script creates by name — indicates at least one product was created through the running app outside of the seed script at some point (expected during manual dev/testing, not a defect, just noting it in case it's a surprise when re-seeding on a clean DB).
- `DELETE /products/:id` returns `200` with a `{ id, deleted: true }` body rather than `204 No Content`; both are defensible per the checklist's "sensible response/status code" bar, but `204` would be more conventional for a delete with no representation to return.
