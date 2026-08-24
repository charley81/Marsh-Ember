"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { MenuItem } from "@/components/ui";
import type { MenuItemRecord, MenuRecord } from "@/lib/content-types";

export type MenuPreview = {
  id: MenuRecord["category"];
  label: string;
  title: string;
  intro: string;
  items: readonly MenuItemRecord[];
};

export function MenuDiscovery({ menus }: { menus: readonly MenuPreview[] }) {
  const [activeId, setActiveId] = useState(menus[0]?.id);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = Math.max(0, menus.findIndex((menu) => menu.id === activeId));
  const activeMenu = menus[activeIndex];

  if (!activeMenu) return null;

  function selectFromKeyboard(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % menus.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + menus.length) % menus.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = menus.length - 1;
    if (nextIndex === undefined) return;

    event.preventDefault();
    setActiveId(menus[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <>
      <div className="menu-header-row">
        <div className="section-heading">
          <p className="eyebrow"><span>Menus</span><i aria-hidden="true" /></p>
          <h2 id="menu-discovery-title">On the table now</h2>
          {activeMenu.items.length ? <p className="lede" key={`${activeMenu.id}-intro`}>{activeMenu.intro}</p> : null}
        </div>
        <div className="menu-tabs" role="tablist" aria-label="Browse menus">
          {menus.map((menu, index) => {
            const selected = menu.id === activeMenu.id;
            return (
              <button
                aria-controls="menu-discovery-panel"
                aria-selected={selected}
                id={`menu-tab-${menu.id}`}
                key={menu.id}
                onClick={() => setActiveId(menu.id)}
                onKeyDown={(event) => selectFromKeyboard(event, index)}
                ref={(element) => { tabRefs.current[index] = element; }}
                role="tab"
                tabIndex={selected ? 0 : -1}
                type="button"
              >
                {menu.label}
              </button>
            );
          })}
        </div>
      </div>
      <div
        aria-labelledby={`menu-tab-${activeMenu.id}`}
        className="menu-discovery__panel"
        id="menu-discovery-panel"
        key={activeMenu.id}
        role="tabpanel"
      >
        {activeMenu.items.length ? (
          <>
            <h3 className="sr-only">{activeMenu.title}</h3>
            <div className="menu-preview">
              {activeMenu.items.map((item) => <MenuItem item={item} key={item.name} />)}
            </div>
          </>
        ) : (
          <div className="menu-discovery__summary">
            <h3>{activeMenu.title}</h3>
            <p>{activeMenu.intro}</p>
          </div>
        )}
      </div>
    </>
  );
}
