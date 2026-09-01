import { expect, test } from "@playwright/test";

test("desktop header separates controls and navigation without collisions", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "phone-chromium", "Desktop header test");
  for (const width of [1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/demo");
    const nav = page.getByRole("navigation", { name: "Main Navigation" });
    await expect(nav).toBeVisible();
    const controls = await page.getByRole("button", { name: "Switch Active Workspace or Demo Scenario" }).boundingBox();
    const navBox = await nav.boundingBox();
    expect(navBox!.y).toBeGreaterThanOrEqual(controls!.y + controls!.height);
    const boxes = await nav.locator("a, button").evaluateAll((elements) => elements.map((element) => {
      const { left, right } = element.getBoundingClientRect();
      return { left, right };
    }));
    for (let index = 0; index < boxes.length; index++) {
      expect(boxes[index].right).toBeLessThanOrEqual(width);
      if (index > 0) expect(boxes[index].left).toBeGreaterThanOrEqual(boxes[index - 1].right);
    }
    await expect(nav.getByRole("link", { name: "Cockpit", exact: true })).not.toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("button", { name: /Modules/i })).toBeVisible();
  }
});

test("Modules supports keyboard focus, Escape, outside dismissal and navigation", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "phone-chromium", "Desktop header test");
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/login");
  const trigger = page.getByRole("button", { name: /Modules/i, exact: true });
  // This control appears after hydration; exercise keyboard navigation once the shell is interactive.
  await expect(page.getByRole("button", { name: "Switch Theme (System, Dark, Light)", exact: true })).toBeVisible();
  await page.keyboard.press("Tab");
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menuitem", { name: "Jobs & Routing", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menuitem", { name: "Shopfloor", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole("heading", { name: "Yorkstead Operations", exact: true }).click();
  await expect(page.getByRole("menu")).toBeHidden();
  await trigger.click();
  await expect(page.getByRole("menuitem")).toHaveCount(18);
  await page.getByRole("menuitem", { name: "Demo Sandboxes" }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByRole("menu")).toBeHidden();
  await page.getByRole("button", { name: /Modules/i }).click();
  await expect(page.getByRole("menuitem", { name: "Demo Sandboxes" })).toHaveAttribute("aria-current", "page");
});

test("compact header keeps controls within the phone and tablet viewport", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "desktop-chromium", "Phone header test");
  for (const width of [320, 360, 390, 640, 768, 1023]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/demo");
    await expect(page.getByRole("navigation", { name: "Main Navigation" })).toBeHidden();
    const controls = await page.getByRole("banner").locator("a, button").evaluateAll((elements) => elements.map((element) => {
      const { left, right, width } = element.getBoundingClientRect();
      return { left, right, width };
    }).filter((box) => box.width > 0));
    for (const box of controls) {
      expect(box.left).toBeGreaterThanOrEqual(0);
      expect(box.right).toBeLessThanOrEqual(width);
    }
    const toggle = page.getByRole("button", { name: "Toggle navigation menu" });
    await toggle.click();
    await expect(page.getByRole("dialog", { name: "Navigation menu" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  }
});
