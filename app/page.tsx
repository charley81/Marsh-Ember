import type { Metadata } from "next";
import { Actions, ButtonLink, Eyebrow, FactGrid, MediaFrame, MenuItem, SectionHeading } from "@/components/ui";

export const metadata: Metadata = { title: "Lowcountry ingredients. Shaped by fire.", description: "Experience live-fire Lowcountry cooking and thoughtful hospitality in the heart of Charleston." };

const preview = [
  { name: "Hearth Bread", price: "$9", description: "Benne, cultured butter, smoked sea salt. Baked fresh over hickory wood coals daily.", tags: ["Hearth-Baked"] },
  { name: "Charred Okra", price: "$16", description: "Field pea hummus, preserved lemon, sesame, extra virgin olive oil.", tags: ["VG", "GA"] },
  { name: "Market Fish", price: "MP", description: "Summer squash, shrimp broth, local garden herbs. Day-boat seafood cooked directly on the ash.", tags: ["GA"] },
] as const;

export default function Home() {
  return <>
    <section className="hero hero--mobile-image-first hero--compact-title">
      <div className="hero__content"><Eyebrow>Charleston, South Carolina</Eyebrow><h1>Lowcountry ingredients. Shaped by fire.</h1><p className="lede">Marsh &amp; Ember brings the season to the table through live-fire cooking, thoughtful hospitality, and a warm Charleston dining room.</p><Actions><ButtonLink href="/visit#contact">Reserve a Table</ButtonLink><ButtonLink href="/menus" variant="secondary">View Menus</ButtonLink></Actions></div>
      <MediaFrame src="/images/home-hero-image.jpg" mobileSrc="/images/home-mobile-hero.jpg" alt="A wood-fired Lowcountry dish at Marsh and Ember" priority />
    </section>

    <section className="section section--sand"><div className="split-section split-section--mobile-media-first"><div className="split-section__copy"><SectionHeading eyebrow="Our Philosophy" title="From coast and field to flame" /><p className="lede">The menu follows the Lowcountry through the ingredients at their best—seafood from nearby waters, regional produce, heritage grains, and preparations drawn toward the hearth. The result is grounded in place without being held to the past.</p><ButtonLink href="/our-story" variant="secondary">Our Story</ButtonLink></div><MediaFrame src="/images/home-story-image.jpg" mobileSrc="/images/home-mobile-story.jpg" alt="A chef preparing seasonal ingredients beside the hearth" className="media-frame--landscape" /></div></section>

    <section className="section"><div className="section__inner"><div className="menu-header-row"><SectionHeading eyebrow="Menus" title="On the table now" intro="Dinner changes with the season and the people who grow, harvest, and land what we cook." /><nav className="menu-tabs" aria-label="Featured menus"><span>Dinner</span><span>Brunch</span><span>Cocktails</span><span>Selected Wines</span></nav></div><div className="menu-preview">{preview.map((item) => <MenuItem item={item} key={item.name} />)}</div><Actions centered><ButtonLink href="/menus">Explore the Menus</ButtonLink></Actions></div></section>

    <section className="section section--sand"><div className="split-section"><div className="split-section__copy"><SectionHeading eyebrow="The Atmosphere" title="A room with warmth" /><p className="lede">Settle into a dining room designed for conversation, celebration, and the pleasure of staying a little longer. The atmosphere is polished but easy; the welcome is attentive without ceremony.</p></div><div className="atmosphere-media"><MediaFrame src="/images/home-main-room-image.jpg" mobileSrc="/images/home-mobile-atmosphere-one.jpg" alt="The warm Marsh and Ember dining room" className="media-frame--landscape" /><MediaFrame src="/images/home-main-room-image.jpg" mobileSrc="/images/home-mobile-atmosphere-two.jpg" alt="Guests gathering around a table" className="media-frame--wide mobile-only" /></div></div></section>

    <section className="section"><div className="split-section"><MediaFrame src="/images/home-private-dining-image.jpg" mobileSrc="/images/home-mobile-private.jpg" alt="A private table prepared for a gathering" className="media-frame--portrait home-private-media" /><div className="split-section__copy"><SectionHeading eyebrow="Private Events" title="Your gathering, considered" /><p className="lede">A private room, a shared table, and a menu shaped around the occasion—from family celebrations to business dinners and intimate receptions.</p><ButtonLink href="/private-dining" variant="secondary">Explore Private Dining</ButtonLink></div></div></section>

    <section className="section section--navy"><div className="section__inner"><SectionHeading eyebrow="Location & Hours" title="Join us in Charleston" intro="Dinner Sunday through Thursday until 10 PM, and Friday and Saturday until 11 PM." centered light /><FactGrid facts={[{ label: "Our Address", value: "184 King Street, Charleston, SC 29401" }, { label: "Our Hours", value: "Sunday–Thursday 5–10 PM · Friday–Saturday 5–11 PM" }]} /><Actions centered><ButtonLink href="/visit" variant="light">Plan Your Visit</ButtonLink><ButtonLink href="https://maps.google.com/?q=184+King+Street+Charleston+SC+29401" variant="light" external>Get Directions</ButtonLink></Actions></div></section>

    <section className="section section--sand"><div className="section__inner"><SectionHeading title="A table is waiting" intro="Come for the fire. Stay for the evening." centered /><Actions centered><ButtonLink href="/visit#contact">Reserve a Table</ButtonLink><ButtonLink href="https://instagram.com" variant="text" external>Follow Marsh &amp; Ember on Instagram</ButtonLink></Actions></div></section>
  </>;
}
