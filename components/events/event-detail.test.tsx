import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getDetailEvent, type DetailEventRecord, type EventAvailability } from "@/lib/events";
import { events } from "@/lib/site-data";
import { EventHero, EventRsvpSection } from "./event-detail";

const harvest = getDetailEvent(events, "harvest-at-the-hearth")!;

function withAvailability(availability: EventAvailability): DetailEventRecord {
  return { ...harvest, availability };
}

describe("EventRsvpSection", () => {
  it("renders the request form only while the event accepts requests", () => {
    render(<EventRsvpSection event={harvest} />);

    expect(screen.getByRole("heading", { name: "Request an RSVP" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /First name/ })).toBeInTheDocument();
    expect(document.getElementById("rsvp")).toBeInTheDocument();
  });

  it.each([
    ["closed", "RSVP requests are now closed"],
    ["sold-out", "Harvest at the Hearth is fully booked"],
    ["cancelled", "Harvest at the Hearth has been cancelled"],
    ["past", "This gathering has ended"],
  ] as const)("renders the %s panel without form controls", (state, title) => {
    render(<EventRsvpSection event={withAvailability({ state })} />);

    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: /First name/ })).not.toBeInTheDocument();
    expect(document.getElementById("rsvp")).not.toBeInTheDocument();
  });
});

describe("EventHero", () => {
  it("does not offer an RSVP action for an unavailable event", () => {
    render(<EventHero event={withAvailability({ state: "closed" })} />);

    expect(screen.queryByRole("link", { name: "Request RSVP" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View Event Details" })).toBeInTheDocument();
    expect(screen.queryByText("Limited seats available")).not.toBeInTheDocument();
  });
});
