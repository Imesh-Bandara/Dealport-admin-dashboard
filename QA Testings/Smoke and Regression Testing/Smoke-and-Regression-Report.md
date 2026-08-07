# Smoke & Regression Testing Report — Dealport Admin Dashboard

**Date:** 2026-08-07
**Target:** `https://dealport-admin-dashboard.onrender.com/api` (live Render production deployment)
**Source suite:** [`QA Testings/Backend Testings/playwright`](../Backend%20Testings/playwright) — this report summarizes that suite's results by test category. Full terminal output lives in [`Backend-API-Test-Report.md`](../Backend%20Testings/Backend-API-Test-Report.md).

> Scope note: this covers the **backend API** only, since that's what's currently automatable here. Frontend test results will be added separately under [`Frontend Testings`](../Frontend%20Testings) once supplied.

## Summary

| Suite | Tests | Passed | Failed | Pass rate |
|---|---:|---:|---:|---:|
| Smoke | 7 | 7 | 0 | 100% |
| Regression | 21 | 21 | 0 | 100% |
| **Total** | **28** | **28** | **0** | **100%** |

## Smoke testing — critical path

Fast checks that the deployed backend is up and its core contract holds: login, category/product listing, and the auth guard actually blocking unauthenticated requests.

| # | Check | Result |
|---|---|---|
| 1 | Login succeeds with valid seeded admin credentials | ✅ Pass |
| 2 | Login rejects an invalid password | ✅ Pass |
| 3 | `GET /categories` returns the 5 seeded categories | ✅ Pass |
| 4 | `GET /products` returns a paginated list | ✅ Pass |
| 5 | `GET /products` without a token is rejected (401) | ✅ Pass |
| 6 | `GET /products/top` (dashboard widget) responds | ✅ Pass |
| 7 | `GET /products/best-selling` (dashboard widget) responds | ✅ Pass |

## Regression testing — broader coverage

Checks that recent changes haven't broken existing behaviour: full CRUD lifecycle, input validation, auth-guard coverage across every protected route, and search/filter/pagination correctness.

| Category | Checks | Result |
|---|---:|---|
| Products CRUD lifecycle (create → read → update → delete → confirm gone) | 5 | ✅ 5/5 Pass |
| Validation (missing fields, unknown fields, malformed/nonexistent IDs) | 5 | ✅ 5/5 Pass |
| Auth guard coverage (products, categories, `/auth/me`) | 6 | ✅ 6/6 Pass |
| Search, status filter, pagination, stats endpoint | 5 | ✅ 5/5 Pass |

The CRUD block creates its own uniquely-named test product and deletes it again at the end — no seeded/demo data was touched or left behind by this run.

## Notable behaviour confirmed (not defects)

- `DELETE /products/:id` correctly returns `204 No Content`.
- `POST /auth/login` enforces a dedicated `5 requests/60s` per-IP throttle, independent of the general API-wide `60/60s` limit — confirmed working as brute-force protection. See [`Backend-API-Test-Report.md`](../Backend%20Testings/Backend-API-Test-Report.md) for how the test design accounts for it.

## How to reproduce

```bash
cd "QA Testings/Backend Testings/playwright"
npm install
npm run test:smoke
npm run test:regression
```
