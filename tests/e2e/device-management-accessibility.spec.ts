import { expect, test } from "@playwright/test";
test("device management provides labelled controls", async ({ page }) => { await page.goto("/devices"); await expect(page.getByLabel("Tìm thiết bị")).toBeVisible(); await expect(page.getByRole("button", { name: "Tạo device" })).toBeVisible(); });
