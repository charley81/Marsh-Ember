import { ButtonLink, Eyebrow } from "@/components/ui";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Accessibility",
  description: "Review accessibility features and known limitations of the fictional Marsh & Ember portfolio preview.",
  path: "/accessibility",
});

export default function AccessibilityPage() {
  return (
    <article className="policy-page section">
      <div className="section__inner policy-page__inner">
        <header>
          <Eyebrow>Welcoming by Design</Eyebrow>
          <h1>Accessibility</h1>
          <p className="lede">
            Marsh &amp; Ember is a fictional portfolio project built to provide an inclusive experience
            across common devices, input methods, and assistive technologies.
          </p>
        </header>

        <section>
          <h2>Accessibility features</h2>
          <ul>
            <li>Semantic page landmarks, headings, navigation, forms, and native controls</li>
            <li>A skip link and visible keyboard focus indicators</li>
            <li>Keyboard-operable mobile navigation, dialogs, forms, and disclosure controls</li>
            <li>Focus management and restoration for modal and mobile-menu interactions</li>
            <li>Visible form labels, linked validation messages, and accessible status updates</li>
            <li>Responsive layouts designed for narrow screens and 200% browser zoom</li>
            <li>Reduced-motion behavior when requested by the operating system</li>
            <li>Text alternatives for meaningful images</li>
          </ul>
        </section>

        <section>
          <h2>Known boundaries</h2>
          <p>
            Booking, inquiry, and RSVP experiences are local demonstrations. They do not connect to
            real restaurant services, but their interaction and error states are designed to remain
            keyboard and screen-reader accessible.
          </p>
          <p>
            External map and social-platform destinations are controlled by their respective
            providers and may have different accessibility characteristics.
          </p>
        </section>

        <section>
          <h2>Restaurant visit information</h2>
          <p>
            The fictional Visit page describes step-free entry, accessible seating, an accessible
            restroom, service-animal welcome, and assistance on request as demonstration content.
          </p>
          <ButtonLink href="/visit" variant="secondary">Review Visit Information</ButtonLink>
        </section>

        <aside className="policy-page__note">
          <h2>Feedback</h2>
          <p>
            The restaurant contact details in this preview are fictional and are not monitored.
            Accessibility defects can be reported through the repository or portfolio owner that
            provided this demonstration.
          </p>
        </aside>

        <ButtonLink href="/">Return Home</ButtonLink>
      </div>
    </article>
  );
}
