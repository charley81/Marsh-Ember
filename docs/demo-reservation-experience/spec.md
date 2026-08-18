# Demo reservation experience specification

## What

Replace every temporary standard-reservation link with one accessible, site-wide reservation dialog that simulates a Cal.com-style booking journey without connecting to Cal.com, a calendar, or any backend. The experience will let portfolio visitors inspect a realistic loading state, select a fictional date, time, and party size, complete a clearly labeled demonstration, and intentionally preview provider failure and recovery. It must never create, persist, transmit, or imply a real restaurant reservation.

## Context

Marsh & Ember is a fictional portfolio project, not an operating restaurant. The original product direction called for an embedded Cal.com experience, but a live integration would require maintaining a calendar and could allow visitors to create appointments that nobody intends to fulfill. A deterministic local simulation better demonstrates interaction design, accessibility, error handling, and integration architecture while remaining honest.

Today, reservation actions throughout `app/` and `components/` link to `/visit#contact`. The global interactive behavior is concentrated in `components/site/site-interactions.tsx`, while `components/site/site-shell.tsx` is the shared server-rendered shell. Existing tests use Vitest, React Testing Library, and Playwright.

The visual source of truth remains Figma nodes:

- `314:5511` — loading
- `314:5552` — provider error
- `314:5574` — confirmed visual hierarchy, with truthful demo copy replacing real confirmation claims
- `246:2870` — icon button
- `181:2224` — action button

## Requirements

### Global behavior

1. Every standard “Reserve” or “Reserve a Table” action must open the same reservation experience rather than navigate to `/visit#contact`.
2. Private Dining inquiry and Event RSVP controls must remain separate and must never open this experience.
3. The trigger must retain the visual variant expected by its placement, including primary, secondary, and light treatments.
4. Closing the dialog must return focus to the exact trigger that opened it.
5. Opening one trigger from the mobile navigation must close the navigation before presenting the reservation dialog.

### Demo disclosure and honesty

1. The first dialog view must state prominently that Marsh & Ember is a fictional portfolio project and that no reservation will be created.
2. The normal call to action must be labeled “Start Demo” or equivalently explicit language—not “Book” or “Confirm Reservation.”
3. The completion view must say “Demo reservation complete,” not “Reservation confirmed.”
4. The experience must state that no email was sent, no table was held, and no information was submitted.
5. Any displayed reference must be labeled “Demo reference” and must not resemble evidence of a real booking without that qualifier.
6. The UI and repository must not claim that Cal.com is live or connected.

### Simulated journey

1. Starting the demo must render the approved loading presentation before availability appears.
2. Availability must contain fictional, deterministic options for party size, date, and time.
3. A visitor must select all required values before completing the demo.
4. Completion must show the selected date, time, and party size using the hierarchy of Figma node `314:5574` with demo-safe copy.
5. Selection data must remain in browser memory only and be cleared when the dialog is reset or the page reloads.
6. The simulation must collect no name, email address, phone number, payment information, or other personal data.
7. The introductory view must offer a secondary “Preview Error State” action so reviewers can intentionally inspect the failure path.
8. Previewing failure must pass through loading, then render the approved error hierarchy from Figma node `314:5552`.
9. “Try Again” from the error state must recover into usable fictional availability; it must not repeatedly fail unless the visitor explicitly previews the error again.
10. The simulated delay should be brief enough not to impede use, deterministic under tests, cancellable on close, and removed or effectively immediate when reduced motion is requested.

### Dialog accessibility

1. Use a semantic modal dialog with an accessible name and description.
2. On open, focus must move into the dialog; the first focus target should be contextually useful.
3. Tab and Shift+Tab must remain within the open modal.
4. Escape and the 44×44 close button must close it.
5. Background content must be inert while the modal is open, and background scrolling must be prevented.
6. Loading and completion updates must use a polite status announcement; a newly rendered blocking error must use an alert announcement.
7. Status meaning must not rely on color or motion.
8. Mobile layouts must behave as a full-screen dialog; desktop must use the centered 640px dialog composition shown in Figma.
9. The interface must remain usable at 320px width and 200% zoom.
10. Motion must respect `prefers-reduced-motion`.

### Visual behavior

1. Preserve the approved dialog header, metadata, close action, spacing, warm neutral surfaces, navy actions, ember accents, and dimmed page backdrop.
2. Loading must include a stable skeleton region and delayed-loading message without causing layout shift.
3. Error must state clearly that no table was reserved and no data was processed.
4. Completion must preserve the approved details-list structure while changing all real-world confirmation language to demo language.
5. Buttons must stack when needed rather than overflow at narrow widths.

### Performance and dependencies

