"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ReservationTrigger } from "@/components/reservations/reservation-trigger";
import { navigation } from "@/lib/site-data";

export function SiteHeader({ name, descriptor }: { name: string; descriptor: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const previousPathnameRef = useRef(pathname);
  const headerNavigationRef = useRef(false);

  useEffect(() => {
    if (previousPathnameRef.current !== pathname) {
      if (headerNavigationRef.current) window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      headerNavigationRef.current = false;
      previousPathnameRef.current = pathname;
    }
  }, [pathname]);

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
  const navigateFromHeader = (href: string) => {
    close();
    if (pathname === href) window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    else headerNavigationRef.current = true;
  };

  return (
    <header className="site-header">
      <Link id="site-brand" className="brand" href="/" aria-label="Marsh and Ember home" onClick={() => navigateFromHeader("/")}>
        <span>{name}</span><small>{descriptor}</small>
      </Link>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => navigateFromHeader(item.href)} aria-current={pathname === item.href ? "page" : undefined}>{item.label}</Link>)}
      </nav>
      <ReservationTrigger className="header-reserve">Reserve a Table</ReservationTrigger>
      <div className="mobile-actions">
        <ReservationTrigger className="mobile-reserve" onBeforeOpen={close}>Reserve</ReservationTrigger>
        <button ref={triggerRef} type="button" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((value) => !value)}>{open ? "×" : "☰"}</button>
      </div>
      <div ref={menuRef} id="mobile-menu" className={`mobile-menu${open ? " is-open" : ""}`} aria-hidden={!open}>
        <nav aria-label="Mobile navigation">
          {navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => navigateFromHeader(item.href)} aria-current={pathname === item.href ? "page" : undefined} tabIndex={open ? 0 : -1}>{item.label}</Link>)}
          <ReservationTrigger onBeforeOpen={close} returnFocusRef={triggerRef} tabIndex={open ? 0 : -1}>Reserve a Table</ReservationTrigger>
        </nav>
      </div>
    </header>
  );
}
