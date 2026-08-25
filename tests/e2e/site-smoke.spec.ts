import { expect, test } from "@playwright/test";

const publicRoutes = [
  "/",
  "/menus",
  "/menus/dinner",
  "/visit",
  "/our-story",
  "/private-dining",
  "/events",
  "/events/harvest-at-the-hearth",
  "/privacy",
  "/accessibility",
] as const;

test("public responses include the launch security headers", async ({ page }) => {
  const response = await page.goto("/");
  const headers = response?.headers() ?? {};

  expect(headers["content-security-policy"]).toContain("frame-ancestors 'self' https://marshandember.sanity.studio http://localhost:3333");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["permissions-policy"]).toContain("camera=()");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-powered-by"]).toBeUndefined();
});

test("every internal destination and fragment is useful", async ({ page, request }) => {
  const destinations = new Set<string>();

  for (const route of publicRoutes) {
    await page.goto(route);
    const links = await page.locator("a[href]").evaluateAll((anchors) => anchors.map((anchor) => {
      const link = anchor as HTMLAnchorElement;
      const containingSection = link.closest<HTMLElement>("section[id]");
      return {
        href: link.getAttribute("href") ?? "",
        sameOrigin: link.origin === window.location.origin,
        selfSection: Boolean(link.hash && containingSection?.id === link.hash.slice(1)),
      };
    }));

    expect(links.filter((link) => link.selfSection), `${route} contains a CTA that targets its own section`).toEqual([]);
    for (const link of links) {
      if (link.sameOrigin && link.href && !link.href.startsWith("mailto:") && !link.href.startsWith("tel:")) {
        destinations.add(new URL(link.href, page.url()).toString());
      }
    }
  }

  for (const destination of destinations) {
    const url = new URL(destination);
    const response = await request.get(`${url.pathname}${url.search}`);
    expect(response.status(), destination).toBeLessThan(400);

    if (url.hash) {
      await page.goto(`${url.pathname}${url.search}${url.hash}`);
      const targetId = decodeURIComponent(url.hash.slice(1));
      const target = page.locator(`[id="${targetId.replaceAll('"', '\\"')}"]`);
      await expect(target, destination).toHaveCount(1);
    }
  }
});

test("menu pathways lead to distinct previews without redundant actions", async ({ page }) => {
  await page.goto("/");
  const homeMenuNavigation = page.getByRole("tablist", { name: "Browse menus" });
  await expect(homeMenuNavigation.getByRole("tab")).toHaveCount(4);
  const brunchTab = homeMenuNavigation.getByRole("tab", { name: "Brunch" });
  await brunchTab.click();
  await expect(page).toHaveURL(/\/$/);
  await expect(brunchTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "Brunch" })).toBeVisible();

  const wineTab = homeMenuNavigation.getByRole("tab", { name: "Selected Wines" });
  await wineTab.click();
  const winePanel = page.getByRole("tabpanel", { name: "Selected Wines" });
  await expect(winePanel).toBeVisible();
  await expect(winePanel.getByRole("heading", { name: "Wine List" })).toBeVisible();
  await expect(winePanel).toContainText("Wines by the Glass");

  await page.goto("/menus");

  await page.getByRole("link", { name: "View Weekend Brunch" }).click();
  await expect(page).toHaveURL(/\/menus#brunch$/);
  await expect(page.locator("#brunch").getByRole("heading", { name: "A slower part of the week" })).toBeVisible();
  await expect(page.locator("#brunch").getByRole("link", { name: /brunch menu/i })).toHaveCount(0);

  await page.goto("/menus/dinner");
  await expect(page.getByRole("navigation", { name: "Browse menus" })).toContainText("Weekend Brunch preview");
  await page.getByRole("link", { name: "Wine preview" }).click();
  await expect(page).toHaveURL(/\/menus#cellar$/);
  const cellar = page.locator("#cellar");
  await expect(cellar.getByRole("heading", { name: "Wines for the table" })).toBeVisible();
  await expect(cellar.getByRole("heading", { level: 3 })).toHaveCount(3);
  await expect(cellar).toContainText("Wines by the Glass");
  const spirits = page.locator("#spirits");
  await expect(spirits.getByRole("heading", { level: 3 })).toHaveCount(2);
  await expect(spirits).toContainText("Ember Old Fashioned");
});

test("mobile dinner preview matches the brunch image-to-title spacing", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "Mobile menu preview layout");
  await page.goto("/menus");

  const dinnerGap = await page.locator("#dinner").evaluate((section) => {
    const image = section.querySelector(".mobile-only")?.getBoundingClientRect();
    const heading = section.querySelector(".section-heading")?.getBoundingClientRect();
    return image && heading ? heading.top - image.bottom : 0;
  });
  const brunchGap = await page.locator("#brunch").evaluate((section) => {
    const image = section.querySelector(".menus-brunch-media")?.getBoundingClientRect();
    const heading = section.querySelector(".section-heading")?.getBoundingClientRect();
    return image && heading ? heading.top - image.bottom : 0;
  });

  expect(dinnerGap).toBeGreaterThan(0);
  expect(dinnerGap).toBeCloseTo(brunchGap, 0);
});

