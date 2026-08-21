import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReservationProvider } from "@/components/reservations/reservation-provider";
import { restaurant } from "@/lib/site-data";
import { Announcement, SiteHeader } from "./site-interactions";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("SiteHeader", () => {
  it("returns the current route to the top from the brand link", async () => {
    const user = userEvent.setup();
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    render(<ReservationProvider settings={restaurant}><SiteHeader name="Marsh & Ember" descriptor="lowcountry culinary fire" /></ReservationProvider>);

    await user.click(screen.getByRole("link", { name: "Marsh and Ember home" }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });
    scrollTo.mockRestore();
  });

  it("moves focus into the mobile menu and restores it on Escape", async () => {
    const user = userEvent.setup();
    render(<ReservationProvider settings={restaurant}><SiteHeader name="Marsh & Ember" descriptor="lowcountry culinary fire" /></ReservationProvider>);

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
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("honors a dismissal stored for the current announcement version", async () => {
    window.localStorage.setItem("marsh-ember-announcement-dismissed:test", "true");
    render(<Announcement announcement={{ message: "Reservations are open.", dismissalVersion: "test" }} />);

    await waitFor(() => expect(screen.queryByRole("complementary", { name: "Restaurant announcement" })).not.toBeInTheDocument());
  });

  it("persists dismissal and removes the announcement", async () => {
    const user = userEvent.setup();
    render(<Announcement announcement={{ message: "Reservations are open.", dismissalVersion: "test" }} />);

    await user.click(screen.getByRole("button", { name: "Dismiss announcement" }));

    expect(window.localStorage.getItem("marsh-ember-announcement-dismissed:test")).toBe("true");
    expect(screen.queryByRole("complementary", { name: "Restaurant announcement" })).not.toBeInTheDocument();
  });
});
