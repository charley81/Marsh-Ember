import type { Metadata } from "next";
import { EventsLandingContent } from "@/components/events/events-landing-content";
import { Eyebrow, MediaFrame } from "@/components/ui";
import { getEvents } from "@/lib/content";

export const metadata: Metadata = { title: "Events", description: "Discover seasonal dinners and special gatherings at Marsh & Ember in Charleston." };

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <>
      <section className="hero">
        <div className="hero__content">
          <Eyebrow>Events</Eyebrow>
          <h1>Gatherings beyond the everyday.</h1>
          <p className="lede">Seasonal dinners, collaborative evenings, and gatherings shaped by the kitchen, the bar, and the people around the table.</p>
        </div>
        <MediaFrame src="/images/events-dining-room-special-gathering-image.jpg" alt="A special gathering in the Marsh and Ember dining room" priority />
      </section>
      <EventsLandingContent events={events} />
    </>
  );
}
