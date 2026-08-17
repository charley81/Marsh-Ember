# Event states and empty events specification

**Status:** Approved

## What

Implement a typed event-availability model that controls event badges, RSVP availability, event-detail replacement panels, and the Events landing empty state. The feature will reproduce the approved Figma states for RSVP closed, sold out, cancelled, past, and no upcoming events while preserving the existing accepting-RSVP experience. It will also remove false event-detail affordances for fixtures that do not yet contain approved detail content.

## Context

The current implementation has four event fixtures in `lib/site-data.ts`, but `EventRecord.status` is an unrestricted string. The Events landing renders the first record as featured, renders the remaining records with disabled “View Event” buttons, and has no empty state. `app/events/[slug]/page.tsx` only supports `harvest-at-the-hearth`, contains Harvest-specific detail content outside the event record, and always displays an active RSVP form and “Request RSVP” action.

This creates four production risks:

1. An unavailable event could still present an active RSVP request form.
2. Status strings cannot be exhaustively checked by TypeScript.
3. Empty CMS results have no approved presentation.
4. Disabled “View Event” controls imply unavailable functionality, while linking them would lead to unsupported or fabricated detail pages.

Approved sources:

- Events landing: Figma `302:5073` and `302:5327`
- Event detail template: Figma `306:5232` and `307:4285`
- Empty Events landing: Figma `314:6086` and `314:6210`
- Event availability states: Figma `314:6367`
- Requirements: `context/PROJECT_CONTEXT.md`, `context/DESIGN_HANDOFF.md`, and `AGENTS.md`

The implementation remains fixture-backed in this feature. Sanity schemas, queries, preview, and live status changes belong to the later CMS feature.

## Requirements

### Event availability model

1. Every event with a detail page must have exactly one availability state:
   - `accepting`
   - `closed`
   - `sold-out`
   - `cancelled`
   - `past`
2. `accepting` may use either the approved “RSVP Open” label or the approved “Limited Availability” label without changing submission eligibility.
3. Non-accepting states must never render an active RSVP form or an RSVP request action.
4. Presentation copy, labels, and actions must be selected exhaustively from the typed state rather than from string comparisons in route components.
5. Event-specific names, dates, times, and locations in replacement panels must come from the event record. The October 17 example on the Figma state board is illustrative and must not overwrite the approved Harvest fixture date.
6. Status must not be inferred from the visitor’s clock in this fixture-backed feature. Editors/CMS records will remain authoritative so cancelled, closed, and sold-out states cannot be incorrectly overridden by date arithmetic.

### Event detail behavior

1. `accepting` renders the existing RSVP clarification and six-field request form.
2. `closed` replaces the form section with:
   - eyebrow: “RSVP Closed”
   - title: “RSVP requests are now closed”
   - event-specific body copy
   - schedule/location block
   - standard-reservation separation note
   - “Explore All Events” and “Reserve a Table” actions
3. `sold-out` replaces the form section with:
   - eyebrow: “Sold Out”
   - event-specific “is fully booked” title
   - approved request/waitlist closure copy
   - schedule/location block
   - standard-reservation separation note
   - “Explore All Events” and “Reserve a Table” actions
4. `cancelled` replaces the form section with:
   - eyebrow: “Event Cancelled”
   - event-specific cancellation title and date copy
   - approved update/contact note
   - “Explore All Events” and “Contact the Restaurant” actions
5. `past` replaces the form section with:
   - eyebrow: “Past Event”
   - title: “This gathering has ended”
   - event-specific past-date copy
   - “Explore Upcoming Events” and “Plan Your Visit” actions
6. Unavailable states must not retain an `#rsvp` target or link visitors to a missing form.
7. The hero badge must reflect the same availability model as the form/replacement panel.
8. The hero’s “Request RSVP” action appears only for `accepting`; the event-details action remains available for all states.
9. Unknown slugs and records without approved detail content must render the existing branded 404 and `noindex` behavior through `notFound()`.
10. Metadata must only be generated from a supported detail record.

### Events landing behavior

1. When listed event records are available, preserve the approved featured/upcoming hierarchy and card compositions.
2. Event status badges must be derived from the typed availability presentation.
3. A “View Event” action is rendered only when the event has approved detail content and a valid detail route.
4. Fixtures without approved detail content must not render a disabled button or a link to a 404. Their date, title, format, status, summary, and imagery remain visible.
5. When the listed event collection is empty, retain the existing Events editorial hero and replace all event-specific sections with the approved empty state directly before the global footer.
6. Empty-state copy must be exactly:
   - eyebrow: “Upcoming Events”
   - title: “No upcoming gatherings are announced”
   - body: “There are no upcoming Marsh & Ember events to share right now. Check back for future dinners, collaborations, and seasonal gatherings.”
7. Empty-state actions must be:
   - primary: “Explore Our Menus” → `/menus`
   - secondary: “Plan Your Visit” → `/visit`
   - secondary reservation trigger: “Reserve a Table” using the project’s current reservation destination until the shared Cal.com trigger is implemented
