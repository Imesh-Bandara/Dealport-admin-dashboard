import { defineConfig } from "@playwright/test";

/**
 * Pure API testing config — no browsers are launched. Playwright's `request`
 * fixture talks straight to the live NestJS API over HTTP.
 *
 * Target defaults to the deployed Render production API. Override with:
 *   API_BASE_URL=http://localhost:4000/api npx playwright test
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: false, // regression suite creates/deletes a shared test product — keep it sequential
  retries: 0,
  workers: 1,
  timeout: 60_000, // Render's free tier can take ~50s to wake from an idle spin-down
  reporter: [["list"], ["json", { outputFile: "test-results/results.json" }]],
  use: {
    // Trailing slash matters: paths in the tests are relative (no leading
    // "/"), so this must end in "/" or WHATWG URL resolution drops "/api"
    // entirely (new URL("/x", "host/api") resolves to "host/x", not
    // "host/api/x").
    baseURL: (process.env.API_BASE_URL || "https://dealport-admin-dashboard.onrender.com/api") + "/",
    extraHTTPHeaders: { "Content-Type": "application/json" },
  },
});
