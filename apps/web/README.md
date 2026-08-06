# DEALPORT Admin Dashboard (Web)

Next.js (App Router) + TypeScript + Tailwind CSS v4 frontend for the DEALPORT
admin dashboard take-home. Implements the three in-scope screens — Dashboard,
Add Product, Product List — against the `apps/api` NestJS backend.

See the [root README](../../README.md) for full setup instructions
(env vars, backend dependency, seed credentials). Quick reference:

```bash
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL — points at the running API
npm run dev                  # http://localhost:3000
```

Requires `apps/api` running and reachable at `NEXT_PUBLIC_API_URL`; there is
no mock-data fallback for authenticated routes.

## Structure

- `src/app` — routes: `/login`, `/dashboard`, `/products`, `/products/new`, `/products/[id]/edit`, `/products/[id]/preview`
- `src/components/layout` — `AppShell`, `Sidebar`, `Topbar`
- `src/components/dashboard` — stat cards, report chart, transaction table (static/documented per the brief), and the API-backed Top Products / Best Selling widgets
- `src/components/products` — `ProductForm` (shared by Add/Edit), customer preview
- `src/context` — `AuthContext` (JWT session), `ThemeContext` (light/dark)
- `src/lib/api.ts` — typed API client (attaches the Bearer token, centralizes error handling, redirects to `/login` on 401)
- `src/lib/types.ts` — shared TypeScript interfaces matching the API's response shapes
