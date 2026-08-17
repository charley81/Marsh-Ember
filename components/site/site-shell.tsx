import Link from "next/link";
import type { ReactNode } from "react";
import { navigation, restaurant } from "@/lib/site-data";
import { Announcement, SiteHeader } from "./site-interactions";

export function SiteShell({ children }: { children: ReactNode }) {
  return <><Announcement /><SiteHeader /><main id="main-content">{children}</main><SiteFooter /></>;
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__main page-gutter">
        <div className="footer-brand"><Link className="brand brand--footer" href="/"><span>Marsh &amp; Ember</span></Link><p>{restaurant.tagline}</p><Link className="button button--light" href="/visit#contact">Reserve a Table</Link></div>
        <nav aria-label="Footer navigation"><h2>Navigate</h2>{navigation.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}</nav>
        <div><h2>Visit</h2><address><a href="https://maps.google.com/?q=184+King+Street+Charleston+SC+29401" target="_blank" rel="noreferrer">{restaurant.addressLines[0]}<br />{restaurant.addressLines[1]}</a></address><a href={restaurant.phoneHref}>{restaurant.phone}</a><a href={`mailto:${restaurant.email}`}>{restaurant.email}</a></div>
        <div><h2>Hours</h2>{restaurant.hours.map((hours) => <p key={hours.days}>{hours.days}<br />{hours.time}</p>)}</div>
      </div>
      <div className="site-footer__utility page-gutter"><div><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram <span className="sr-only">(opens in a new tab)</span></a><a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook <span className="sr-only">(opens in a new tab)</span></a></div><div><span>Privacy</span><span>Accessibility</span><span>© {new Date().getFullYear()} Marsh &amp; Ember. All rights reserved.</span></div></div>
    </footer>
  );
}
