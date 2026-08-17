import { Actions, ButtonLink, SectionHeading } from "@/components/ui";

export default function NotFound() {
  return <section className="section section--sand"><div className="section__inner not-found"><SectionHeading eyebrow="404" title="This table could not be found" intro="The page may have moved, or the event may no longer be available." centered /><Actions centered><ButtonLink href="/">Return Home</ButtonLink><ButtonLink href="/events" variant="secondary">View Events</ButtonLink></Actions></div></section>;
}
