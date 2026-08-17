import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Announcement, SiteHeader } from "./site-interactions";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("SiteHeader", () => {
  it("moves focus into the mobile menu and restores it on Escape", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    const trigger = screen.getByRole("button", { name: "Open menu" });
    await user.click(trigger);

    const menu = document.getElementById("mobile-menu");
    expect(menu).not.toBeNull();
    const firstMenuLink = within(menu!).getByRole("link", { name: "Our Story" });

    await waitFor(() => expect(firstMenuLink).toHaveFocus());
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{Escape}");

    await waitFor(() => expect(trigger).toHaveFocus());
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});

describe("Announcement", () => {
  it("persists dismissal and removes the announcement", async () => {
    const user = userEvent.setup();
    render(<Announcement />);

    await user.click(screen.getByRole("button", { name: "Dismiss announcement" }));

    expect(window.localStorage.getItem("marsh-ember-announcement-dismissed")).toBe("true");
    expect(screen.queryByRole("complementary", { name: "Restaurant announcement" })).not.toBeInTheDocument();
  });
});
