import { Faq } from "@/components/faq";
import { ReservationTrigger } from "@/components/reservations/reservation-trigger";
import { Actions, ButtonLink, Eyebrow, FactGrid, MediaFrame, SectionHeading } from "@/components/ui";
import { getSiteSettings } from "@/lib/content";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({title: "Visit", description: "Find hours, directions, accessibility information, and arrival guidance for Marsh & Ember in Charleston.", path: "/visit", image: "/images/visit-main-exterior-dusk-image.jpg", imageAlt: "Marsh and Ember exterior at dusk in Charleston"});

const questions = [
  { question: "Is there a dress code?", answer: "There is no formal dress code. Guests are encouraged to come as they are and dress for the occasion." },
  { question: "Are children welcome?", answer: "Guests planning a visit with children can contact the restaurant before booking for current seating guidance and help choosing the most comfortable table." },
  { question: "Can I bring a service animal?", answer: "Yes. Service animals are welcomed. Contact the restaurant before your visit if there is anything the team can do to support your arrival or seating." },
  { question: "How do I change a reservation?", answer: "Use the change or cancellation options provided with your booking. If you need additional help, call or email the restaurant." },
  { question: "Are walk-ins accepted?", answer: "Same-day availability can change throughout service. Contact the restaurant for current guidance, or use the reservation experience to look for an available table." },
] as const;

export default async function VisitPage() {
  const restaurant = await getSiteSettings();

  return <>
    <section className="hero hero--mobile-image-first"><div className="hero__content"><Eyebrow>Marsh &amp; Ember</Eyebrow><h1>Visit</h1><p className="lede">Find your way to Marsh &amp; Ember.</p><p className="lede">Join us in Charleston for dinner nightly and weekend brunch.</p><Actions><ReservationTrigger>Reserve a Table</ReservationTrigger><ButtonLink href={restaurant.mapUrl} variant="secondary" external>Get Directions</ButtonLink></Actions></div><MediaFrame src="/images/visit-main-exterior-dusk-image.jpg" mobileSrc="/images/visit-mobile-hero.jpg" alt="Marsh and Ember at dusk in Charleston" priority /></section>

    <section id="contact" className="section section--sand visit-details"><div className="section__inner"><SectionHeading eyebrow="Essential Details" title="Plan your visit" /><FactGrid facts={[
      { label: "Address", value: <address>{restaurant.addressLines[0]}<br />{restaurant.addressLines[1]}<span className="fact-grid__links"><a href={restaurant.mapUrl} target="_blank" rel="noreferrer">Get Directions <span aria-hidden="true">↗</span></a></span></address> },
      { label: "Hours", value: <span>{restaurant.hours.map((row) => <span className="fact-grid__line" key={row.days}>{row.days}<br />{row.time}</span>)}<small>Hours may change for holidays, weather, or private events.</small></span> },
      { label: "Contact", value: <span className="fact-grid__links"><a href={restaurant.phoneHref}>{restaurant.phone}</a><a href={`mailto:${restaurant.email}`}>{restaurant.email}</a></span> },
    ]} /></div></section>

    <section className="section"><div className="split-section"><div className="split-section__copy"><SectionHeading eyebrow="Location" title="In Charleston" /><p className="lede">Marsh & Ember is located on the Charleston peninsula, within reach of downtown neighborhoods, hotels, and the surrounding waterfront.</p><Actions><ButtonLink href={restaurant.mapUrl} variant="secondary" external>Open in Google Maps</ButtonLink></Actions></div><MediaFrame src="/images/visit-charleston-waterfront-evening-image.jpg" mobileSrc="/images/visit-mobile-waterfront.jpg" alt="Charleston waterfront in the evening" /></div></section>

    <section className="section section--sand"><div className="split-section split-section--reverse split-section--mobile-copy-first"><MediaFrame src="/images/visit-charleston-evening-streetscape-image.jpg" mobileSrc="/images/visit-mobile-streetscape.jpg" alt="A warm Charleston streetscape at dusk" /><div className="split-section__copy"><SectionHeading eyebrow="Arrival Guidance" title="Parking and arrival" /><p className="lede">Street parking and public garages may be available nearby. Availability, pricing, and restrictions vary, so review posted signs and current garage information before arrival.</p><ul><li>Allow time for downtown traffic and parking.</li><li>Rideshare drop-off details should be confirmed before publication.</li><li>Guests should not park in private or restricted areas.</li></ul></div></div></section>

    <section className="section visit-accessibility"><div className="section__inner"><SectionHeading eyebrow="Welcoming All" title="Accessibility" intro="We want every guest to feel welcome and able to plan with confidence." /><div className="list-grid"><article><h3>Step-free main entrance</h3></article><article><h3>Accessible seating options</h3></article><article><h3>Accessible restroom</h3></article><article><h3>Service animals welcomed</h3></article><article><h3>Team assistance available upon request</h3></article></div><p>For questions about access, seating, or accommodations, contact us before your visit.</p><Actions><ButtonLink href={restaurant.phoneHref} variant="secondary">Call the Restaurant</ButtonLink><ButtonLink href={`mailto:${restaurant.email}`} variant="secondary">Email the Restaurant</ButtonLink></Actions></div></section>

    <section className="section section--sand"><div className="section__inner"><SectionHeading eyebrow="Common Questions" title="Good to know" centered /><Faq items={questions} /></div></section>

    <section className="section"><div className="section__inner"><SectionHeading eyebrow="Gatherings & Events" title="Planning something more?" /><div className="card-grid card-grid--2"><article className="editorial-card"><div className="editorial-card__body"><h3>Private Dining</h3><p>For celebrations, business dinners, receptions, and other private gatherings.</p><ButtonLink href="/private-dining" variant="text">Explore Private Dining</ButtonLink></div></article><article className="editorial-card"><div className="editorial-card__body"><h3>Events</h3><p>Discover seasonal dinners and special gatherings at Marsh & Ember.</p><ButtonLink href="/events" variant="text">View Upcoming Events</ButtonLink></div></article></div></div></section>

    <section className="section section--sand"><div className="section__inner"><SectionHeading title="Your table is waiting" intro="Choose an evening, plan your arrival, and join us in Charleston." centered /><Actions centered><ReservationTrigger>Reserve a Table</ReservationTrigger><ButtonLink href="/menus" variant="secondary">View Menus</ButtonLink><ButtonLink href={restaurant.mapUrl} variant="secondary" external>Get Directions</ButtonLink></Actions></div></section>
  </>;
}
