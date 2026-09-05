import { expect, test } from "@playwright/test";
test("US2: displays device feature state", async ({ page }) => { await page.goto("/devices"); await page.getByRole("button", { name: "Chi tiết" }).first().click(); await expect(page.getByRole("heading", { name: "Feature khả dụng" })).toBeVisible(); await expect(page.getByRole("switch").first()).toBeVisible(); });
