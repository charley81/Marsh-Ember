"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getAnnouncementStorageKey } from "@/lib/announcement";
import type { RestaurantSettings } from "@/lib/content-types";
import { navigation } from "@/lib/site-data";

const announcementDismissedEvent = "marsh-ember-announcement-dismissed";

function subscribeToAnnouncementDismissal(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(announcementDismissedEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(announcementDismissedEvent, callback);
  };
}

export function Announcement({ announcement }: { announcement: RestaurantSettings["announcement"] }) {
  const announcementKey = announcement ? getAnnouncementStorageKey(announcement.dismissalVersion) : null;
  const dismissed = useSyncExternalStore(
    subscribeToAnnouncementDismissal,
    () => announcementKey ? window.localStorage.getItem(announcementKey) === "true" : false,
    () => false,
  );

  if (!announcement || !announcementKey || dismissed) return null;

  return (
    <aside className="announcement" aria-label="Restaurant announcement">
      <div className="announcement__copy">
        <span>{announcement.message}</span>
        {announcement.linkPath && announcement.linkLabel ? <Link href={announcement.linkPath}>{announcement.linkLabel} <span aria-hidden="true">→</span></Link> : null}
      </div>
      <button type="button" aria-label="Dismiss announcement" onClick={() => {
        window.localStorage.setItem(announcementKey, "true");
        window.dispatchEvent(new Event(announcementDismissedEvent));
        window.requestAnimationFrame(() => document.getElementById("site-brand")?.focus());
      }}>×</button>
    </aside>
  );
}

export function SiteHeader({ name, descriptor }: { name: string; descriptor: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => {
      menuRef.current?.querySelector<HTMLElement>("a[href]")?.focus();
    });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = menuRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <Link id="site-brand" className="brand" href="/" aria-label="Marsh and Ember home">
        <span>{name}</span><small>{descriptor}</small>
      </Link>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navigation.map((item) => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>{item.label}</Link>)}
      </nav>
      <Link className="button button--primary header-reserve" href="/visit#contact">Reserve a Table</Link>
      <div className="mobile-actions">
        <Link href="/visit#contact">Reserve</Link>
        <button ref={triggerRef} type="button" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((value) => !value)}>{open ? "×" : "☰"}</button>
      </div>
      <div ref={menuRef} id="mobile-menu" className={`mobile-menu${open ? " is-open" : ""}`} aria-hidden={!open}>
        <nav aria-label="Mobile navigation">
          {navigation.map((item) => <Link key={item.href} href={item.href} onClick={close} aria-current={pathname === item.href ? "page" : undefined} tabIndex={open ? 0 : -1}>{item.label}</Link>)}
          <Link className="button button--primary" href="/visit#contact" onClick={close} tabIndex={open ? 0 : -1}>Reserve a Table</Link>
        </nav>
      </div>
    </header>
  );
}