8. At desktop widths, empty-state actions form a centered row; at mobile widths, they stack full-width with 12px gaps.
9. The empty section uses the approved sand surface, centered typography, desktop `120px 80px` padding, mobile `80px 24px` padding, and fluid intermediate behavior.
10. An empty collection must not throw from featured-event destructuring.

### Accessibility and responsive behavior

1. Replacement panels must use a labeled section and semantic heading structure; status is communicated in text and not by color alone.
2. Action controls must be real links or reservation triggers with visible focus states and approximately 44px minimum targets.
3. No unavailable state may expose hidden or focusable RSVP fields.
4. Event facts use semantic description-list markup where appropriate.
5. Desktop and mobile layouts must match the approved hierarchy and remain fluid from 320px through large desktop widths.
6. No state may introduce horizontal page overflow.
7. Existing reduced-motion behavior must remain intact.

## Design

### Domain types

Replace the free-form `status: string` with a discriminated availability model owned by framework-independent event data.

```ts
type AcceptingAvailability = {
  state: "accepting";
  label: "RSVP Open" | "Limited Availability";
};

type EventAvailability =
  | AcceptingAvailability
  | { state: "closed" }
  | { state: "sold-out" }
  | { state: "cancelled" }
  | { state: "past" };
```

`EventRecord` will also distinguish listing data from approved detail availability:

```ts
type EventRecord = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  time: string;
  schedule: string;
  location: string;
  format: string;
  availability: EventAvailability;
  detail?: EventDetail;
};
```

`EventDetail` will own the existing Harvest-specific facts, expectations, course preview, media references, alt text, and editorial copy currently declared in `app/events/[slug]/page.tsx`. Moving that content establishes the boundary required for later Sanity mapping without inventing detail content for other fixture events.

### Pure presentation selector

Add an exhaustive function such as `getEventAvailabilityPresentation(event)` that returns the UI contract needed by badges, hero actions, and the RSVP section:

- normalized label
- whether requests are accepted
- replacement-panel eyebrow, title, and body when unavailable
- whether schedule/location and standard-reservation notes appear
- approved action definitions

The selector will use an exhaustive `switch` with a `never` assertion so adding a future state fails type checking until its presentation is defined.

Submission-time availability checking is not part of this static feature, but the same `state === "accepting"` invariant will later be reused by the RSVP server handler.

### Components

Introduce focused server components rather than adding more conditional markup to the route:

- `EventsLandingContent` receives an event collection and chooses populated or empty rendering.
- `EventsEmptyState` renders Figma `314:6086` / `314:6210`.
- `EventAvailabilityPanel` renders Figma `314:6367` for non-accepting states.
- `EventRsvpSection` chooses the existing form or replacement panel from the presentation selector.
- Existing `ButtonLink`, `Actions`, `FactGrid`, and form primitives remain the shared visual primitives.

Components should live under an event-focused directory such as `components/events/`. Domain selectors remain in `lib/` so they can be tested without rendering Next.js routes.

### Route and data flow

1. `app/events/page.tsx` receives the listed fixture records and delegates to `EventsLandingContent`.
2. The landing component checks collection length before selecting a featured record.
3. Cards render detail links only when `detail` exists.
4. `generateStaticParams()` derives params from records with `detail` instead of comparing against a hardcoded approved slug.
5. `generateMetadata()` and the page resolve one detail-capable event through a shared selector; unsupported records call `notFound()`.
6. The detail route passes the resolved record to hero, content, and RSVP-state components.

With the current approved content, only `/events/harvest-at-the-hearth` is generated. The other listing records remain visible but do not claim that an approved detail page exists. Sanity integration will restore “View Event” actions as complete detail records become available.

### Styling

Extend `app/globals.css` using existing tokens:

- shared empty-state container and typography styles
- replacement-panel outer sand container, inner white card, dividers, schedule block, and action row
- mobile full-width action stacking
- state labels using text plus the existing ember/ink/slate palette

Do not introduce new hardcoded colors when an existing semantic custom property applies.

## Decisions

### Availability is explicit, not date-derived

- **Choice:** Store a discriminated availability state on each event.
- **Alternatives:** Infer state from date/time; continue using arbitrary display strings.
- **Why:** Closed, sold-out, and cancelled are operational states that dates cannot determine. Explicit state is also required for the future server-side RSVP recheck.
- **Reversibility:** The union can be mapped directly from future Sanity enum fields.
- **Research:** Project requirements list five supported states and require server-authoritative availability.

### “Limited Availability” remains an accepting variant

- **Choice:** Model it as the label of `accepting`, not as a sixth lifecycle state.
- **Alternatives:** Add a separate state; remove the approved label.
- **Why:** Figma uses “Limited Availability” while the lifecycle requirements only distinguish whether requests may be accepted. A label variant preserves the design without duplicating behavior.
- **Reversibility:** It can later become a CMS-controlled badge within an allowed enum.

