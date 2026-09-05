import { expect, test } from "@playwright/test";
test("device management navigation is reachable from the landing page", async ({ page }) => { await page.goto("/"); await page.getByRole("link", { name: "Quản lý thiết bị" }).click(); await expect(page).toHaveURL(/\/devices$/); });
