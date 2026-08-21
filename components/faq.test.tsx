import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Faq } from "./faq";

const items = [
  { question: "First question?", answer: "First answer." },
  { question: "Second question?", answer: "Second answer." },
] as const;

describe("Faq", () => {
  it("lets each question open independently", async () => {
    const user = userEvent.setup();
    render(<Faq items={items} />);

    const first = screen.getByRole("button", { name: /First question/ });
    const second = screen.getByRole("button", { name: /Second question/ });
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(second).toHaveAttribute("aria-expanded", "false");

    await user.click(second);

    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(second).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Second answer.").closest("[role=region]")).toHaveAttribute("aria-hidden", "false");
  });
});
