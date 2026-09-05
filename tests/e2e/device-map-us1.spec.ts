import { expect, test } from "@playwright/test";
import { apiSnapshot } from "./device-map-fixture";

test("P1 renders a viewport-bounded operational map", async ({ page }) => {
  let requestUrl = "";
  await page.route("**/api/v1/map/device-states**", async (route) => { requestUrl = route.request().url(); await route.fulfill({ json: apiSnapshot(4), headers: { ETag: '"one"' } }); });
  await page.goto("/map");
  await expect(page.getByRole("heading", { name: "Bản đồ thiết bị" })).toBeVisible();
  await expect(page.locator(".device-marker")).toHaveCount(4);
  expect(new URL(requestUrl).searchParams.get("bbox")?.split(",")).toHaveLength(4);
  await expect(page.getByText(/4 thiết bị/)).toBeVisible();
});
