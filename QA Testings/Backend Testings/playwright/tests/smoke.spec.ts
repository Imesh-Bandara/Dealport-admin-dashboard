import { test, expect } from "@playwright/test";
import { login, authHeader, ADMIN_EMAIL, ADMIN_PASSWORD } from "./helpers";

/**
 * Smoke tests — fast, critical-path checks that the deployed backend is up
 * and its core contract (auth, categories, products list, guard) still
 * holds. Run alone with: npm run test:smoke
 *
 * NOTE: /auth/login has its own stricter throttle (5 requests/60s per IP —
 * see @Throttle in auth.controller.ts), on top of the general 60/60s API
 * limit — deliberate brute-force protection. So besides the two tests that
 * exercise login directly, everything else logs in once in beforeAll and
 * reuses that token, instead of re-authenticating per test.
 */
test.describe("Smoke — critical path @smoke", () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await login(request);
  });

  test("POST /auth/login succeeds with valid seeded credentials @smoke", async ({ request }) => {
    const res = await request.post("auth/login", {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty("accessToken");
    expect(body.user.email).toBe(ADMIN_EMAIL);
  });

  test("POST /auth/login rejects an invalid password @smoke", async ({ request }) => {
    const res = await request.post("auth/login", {
      data: { email: ADMIN_EMAIL, password: "definitely-wrong-password" },
    });
    expect(res.status()).toBe(401);
  });

  test("GET /categories returns the seeded categories @smoke", async ({ request }) => {
    const res = await request.get("categories", { headers: authHeader(token) });
    expect(res.status()).toBe(200);
    const categories = await res.json();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThanOrEqual(5);
  });

  test("GET /products returns a paginated product list @smoke", async ({ request }) => {
    const res = await request.get("products?page=1&limit=5", { headers: authHeader(token) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("items");
    expect(body).toHaveProperty("meta");
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.meta.total).toBeGreaterThan(0);
  });

  test("GET /products without a token is rejected — auth guard is active @smoke", async ({ request }) => {
    const res = await request.get("products");
    expect(res.status()).toBe(401);
  });

  test("GET /products/top returns the top-products widget data @smoke", async ({ request }) => {
    const res = await request.get("products/top?limit=4", { headers: authHeader(token) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test("GET /products/best-selling returns the best-selling widget data @smoke", async ({ request }) => {
    const res = await request.get("products/best-selling?limit=4", { headers: authHeader(token) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });
});