test("header links always return destination pages to the top", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.startsWith("mobile"), "Desktop header navigation behavior");
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  await page.locator(".desktop-nav").getByRole("link", { name: "Our Story" }).click();

  await expect(page).toHaveURL(/\/our-story$/);
  await expect(page.getByRole("heading", { level: 1, name: "A Charleston table, shaped by the Lowcountry." })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(1);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.getByRole("link", { name: "Marsh and Ember home" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(1);
});

test("the site does not render a reservations-open notification", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("complementary", { name: "Restaurant announcement" })).toHaveCount(0);
  await expect(page.getByText(/reservations are now open/i)).toHaveCount(0);
});

test("common questions start closed and keep one answer open", async ({ page }) => {
  for (const route of ["/private-dining", "/visit"] as const) {
    await page.goto(route);
    const faq = page.locator(".faq");
    const questions = faq.getByRole("button");
    await expect(questions).toHaveCount(5);

    for (let index = 0; index < 5; index += 1) {
      await expect(questions.nth(index)).toHaveAttribute("aria-expanded", "false");
    }

    await questions.nth(0).click();
    await expect(questions.nth(0)).toHaveAttribute("aria-expanded", "true");

    await questions.nth(1).click();
    await expect(questions.nth(0)).toHaveAttribute("aria-expanded", "false");
    await expect(questions.nth(1)).toHaveAttribute("aria-expanded", "true");
    const panelId = await questions.nth(1).getAttribute("aria-controls");
    await expect(page.locator(`[id="${panelId}"]`)).toHaveAttribute("aria-hidden", "false");
  }
});

test("visitors can navigate from menus to the dinner menu", async ({ page }) => {
  await page.goto("/menus");

  await page.getByRole("link", { name: "View Dinner Menu" }).first().click();

  await expect(page).toHaveURL(/\/menus\/dinner$/);
  await expect(page.getByRole("heading", { level: 1, name: "Dinner" })).toBeVisible();
});

test("visitors can complete the event RSVP preview without transmitting values", async ({ page }) => {
  await page.goto("/events");

  await page.getByRole("link", { name: "View Event" }).click();

  await expect(page).toHaveURL(/\/events\/harvest-at-the-hearth$/);
  await expect(page.getByRole("heading", { level: 1, name: "Harvest at the Hearth" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Request an RSVP" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Use fictional information only" })).toBeVisible();
  await expect(page.getByRole("button", { name: /preview error|simulate failure/i })).toHaveCount(0);

  await page.getByRole("button", { name: "Complete RSVP Preview" }).click();
  const summary = page.getByRole("alert").filter({ hasText: "We need a few more details" });
  await expect(summary).toBeFocused();
  await expect(summary).toContainText("First name is required");

  await page.getByLabel(/^First name/).fill("Avery");
  await page.getByLabel(/^Last name/).fill("Example");
  await page.getByLabel(/^Email address/).fill("avery@example.com");
  await page.getByLabel(/^Phone number/).fill("(843) 555-0100");
  await page.getByLabel(/^Number of guests/).selectOption("2");
  await page.getByLabel("Dietary or accessibility information").fill("Secret fictional note");
  await page.getByLabel(/^I understand/).check();

  const submissionRequests: string[] = [];
  page.on("request", (request) => {
    if (["fetch", "xhr"].includes(request.resourceType())) submissionRequests.push(request.url());
  });
  await page.getByRole("button", { name: "Complete RSVP Preview" }).click();

  await expect(page.getByRole("heading", { name: "RSVP preview complete" })).toBeFocused();
  await expect(page.getByText(/no RSVP request was created/i)).toBeVisible();
  await expect(page.getByText("Party of 2")).toBeVisible();
  await expect(page.getByText(/^PREVIEW-ER-/)).toBeVisible();
  await expect(page.getByText("avery@example.com")).toHaveCount(0);
  await expect(page.getByText("Secret fictional note")).toHaveCount(0);
  expect(submissionRequests).toEqual([]);
});

test("event RSVP error scenario preserves values and retries", async ({ page }) => {
  await page.goto("/events/harvest-at-the-hearth?previewScenario=event-rsvp-error#rsvp");

  await page.getByLabel(/^First name/).fill("Avery");
  await page.getByLabel(/^Last name/).fill("Example");
  await page.getByLabel(/^Email address/).fill("avery@example.com");
  await page.getByLabel(/^Phone number/).fill("(843) 555-0100");
  await page.getByLabel(/^Number of guests/).selectOption("2");
  await page.getByLabel(/^I understand/).check();
  await page.getByRole("button", { name: "Complete RSVP Preview" }).click();

  await expect(page.getByRole("alert").filter({ hasText: "We couldn’t complete the RSVP preview" })).toBeFocused();
  await expect(page.getByLabel(/^First name/)).toHaveValue("Avery");
  await page.getByRole("button", { name: "Try Again" }).click();
  await expect(page.getByRole("heading", { name: "RSVP preview complete" })).toBeVisible();
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

  const menu = page.locator("#mobile-menu");
  await expect(menu.getByRole("link", { name: "Our Story" })).toBeFocused();
  const metrics = await menu.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height ?? 0;
    return {
      backgroundColor: getComputedStyle(element).backgroundColor,
      opacity: getComputedStyle(element).opacity,
      height: rect.height,
      expectedHeight: window.innerHeight - headerHeight,
    };
  });
  expect(metrics.backgroundColor).toBe("rgb(250, 248, 245)");
  expect(metrics.opacity).toBe("1");
  expect(metrics.height).toBeCloseTo(metrics.expectedHeight, 0);

  await page.keyboard.press("Escape");

  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});