1. Keep pages and the site shell server-rendered except for the smallest client boundaries needed for triggers, dialog state, and the simulation.
2. Load the substantive dialog UI only after a visitor opens it when practical.
3. Add no Cal.com package, calendar package, API token, webhook, network request, or new runtime dependency.
4. The feature must work in fixture and Sanity content modes without additional environment variables.

## Design

### Component structure

Add a focused reservation feature boundary under `components/reservations/`:

- `reservation-provider.tsx`: a small client context mounted inside `SiteShell`; stores open state and the initiating trigger reference and exposes `openReservation()` / `closeReservation()`.
- `reservation-trigger.tsx`: a native button styled through existing `.button` variants; consumes the provider and replaces only standard reservation links.
- `reservation-dialog.tsx`: the semantic modal shell, focus restoration, close handling, scroll containment, responsive presentation, and state rendering.
- `demo-reservation-adapter.ts`: framework-independent demo availability and completion contract with no I/O.
- `reservation-machine.ts`: pure transition logic and discriminated state types where separating it improves testability.

The exact file split may be consolidated if implementation shows that a file would contain only trivial forwarding code. The provider and dialog should remain separate from unrelated mobile-navigation and announcement logic.

### Runtime flow

```text
closed
  -> introduction
      -> loading(normal) -> availability -> demo-completing -> demo-complete
      -> loading(error)  -> provider-error -> loading(retry) -> availability
  -> closed/reset
```

The adapter contract should model the future provider boundary without pretending to implement Cal.com. A suitable conceptual interface is:

```ts
type DemoAvailability = {
  dates: readonly DemoDateOption[]
  partySizes: readonly number[]
}

type DemoSelection = {
  date: string
  time: string
  partySize: number
}

type DemoCompletion = DemoSelection & {
  demoReference: string
}

interface ReservationProviderAdapter {
  loadAvailability(signal: AbortSignal): Promise<DemoAvailability>
  complete(selection: DemoSelection, signal: AbortSignal): Promise<DemoCompletion>
}
```

Implementation names may differ, but the boundary must remain provider-neutral, typed, abortable, and free of React concerns. A future real client could replace the adapter without rewriting dialog accessibility or trigger wiring.

### Availability fixtures

Generate a small set of future fictional dates from an injected/current clock rather than hardcoding a date that will become stale. Date generation and formatting must be deterministic when a clock is supplied by tests. Offer limited realistic dinner times and party sizes without inventing restaurant policies, capacity promises, deposits, or prices.

### Trigger migration

Replace standard reservation links in:

- `components/site/site-interactions.tsx`
- `components/site/site-shell.tsx`
- Home, menus, dinner, visit, our-story, private-dining, events landing, and event-detail calls to action

Do not alter navigation links such as “Plan Your Visit,” Private Dining inquiry controls, or RSVP controls. Update existing assertions that currently require `/visit#contact`.

### Styling

Add reservation-specific classes to `app/globals.css`, reusing existing color, typography, spacing, button, focus, and breakpoint tokens. Do not introduce a parallel token system. Desktop uses the Figma 640px card with a constrained viewport height and internal overflow where necessary; mobile uses the viewport as a full-screen surface with safe padding.

## Decisions

### Use a local adapter, not Cal.com

- **Choice:** Implement a no-I/O demo adapter.
- **Alternatives:** Connect a personal calendar; create and maintain a fake Cal.com account; omit reservations entirely.
- **Why:** The local adapter demonstrates the complete UX safely, cannot create accidental appointments, requires no secrets, and remains replaceable for a real client.
- **Reversible:** Yes. A future Cal.com adapter can implement the same boundary.
- **Informed by:** Project purpose, user direction, and the integration boundaries in `context/PROJECT_CONTEXT.md`.

### Use an explicit demo introduction

- **Choice:** Disclose the simulation before showing booking controls and expose an intentional error preview there.
- **Alternatives:** Hide disclosure in footer copy; silently simulate a real confirmation; expose failure only through test configuration.
- **Why:** It is honest, prevents misunderstanding, and lets portfolio reviewers inspect resilient provider-error design without secret URLs or unreliable failures.
- **Reversible:** The introduction can be replaced by a provider-loaded state for a real client.

### Use the native dialog platform primitive

- **Choice:** Prefer `<dialog>` with `showModal()` and explicit focus restoration, backed by tests in supported project browsers.
- **Alternatives:** A fully custom ARIA dialog and manual focus trap; a new dialog library.
- **Why:** Native modal behavior provides focus containment, Escape handling, backdrop semantics, and background inertness with less code and no dependency. Explicit lifecycle code is still required for initial focus, cancellation, cleanup, and trigger restoration.
- **Reversible:** Yes, behind the dialog component boundary.
- **Assumption:** The project’s supported modern Chromium/WebKit browsers provide the required native dialog behavior.

### Keep demo data ephemeral

