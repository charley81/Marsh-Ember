import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { events } from "@/lib/site-data";
import { EventsLandingContent } from "./events-landing-content";

describe("EventsLandingContent", () => {
  it("renders the approved empty state and actions for an empty collection", () => {
    render(<EventsLandingContent events={[]} />);

    expect(screen.getByRole("heading", { name: "No upcoming gatherings are announced" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore Our Menus" })).toHaveAttribute("href", "/menus");
    expect(screen.getByRole("link", { name: "Plan Your Visit" })).toHaveAttribute("href", "/visit");
    expect(screen.getByRole("link", { name: "Reserve a Table" })).toHaveAttribute("href", "/visit#contact");
  });

  it("links only events with approved detail content", () => {
    render(<EventsLandingContent events={events} />);

    expect(screen.getAllByRole("link", { name: "View Event" })).toHaveLength(1);
    expect(screen.getByRole("link", { name: "View Event" })).toHaveAttribute("href", "/events/harvest-at-the-hearth");
    expect(screen.queryByRole("button", { name: "View Event" })).not.toBeInTheDocument();
  });
});
