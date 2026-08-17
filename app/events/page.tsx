import type { Metadata } from "next";
import { Actions, ButtonLink, Eyebrow, MediaFrame, SectionHeading } from "@/components/ui";
import { events } from "@/lib/site-data";

export const metadata: Metadata = { title: "Events", description: "Discover seasonal dinners and special gatherings at Marsh & Ember in Charleston." };

const images: Record<string, string> = {
  "harvest-at-the-hearth": "/images/events-harvest-dinner-image.jpg",
  "lowcountry-oyster-roast": "/images/events-oyster-roast-image.jpg",
  "benne-and-bourbon": "/images/events-benne-bourbon-image.jpg",
  "sunday-supper": "/images/events-sunday-supper-image.jpg",
};

export default function EventsPage() {
  const [featured, ...upcoming] = events;
  return <>
    <section className="hero"><div className="hero__content"><Eyebrow>Events</Eyebrow><h1>Gatherings beyond the everyday.</h1><p className="lede">Seasonal dinners, collaborative evenings, and gatherings shaped by the kitchen, the bar, and the people around the table.</p></div><MediaFrame src="/images/events-dining-room-special-gathering-image.jpg" alt="A special gathering in the Marsh and Ember dining room" priority /></section>

    <section className="section section--sand"><div className="section__inner"><SectionHeading eyebrow="Featured Event" title="A signature gathering at our hearth" /><div className="split-section events-featured"><MediaFrame src={images[featured.slug]} alt="Harvest at the Hearth seasonal dinner" /><div className="split-section__copy"><p className="status">{featured.status}</p><h3 className="display-subheading">{featured.title}</h3><dl className="fact-grid"><div><dt>Date</dt><dd>{featured.date}</dd></div><div><dt>Time</dt><dd>{featured.time}</dd></div><div><dt>Format</dt><dd>{featured.format}</dd></div></dl><p className="lede">{featured.summary}</p><ButtonLink href={`/events/${featured.slug}`}>View Event</ButtonLink></div></div></div></section>

    <section className="section events-upcoming"><div className="section__inner"><SectionHeading eyebrow="Upcoming" title="Upcoming at Marsh & Ember" /><div className="card-grid">{upcoming.map((event) => <article className="editorial-card" key={event.slug}><MediaFrame src={images[event.slug]} alt="" /><div className="editorial-card__body"><p className="meta">{event.date}</p><h3>{event.title}</h3><p className="meta">{event.format}</p>{event.status === "Limited Availability" ? <p className="status">{event.status}</p> : null}<p>{event.summary}</p><button className="button button--secondary" type="button" disabled>View Event</button></div></article>)}</div></div></section>

    <section className="section section--sand"><div className="section__inner"><div className="story-copy-row"><SectionHeading eyebrow="The experience" title="One evening, considered from beginning to end" /><p className="lede">Events allow the Marsh & Ember team to explore a season, ingredient, format, or shared idea in greater depth. Details vary, but each gathering is designed around the food, the room, and the experience of being at the table together.</p></div><div className="events-experience-media card-grid card-grid--2"><MediaFrame src="/images/events-experience-dining-image.jpg" alt="Guests sharing an event dinner" /><MediaFrame src="/images/events-kitchen-flame-close-up.jpg" alt="A chef finishing a dish over flame" /></div></div></section>

    <section className="section section--tight"><aside className="notice"><h2>Before you RSVP</h2><div><p>Event availability, format, and registration requirements vary. Review the complete event details before submitting an RSVP.</p><p><strong>Submitting an RSVP is separate from making a standard dining reservation.</strong></p></div></aside></section>

    <section className="section"><div className="split-section split-section--reverse split-section--mobile-copy-first"><MediaFrame src="/images/events-intimate-private-dining-room-image.jpg" alt="An intimate private dining room" className="events-private-media" /><div className="split-section__copy"><SectionHeading eyebrow="Private Dining" title="Planning a gathering of your own?" /><p className="lede">Explore private dining for celebrations, business dinners, receptions, and other occasions.</p><ButtonLink href="/private-dining" variant="secondary">Explore Private Dining</ButtonLink></div></div></section>

    <section className="section section--sand"><div className="section__inner"><SectionHeading eyebrow="Marsh & Ember" title="Join us another evening" intro="For a standard dining reservation, reserve a table through our online booking experience." centered /><Actions centered><ButtonLink href="/visit#contact">Reserve a Table</ButtonLink><ButtonLink href="/visit" variant="secondary">Plan Your Visit</ButtonLink></Actions></div></section>
  </>;
}