- **Choice:** Store only selection state in React memory.
- **Alternatives:** Local storage, cookies, server actions, or a database.
- **Why:** Persistence creates no portfolio value and could make a fictional booking appear durable.
- **Reversible:** Yes, if a real integration later owns persistence.

### Preserve Figma hierarchy but revise claims

- **Choice:** Match the approved loading, error, and completion compositions while replacing provider-specific or real-confirmation claims with explicit demo language.
- **Alternatives:** Copy the frames verbatim; redesign the states.
- **Why:** Visual fidelity remains important, but truthful product behavior overrides copy that assumes an authoritative provider response.
- **Reversible:** Provider-specific copy can return only after authoritative integration events exist.

## Versions

No dependency changes are required. Implementation targets the versions already locked by the repository:

- Next.js `16.3.1`
- React / React DOM `19.2.8`
- TypeScript 5.x
- Vitest `4.1.10`
- Playwright `1.62.1`

Relevant bundled Next.js documentation reviewed:

- Server and Client Components: keep the client boundary narrow and pass serializable values.
- Lazy Loading: defer client UI through a top-level dynamic import when it provides a measurable bundle benefit.
- Vitest: use unit/component tests for synchronous client behavior and pure state logic.
- Playwright: verify the integrated modal journey against a production build.
- Accessibility: preserve descriptive page and interaction semantics.

## Invariants

- No network request may occur during the reservation journey.
- No secret, API key, Cal.com account, or environment variable is required.
- No personal data is requested, stored, logged, or transmitted.
- No UI text may claim a real reservation, held table, sent email, or live Cal.com integration.
- Private Dining and Event RSVP remain distinct experiences.
- Every standard reservation trigger opens the same dialog.
- Closing by button, Escape, or completion restores focus to the initiating trigger.
- The dialog cannot leave body scroll locked, timers running, or pending state updates after close/unmount.

These invariants should be checked through source review, targeted tests, and a repository search for obsolete `/visit#contact` reservation destinations and unsupported live-integration claims.

## Error Behavior

- **Intentional provider preview:** Show the approved blocking error with “Your table has not been reserved” and “No data was processed,” plus Try Again, contact, and close options. Do not offer an external booking page because none exists.
- **Unexpected adapter failure:** Normalize it to the same safe provider-error state; do not expose exception text.
- **Invalid/incomplete selection:** Keep entered selections, identify each missing choice in visible text, associate errors with controls, and move focus to an error summary or first invalid control.
- **Closed during async work:** Abort the operation, clear timers, suppress stale updates, and reset for the next open.
- **Reduced motion:** Skip decorative loading animation and shorten the simulated wait while preserving an announced loading transition.

## Testing Strategy

### Unit tests

- Availability generation always returns future, deterministic fictional options for an injected clock.
- State transitions cover normal completion, intentional error, retry recovery, reset, invalid transition protection, and abort.
- Completion details are derived only from the visitor’s in-memory selection.

### Component/integration tests

- Every trigger variant opens the dialog.
- Opening moves focus into the dialog.
- Escape and close button restore focus to the initiating trigger.
- Tab and Shift+Tab remain within the modal.
- Introduction contains the demo disclosure.
- Normal flow shows loading, validates required choices, and ends with truthful demo completion copy.
- Error preview shows an alert and Try Again recovers.
- Closing during loading performs cleanup without stale state updates.
- Mobile-menu reservation closes the menu before opening the dialog.
- No completion text claims an email was sent or a real reservation exists.

### End-to-end tests

Extend the existing Playwright suite for desktop Chromium and mobile Chromium:

1. Open from a page CTA, complete the normal demo, close, and verify focus restoration.
2. Open with keyboard, close with Escape, and verify restoration.
3. Preview provider failure, retry, and reach availability.
4. Exercise the mobile navigation trigger and full-screen presentation.
5. Assert no reservation journey request is sent to Cal.com or any application endpoint.

### Manual verification

- Compare loading, error, and completion hierarchy against Figma at 1440px and 390px.
- Review 320px, tablet, desktop, and 200% zoom.
- Complete keyboard-only and basic screen-reader-oriented checks.
- Verify reduced-motion behavior.
- Confirm all standard reservation CTAs open the shared experience and no unrelated controls do.

Before delivery, run formatting, lint, TypeScript, focused tests, the broader unit suite, the production build, and relevant Playwright tests.

## Out of Scope

- A live Cal.com embed, API, webhook, calendar connection, or sandbox account
- Real availability, capacity, booking, payment, cancellation, or modification
- Email or SMS notifications
- Persistence, analytics, or collection of visitor information
- Private Dining inquiry implementation
- Event RSVP submission implementation
- Redesigning the approved reservation state compositions
- Claiming production readiness for live reservations
