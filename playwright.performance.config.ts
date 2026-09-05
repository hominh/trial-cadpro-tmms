import { defineConfig, devices } from "@playwright/test";
export default defineConfig({ testDir: "./tests/performance", use: { ...devices["Desktop Chrome"], headless: true, viewport: { width: 1440, height: 900 } } });
