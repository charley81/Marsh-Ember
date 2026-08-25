"use client";

import { useId, useState } from "react";

export type FaqItem = {
  question: string;
  answer: string;
};

export function Faq({ items }: { items: readonly FaqItem[] }) {
  const id = useId();
  const [openItem, setOpenItem] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenItem((current) => current === index ? null : index);
  }

  return (
    <div className="faq">
      {items.map((item, index) => {
        const open = openItem === index;
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
