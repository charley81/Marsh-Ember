import { DemoPrivateDiningForm } from "@/components/private-dining/demo-private-dining-form";
import { ReservationTrigger } from "@/components/reservations/reservation-trigger";
import { Actions, ButtonLink, Eyebrow, MediaFrame, SectionHeading } from "@/components/ui";
import { getSiteSettings } from "@/lib/content";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({title: "Private Dining", description: "Explore private dining and gathering spaces at Marsh & Ember in Charleston.", path: "/private-dining", image: "/images/private-full-dining-room-interior.jpg", imageAlt: "A private dining room prepared for a gathering at Marsh and Ember"});

const questions = [
  { question: "Does submitting the form reserve my date?", answer: "No. The form begins the conversation. Dates and spaces remain unconfirmed until availability, event details, an agreement, and required payment are completed." },
  { question: "Can menus accommodate dietary needs?" },
  { question: "Are menus and pricing fixed?" },
  { question: "Can I request a specific room?" },
  { question: "Can I make a regular dinner reservation here?" },
] as const;

export default async function PrivateDiningPage() {
  const settings = await getSiteSettings();

  return <>
    <section className="hero"><div className="hero__content"><Eyebrow>Private Dining</Eyebrow><h1>Gather around a table of your own.</h1><p className="lede">From intimate celebrations to business dinners and full-room gatherings, Marsh & Ember creates private experiences shaped around the people, the occasion, and the season.</p><Actions><ButtonLink href="#inquiry">Start Your Inquiry</ButtonLink><ButtonLink href="#experience" variant="secondary">Explore the Experience</ButtonLink></Actions></div><MediaFrame src="/images/private-candlelit-dining-atmosphere.jpg" mobileSrc="/images/private-mobile-hero.jpg" alt="A candlelit private table at Marsh and Ember" priority /></section>

    <section id="experience" className="section section--sand"><div className="split-section"><div className="split-section__copy"><SectionHeading eyebrow="The Experience" title="An evening shaped around your gathering" /><p className="lede">Our team works with each host to create an experience that feels personal—from the rhythm of the meal and the shape of the table to menu selections, wine, cocktails, and thoughtful details.</p><ul><li>Family celebrations</li><li>Rehearsal dinners</li><li>Business dinners</li><li>Intimate receptions</li><li>Milestone occasions</li><li>Full restaurant gatherings</li></ul><p className="meta">Private dining options depend on the date, party size, format, and restaurant availability.</p></div><MediaFrame src="/images/private-interior-main.jpg" mobileSrc="/images/private-mobile-room.jpg" alt="The private dining room interior" /></div></section>

    <section className="section"><div className="section__inner"><SectionHeading eyebrow="Our Rooms" title="Spaces with warmth and character" /><div className="card-grid card-grid--2"><article className="editorial-card"><MediaFrame src="/images/private-interior-main.jpg" mobileSrc="/images/private-mobile-room.jpg" alt="The dedicated private dining room" /><div className="editorial-card__body"><h3>The Private Dining Room</h3><p>A dedicated room designed for conversation, shared meals, and gatherings that benefit from a more intimate setting.</p><p className="meta">Capacity discussed during inquiry</p></div></article><article className="editorial-card"><MediaFrame src="/images/private-full-dining-room-interior.jpg" mobileSrc="/images/private-mobile-full-room.jpg" alt="The full Marsh and Ember dining room" /><div className="editorial-card__body"><h3>Full Restaurant Gathering</h3><p>For larger occasions, a full restaurant gathering may offer access to the dining room, bar, and surrounding hospitality spaces.</p><p className="meta">Availability and format discussed during inquiry</p></div></article></div></div></section>

    <section className="section section--sand"><div className="split-section split-section--reverse split-section--mobile-copy-first"><MediaFrame src="/images/private-food-and-wine-portrait.jpg" mobileSrc="/images/private-mobile-food-wine.jpg" alt="Food and wine prepared for a private gathering" /><div className="split-section__copy"><SectionHeading eyebrow="Food & Beverage" title="Menus made for the occasion" /><p className="lede">Rooted in the seasonal landscape of coastal South Carolina, our kitchen prepares clean, fire-kissed dishes designed to foster shared conversation and continuous delight.</p><p className="meta">Representative possibilities</p><ul><li>Family-style menus</li><li>Multi-course shared menus</li><li>Passed bites and reception formats</li><li>Wine pairings</li><li>Seasonal cocktails</li><li>Nonalcoholic beverage options</li></ul><p>Specific formats, menus, and pricing are discussed during planning and depend on the event.</p><ButtonLink href="/menus" variant="secondary">View Current Menus</ButtonLink></div></div></section>

    <section className="section"><div className="section__inner"><SectionHeading eyebrow="Planning" title="From inquiry to gathering" /><div className="numbered-grid"><article><h3>Tell us about the occasion</h3><p>Share your preferred date, estimated guest count, event type, and what you have in mind.</p></article><article><h3>Plan with our team</h3><p>We&apos;ll discuss availability, space, menu direction, beverage options, and the details that matter to your gathering.</p></article><article><h3>Confirm the experience</h3><p>Once the details are agreed upon, your event is confirmed through a separate agreement and required payment.</p></article></div><p className="meta">Submitting the inquiry does not hold a date or confirm an event.</p></div></section>

    <section className="section section--sand"><div className="section__inner"><SectionHeading title="Common questions" intro="Details about private dining at Marsh & Ember." centered /><div className="faq">{questions.map((item) => "answer" in item ? <details key={item.question} open><summary>{item.question}</summary><p>{item.answer}</p></details> : <p className="faq__question" key={item.question}>{item.question}</p>)}</div></div></section>

    <section id="inquiry" className="section section--sand form-section private-form-section"><DemoPrivateDiningForm privateDiningEmail={settings.privateDiningEmail} privateDiningPhone={settings.privateDiningPhone} privateDiningPhoneHref={settings.privateDiningPhoneHref} /></section>

    <section className="section section--navy"><div className="section__inner"><SectionHeading eyebrow="Direct Connection" title="Prefer to reach out directly?" intro="Our events team is happy to answer questions or help you get started." centered light /><Actions centered><ButtonLink href={`mailto:${settings.privateDiningEmail}`} variant="light">{settings.privateDiningEmail}</ButtonLink><ButtonLink href={settings.privateDiningPhoneHref} variant="light">{settings.privateDiningPhone}</ButtonLink></Actions></div></section>
    <section className="section section--sand"><div className="section__inner"><SectionHeading eyebrow="Marsh & Ember" title="Joining us for dinner?" intro="For a standard dining reservation, reserve a table through our online booking experience." centered /><Actions centered><ReservationTrigger>Reserve a Table</ReservationTrigger><ButtonLink href="/visit" variant="secondary">Plan Your Visit</ButtonLink></Actions></div></section>
  </>;
}
