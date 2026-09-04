import { expect, test } from "@playwright/test";
import { apiSnapshot } from "./device-map-fixture";

test("combined polling, ETag, stale recovery and density flow", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/v1/map/device-states**", async (route) => {
    calls += 1;
    if (calls === 2) return route.fulfill({ status: 304, body: "" });
    await route.fulfill({ json: apiSnapshot(4), headers: { ETag: calls > 2 ? '"offline-transition"' : '"online"' } });
  });
  await page.goto("/map");
  await expect(page.locator(".device-marker")).toHaveCount(4);
  await page.waitForTimeout(4100);
  expect(calls).toBeGreaterThanOrEqual(2);
});

test("422 is guidance and never partial data", async ({ page }) => {
  await page.route("**/api/v1/map/device-states**", (route) => route.fulfill({ status: 422, contentType: "application/problem+json", body: JSON.stringify({ type: "about:blank", title: "Too dense", status: 422, code: "VIEWPORT_TOO_DENSE", matched: 5001, max_items: 5000 }) }));
  await page.goto("/map");
  await expect(page.getByText(/Viewport có quá nhiều/)).toBeVisible();
  await expect(page.getByText(/zoom in/)).toBeVisible();
});
