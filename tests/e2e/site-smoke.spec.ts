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

test("visitors can complete the reservation preview without contacting a booking provider", async ({ page }) => {
  const externalBookingRequests: string[] = [];
  page.on("request", (request) => {
    if (/cal\.com|booking/i.test(request.url())) externalBookingRequests.push(request.url());
  });
  await page.goto("/");

  const trigger = page.getByRole("button", { name: "Reserve a Table" }).first();
  await trigger.click();
  await expect(page.getByRole("heading", { name: "Reserve a Table" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Preview Error State" })).toHaveCount(0);
  await page.getByRole("button", { name: "Check Availability" }).click();
  await expect(page.getByRole("heading", { name: "Choose your table" })).toBeVisible();

  await page.getByLabel("Party size").selectOption("4");
  await page.getByLabel("Date").selectOption({ index: 1 });
  await page.getByLabel("Time").selectOption("6:45 PM");
  await page.getByRole("button", { name: "Finish Preview" }).click();

  await expect(page.getByRole("heading", { name: "Reservation preview complete" })).toBeVisible();
  await expect(page.getByText("No table was held, no information was submitted, and no confirmation email was sent.")).toBeVisible();
  await expect(page.getByText(/^PREVIEW-/)).toBeVisible();
  expect(externalBookingRequests).toEqual([]);

  await page.getByRole("button", { name: "Done" }).click();
  await expect(trigger).toBeFocused();
});

test("reservation provider-error scenario recovers safely", async ({ page }) => {
  await page.goto("/?previewScenario=reservation-error");

  await page.getByRole("button", { name: "Reserve a Table" }).first().click();
  await page.getByRole("button", { name: "Check Availability" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Your table has not been reserved." })).toBeVisible();
  await page.getByRole("button", { name: "Try Again" }).click();
  await expect(page.getByRole("heading", { name: "Choose your table" })).toBeVisible();
});

test("visitors can complete the Private Dining inquiry preview without transmitting values", async ({ page }) => {
  await page.goto("/private-dining#inquiry");

  await expect(page.getByRole("heading", { name: "Use fictional information only" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Preview Error State" })).toHaveCount(0);
  await page.getByRole("button", { name: "Complete Inquiry Preview" }).click();
  const summary = page.getByRole("alert").filter({ hasText: "We need a few more details" });
  await expect(summary).toBeFocused();
  await expect(summary).toContainText("First name is required");

  await page.getByLabel(/^First name/).fill("Avery");
  await page.getByLabel(/^Last name/).fill("Example");
  await page.getByLabel(/^Email address/).fill("avery@example.com");
  await page.getByLabel(/^Phone number/).fill("(843) 555-0100");
  await page.getByLabel(/^Event type/).selectOption("Celebration");
  await page.getByLabel(/^Preferred date/).fill("2099-11-15");
  await page.getByLabel(/^Preferred time of day/).selectOption("Evening");
  await page.getByLabel(/^Estimated guest count/).fill("24");
  await page.getByLabel(/^I understand/).check();

  const submissionRequests: string[] = [];
  page.on("request", (request) => {
    if (["fetch", "xhr"].includes(request.resourceType())) submissionRequests.push(request.url());
  });
  await page.getByRole("button", { name: "Complete Inquiry Preview" }).click();

  await expect(page.getByRole("heading", { name: "Inquiry preview complete" })).toBeVisible();
  await expect(page.getByText(/no team will contact you/i)).toBeVisible();
  await expect(page.getByText(/^PREVIEW-PD-/)).toBeVisible();
  expect(submissionRequests).toEqual([]);

  await page.getByRole("button", { name: "Start Over" }).click();
  await expect(page.getByLabel(/^First name/)).toBeFocused();
  await expect(page.getByLabel(/^First name/)).toHaveValue("");
});

test("Private Dining error scenario preserves values and retries", async ({ page }) => {
  await page.goto("/private-dining?previewScenario=private-dining-error#inquiry");

  await page.getByLabel(/^First name/).fill("Avery");
  await page.getByLabel(/^Last name/).fill("Example");
  await page.getByLabel(/^Email address/).fill("avery@example.com");
  await page.getByLabel(/^Phone number/).fill("(843) 555-0100");
  await page.getByLabel(/^Event type/).selectOption("Celebration");
  await page.getByLabel(/^Preferred date/).fill("2099-11-15");
  await page.getByLabel(/^Preferred time of day/).selectOption("Evening");
  await page.getByLabel(/^Estimated guest count/).fill("24");
  await page.getByLabel(/^I understand/).check();
  await page.getByRole("button", { name: "Complete Inquiry Preview" }).click();

  await expect(page.getByRole("alert").filter({ hasText: "We couldn’t complete the inquiry preview" })).toBeVisible();
  await expect(page.getByLabel(/^First name/)).toHaveValue("Avery");
  await page.getByRole("button", { name: "Try Again" }).click();
  await expect(page.getByRole("heading", { name: "Inquiry preview complete" })).toBeVisible();
});

test("the mobile navigation opens the reservation preview and restores safe focus", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "Mobile reservation behavior");
  await page.goto("/");

  const menuTrigger = page.getByRole("button", { name: "Open menu" });
  await menuTrigger.click();
  await page.locator("#mobile-menu").getByRole("button", { name: "Reserve a Table" }).click();

  await expect(page.locator("#mobile-menu")).toHaveAttribute("aria-hidden", "true");
  await expect(page.getByRole("heading", { name: "Reserve a Table" })).toBeVisible();
  await page.getByRole("button", { name: "Close reservation preview" }).click();
  await expect(menuTrigger).toBeFocused();
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
