import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MenuDiscovery, type MenuPreview } from "./menu-discovery";

const menus: readonly MenuPreview[] = [
  { id: "dinner", label: "Dinner", title: "Dinner", intro: "Dinner introduction", items: [{ name: "Hearth Bread", description: "Benne" }] },
  { id: "brunch", label: "Brunch", title: "Brunch", intro: "Brunch introduction", items: [{ name: "Shrimp and Grits", description: "Shrimp" }] },
] as const;

describe("MenuDiscovery", () => {
  it("changes the menu in place and supports arrow-key selection", async () => {
    const user = userEvent.setup();
    render(<MenuDiscovery menus={menus} />);

    const dinner = screen.getByRole("tab", { name: "Dinner" });
    const brunch = screen.getByRole("tab", { name: "Brunch" });
    expect(dinner).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { name: "Hearth Bread" })).toBeInTheDocument();

    dinner.focus();
    await user.keyboard("{ArrowRight}");

    expect(brunch).toHaveFocus();
    expect(brunch).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Brunch introduction")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Shrimp and Grits" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Hearth Bread" })).not.toBeInTheDocument();
  });
});
