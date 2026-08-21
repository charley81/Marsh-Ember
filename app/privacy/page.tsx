import { ButtonLink, Eyebrow } from "@/components/ui";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Privacy",
  description: "Learn how the fictional Marsh & Ember portfolio preview handles form values and local browser storage.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <article className="policy-page section">
      <div className="section__inner policy-page__inner">
        <header>
          <Eyebrow>Portfolio Preview</Eyebrow>
          <h1>Privacy</h1>
          <p className="lede">
            Marsh &amp; Ember is a fictional restaurant website created as a portfolio demonstration.
            Its interactive previews are designed not to collect or submit personal information.
          </p>
        </header>

        <section>
          <h2>Reservation and form previews</h2>
          <p>
            Reservation selections, Private Dining inquiry values, and event RSVP values remain in
            the open browser page while you use each preview. They are not sent to Marsh &amp; Ember,
            a booking provider, an email service, or a website submission endpoint. Contact and
            free-text values are cleared when a form preview is completed.
          </p>
          <p>Use fictional information only when trying the forms.</p>
        </section>

        <section>
          <h2>Local browser storage</h2>
          <p>
            Dismissing the announcement stores a small versioned preference in your browser&apos;s local
            storage so the same announcement can remain hidden. The preference contains no contact
            information and can be removed by clearing site data in your browser.
          </p>
        </section>

        <section>
          <h2>Hosting and external destinations</h2>
          <p>
            The hosting platform may process routine technical request information needed to serve
            and protect the site. Links to maps and social platforms leave this website and are
            governed by those services&apos; own privacy practices.
          </p>
        </section>

        <aside className="policy-page__note">
          <h2>No monitored restaurant inbox</h2>
          <p>
            Contact details shown throughout this fictional experience are demonstration content and
            should not be used to send personal or confidential information.
          </p>
        </aside>

        <ButtonLink href="/">Return Home</ButtonLink>
      </div>
    </article>
  );
}
