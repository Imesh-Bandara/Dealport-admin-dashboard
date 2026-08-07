# Backend API Test Report — Dealport Admin Dashboard

**Date:** 2026-08-07
**Target:** `https://dealport-admin-dashboard.onrender.com/api` (live Render production deployment)
**Database:** Neon PostgreSQL (production)
**Tooling:** [Playwright Test](https://playwright.dev/docs/api-testing) `v1.62.1`, pure API mode (`request` fixture — no browser, runs straight from the terminal) on Node `v22.22.2`
**Test project:** [`playwright/`](playwright) in this folder

## Scope

Automated coverage of every route exposed by the NestJS API (`apps/api`):

| Area | Routes covered |
|---|---|
| Auth | `POST /auth/login`, `GET /auth/me` |
| Categories | `GET /categories` |
| Products | `GET /products`, `GET /products/:id`, `GET /products/top`, `GET /products/best-selling`, `GET /products/stats`, `POST /products`, `PATCH /products/:id`, `DELETE /products/:id` |

Split into two suites (see [`QA Testings/Smoke and Regression Testing`](../Smoke%20and%20Regression%20Testing) for the category breakdown):

- **Smoke** (`tests/smoke.spec.ts`, tag `@smoke`) — 7 tests, fast critical-path checks.
- **Regression** (`tests/regression.spec.ts`, tag `@regression`) — 21 tests, full CRUD lifecycle, validation, auth-guard coverage, and search/filter/pagination behaviour.

The regression CRUD block creates its **own** uniquely-named test product and deletes it again at the end of the run — no seeded data is touched or left behind.

## How to run it

```bash
cd "QA Testings/Backend Testings/playwright"
npm install
npm test              # everything
npm run test:smoke    # smoke suite only
npm run test:regression   # regression suite only
```

Target a different environment (e.g. local dev) with:

```bash
API_BASE_URL=http://localhost:4000/api npm test
```

Credentials default to the production seed admin (`admin@dealport.dev` / `ChangeMe123!`); override with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` env vars if needed.

## Results — successful run

Smoke and regression were run as two separate passes (see **Finding 2** below for why). Both are fully green.

### Regression suite — 21/21 passed

```
Running 21 tests using 1 worker

  ✓   1 tests/regression.spec.ts:23:7 › Regression — Products CRUD lifecycle @regression › creates a product with valid data @regression (1.1s)
  ✓   2 tests/regression.spec.ts:41:7 › Regression — Products CRUD lifecycle @regression › retrieves the created product by id @regression (492ms)
  ✓   3 tests/regression.spec.ts:49:7 › Regression — Products CRUD lifecycle @regression › updates the product via PATCH (partial update) @regression (812ms)
  ✓   4 tests/regression.spec.ts:62:7 › Regression — Products CRUD lifecycle @regression › deletes the product @regression (600ms)
  ✓   5 tests/regression.spec.ts:69:7 › Regression — Products CRUD lifecycle @regression › the deleted product now 404s @regression (379ms)
  ✓   6 tests/regression.spec.ts:81:7 › Regression — Validation @regression › rejects product creation missing the required name/price @regression (332ms)
  ✓   7 tests/regression.spec.ts:89:7 › Regression — Validation @regression › rejects a product payload with an unknown field (whitelist validation) @regression (356ms)
  ✓   8 tests/regression.spec.ts:97:7 › Regression — Validation @regression › rejects a malformed UUID in GET /products/:id @regression (968ms)
  ✓   9 tests/regression.spec.ts:102:7 › Regression — Validation @regression › returns 404 for a well-formed but nonexistent product UUID @regression (1.2s)
  ✓  10 tests/regression.spec.ts:109:7 › Regression — Validation @regression › returns 404 deleting a nonexistent product @regression (777ms)
  ✓  11 tests/regression.spec.ts:118:7 › Regression — Auth guard coverage @regression › POST /products without a token is rejected @regression (344ms)
  ✓  12 tests/regression.spec.ts:123:7 › Regression — Auth guard coverage @regression › PATCH /products/:id without a token is rejected @regression (376ms)
  ✓  13 tests/regression.spec.ts:130:7 › Regression — Auth guard coverage @regression › DELETE /products/:id without a token is rejected @regression (349ms)
  ✓  14 tests/regression.spec.ts:135:7 › Regression — Auth guard coverage @regression › GET /categories without a token is rejected @regression (330ms)
  ✓  15 tests/regression.spec.ts:140:7 › Regression — Auth guard coverage @regression › GET /auth/me without a token is rejected @regression (336ms)
  ✓  16 tests/regression.spec.ts:145:7 › Regression — Auth guard coverage @regression › GET /auth/me with a valid token returns the logged-in user @regression (1.1s)
  ✓  17 tests/regression.spec.ts:160:7 › Regression — Search, filter, pagination @regression › search returns a relevant match for a known seeded product @regression (885ms)
  ✓  18 tests/regression.spec.ts:168:7 › Regression — Search, filter, pagination @regression › search returns an empty result set for a nonsense query @regression (567ms)
  ✓  19 tests/regression.spec.ts:176:7 › Regression — Search, filter, pagination @regression › status filter only returns matching products @regression (984ms)
  ✓  20 tests/regression.spec.ts:186:7 › Regression — Search, filter, pagination @regression › pagination returns disjoint pages with consistent meta @regression (2.5s)
  ✓  21 tests/regression.spec.ts:200:7 › Regression — Search, filter, pagination @regression › GET /products/stats returns dashboard stat data @regression (641ms)

  21 passed (25.5s)
```

### Smoke suite — 7/7 passed

```
Running 7 tests using 1 worker

  ✓  1 tests/smoke.spec.ts:22:7 › Smoke — critical path @smoke › POST /auth/login succeeds with valid seeded credentials @smoke (673ms)
  ✓  2 tests/smoke.spec.ts:32:7 › Smoke — critical path @smoke › POST /auth/login rejects an invalid password @smoke (1.1s)
  ✓  3 tests/smoke.spec.ts:39:7 › Smoke — critical path @smoke › GET /categories returns the seeded categories @smoke (497ms)
  ✓  4 tests/smoke.spec.ts:47:7 › Smoke — critical path @smoke › GET /products returns a paginated product list @smoke (970ms)
  ✓  5 tests/smoke.spec.ts:57:7 › Smoke — critical path @smoke › GET /products without a token is rejected — auth guard is active @smoke (390ms)
  ✓  6 tests/smoke.spec.ts:62:7 › Smoke — critical path @smoke › GET /products/top returns the top-products widget data @smoke (535ms)
  ✓  7 tests/smoke.spec.ts:69:7 › Smoke — critical path @smoke › GET /products/best-selling returns the best-selling widget data @smoke (506ms)

  7 passed (6.1s)
```

**Total: 28/28 passed.**

## Findings along the way

Two real things surfaced while building this suite — neither is a defect in the app, both are noted here for the record:

1. **`DELETE /products/:id` returns `204 No Content`, not `200` with a body.** The suite's first draft assumed `200 + {id, deleted: true}` (matching an earlier manual audit note), but the controller explicitly sets `@HttpCode(HttpStatus.NO_CONTENT)`. This is the more conventional REST response for a delete with nothing to return — the test was updated to expect `204`, not the API.
2. **`POST /auth/login` has its own stricter rate limit: 5 requests/60s per IP** (`@Throttle({ default: { limit: 5, ttl: 60000 } })` in `auth.controller.ts`), on top of the general `60 requests/60s` API-wide limit — deliberate brute-force protection. Running smoke and regression back-to-back in one process, with a login call in nearly every test, exceeded that 5/60s login-specific cap and produced spurious `429` failures. Fixed by having each suite log in **once** (`beforeAll`) and reuse the token, except the two tests that specifically exercise login itself. This is also why smoke and regression are documented here as two separate passes rather than one combined run — that mirrors how a real CI pipeline would stage them anyway (fast smoke check on every deploy, fuller regression pass separately).
