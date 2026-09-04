import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 2,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3107",
    trace: "retain-on-failure",
  },
  webServer: process.env.PLAYWRIGHT_EXTERNAL_SERVER ? undefined : {
    command: "next start -p 3107",
    url: "http://127.0.0.1:3107",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
