import { describe, expect, it } from "vitest";
import { events } from "./site-data";
import {
  getDetailEvent,
  getDetailEvents,
  getEventAvailabilityPresentation,
  type EventAvailability,
  type EventRecord,
} from "./events";

const harvest = getDetailEvent(events, "harvest-at-the-hearth")!;

function withAvailability(availability: EventAvailability): EventRecord {
  return { ...harvest, availability };
}

describe("event availability presentation", () => {
  it.each([
    ["closed", "RSVP Closed", "RSVP requests are now closed"],
    ["sold-out", "Sold Out", "Harvest at the Hearth is fully booked"],
    ["cancelled", "Event Cancelled", "Harvest at the Hearth has been cancelled"],
    ["past", "Past Event", "This gathering has ended"],
  ] as const)("maps %s to its unavailable presentation", (state, label, title) => {
    const presentation = getEventAvailabilityPresentation(withAvailability({ state }));

    expect(presentation.acceptsRequests).toBe(false);
    expect(presentation.label).toBe(label);
    expect(presentation.panel?.title).toBe(title);
  });

  it.each(["RSVP Open", "Limited Availability"] as const)("keeps %s eligible for requests", (label) => {
    const presentation = getEventAvailabilityPresentation(withAvailability({ state: "accepting", label }));

    expect(presentation).toEqual({ label, acceptsRequests: true, panel: null });
  });

  it("uses event-owned schedule and date content in unavailable states", () => {
    const closed = getEventAvailabilityPresentation(withAvailability({ state: "closed" }));
    const cancelled = getEventAvailabilityPresentation(withAvailability({ state: "cancelled" }));

    expect(closed.panel?.showSchedule).toBe(true);
    expect(harvest.schedule).toContain("September 24, 2026");
    expect(cancelled.panel?.body).toContain(harvest.date);
  });
});

describe("event detail selectors", () => {
  it("returns only records with approved detail content without mutating the source", () => {
    const original = [...events];
    const detailEvents = getDetailEvents(events);

    expect(detailEvents.map((event) => event.slug)).toEqual(["harvest-at-the-hearth"]);
    expect(events).toEqual(original);
  });

  it("does not resolve listing-only or unknown records as detail pages", () => {
    expect(getDetailEvent(events, "lowcountry-oyster-roast")).toBeUndefined();
    expect(getDetailEvent(events, "not-an-event")).toBeUndefined();
  });
});
