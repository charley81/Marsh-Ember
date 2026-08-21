"use client";

import { useId, useState } from "react";

export type FaqItem = {
  question: string;
  answer: string;
};

export function Faq({ items, firstOpen = true }: { items: readonly FaqItem[]; firstOpen?: boolean }) {
  const id = useId();
  const [openItems, setOpenItems] = useState<Set<number>>(() => firstOpen ? new Set([0]) : new Set());

  function toggle(index: number) {
    setOpenItems((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className="faq">
      {items.map((item, index) => {
        const open = openItems.has(index);
        const buttonId = `${id}-question-${index}`;
        const panelId = `${id}-answer-${index}`;
        return (
          <div className={`faq__item${open ? " is-open" : ""}`} key={item.question}>
            <h3>
              <button
                aria-controls={panelId}
                aria-expanded={open}
                id={buttonId}
                onClick={() => toggle(index)}
                type="button"
              >
                <span>{item.question}</span>
                <span aria-hidden="true" className="faq__indicator">{open ? "−" : "+"}</span>
              </button>
            </h3>
            <div aria-hidden={!open} aria-labelledby={buttonId} className="faq__answer" id={panelId} role="region">
              <div><p>{item.answer}</p></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
