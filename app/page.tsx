import Link from "next/link";
import { ReservationTrigger } from "@/components/reservations/reservation-trigger";
import { Actions, ButtonLink, Eyebrow, FactGrid, MediaFrame, MenuItem, SectionHeading } from "@/components/ui";
import { getMenus, getSiteSettings } from "@/lib/content";

export default async function Home() {
  const [settings, menus] = await Promise.all([getSiteSettings(), getMenus()]);
  const dinner = menus.find((menu) => menu.category === "dinner");
  if (!dinner) throw new Error("Dinner menu content is unavailable");
  const allDinnerItems = dinner.sections.flatMap((section) => section.items);
  const featuredItems = allDinnerItems.filter((item) => item.featuredOnLanding);
  const preview = (featuredItems.length ? featuredItems : allDinnerItems).slice(0, 3);
  const hours = settings.hours.map((row) => `${row.days} ${row.time}`).join(" · ");

  return <>
    <section className="hero hero--mobile-image-first hero--compact-title">
      <div className="hero__content"><Eyebrow>Charleston, South Carolina</Eyebrow><h1>Lowcountry ingredients. Shaped by fire.</h1><p className="lede">Marsh &amp; Ember brings the season to the table through live-fire cooking, thoughtful hospitality, and a warm Charleston dining room.</p><Actions><ReservationTrigger>Reserve a Table</ReservationTrigger><ButtonLink href="/menus" variant="secondary">View Menus</ButtonLink></Actions></div>
      <MediaFrame src="/images/home-hero-image.jpg" mobileSrc="/images/home-mobile-hero.jpg" alt="A wood-fired Lowcountry dish at Marsh and Ember" priority />
    </section>

    <section className="section section--sand"><div className="split-section split-section--mobile-media-first"><div className="split-section__copy"><SectionHeading eyebrow="Our Philosophy" title="From coast and field to flame" /><p className="lede">The menu follows the Lowcountry through the ingredients at their best—seafood from nearby waters, regional produce, heritage grains, and preparations drawn toward the hearth. The result is grounded in place without being held to the past.</p><ButtonLink href="/our-story" variant="secondary">Our Story</ButtonLink></div><MediaFrame src="/images/home-story-image.jpg" mobileSrc="/images/home-mobile-story.jpg" alt="A chef preparing seasonal ingredients beside the hearth" className="media-frame--landscape" /></div></section>

    <section className="section"><div className="section__inner"><div className="menu-header-row"><SectionHeading eyebrow="Menus" title="On the table now" intro="Dinner changes with the season and the people who grow, harvest, and land what we cook." /><nav className="menu-tabs" aria-label="Browse menus"><Link href="/menus/dinner">Dinner</Link><Link href="/menus#brunch">Brunch</Link><Link href="/menus#spirits">Cocktails</Link><Link href="/menus#cellar">Selected Wines</Link></nav></div><div className="menu-preview">{preview.map((item) => <MenuItem item={item} key={item.name} />)}</div><Actions centered><ButtonLink href="/menus">Explore the Menus</ButtonLink></Actions></div></section>

    <section className="section section--sand"><div className="split-section"><div className="split-section__copy"><SectionHeading eyebrow="The Atmosphere" title="A room with warmth" /><p className="lede">Settle into a dining room designed for conversation, celebration, and the pleasure of staying a little longer. The atmosphere is polished but easy; the welcome is attentive without ceremony.</p></div><div className="atmosphere-media"><MediaFrame src="/images/home-main-room-image.jpg" mobileSrc="/images/home-mobile-atmosphere-one.jpg" alt="The warm Marsh and Ember dining room" className="media-frame--landscape" /><MediaFrame src="/images/home-main-room-image.jpg" mobileSrc="/images/home-mobile-atmosphere-two.jpg" alt="Guests gathering around a table" className="media-frame--wide mobile-only" /></div></div></section>

    <section className="section"><div className="split-section"><MediaFrame src="/images/home-private-dining-image.jpg" mobileSrc="/images/home-mobile-private.jpg" alt="A private table prepared for a gathering" className="media-frame--portrait home-private-media" /><div className="split-section__copy"><SectionHeading eyebrow="Private Events" title="Your gathering, considered" /><p className="lede">A private room, a shared table, and a menu shaped around the occasion—from family celebrations to business dinners and intimate receptions.</p><ButtonLink href="/private-dining" variant="secondary">Explore Private Dining</ButtonLink></div></div></section>

    <section className="section section--navy"><div className="section__inner"><SectionHeading eyebrow="Location & Hours" title="Join us in Charleston" intro="Dinner Sunday through Thursday until 10 PM, and Friday and Saturday until 11 PM." centered light /><FactGrid facts={[{ label: "Our Address", value: settings.address }, { label: "Our Hours", value: hours }]} /><Actions centered><ButtonLink href="/visit" variant="light">Plan Your Visit</ButtonLink><ButtonLink href={settings.mapUrl} variant="light" external>Get Directions</ButtonLink></Actions></div></section>

    <section className="section section--sand"><div className="section__inner"><SectionHeading title="A table is waiting" intro="Come for the fire. Stay for the evening." centered /><Actions centered><ReservationTrigger>Reserve a Table</ReservationTrigger><ButtonLink href={settings.instagramUrl} variant="text" external>Follow Marsh &amp; Ember on Instagram</ButtonLink></Actions></div></section>
  </>;
}