### Do not invent missing event-detail content

- **Choice:** Only records with an `EventDetail` render routes and “View Event” links.
- **Alternatives:** Reuse Harvest copy for other events; create generic detail pages; keep disabled buttons.
- **Why:** Reusing or inventing facts, courses, policies, and details violates the approved content constraints. Disabled buttons are false affordances. Optional detail data makes the temporary limitation explicit and safe.
- **Reversibility:** Adding a complete CMS detail record automatically makes the action and route eligible.
- **Assumption:** Until CMS content is authored, the three non-Harvest listing fixtures have no approved detail content beyond what appears on the Events landing frame.

### Replacement panels are server-rendered

- **Choice:** Select the form or panel during server rendering.
- **Alternatives:** Hide the form with CSS; switch after hydration.
- **Why:** Unavailable controls must not appear in the accessibility tree or briefly flash during hydration. No client state is needed for fixture-backed status.
- **Reversibility:** CMS data can feed the same server-rendered branch later.

### Keep static generation data-driven

- **Choice:** Derive `generateStaticParams()` from detail-capable records and retain `notFound()` for unsupported slugs.
- **Alternatives:** Preserve the hardcoded slug check; generate every listing slug.
- **Why:** Next.js 16.3.1 supports async `params`, typed `PageProps`, data-driven `generateStaticParams`, and route-level `notFound()`. This removes the one-off route guard while preventing incomplete routes.
- **Reversibility:** The fixture selector can later be replaced by a Sanity slug query.

### No new runtime dependency

- **Choice:** Implement the model, selector, and components with TypeScript, React, and existing Next.js primitives.
- **Alternatives:** Add a state-management or schema package.
- **Why:** Status selection is deterministic server-side domain logic and does not justify another dependency.

## Versions

- Next.js `16.3.1`, React `19.2.8`, and TypeScript `5.9.x` as locked by the repository.
- Next.js 16.3.1 documentation confirms:
  - dynamic route `params` are promises and can use generated `PageProps`
  - `generateStaticParams()` should return route parameter objects for supported static records
  - `notFound()` terminates rendering, uses the nearest `not-found` UI, and injects `noindex`
- No dependency changes are required.

## Invariants

1. Only `accepting` events show or link to an RSVP request form.
2. A successful visual state never implies attendance is confirmed.
3. Standard reservations remain separate from event RSVP requests.
4. Event names, schedules, and dates come from the active event record.
5. Unsupported and unknown event slugs return the branded 404.
6. Empty event data produces an intentional page, not an exception.
7. No Resy or OpenTable references are introduced.
8. The existing Harvest page content and approved `6:30 PM – Approximately 9 PM` display remain unchanged except for moving data into the typed boundary.

## Error behavior

- Unknown slug: call `notFound()` before rendering page content or metadata derived from an event.
- Listing record without detail: render the listing content without a detail action; direct slug access returns 404.
- Empty list: render the approved empty state.
- Unsupported availability value: impossible in typed fixtures; later CMS mapping must reject or safely map malformed values before they reach these components.
- Missing optional detail media/copy: not introduced by this fixture model; future CMS mapping owns those fallbacks.

## Testing strategy

### Unit tests

- Availability selector returns the correct label, eligibility, copy contract, and actions for all five states.
- “Limited Availability” remains eligible to submit.
- Exhaustive state handling is enforced by TypeScript.
- Detail-capable event selector includes Harvest and excludes unsupported fixture records.
- Empty and populated listing selectors do not mutate input and do not throw.

### Component tests

- Accepting renders the RSVP form and no replacement panel.
- Closed, sold-out, cancelled, and past each render their approved panel copy and no form controls.
- Unavailable hero state has no “Request RSVP” link.
- Empty landing renders all approved copy and three valid actions.
- Listing records without detail render no disabled button and no link to a missing route.

### End-to-end tests

- Existing Events → Harvest detail navigation continues to work.
- Harvest accepting state exposes the RSVP request form.
- Unknown and unsupported event slugs render the branded 404.
- The no-upcoming-events public-route E2E is deferred until CMS/test data can produce an empty collection without adding a production query-string backdoor. Its rendering and actions are covered at the component level in this feature.

### Verification

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm test:e2e:run`
- Responsive comparison against Figma `314:6086`, `314:6210`, and `314:6367` at 390px and 1440px
- Keyboard review of all empty/replacement-panel actions
- Confirm unavailable states contain no focusable RSVP fields

## Out of scope

- Sanity schemas, queries, preview mode, caching, and revalidation
- Server-side RSVP submission or real-time availability rechecks
- Cal.com reservation dialog behavior
- Authoring unapproved detail copy for Lowcountry Oyster Roast, Benne & Bourbon, or Sunday Supper
- Automatic date/time-zone transition to `past`
- Waitlist functionality
- Private Dining form behavior
- Global announcement, footer legal links, and unrelated static-content cleanup
