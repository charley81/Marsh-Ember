import { describe, expect, it } from "vitest";
import { events, getEvent, navigation, restaurant } from "./site-data";

describe("site data", () => {
  it("keeps navigation destinations unique", () => {
    const destinations = navigation.map((item) => item.href);

    expect(new Set(destinations).size).toBe(destinations.length);
  });

  it("resolves a known event by its stable slug", () => {
    expect(getEvent("harvest-at-the-hearth")).toEqual(events[0]);
  });

  it("returns undefined for an unknown event", () => {
    expect(getEvent("not-an-event")).toBeUndefined();
  });

  it("uses actionable restaurant contact values", () => {
    expect(restaurant.phoneHref).toMatch(/^tel:\+\d+$/);
    expect(restaurant.email).toMatch(/^[^@]+@[^@]+\.[^@]+$/);
  });
});
