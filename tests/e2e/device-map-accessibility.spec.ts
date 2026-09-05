import { expect, test } from "@playwright/test";
import { apiSnapshot } from "./device-map-fixture";

test.use({ viewport: { width: 768, height: 1024 } });
test("keyboard, explicit status and tablet touch targets", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/api/v1/map/device-states**", (route) => route.fulfill({ json: apiSnapshot(4) }));
  await page.goto("/map");
  await expect(page.getByLabel("Bộ lọc thiết bị")).toBeVisible();
  await page.getByPlaceholder("Tìm mã hoặc tên…").focus();
  await page.keyboard.type("DV-00001");
  await expect(page.getByText(/4 thiết bị/)).toBeVisible();
  const height = await page.getByPlaceholder("Tìm mã hoặc tên…").evaluate((element) => element.getBoundingClientRect().height);
  expect(height).toBeGreaterThanOrEqual(44);
});
