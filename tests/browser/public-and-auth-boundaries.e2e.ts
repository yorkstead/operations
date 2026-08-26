import { expect, test } from "@playwright/test";

test("public demo entry renders and remains vertical on a phone viewport", async ({ page }, testInfo) => {
  await page.goto("/demo");
  await expect(page).toHaveTitle(/Yorkstead/i);
  await expect(page.getByText(/synthetic/i).first()).toBeVisible();
  if (testInfo.project.name === "phone-chromium") {
    const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width);
  }
});

test("mobile navigation opens over the viewport and closes with Escape", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "phone-chromium", "Mobile navigation is hidden at desktop widths");

  await page.goto("/demo");
  const toggle = page.getByRole("button", { name: "Toggle navigation menu" });
  await toggle.click();

  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("dialog", { name: "Navigation menu" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Inventory" })).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Navigation menu" })).toBeHidden();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});

test("protected API rejects an anonymous request", async ({ request }) => {
  const response = await request.get("/api/inventory/items");
  expect(response.status()).toBe(401);
});

test("login page exposes the authentication form", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Yorkstead Operations" })).toBeVisible();
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.getByRole("button", { name: /sign in to workspace/i })).toBeVisible();
});
