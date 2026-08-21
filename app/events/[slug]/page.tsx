import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventHero, EventRsvpSection } from "@/components/events/event-detail";
import { ReservationTrigger } from "@/components/reservations/reservation-trigger";
import { JsonLd } from "@/components/seo/json-ld";
import { Actions, ButtonLink, FactGrid, MediaFrame, SectionHeading, Tags } from "@/components/ui";
import { getDetailEventSlugs, getEventBySlug, getSiteSettings } from "@/lib/content";
import { getEventAvailabilityPresentation } from "@/lib/events";
import { createPageMetadata } from "@/lib/seo";
import { createEventJsonLd } from "@/lib/structured-data";

export async function generateStaticParams() {
  return (await getDetailEventSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug, { stega: false });
  if (!event) return { title: "Event Not Found", robots: {index: false, follow: false} };
  return createPageMetadata({title: event.title, description: event.summary, path: `/events/${slug}`, image: event.detail.heroImage, imageAlt: event.detail.heroAlt});
}

export default async function EventDetailPage({ params }: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const [event, settings] = await Promise.all([getEventBySlug(slug), getSiteSettings()]);
  if (!event) notFound();

  const presentation = getEventAvailabilityPresentation(event);
  const facts = [...event.detail.facts, { label: "Status", value: presentation.label }];

  return (
    <>
      <JsonLd data={createEventJsonLd(event, settings)} />
      <div className="event-detail-page">
      <div className="section event-back"><div className="section__inner"><Link className="button button--text" href="/events">← Back to All Events</Link></div></div>
      <EventHero event={event} />

      <section id="event-details" className="section section--sand event-facts"><div className="section__inner"><SectionHeading title="Event Details" /><FactGrid className="event-facts__grid" facts={facts} /></div></section>

      <section className="section">
        <div className="split-section">
          <div className="split-section__copy">
            <SectionHeading title={event.detail.intro.title} />
            {event.detail.intro.paragraphs.map((paragraph, index) => <p className={index === 0 ? "lede" : undefined} key={paragraph}>{paragraph}</p>)}
          </div>
          <div className="event-intro-media">
            {event.detail.intro.images.map((image) => <MediaFrame src={image.src} alt={image.alt} key={image.src} />)}
          </div>
        </div>
      </section>

      <section className="section section--sand"><div className="section__inner"><SectionHeading eyebrow="Experience" title="What to expect" /><div className="list-grid">{event.detail.expectations.map((expectation) => <article key={expectation.title}><h3>{expectation.title}</h3><p>{expectation.copy}</p></article>)}</div></div></section>

      <section className="section event-menu"><div className="section__inner"><SectionHeading title="A glimpse of the menu" intro="The final menu follows availability and may change before the event." /><div className="event-menu__courses">{event.detail.courses.map((course) => <article className="menu-item event-menu__card" key={course.name}><h3>{course.name}</h3><p>{course.description}</p><Tags tags={course.tags} /></article>)}</div><p><strong>V</strong> — Vegetarian &nbsp; <strong>VG</strong> — Vegan &nbsp; <strong>GA</strong> — Gluten-aware</p><p className="meta">The menu is representative. Final courses and dietary labels require operational verification.</p></div></section>

      <EventRsvpSection event={event} />

      <section className="section section--sand"><div className="section__inner"><SectionHeading title="Questions about the event?" centered /><Actions centered><ButtonLink href={`mailto:${settings.eventEmail}`} variant="secondary">{settings.eventEmail}</ButtonLink><ButtonLink href={settings.eventPhoneHref} variant="secondary">{settings.eventPhone}</ButtonLink></Actions></div></section>
      <section className="section section--sand"><div className="section__inner"><SectionHeading eyebrow="Marsh & Ember" title="Looking for a regular reservation?" intro="For dinner on another evening, reserve a table through our standard online booking experience." centered /><Actions centered><ReservationTrigger>Reserve a Table</ReservationTrigger><ButtonLink href="/events" variant="secondary">Explore All Events</ButtonLink><ButtonLink href="/visit" variant="secondary">Plan Your Visit</ButtonLink></Actions></div></section>
      </div>
    </>
  );
}
