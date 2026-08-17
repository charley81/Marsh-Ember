import { expect, test } from "@playwright/test";

test("visitors can navigate from menus to the dinner menu", async ({ page }) => {
  await page.goto("/menus");

  await page.getByRole("link", { name: "View Dinner Menu" }).first().click();

  await expect(page).toHaveURL(/\/menus\/dinner$/);
  await expect(page.getByRole("heading", { level: 1, name: "Dinner" })).toBeVisible();
});

test("visitors can open the accepting event and see the RSVP request form", async ({ page }) => {
  await page.goto("/events");

  await page.getByRole("link", { name: "View Event" }).click();

  await expect(page).toHaveURL(/\/events\/harvest-at-the-hearth$/);
  await expect(page.getByRole("heading", { level: 1, name: "Harvest at the Hearth" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Request an RSVP" })).toBeVisible();
});

test("unsupported event detail slugs render the branded not-found page", async ({ page }) => {
  const response = await page.goto("/events/lowcountry-oyster-roast");

  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "This table could not be found" })).toBeVisible();
});

test("the mobile menu supports Escape and restores trigger focus", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "Mobile navigation behavior");
  await page.goto("/");

  const trigger = page.getByRole("button", { name: "Open menu" });
  await trigger.click();

  await expect(page.locator("#mobile-menu").getByRole("link", { name: "Our Story" })).toBeFocused();
  await page.keyboard.press("Escape");

  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});
