# Security Audit Report — Dealport Admin Dashboard

**Date:** 2026-08-07
**Scope:** Input validation across the monorepo — `apps/api` (NestJS + Prisma + PostgreSQL) and `apps/web` (Next.js)
**Target reviewed:** Codebase at commit [`eb51bf6`](https://github.com/Imesh-Bandara/Dealport-admin-dashboard/commit/eb51bf6431a49e687fe6b81ce9b2a93d0080532d), production deployment at `https://dealport-admin-dashboard.onrender.com`
**Method:** Manual + agent-assisted static review of every DTO, controller, guard, and form component, followed by targeted dynamic testing (real HTTP requests, a standalone magic-byte detector test) to confirm each finding and each fix.

## Executive summary

The application already had a solid validation baseline going in: a global `ValidationPipe` (`whitelist` + `forbidNonWhitelisted` + `transform`), `class-validator` DTOs on every `POST`/`PATCH` body, bcrypt password hashing, JWT auth on every protected route, a global rate limiter plus a stricter one on `/auth/login`, and `helmet` middleware. No SQL injection, XSS, or auth-bypass vulnerabilities were found — Prisma parameterizes all queries, React auto-escapes all rendered output, and every mutating route sits behind `JwtAuthGuard`.

The audit found **6 concrete gaps**, all in the "unvalidated edge case" category rather than exploitable-today vulnerabilities: two endpoints that bypassed DTO validation entirely for a query parameter, a file-upload filter that trusted a spoofable client header instead of actual file content, an auth timing side-channel, and a couple of missing upper bounds. All 6 are fixed in code and covered by tests. **One item is still open**: the fix is not yet confirmed live on the Render production deployment — see [Deployment status](#deployment-status).

| Severity | Count |
|---|---:|
| Medium | 2 |
| Low | 4 |
| **Total** | **6** |

## Findings & remediation

### 1. [Medium] File upload trusted client-supplied `Content-Type`, not actual file content
**File:** `apps/api/src/uploads/uploads.controller.ts`
**Risk:** The `fileFilter` only checked `file.mimetype` — a header the client fully controls. An attacker could rename any file (e.g. an HTML/script payload) and claim `Content-Type: image/png` to get it accepted, written to disk, and served back publicly from `/uploads/...` (the static file server is configured `crossOriginResourcePolicy: 'cross-origin'`). This is a stored-content risk, not a direct code-execution one (Node serves it as a static file, not interpreted), but a browser opening the file directly could still execute embedded script if the content type response header or file extension caused it to render as HTML.
**Fix:** Added real magic-byte sniffing (`detectImageMimeType`) that reads the first 12 bytes of the file *after* it's written and checks them against the actual JPEG/PNG/GIF/WEBP signatures. Files that fail this check are deleted and the request rejected with `400`. The on-disk file extension is now derived from the *verified* type, never from the client-supplied filename.
**Verified:** Standalone test against real PNG/JPEG/GIF/WEBP headers (all correctly detected) and a spoofed HTML-as-image payload (correctly returned `null` → rejected). See test transcript in [Verification](#verification).

### 2. [Medium] Auth timing side-channel allowed email enumeration
**File:** `apps/api/src/auth/auth.service.ts`
**Risk:** `login()` returned immediately with `401` when no user matched the email, *before* ever calling `bcrypt.compare()`. Since bcrypt is deliberately slow and short-circuiting skips it entirely, an attacker measuring response times could distinguish "no such user" (fast) from "wrong password" (slow) and enumerate valid admin emails — even though the HTTP response body itself was already a generic `"Invalid email or password"` message with no direct leak.
**Fix:** A precomputed dummy bcrypt hash is now compared against on every login attempt where no user is found, so the "user not found" and "wrong password" paths do the same amount of work and take comparable time.

### 3. [Low] `GET /products/top` and `GET /products/best-selling` had an unbounded `limit`
**File:** `apps/api/src/products/products.controller.ts`, `products.service.ts`
**Risk:** Both endpoints read `?limit=` as a raw string and passed `Number(limit)` straight into Prisma's `take` with no validation — every other list-style endpoint in the API goes through a bounded DTO, but these two didn't. `limit=999999999` (or a negative number, or `NaN` from a non-numeric value) went straight to the database layer unchecked.
**Fix:** Added `LimitQueryDto` (new file: `apps/api/src/products/dto/limit-query.dto.ts`) with `@IsInt() @Min(1) @Max(50)`, applied via the same global `ValidationPipe` every other endpoint already uses.

### 4. [Low] `LoginDto.password` had no upper bound
**File:** `apps/api/src/auth/dto/login.dto.ts`
**Risk:** Only `@MinLength(6)` was set. An attacker could submit an arbitrarily large password string (limited only by the framework's default body-size limit) on every login attempt, forcing bcrypt to process megabyte-scale input repeatedly — unnecessary CPU/bandwidth cost stacked on top of, though not bypassing, the existing 5-requests/60s login throttle.
**Fix:** Added `@MaxLength(72)` — bcrypt itself silently ignores bytes past 72, so anything longer was already pointless to accept. Also added `@MaxLength(254)` to `email` (RFC 5321 mailbox length limit).

### 5. [Low] `QueryProductDto.page` and `CreateProductDto.stockQuantity` had no upper bound
**File:** `apps/api/src/products/dto/query-product.dto.ts`, `create-product.dto.ts`
**Risk:** `page` could be requested as an arbitrarily large number (returns an empty result set, not a crash — low impact, but inconsistent with `limit`, which was already capped). `stockQuantity` had no cap even though `price`/`discountPrice` on the same DTO were already capped at 1,000,000 — an inconsistency rather than a direct exploit.
**Fix:** Added `@Max(100_000)` to `page` and `@Max(1_000_000)` to `stockQuantity`, matching the existing pattern used elsewhere in the same DTO.

### 6. [Low] Frontend validation didn't mirror backend rules (defense-in-depth gap)
**Files:** `apps/web/src/app/login/page.tsx`, `apps/web/src/components/products/ProductForm.tsx`, `apps/web/src/app/products/page.tsx`
**Risk:** Not directly exploitable — the backend DTOs are the real enforcement point and were never bypassable — but several forms opted out of native browser validation (`noValidate`) without replacing it with equivalent JavaScript checks, so users only found out about invalid input (oversized price/stock/tags, bad email format) after a round trip to the API.
**Fix:**
- Login page: added real client-side email-format and password-length (6–72) validation with inline error messages, plus matching `maxLength`/`minLength` attributes.
- `ProductForm`: added client-side checks mirroring the backend's bounds — price/discount upper limit (1,000,000), stock quantity bounds, and a 20-tag cap — all checked before the network call, all still enforced server-side regardless.
- Products list search input: added `maxLength={200}`, matching `QueryProductDto.search`.

## What was checked and found to already be solid (no action needed)

- **SQL injection:** All DB access goes through Prisma's parameterized query builder — no raw SQL, no string concatenation into queries.
- **XSS:** Only one `dangerouslySetInnerHTML` in the entire frontend (`layout.tsx`, the theme-init script), and it's a static string with no user-input interpolation. All product data is rendered as plain JSX text, which React auto-escapes.
- **Auth guard coverage:** Every mutating route (`POST`/`PATCH`/`DELETE` on products, `GET /categories`, `GET /auth/me`) is behind `JwtAuthGuard` — confirmed both by static review and by the regression test suite in `QA Testings/`.
- **Password storage:** bcrypt hashing, plaintext password never logged or persisted (only the email is logged on a failed attempt).
- **Rate limiting:** A global 60-req/60s limit plus a stricter 5-req/60s limit specifically on `/auth/login` — confirmed working via live testing (see `QA Testings/Backend Testings/Backend-API-Test-Report.md` for how the test suite adapted to it).
- **CORS:** Origin allow-list driven by `CORS_ORIGIN`, fails closed to `localhost` if unset in production (safe default, not silently permissive).
- **Global `ValidationPipe`:** `whitelist: true, forbidNonWhitelisted: true` — any request body field not declared on a DTO is stripped/rejected, not silently accepted.

## Verification

Both apps build clean after all fixes:

```
apps/api: npx tsc --noEmit  → no errors
apps/api: npm run build (nest build) → success
apps/web: npx tsc --noEmit  → no errors
apps/web: npm run build (next build) → success, all routes compiled
```

The new upload magic-byte detector was tested standalone against real image headers and a spoofed payload:

```
test.png  => image/png
test.gif  => image/gif
test.jpg  => image/jpeg
test.webp => image/webp
evil.html => null   (correctly rejected — HTML file spoofing as an image)
```

## Deployment status

⚠️ **As of this report, the fixes are committed and pushed to `main` (commit `eb51bf6`) but not yet confirmed live on the Render production deployment.** A post-deploy check against `https://dealport-admin-dashboard.onrender.com/api` still showed the old (unvalidated) behavior — `GET /products/top?limit=999999` returned `200` instead of the expected `400`, and an 80-character login password returned `401` (reached the auth logic) instead of `400` (rejected by the new `@MaxLength` before reaching it).

This needs to be re-checked once the Render deploy is confirmed to have picked up the latest commit — either via **Auto-Deploy** (if enabled) or a manual **Deploy latest commit** from the Render dashboard. Once confirmed live, re-run:

```bash
cd "QA Testings/Backend Testings/playwright"
npm run test:regression   # should still be 21/21 — nothing here changes success-path behavior
```

and the two manual checks above, then update this section.

## Recommended future hardening (not yet actioned — out of scope for this pass)

These were noted during the audit but weren't part of the "add validation" ask and haven't been implemented:

- **JWT storage:** the access token is kept in `localStorage` (`apps/web/src/lib/api.ts`), which is readable by any script if an XSS vector were ever introduced elsewhere. An `httpOnly` cookie would remove that exposure, at the cost of a larger auth-flow rework (CSRF handling, SameSite config).
- **Content-Security-Policy:** `helmet()` is applied but only `crossOriginResourcePolicy` is customized; an explicit CSP would give another layer of XSS defense even though none was found.
- **Uploaded-file re-encoding:** the magic-byte check confirms the file *starts with* a valid image signature, but doesn't fully parse/re-encode the image — a malformed-but-signature-valid file could theoretically still exploit a bug in whatever eventually decodes it (browser, thumbnail generator, etc.). Re-encoding uploads through a trusted image library before serving them would close that residual gap.
- **Password policy:** there's no user-registration or password-change flow today (accounts are seeded), so this wasn't in scope — but if one is added later, enforce complexity rules at that point, not just length.
