import { expect, test } from "@playwright/test";
import { apiSnapshot } from "./device-map-fixture";

test("Tailwind retains marker states and map breakpoint layout", async ({ page }) => {
  const snapshot = apiSnapshot(4);
  snapshot.items[0]!.alert_level = "critical";
  await page.route("**/api/v1/map/device-states**", (route) => route.fulfill({ json: snapshot }));
  await page.goto("/map");
  const offline = page.locator(".device-marker.is-offline").first();
  await expect(offline).toHaveCSS("width", "38px");
  await expect(offline).toHaveCSS("height", "38px");
  await expect(offline).toHaveCSS("background-color", "rgb(104, 114, 110)");
  await expect(offline.locator(".device-marker-status")).toHaveCSS(
    "background-color",
    "rgb(157, 165, 161)"
  );
  await expect
    .poll(() => offline.evaluate((el) => getComputedStyle(el, "::after").content))
    .toBe('"!"');
  await expect(page.locator(".map-toolbar")).toHaveCSS("flex-direction", "row");
  await page.setViewportSize({ width: 760, height: 900 });
  await expect(page.locator(".map-toolbar")).toHaveCSS("flex-direction", "column");
  await expect(page.getByPlaceholder("Tìm mã hoặc tên…")).toHaveCSS("width", "240px");
});

test("Tailwind retains catalog layout, small buttons and standalone Leaflet editor", async ({
  page,
}) => {
  await page.goto("/devices");
  await expect(page.getByRole("button", { name: "Chi tiết" }).first()).toHaveCSS(
    "min-height",
    "36px"
  );
  await page.setViewportSize({ width: 940, height: 900 });
  await expect(page.locator(".devices-header")).toHaveCSS("flex-direction", "column");
  await expect(page.locator(".device-detail")).toHaveCSS("position", "static");
  await page.getByRole("button", { name: "Tạo object", exact: true }).click();
  const map = page.locator(".point-map .leaflet-container");
  await expect(map).toBeVisible();
  await expect(map).toHaveCSS("position", "relative");
  await expect
    .poll(() => map.evaluate((el) => el.getBoundingClientRect().height))
    .toBeGreaterThan(200);
});
