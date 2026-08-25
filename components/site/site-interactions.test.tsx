import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ReservationProvider } from "@/components/reservations/reservation-provider";
import { restaurant } from "@/lib/site-data";
import { SiteHeader } from "./site-interactions";

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
