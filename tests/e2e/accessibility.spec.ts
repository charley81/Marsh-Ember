import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

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

function formatViolations(violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"]) {
  return violations.map((violation) => {
    const targets = violation.nodes.map((node) => node.target.join(" ")).join(", ");
    return `${violation.id} (${violation.impact ?? "unknown"}): ${violation.help} — ${targets}`;
  }).join("\n");
}

async function expectNoAccessibilityViolations(page: Page, context: string) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  expect(results.violations, `${context}\n${formatViolations(results.violations)}`).toEqual([]);
}

for (const route of publicRoutes) {
  test(`${route} has no automated WCAG A/AA violations`, async ({ page }) => {
    await page.goto(route);
    await expectNoAccessibilityViolations(page, route);
  });
}

test("reservation dialog states have no automated WCAG A/AA violations", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Reserve a Table" }).first().click();
  await expectNoAccessibilityViolations(page, "reservation introduction");

  await page.getByRole("button", { name: "Check Availability" }).click();
  await expect(page.getByRole("heading", { name: "Choose your table" })).toBeVisible();
  await expectNoAccessibilityViolations(page, "reservation availability");
});

test("form validation states have no automated WCAG A/AA violations", async ({ page }) => {
  await page.goto("/private-dining#inquiry");
  await page.getByRole("button", { name: "Complete Inquiry Preview" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "We need a few more details" })).toBeVisible();
  await expectNoAccessibilityViolations(page, "Private Dining validation");

  await page.goto("/events/harvest-at-the-hearth#rsvp");
  await page.getByRole("button", { name: "Complete RSVP Preview" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "We need a few more details" })).toBeVisible();
  await expectNoAccessibilityViolations(page, "event RSVP validation");
});

test("open mobile navigation has no automated WCAG A/AA violations", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "Mobile navigation state");
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await expectNoAccessibilityViolations(page, "open mobile navigation");
});
