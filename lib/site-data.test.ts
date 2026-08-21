import { describe, expect, it } from "vitest";
import { navigation, restaurant } from "./site-data";

describe("site data", () => {
  it("keeps navigation destinations unique", () => {
    const destinations = navigation.map((item) => item.href);

    expect(new Set(destinations).size).toBe(destinations.length);
  });

  it("uses actionable restaurant contact values", () => {
    expect(restaurant.phoneHref).toMatch(/^tel:\+\d+$/);
    expect(restaurant.email).toMatch(/^[^@]+@[^@]+\.[^@]+$/);
  });
});
