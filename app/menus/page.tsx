import type { Metadata } from "next";
import { Actions, ButtonLink, Eyebrow, MediaFrame, MenuItem, SectionHeading } from "@/components/ui";
import { dietaryMarkers } from "@/lib/site-data";

export const metadata: Metadata = { title: "Menus", description: "Explore seasonal dinner, weekend brunch, cocktails, and wine at Marsh & Ember." };

const dinner = [
  { name: "Hearth Bread", price: "$9", description: "Benne, cultured butter, smoked sea salt. Baked fresh over hickory wood coals daily.", tags: ["Hearth-Baked", "V"] },
  { name: "Charred Okra", price: "$16", description: "Field pea hummus, preserved lemon, sesame, extra virgin olive oil.", tags: ["VG", "GA"] },
  { name: "Market Fish", price: "MP", description: "Summer squash, shrimp broth, local garden herbs. Day-boat seafood cooked directly on the ash." },
] as const;
const brunch = [
  { name: "Skillet Cornbread", price: "$10", description: "Marsh hen mill cornmeal, whipped sea salt honey butter.", tags: ["V", "Hearth-Baked"] },
  { name: "Crab Rice", price: "$22", description: "Local blue crab, gold rice, scallions, soft egg yolk." },
  { name: "Brioche French Toast", price: "$17", description: "Thick-cut wood-toast, seasonal preserves, cultured cream, organic sorghum.", tags: ["V"] },
] as const;

