import { Actions, ButtonLink, MediaFrame, SectionHeading } from "@/components/ui";
import { getEventAvailabilityPresentation, hasEventDetail, type EventRecord } from "@/lib/events";

const images: Record<string, { src: string; alt: string }> = {
  "harvest-at-the-hearth": {
    src: "/images/events-harvest-dinner-image.jpg",
    alt: "Harvest at the Hearth seasonal dinner",
  },
  "lowcountry-oyster-roast": {
    src: "/images/events-oyster-roast-image.jpg",
    alt: "Oysters roasting over the fire at a Lowcountry gathering",
  },
  "benne-and-bourbon": {
    src: "/images/events-benne-bourbon-image.jpg",
    alt: "Benne and bourbon prepared for a guided dinner",
  },
  "sunday-supper": {
    src: "/images/events-sunday-supper-image.jpg",
    alt: "A seasonal shared-table Sunday supper",
  },
};

export function EventsLandingContent({ events }: { events: readonly EventRecord[] }) {
  if (events.length === 0) return <EventsEmptyState />;

  const [featured, ...upcoming] = events;
  const featuredPresentation = getEventAvailabilityPresentation(featured);
  const featuredImage = images[featured.slug];

  return (
    <>
      <section className="section section--sand">
        <div className="section__inner">
          <SectionHeading eyebrow="Featured Event" title="A signature gathering at our hearth" />
          <div className="split-section events-featured">
            <MediaFrame src={featuredImage.src} alt={featuredImage.alt} />
            <div className="split-section__copy">
              <p className="status">{featuredPresentation.label}</p>
              <h3 className="display-subheading">{featured.title}</h3>
              <dl className="fact-grid">
                <div><dt>Date</dt><dd>{featured.date}</dd></div>
                <div><dt>Time</dt><dd>{featured.time}</dd></div>
                <div><dt>Format</dt><dd>{featured.format}</dd></div>
              </dl>
              <p className="lede">{featured.summary}</p>
              {hasEventDetail(featured) ? <ButtonLink href={`/events/${featured.slug}`}>View Event</ButtonLink> : null}
            </div>
          </div>
        </div>
      </section>

      {upcoming.length ? (
        <section className="section events-upcoming">
          <div className="section__inner">
            <SectionHeading eyebrow="Upcoming" title="Upcoming at Marsh & Ember" />
            <div className="card-grid">
              {upcoming.map((event) => {
                const presentation = getEventAvailabilityPresentation(event);
                const image = images[event.slug];

                return (
                  <article className="editorial-card" key={event.slug}>
                    <MediaFrame src={image.src} alt={image.alt} />
                    <div className="editorial-card__body">
                      <p className="meta">{event.date} · {event.time}</p>
                      <h3>{event.title}</h3>
                      <p className="meta">{event.format}</p>
                      <p className="status">{presentation.label}</p>
                      <p>{event.summary}</p>
                      {hasEventDetail(event) ? <ButtonLink href={`/events/${event.slug}`} variant="secondary">View Event</ButtonLink> : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section section--sand">
        <div className="section__inner">
          <div className="story-copy-row">
            <SectionHeading eyebrow="The experience" title="One evening, considered from beginning to end" />
            <p className="lede">Events allow the Marsh & Ember team to explore a season, ingredient, format, or shared idea in greater depth. Details vary, but each gathering is designed around the food, the room, and the experience of being at the table together.</p>
          </div>
          <div className="events-experience-media card-grid card-grid--2">
            <MediaFrame src="/images/events-experience-dining-image.jpg" alt="Guests sharing an event dinner" />
            <MediaFrame src="/images/events-kitchen-flame-close-up.jpg" alt="A chef finishing a dish over flame" />
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <aside className="notice">
          <h2>Before you RSVP</h2>
          <div>
            <p>Event availability, format, and registration requirements vary. Review the complete event details before submitting an RSVP.</p>
            <p><strong>Submitting an RSVP is separate from making a standard dining reservation.</strong></p>
          </div>
        </aside>
      </section>

      <section className="section">
        <div className="split-section split-section--reverse split-section--mobile-copy-first">
          <MediaFrame src="/images/events-intimate-private-dining-room-image.jpg" alt="An intimate private dining room" className="events-private-media" />
          <div className="split-section__copy">
            <SectionHeading eyebrow="Private Dining" title="Planning a gathering of your own?" />
            <p className="lede">Explore private dining for celebrations, business dinners, receptions, and other occasions.</p>
            <ButtonLink href="/private-dining" variant="secondary">Explore Private Dining</ButtonLink>
          </div>
        </div>
      </section>

      <section className="section section--sand">
        <div className="section__inner">
          <SectionHeading eyebrow="Marsh & Ember" title="Join us another evening" intro="For a standard dining reservation, reserve a table through our online booking experience." centered />
          <Actions centered>
            <ButtonLink href="/visit#contact">Reserve a Table</ButtonLink>
            <ButtonLink href="/visit" variant="secondary">Plan Your Visit</ButtonLink>
          </Actions>
        </div>
      </section>
    </>
  );
}

export function EventsEmptyState() {
  return (
    <section className="events-empty" aria-labelledby="events-empty-title">
      <div className="events-empty__inner">
        <div className="events-empty__copy">
          <p className="events-empty__eyebrow">Upcoming Events</p>
          <h2 id="events-empty-title">No upcoming gatherings are announced</h2>
          <p>There are no upcoming Marsh & Ember events to share right now. Check back for future dinners, collaborations, and seasonal gatherings.</p>
        </div>
        <Actions centered>
          <ButtonLink href="/menus">Explore Our Menus</ButtonLink>
          <ButtonLink href="/visit" variant="secondary">Plan Your Visit</ButtonLink>
          <ButtonLink href="/visit#contact" variant="secondary">Reserve a Table</ButtonLink>
        </Actions>
      </div>
    </section>
  );
}
