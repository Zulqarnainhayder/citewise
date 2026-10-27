import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";

// Locally the keys live in .env.local; in CI they come from repository secrets.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const port = Number(process.env.PORT ?? 3000);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${port}`;

/**
 * Browser tests. They sign in as a temporary user created per test (see e2e/fixtures.ts),
 * so they need real Supabase and Gemini keys in the environment:
 *   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_API_KEY
 * Locally:  npx playwright test   (starts `next dev` unless one is running)
 * CI:       builds the app and tests the production server.
 */
export default defineConfig({
  testDir: "./e2e",
  // Tests that call Gemini share one small free quota, so run one at a time.
  workers: 1,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    // Locally use the installed Chrome; CI installs Playwright's own Chromium.
    ...devices["Desktop Chrome"],
    channel: process.env.CI ? undefined : "chrome",
    viewport: { width: 1400, height: 900 },
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: process.env.CI ? `npm run start -- --port ${port}` : "npm run dev",
        url: `${baseURL}/login`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
