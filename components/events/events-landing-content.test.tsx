import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReservationProvider } from "@/components/reservations/reservation-provider";
import { events, restaurant } from "@/lib/site-data";
import { EventsLandingContent } from "./events-landing-content";

function renderEvents(eventsToRender = events) {
  return render(<ReservationProvider settings={restaurant}><EventsLandingContent events={eventsToRender} /></ReservationProvider>);
}

describe("EventsLandingContent", () => {
  it("renders the approved empty state and actions for an empty collection", () => {
    renderEvents([]);

    expect(screen.getByRole("heading", { name: "No upcoming gatherings are announced" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore Our Menus" })).toHaveAttribute("href", "/menus");
    expect(screen.getByRole("link", { name: "Plan Your Visit" })).toHaveAttribute("href", "/visit");
    expect(screen.getByRole("button", { name: "Reserve a Table" })).toBeInTheDocument();
  });

  it("links only events with approved detail content", () => {
    renderEvents();

    expect(screen.getAllByRole("link", { name: "View Event" })).toHaveLength(1);
    expect(screen.getByRole("link", { name: "View Event" })).toHaveAttribute("href", "/events/harvest-at-the-hearth");
    expect(screen.queryByRole("button", { name: "View Event" })).not.toBeInTheDocument();
  });
});
