export type AcceptingAvailability = {
  state: "accepting";
  label: "RSVP Open" | "Limited Availability";
};

export type EventAvailability =
  | AcceptingAvailability
  | { state: "closed" }
  | { state: "sold-out" }
  | { state: "cancelled" }
  | { state: "past" };

export type EventFact = {
  label: string;
  value: string;
};

export type EventExpectation = {
  title: string;
  copy: string;
};

export type EventCourse = {
  name: string;
  description: string;
  tags?: readonly string[];
};

export type EventDetail = {
  heroImage: string;
  heroAlt: string;
  availabilityNote?: string;
  facts: readonly EventFact[];
  intro: {
    title: string;
    paragraphs: readonly string[];
    images: readonly { src: string; alt: string }[];
  };
  expectations: readonly EventExpectation[];
  courses: readonly EventCourse[];
};

export type EventRecord = {
  slug: string;
  title: string;
  summary: string;
  listingImage: { src: string; alt: string };
  startsAt: string;
  endsAt: string;
  date: string;
  time: string;
  schedule: string;
  location: string;
  format: string;
  availability: EventAvailability;
  detail?: EventDetail;
};

export type DetailEventRecord = EventRecord & { detail: EventDetail };

type EventAction = {
  label: string;
  href: string;
  variant: "primary" | "secondary";
};

type UnavailablePanel = {
  eyebrow: string;
  title: string;
  body: string;
  showSchedule: boolean;
  note?: string;
  actions: readonly EventAction[];
};

export type EventAvailabilityPresentation =
  | {
      label: AcceptingAvailability["label"];
      acceptsRequests: true;
      panel: null;
    }
  | {
      label: "RSVP Closed" | "Sold Out" | "Event Cancelled" | "Past Event";
      acceptsRequests: false;
      panel: UnavailablePanel;
    };

const exploreEvents: EventAction = { label: "Explore All Events", href: "/events", variant: "primary" };
const reserveTable: EventAction = { label: "Reserve a Table", href: "/visit#contact", variant: "secondary" };

function assertNever(value: never): never {
  throw new Error(`Unsupported event availability: ${JSON.stringify(value)}`);
}

export function getEventAvailabilityPresentation(event: EventRecord): EventAvailabilityPresentation {
  switch (event.availability.state) {
    case "accepting":
      return {
        label: event.availability.label,
        acceptsRequests: true,
        panel: null,
      };
    case "closed":
      return {
        label: "RSVP Closed",
        acceptsRequests: false,
        panel: {
          eyebrow: "RSVP Closed",
          title: "RSVP requests are now closed",
          body: `We are no longer accepting RSVP requests for ${event.title}.`,
          showSchedule: true,
          note: "Standard dining reservations are separate from this event.",
          actions: [exploreEvents, reserveTable],
        },
      };
    case "sold-out":
      return {
        label: "Sold Out",
        acceptsRequests: false,
        panel: {
          eyebrow: "Sold Out",
          title: `${event.title} is fully booked`,
          body: "RSVP requests and the waitlist are now closed for this event.",
          showSchedule: true,
          note: "Standard dining reservations are separate from this event.",
          actions: [exploreEvents, reserveTable],
        },
      };
    case "cancelled":
      return {
        label: "Event Cancelled",
        acceptsRequests: false,
        panel: {
          eyebrow: "Event Cancelled",
          title: `${event.title} has been cancelled`,
          body: `This event will not take place on ${event.date}. Guests with confirmed attendance or active requests will receive updates using the contact information they provided.`,
          showSchedule: false,
          note: "If you expected an update and have not received one, contact Marsh & Ember directly.",
          actions: [
            exploreEvents,
            { label: "Contact the Restaurant", href: "/visit#contact", variant: "secondary" },
          ],
        },
      };
    case "past":
      return {
        label: "Past Event",
        acceptsRequests: false,
        panel: {
          eyebrow: "Past Event",
          title: "This gathering has ended",
          body: `${event.title} took place on ${event.date}. Explore upcoming Marsh & Ember events or plan another visit.`,
          showSchedule: false,
          actions: [
            { label: "Explore Upcoming Events", href: "/events", variant: "primary" },
            { label: "Plan Your Visit", href: "/visit", variant: "secondary" },
          ],
        },
      };
    default:
      return assertNever(event.availability);
  }
}

export function hasEventDetail(event: EventRecord): event is DetailEventRecord {
  return event.detail !== undefined;
}

export function getDetailEvents(records: readonly EventRecord[]): DetailEventRecord[] {
  return records.filter(hasEventDetail);
}

export function getDetailEvent(records: readonly EventRecord[], slug: string): DetailEventRecord | undefined {
  return records.find((event): event is DetailEventRecord => event.slug === slug && hasEventDetail(event));
}
