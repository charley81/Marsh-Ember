import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Field, SelectField, StaticForm, TextAreaField } from "@/components/forms";
import { Actions, ButtonLink, Eyebrow, FactGrid, MediaFrame, SectionHeading, Tags } from "@/components/ui";
import { getEvent } from "@/lib/site-data";

const approvedSlug = "harvest-at-the-hearth";

export function generateStaticParams() { return [{ slug: approvedSlug }]; }

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event || slug !== approvedSlug) return { title: "Event Not Found" };
  return { title: event.title, description: event.summary };
}

const facts = [
  { label: "Date", value: "September 24, 2026" },
  { label: "Time", value: "6:30 PM – Approximately 9 PM" },
  { label: "Time Zone", value: "Eastern Time" },
  { label: "Format", value: "Multi-course shared dinner" },
  { label: "Location", value: "Marsh & Ember, Charleston" },
  { label: "Registration", value: "RSVP required" },
  { label: "Status", value: "RSVP Open" },
] as const;
const expectations = [
  ["Shared multi-course menu", "The kitchen will serve one seasonal menu across the evening."],
  ["Communal experience", "Seating may include shared tables or neighboring parties depending on the final event format."],
  ["Set arrival time", "Guests should plan to arrive before the 6:30 PM start so the menu can begin together."],
  ["Dietary communication", "Share dietary needs in the RSVP request. The team will review requests before confirming attendance, but not every accommodation can be guaranteed."],
] as const;
const courses = [
  { name: "Hearth Bread", description: "Benne, cultured butter, smoked sea salt" },
  { name: "Ember-Roasted Vegetables", description: "Field peas, herbs, preserved lemon", tags: ["VG", "GA"] },
  { name: "Market Fish", description: "Carolina Gold rice, shrimp broth, seasonal vegetables" },
  { name: "Wood-Grilled Pork", description: "Mustard greens, peach, natural jus" },
  { name: "Cornmeal Cake", description: "Late-summer fruit, cultured cream", tags: ["V"] },
] as const;

export default async function EventDetailPage({ params }: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event || slug !== approvedSlug) notFound();

  return <div className="event-detail-page">
    <div className="section event-back"><div className="section__inner"><Link className="button button--text" href="/events">← Back to All Events</Link></div></div>
    <section className="hero event-hero"><div className="hero__content"><Eyebrow>Featured Event</Eyebrow><h1>{event.title}</h1><p className="lede">{event.summary}</p><p className="status">{event.status}</p><p className="meta">Limited seats available</p><Actions><ButtonLink href="#rsvp">Request RSVP</ButtonLink><ButtonLink href="#event-details" variant="secondary">View Event Details</ButtonLink></Actions></div><MediaFrame src="/images/event-primary-harvest-dinner.jpg" alt="Harvest at the Hearth dinner served around a shared table" priority /></section>

    <section id="event-details" className="section section--sand event-facts"><div className="section__inner"><SectionHeading title="Event Details" /><FactGrid facts={facts} /></div></section>

    <section className="section"><div className="split-section"><div className="split-section__copy"><SectionHeading title="An evening around the hearth" /><p className="lede">Harvest at the Hearth is a one-night dinner inspired by the transition from late summer into fall. The menu follows ingredients through the fire—from vegetables and seafood to grains, smoke, and the final course.</p><p>Guests will be seated for a shared multi-course experience. The evening is designed to unfold as one menu, with beverages available separately unless otherwise noted during confirmation.</p></div><div className="event-intro-media"><MediaFrame src="/images/event-food-prep-image.jpg" alt="Seasonal ingredients being prepared for the event" /><MediaFrame src="/images/event-dining-room-setup.jpg" alt="The dining room prepared for Harvest at the Hearth" /></div></div></section>

    <section className="section section--sand"><div className="section__inner"><SectionHeading eyebrow="Experience" title="What to expect" /><div className="list-grid">{expectations.map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>

    <section className="section"><div className="section__inner"><SectionHeading title="A glimpse of the menu" intro="The final menu follows availability and may change before the event." /><div className="menu-section__items">{courses.map((course) => <article className="menu-item" key={course.name}><h3>{course.name}</h3><p>{course.description}</p><Tags tags={"tags" in course ? course.tags : undefined} /></article>)}</div><p><strong>V</strong> — Vegetarian &nbsp; <strong>VG</strong> — Vegan &nbsp; <strong>GA</strong> — Gluten-aware</p><p className="meta">The menu is representative. Final courses and dietary labels require operational verification.</p></div></section>

    <section className="section section--tight section--sand"><aside className="notice"><h2>Before requesting an RSVP</h2><div><p><strong>Request Process</strong><br />Submitting this form requests space at Harvest at the Hearth. Attendance is not confirmed until you receive a confirmation email from Marsh & Ember.</p><p><strong>Dining Reservations</strong><br />This RSVP is for the event only. It does not create a standard dining reservation.</p></div></aside></section>

    <section id="rsvp" className="section form-section event-form-section"><StaticForm kicker="Request an RSVP" title="Request an RSVP" intro="Tell us who will be attending. We'll review availability and send confirmation or next-step information by email. Attendance is not confirmed until a confirmation email is issued." acknowledgment="I understand that submitting this request does not confirm attendance and is not a standard dining reservation." buttonLabel="Request RSVP" privacy="Information submitted through this form will be used to process this event RSVP and communicate event updates.">
      <Field label="First name" name="first-name" required /><Field label="Last name" name="last-name" required />
      <Field label="Email address" name="email" type="email" placeholder="name@example.com" help="Event confirmation and updates will be sent here." required /><Field label="Phone number" name="phone" type="tel" placeholder="(843) 555-0123" required />
      <SelectField label="Number of guests" name="guest-count" placeholder="Select party size" options={["1", "2", "3", "4", "5", "6"]} required />
      <TextAreaField label="Dietary or accessibility information" name="details" placeholder="Share dietary needs, allergies, mobility considerations, or other information that may help us prepare." help="Please do not include medical diagnoses or unrelated sensitive information." />
    </StaticForm></section>

    <section className="section section--sand"><div className="section__inner"><SectionHeading title="Questions about the event?" centered /><Actions centered><ButtonLink href="mailto:events@marshandember.com" variant="secondary">events@marshandember.com</ButtonLink><ButtonLink href="tel:+18435550100" variant="secondary">(843) 555-0100</ButtonLink></Actions></div></section>
    <section className="section section--sand"><div className="section__inner"><SectionHeading eyebrow="Marsh & Ember" title="Looking for a regular reservation?" intro="For dinner on another evening, reserve a table through our standard online booking experience." centered /><Actions centered><ButtonLink href="/visit#contact">Reserve a Table</ButtonLink><ButtonLink href="/events" variant="secondary">Explore All Events</ButtonLink><ButtonLink href="/visit" variant="secondary">Plan Your Visit</ButtonLink></Actions></div></section>
  </div>;
}