export default function MenusPage() {
  return <div className="menus-page">
    <section className="hero hero--mobile-image-first hero--compact-title"><div className="hero__content"><Eyebrow>Menus</Eyebrow><h1>Cooked with the season. Guided by the Lowcountry.</h1><p className="lede">Our menus follow the ingredients at their best—from seafood landed nearby and regional produce to dishes shaped by the hearth. Offerings change with the season and may vary from what is shown online.</p><ButtonLink href="#our-menus">View Menus</ButtonLink></div><MediaFrame src="/images/menus-hero-image.jpg" mobileSrc="/images/menus-mobile-hero.jpg" alt="A seasonal plate at Marsh and Ember" priority /></section>

    <section id="our-menus" className="section section--sand"><div className="section__inner"><SectionHeading title="Our Menus" /><div className="card-grid card-grid--2">
      <article className="editorial-card"><MediaFrame src="/images/menus-plating-shot.jpg" mobileSrc="/images/menus-mobile-dinner-preview.jpg" alt="Dinner being plated" className="media-frame--wide" /><div className="editorial-card__body"><h3>Dinner</h3><p>Seasonal hearth and coastal cooking. Heavy influence from locally harvested oysters, day-boat fish, and Lowcountry fields.</p><p className="meta">Tuesday through Sunday</p><ButtonLink href="/menus/dinner" variant="text">View Dinner Menu</ButtonLink></div></article>
      <article className="editorial-card"><MediaFrame src="/images/menus-brunch-shot.jpg" mobileSrc="/images/menus-mobile-brunch-preview.jpg" alt="Weekend brunch dishes" className="media-frame--wide" /><div className="editorial-card__body"><h3>Weekend Brunch</h3><p>Late-morning plates, hearth dishes, and vibrant sparkling cocktails crafted for slower weekend celebrations.</p><p className="meta">Saturday and Sunday · 10 AM–2 PM</p><ButtonLink href="#brunch" variant="text">View Weekend Brunch</ButtonLink></div></article>
      <article className="editorial-card"><div className="editorial-card__body"><h3>Cocktails &amp; Spirits</h3><p>Seasonal cocktails, thoughtful classics, and an expansive selection of amari, rums, and Southern whiskeys.</p><ButtonLink href="#spirits" variant="text">View Cocktails &amp; Spirits</ButtonLink></div></article>
      <article className="editorial-card"><div className="editorial-card__body"><h3>Wine List</h3><p>Bottles and pours carefully curated to match Lowcountry salinity, smoke, and rich Southern textures.</p><ButtonLink href="#cellar" variant="text">View Wine List</ButtonLink></div></article>
    </div></div></section>

    <section className="section"><div className="section__inner"><MediaFrame src="/images/menus-plating-shot.jpg" mobileSrc="/images/menus-mobile-dinner.jpg" alt="Dinner cooked over the hearth" className="media-frame--wide mobile-only" /><SectionHeading eyebrow="Dinner Preview" title="From the hearth and the coast" intro="Dinner changes with the season, balancing dishes from the fire with fresh oysters, ocean catch, heirloom vegetables, and preparations rooted in regional tradition." /><div className="menu-preview">{dinner.map((item) => <MenuItem item={item} key={item.name} />)}</div><Actions centered><ButtonLink href="/menus/dinner">View Dinner Menu</ButtonLink></Actions></div></section>

    <section id="brunch" className="section section--sand"><div className="split-section"><MediaFrame src="/images/menus-brunch-shot.jpg" mobileSrc="/images/menus-mobile-brunch.jpg" alt="Weekend brunch spread" className="media-frame--wide" /><div><SectionHeading eyebrow="Weekend Brunch" title="A slower part of the week" intro="Brunch brings the Marsh & Ember point of view to late mornings, with seasonal plates, hearth cooking, curated sparkling cocktails, and sweet structures made for sharing." />{brunch.map((item) => <MenuItem item={item} compact key={item.name} />)}<ButtonLink href="#brunch" variant="text">View Brunch Menu</ButtonLink></div></div></section>

    <section className="section menus-drinks"><div className="section__inner card-grid card-grid--2"><div id="spirits"><SectionHeading eyebrow="Spirits" title="Cocktails shaped by the season" intro="Curated concoctions reflecting Southern herbs, dynamic amari profiles, and artisanal wood-fire smoked infusions." /><MenuItem item={{ name: "Salt Marsh", price: "$15", description: "Tequila, lime, sea bean cordial, smoked sea salt rim." }} /><ButtonLink href="#spirits" variant="secondary">View Cocktails & Spirits</ButtonLink></div><div id="cellar"><SectionHeading eyebrow="Cellar" title="Wines for the table" intro="Bottles selected from family estates and coastal vineyards, balanced to cut the richness of wood-fired smoke and culinary fats." /><ul><li>Thoughtful wines by the glass</li><li>Half and full bottles for sharing</li><li>Lively sparklings, whites, and rosés</li><li>Earthy reds and sweet dessert pours</li></ul><ButtonLink href="#cellar" variant="secondary">View Wine List</ButtonLink></div></div></section>

    <section className="section section--sand"><div className="section__inner"><SectionHeading eyebrow="Care" title="Dietary guidance" intro="We are delighted to assist our guests in navigating our menu selections comfortably. Please inform your server or mention allergies or specific dietary needs during booking." /><div className="dietary-grid">{dietaryMarkers.map((marker) => <div key={marker.code}><strong>{marker.code} · {marker.label}</strong><p>{marker.detail}</p></div>)}</div><p className="lede">Menu labels are provided strictly as guidance. Our kitchen handles a range of grains, nuts, and proteins, and we cannot guarantee a completely allergen-free environment.</p></div></section>

    <section className="section section--tight"><aside className="notice"><h2>Menus change with the season</h2><p>Items, ingredients, and prices may change as availability shifts. The menu shown online reflects our most recently published offering but may differ slightly from the menu served during your visit.</p></aside></section>
    <section className="section section--sand"><div className="section__inner"><SectionHeading title="Plan your table" intro="Choose the menu that fits the occasion, then join us in Charleston." centered /><Actions centered><ButtonLink href="/visit#contact">Reserve a Table</ButtonLink><ButtonLink href="/visit" variant="secondary">Plan Your Visit</ButtonLink></Actions></div></section>
  </div>;
}
