import Link from "next/link";
import type { ReactNode } from "react";
import type { RestaurantSettings } from "@/lib/content-types";
import { navigation } from "@/lib/site-data";
import { Announcement, SiteHeader } from "./site-interactions";

export function SiteShell({ children, settings }: { children: ReactNode; settings: RestaurantSettings }) {
  return <><Announcement announcement={settings.announcement} /><SiteHeader name={settings.name} descriptor={settings.descriptor} /><main id="main-content">{children}</main><SiteFooter settings={settings} /></>;
}

function SiteFooter({ settings: restaurant }: { settings: RestaurantSettings }) {
  return (
    <footer className="site-footer">
      <div className="site-footer__main page-gutter">
        <div className="footer-brand"><Link className="brand brand--footer" href="/"><span>{restaurant.name}</span></Link><p>{restaurant.tagline}</p><Link className="button button--light" href="/visit#contact">Reserve a Table</Link></div>
        <nav aria-label="Footer navigation"><h2>Navigate</h2>{navigation.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}</nav>
        <div><h2>Visit</h2><address><a href={restaurant.mapUrl} target="_blank" rel="noreferrer">{restaurant.addressLines[0]}<br />{restaurant.addressLines[1]}</a></address><a href={restaurant.phoneHref}>{restaurant.phone}</a><a href={`mailto:${restaurant.email}`}>{restaurant.email}</a></div>
        <div><h2>Hours</h2>{restaurant.hours.map((hours) => <p key={hours.days}>{hours.days}<br />{hours.time}</p>)}</div>
      </div>
      <div className="site-footer__utility page-gutter"><div><a href={restaurant.instagramUrl} target="_blank" rel="noreferrer">Instagram <span className="sr-only">(opens in a new tab)</span></a><a href={restaurant.facebookUrl} target="_blank" rel="noreferrer">Facebook <span className="sr-only">(opens in a new tab)</span></a></div><div><span>Privacy</span><span>Accessibility</span><span>© {new Date().getFullYear()} {restaurant.name}. All rights reserved.</span></div></div>
    </footer>
  );
}
