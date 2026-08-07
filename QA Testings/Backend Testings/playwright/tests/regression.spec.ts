import { test, expect } from "@playwright/test";
import { login, authHeader } from "./helpers";

/**
 * Regression tests — broader coverage of CRUD, validation, auth guards,
 * and search/filter/pagination behaviour, to catch anything a recent
 * change may have broken. Run alone with: npm run test:regression
 *
 * The CRUD lifecycle block creates its own uniquely-named test product and
 * deletes it again at the end — it does not touch or leave behind any
 * seeded data.
 */

test.describe("Regression — Products CRUD lifecycle @regression", () => {
  let token: string;
  let createdProductId: string;
  const testProductName = `QA Regression Test Product ${Date.now()}`;

  test.beforeAll(async ({ request }) => {
    token = await login(request);
  });

  test("creates a product with valid data @regression", async ({ request }) => {
    const res = await request.post("products", {
      headers: authHeader(token),
      data: {
        name: testProductName,
        description: "Created by an automated regression test run — safe to ignore.",
        price: 19.99,
        stockQuantity: 10,
        status: "DRAFT",
      },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.name).toBe(testProductName);
    expect(body.status).toBe("DRAFT");
    createdProductId = body.id;
  });

  test("retrieves the created product by id @regression", async ({ request }) => {
    const res = await request.get(`products/${createdProductId}`, { headers: authHeader(token) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(createdProductId);
    expect(body.name).toBe(testProductName);
  });

  test("updates the product via PATCH (partial update) @regression", async ({ request }) => {
    const res = await request.patch(`products/${createdProductId}`, {
      headers: authHeader(token),
      data: { price: 24.99, status: "PUBLISHED" },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Number(body.price)).toBe(24.99);
    expect(body.status).toBe("PUBLISHED");
    // Fields not included in the PATCH body must be left untouched.
    expect(body.name).toBe(testProductName);
  });

  test("deletes the product @regression", async ({ request }) => {
    // The controller explicitly sets @HttpCode(HttpStatus.NO_CONTENT) — a
    // successful delete returns 204 with an empty body, not 200 + a body.
    const res = await request.delete(`products/${createdProductId}`, { headers: authHeader(token) });
    expect(res.status()).toBe(204);
  });

  test("the deleted product now 404s @regression", async ({ request }) => {
    const res = await request.get(`products/${createdProductId}`, { headers: authHeader(token) });
    expect(res.status()).toBe(404);
  });
});

test.describe("Regression — Validation @regression", () => {
  let token: string;
  test.beforeAll(async ({ request }) => {
    token = await login(request);
  });

  test("rejects product creation missing the required name/price @regression", async ({ request }) => {
    const res = await request.post("products", {
      headers: authHeader(token),
      data: { description: "missing name and price" },
    });
    expect(res.status()).toBe(400);
  });

  test("rejects a product payload with an unknown field (whitelist validation) @regression", async ({ request }) => {
    const res = await request.post("products", {
      headers: authHeader(token),
      data: { name: "Whitelist Test", price: 1, nonexistentField: "should be rejected" },
    });
    expect(res.status()).toBe(400);
  });

  test("rejects a malformed UUID in GET /products/:id @regression", async ({ request }) => {
    const res = await request.get("products/not-a-uuid", { headers: authHeader(token) });
    expect(res.status()).toBe(400);
  });

  test("returns 404 for a well-formed but nonexistent product UUID @regression", async ({ request }) => {
    const res = await request.get("products/00000000-0000-0000-0000-000000000000", {
      headers: authHeader(token),
    });
    expect(res.status()).toBe(404);
  });

  test("returns 404 deleting a nonexistent product @regression", async ({ request }) => {
    const res = await request.delete("products/00000000-0000-0000-0000-000000000000", {
      headers: authHeader(token),
    });
    expect(res.status()).toBe(404);
  });
});

test.describe("Regression — Auth guard coverage @regression", () => {
  test("POST /products without a token is rejected @regression", async ({ request }) => {
    const res = await request.post("products", { data: { name: "x", price: 1 } });
    expect(res.status()).toBe(401);
  });

  test("PATCH /products/:id without a token is rejected @regression", async ({ request }) => {
    const res = await request.patch("products/00000000-0000-0000-0000-000000000000", {
      data: { price: 1 },
    });
    expect(res.status()).toBe(401);
  });

  test("DELETE /products/:id without a token is rejected @regression", async ({ request }) => {
    const res = await request.delete("products/00000000-0000-0000-0000-000000000000");
    expect(res.status()).toBe(401);
  });

  test("GET /categories without a token is rejected @regression", async ({ request }) => {
    const res = await request.get("categories");
    expect(res.status()).toBe(401);
  });

  test("GET /auth/me without a token is rejected @regression", async ({ request }) => {
    const res = await request.get("auth/me");
    expect(res.status()).toBe(401);
  });

  test("GET /auth/me with a valid token returns the logged-in user @regression", async ({ request }) => {
    const token = await login(request);
    const res = await request.get("auth/me", { headers: authHeader(token) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("email");
  });
});

test.describe("Regression — Search, filter, pagination @regression", () => {
  let token: string;
  test.beforeAll(async ({ request }) => {
    token = await login(request);
  });

  test("search returns a relevant match for a known seeded product @regression", async ({ request }) => {
    const res = await request.get("products?search=iphone", { headers: authHeader(token) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.items.length).toBeGreaterThan(0);
    expect(body.items.some((p: { name: string }) => p.name.toLowerCase().includes("iphone"))).toBe(true);
  });

  test("search returns an empty result set for a nonsense query @regression", async ({ request }) => {
    const res = await request.get("products?search=zzzznomatchxyz123", { headers: authHeader(token) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.items.length).toBe(0);
    expect(body.meta.total).toBe(0);
  });

  test("status filter only returns matching products @regression", async ({ request }) => {
    const res = await request.get("products?status=PUBLISHED&limit=50", { headers: authHeader(token) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.items.length).toBeGreaterThan(0);
    for (const p of body.items as { status: string }[]) {
      expect(p.status).toBe("PUBLISHED");
    }
  });

  test("pagination returns disjoint pages with consistent meta @regression", async ({ request }) => {
    const page1res = await request.get("products?limit=2&page=1", { headers: authHeader(token) });
    const page2res = await request.get("products?limit=2&page=2", { headers: authHeader(token) });
    expect(page1res.status()).toBe(200);
    expect(page2res.status()).toBe(200);
    const page1 = await page1res.json();
    const page2 = await page2res.json();
    const ids1 = page1.items.map((p: { id: string }) => p.id);
    const ids2 = page2.items.map((p: { id: string }) => p.id);
    expect(ids1.some((id: string) => ids2.includes(id))).toBe(false);
    expect(page1.meta.page).toBe(1);
    expect(page2.meta.page).toBe(2);
  });

  test("GET /products/stats returns dashboard stat data @regression", async ({ request }) => {
    const res = await request.get("products/stats", { headers: authHeader(token) });
    expect(res.status()).toBe(200);
  });
});
