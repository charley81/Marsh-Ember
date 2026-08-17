import { Field, SelectField, StaticForm, TextAreaField } from "@/components/forms";
import { Actions, ButtonLink, Eyebrow, MediaFrame } from "@/components/ui";
import { getEventAvailabilityPresentation, type DetailEventRecord } from "@/lib/events";

export function EventHero({ event }: { event: DetailEventRecord }) {
  const presentation = getEventAvailabilityPresentation(event);

  return (
    <section className="hero event-hero">
      <div className="hero__content">
        <Eyebrow>Featured Event</Eyebrow>
        <h1>{event.title}</h1>
        <p className="lede">{event.summary}</p>
        <p className="status">{presentation.label}</p>
        {presentation.acceptsRequests && event.detail.availabilityNote ? <p className="meta">{event.detail.availabilityNote}</p> : null}
        <Actions>
          {presentation.acceptsRequests ? <ButtonLink href="#rsvp">Request RSVP</ButtonLink> : null}
          <ButtonLink href="#event-details" variant="secondary">View Event Details</ButtonLink>
        </Actions>
      </div>
      <MediaFrame src={event.detail.heroImage} alt={event.detail.heroAlt} priority />
    </section>
  );
}

export function EventRsvpSection({ event }: { event: DetailEventRecord }) {
  const presentation = getEventAvailabilityPresentation(event);

  if (!presentation.acceptsRequests) {
    const { panel } = presentation;

    return (
      <section className="event-availability-section" aria-labelledby="event-availability-title">
        <div className="event-availability">
          <div className="event-availability__card">
            <div className="event-availability__copy">
              <p className="event-availability__eyebrow">{panel.eyebrow}</p>
              <h2 id="event-availability-title">{panel.title}</h2>
              <p className="lede">{panel.body}</p>
            </div>
            {panel.showSchedule ? (
              <dl className="event-availability__schedule">
                <div>
                  <dt>Event schedule &amp; location</dt>
                  <dd>{event.schedule}</dd>
                </div>
              </dl>
            ) : null}
            {panel.note ? <p className="event-availability__note">{panel.note}</p> : null}
          </div>
          <Actions>
            {panel.actions.map((action) => (
              <ButtonLink href={action.href} variant={action.variant === "primary" ? "primary" : "secondary"} key={action.label}>
                {action.label}
              </ButtonLink>
            ))}
          </Actions>
        </div>
      </section>
    );
  }

  return (
    <section id="rsvp" className="section form-section event-form-section">
      <StaticForm
        kicker="Request an RSVP"
        title="Request an RSVP"
        intro="Tell us who will be attending. We'll review availability and send confirmation or next-step information by email. Attendance is not confirmed until a confirmation email is issued."
        acknowledgment="I understand that submitting this request does not confirm attendance and is not a standard dining reservation."
        buttonLabel="Request RSVP"
        privacy="Information submitted through this form will be used to process this event RSVP and communicate event updates."
      >
        <Field label="First name" name="first-name" required />
        <Field label="Last name" name="last-name" required />
        <Field label="Email address" name="email" type="email" placeholder="name@example.com" help="Event confirmation and updates will be sent here." required />
        <Field label="Phone number" name="phone" type="tel" placeholder="(843) 555-0123" required />
        <SelectField label="Number of guests" name="guest-count" placeholder="Select party size" options={["1", "2", "3", "4", "5", "6"]} required />
        <TextAreaField label="Dietary or accessibility information" name="details" placeholder="Share dietary needs, allergies, mobility considerations, or other information that may help us prepare." help="Please do not include medical diagnoses or unrelated sensitive information." />
      </StaticForm>
    </section>
  );
}
