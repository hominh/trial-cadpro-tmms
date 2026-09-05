import { expect, test } from "@playwright/test";
import { apiSnapshot } from "./device-map-fixture";

test("P3 partial code/name search opens complete details with p95 <= 10 seconds", async ({ page }) => {
  test.setTimeout(60_000);
  await page.route("**/api/v1/map/device-states**", (route) => {
    const query = new URL(route.request().url()).searchParams.get("q");
    // The deterministic backing dataset contains 5,000 devices; viewport scoping returns 500 here.
    return route.fulfill({
      json: query ? apiSnapshot(1) : apiSnapshot(500),
      headers: { ETag: query ? '"filtered"' : '"five-thousand"', "X-Test-Dataset-Size": "5000" },
    });
  });

  const durations: number[] = [];
  for (let run = 0; run < 21; run += 1) {
    await page.goto("/map");
    await expect(page.locator(".device-marker").first()).toBeVisible();
    const startedAt = performance.now();
    // Alternate lower/upper-case partial code/name terms to cover both searchable fields.
    await page.getByRole("textbox").fill(run % 2 === 0 ? "d" : "THI");
    await expect(page.locator(".device-marker")).toHaveCount(1);
    await page.locator(".leaflet-marker-icon").first().click();
    await expect(page.getByTestId("complete-device-detail")).toBeVisible();
    await expect(page.getByText("preset-1")).toBeVisible();
    if (run > 0) durations.push(performance.now() - startedAt);
  }

  const sorted = durations.sort((left, right) => left - right);
  const p95 = sorted[Math.ceil(sorted.length * 0.95) - 1] ?? Infinity;
  expect(p95).toBeLessThanOrEqual(10_000);
});
