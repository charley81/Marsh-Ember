# Demo Private Dining inquiry specification

## What

Replace the inert Private Dining form with an accessible, client-side portfolio demonstration of a complete inquiry workflow. Visitors can enter fictional details, exercise field validation, observe a pending state, intentionally preview a submission failure with value preservation, and reach a clearly labeled demo completion state. The experience must not call a server action or endpoint, persist data, send email, create an inquiry, hold a date, or imply that the fictional restaurant will contact the visitor.

## Context

Marsh & Ember is a fictional portfolio project rather than an operating restaurant. The current Private Dining page at `app/private-dining/page.tsx` renders the approved fields through `components/forms.tsx`, but its button is intentionally `type="button"` and announces that online submission will be enabled later. A real production workflow would require persistence, transactional email, spam protection, rate limiting, retention policy, and an operational recipient. None of those services or owners exist for this demonstration.

The reservation feature established the project pattern for an honest no-I/O simulation: typed local behavior, deterministic failure preview, explicit disclosure, ephemeral state, and no external dependency. The Private Dining form should follow the same product principles while retaining native form semantics and building reusable field/status patterns for a later demo Event RSVP workflow.

Visual sources of truth:

- Private Dining page: Figma `295:4750` desktop and `295:5065` mobile
- Private Dining form states: Figma `314:5658`
- Form fields: Figma component set `199:2486`
- Status messages: Figma component set `209:2593`
- Buttons: Figma component set `181:2224`

Figma `314:5658` defines four state hierarchies: validation error, in-flight submission, global submission error with intact values, and success. Real-submission language in those frames must be adapted to truthful demo language.

## Requirements

### Demo disclosure and privacy

1. A prominent notice immediately before the form fields must identify the workflow as a portfolio demonstration.
2. The notice must state that no inquiry will be sent, stored, emailed, or reviewed and that no date will be reserved or held.
3. Visitors must be instructed to use fictional information only.
4. The form must discourage browser autofill where practical so personal contact details are not inserted accidentally.
5. No form value may be sent through `fetch`, a server action, a route handler, navigation query parameters, analytics, logging, local storage, session storage, cookies, or another persistence mechanism.
6. Values may exist only in the live form/client state while the visitor is interacting with it.
7. On successful demo completion, all entered name, email, phone, and free-text values must be cleared from component state.
8. Tests, fixtures, screenshots, and examples must use obviously fictional information and reserved example contact data only.

### Form fields

Preserve the current approved field set and visible labels:

- First name — required
- Last name — required
- Email address — required, email input
- Phone number — required, telephone input
- Event type — required
- Preferred date — required
- Preferred time of day — required
- Estimated guest count — required, numeric
- Alternate date — optional
- Space preference — optional
- Estimated food and beverage budget — optional
- Additional information — optional textarea
- Acknowledgment — required

The acknowledgment must continue to state that an inquiry does not reserve a date or confirm an event. The demo disclosure is additional and must not weaken that operational distinction.

### Validation state

1. Submit through a native `<form>` and submit button, enhanced by a focused client component.
2. Validate required text after trimming whitespace.
3. Validate email syntax without transmitting the value.
4. Require a non-empty phone value without imposing an invented regional format.
5. Require event type and preferred-time values from the approved option sets.
6. Require an ISO date value for the preferred date and reject dates earlier than the current date using an injected clock in pure validation tests.
7. Require estimated guest count to be a whole number of at least 1; do not invent a maximum capacity.
8. Require the acknowledgment checkbox.
9. On invalid submit, preserve every entered value and render the Figma validation hierarchy with the demo-safe heading “We need a few more details.”
10. Render a focusable error summary at the start of the form containing links to each invalid field.
11. Move focus to the error summary after invalid submission.
12. Associate every inline error with its control through stable IDs and `aria-describedby`; set `aria-invalid="true"` only on invalid controls.
13. When a visitor corrects a field, remove that field’s stale error without clearing unrelated errors or values.

### Pending state

1. A valid normal submission must enter a brief deterministic pending state before completion.
2. The pending state must use the Figma loading hierarchy with truthful copy such as “Completing the inquiry demo…” and “No information is being transmitted.”
3. Disable the fieldset and all submission controls while pending to prevent duplicate activation.
4. Change the primary button label to “Completing Demo…” while pending.
5. Announce the pending state politely without repeatedly announcing on every render.
6. The simulated delay must be abortable on unmount and effectively immediate when reduced motion is requested.

### Intentional error and retry

1. Provide a clearly secondary “Preview Error State” submit action near the primary demo action.
2. The error-preview action must still run validation first; invalid data must never skip directly to a global error.
3. A valid error preview must pass through pending and then render the Figma global-error hierarchy.
4. Error copy must say that this is a simulated failure and that no information was submitted and no date was held.
5. Preserve all entered values after the simulated error.
6. “Try Again” must rerun the same local values through the successful path without forcing re-entry.
7. Email and telephone fallback links may use shared fictional restaurant settings, but the UI must not imply that the demo values were sent to those channels.
8. Unexpected local adapter failures must normalize to the same safe error state without exposing exception text.

### Demo completion

1. Replace the form with the Figma success hierarchy after a valid normal completion.
2. Use “Demo inquiry complete,” not “Inquiry received.”
3. State explicitly that no inquiry was created, no team will contact the visitor, and no date is held or event confirmed.
4. A displayed identifier must be labeled “Demo reference” and begin with `DEMO-PD-`; it must not be presented as an operational receipt.
5. Do not repeat entered names, contact details, additional information, or other potentially personal values on the completion screen.
6. Provide actions to restart the demo, view menus, and plan a visit.
7. Restarting must return a blank form and place focus on the form heading or first useful control.

### Accessibility and responsive behavior

1. Keep persistent visible labels; placeholders must remain supplemental.
2. Required state must be communicated in text/semantics, not only by an asterisk.
3. Status meaning must use clear written copy and must not rely on color or icons.
4. Newly rendered validation/global errors must use an appropriate alert announcement; pending and completion must use polite status announcements.
5. Maintain logical keyboard order and visible focus throughout validation, retry, and restart.
6. Controls must retain approximately 44px minimum touch targets.
7. At desktop widths, preserve the two-column field rhythm where approved; at narrow widths, stack controls in a single readable column.
8. The form and every state must work at 320px width, 390px reference width, intermediate widths, and 200% zoom without clipping or horizontal page overflow.
9. Respect `prefers-reduced-motion` and do not make understanding depend on animation.

### Performance and dependencies

1. Keep `app/private-dining/page.tsx` as a Server Component and isolate form interaction in the smallest practical Client Component.
2. Do not turn the full page or shared static form primitives into a client bundle unnecessarily.
3. Add no runtime package, validation package, provider SDK, endpoint, environment variable, or external service.
4. The feature must work identically in fixture and Sanity content modes.

## Design

### Component boundaries

Introduce a focused Private Dining feature boundary while extracting only genuinely reusable form behavior:

- `components/private-dining/demo-private-dining-form.tsx` — client component that owns field values, form phase, focus movement, pending lifecycle, and rendering of the form/state composition.
- `lib/private-dining-inquiry.ts` — framework-independent field types, option constants, normalization, validation, error types, and deterministic demo-reference generation.
- `components/forms/form-field.tsx` (or an equivalent small shared primitive) — server/client-safe field shell supporting label, help, error, required state, disabled state, and described-by composition.
- `components/forms/form-status.tsx` (only if repetition justifies it) — presentational status hierarchy aligned to Figma `209:2593`.

`components/forms.tsx` currently serves both Private Dining and Event RSVP. Refactor it only as needed to avoid duplication and preserve the existing inert RSVP presentation. This feature must not accidentally make Event RSVP submit or change its availability behavior.

Implementation may consolidate trivial files, but validation must remain pure and separate from React so Event RSVP can reuse the pattern later.

### State model

Use a discriminated state rather than independent booleans:

```text
editing
  -> validation-error
  -> pending(success) -> demo-complete
  -> pending(error)   -> submission-error
submission-error
  -> pending(retry)   -> demo-complete
  -> editing

demo-complete
  -> editing(blank)
```

Field errors and values belong to the editing/error state. Pending captures an immutable in-memory snapshot for the duration of the simulated operation. Completion retains only a generated demo reference; sensitive/contact fields are cleared before rendering success.

### Local adapter contract

Use a small no-I/O adapter similar in spirit to the reservation adapter:

```ts
type DemoInquiryScenario = 'success' | 'error'

type DemoInquiryResult = {
  demoReference: `DEMO-PD-${string}`
}

interface DemoPrivateDiningAdapter {
  complete(
    normalized: NormalizedPrivateDiningInquiry,
    signal: AbortSignal,
    scenario?: DemoInquiryScenario,
  ): Promise<DemoInquiryResult>
}
```

The adapter may inspect non-sensitive normalized fields to make a deterministic reference, but it must not log, persist, serialize to a URL, or transmit any value. The reference should not encode names, email, phone, notes, or other entered content.

### Form submission

Use client-side `onSubmit` because the approved feature deliberately has no server mutation. The primary and error-preview buttons should be native submitters with an explicit scenario value so keyboard/native submission uses the normal successful path by default. Read and normalize current controlled state or local `FormData` only inside the component; do not attach an `action` URL or Server Action.

The event flow is:

1. Prevent network navigation.
2. Normalize and validate locally.
3. If invalid, render/focus summary and preserve values.
4. If valid, capture the requested demo scenario and enter pending.
5. Resolve to demo completion or simulated global error.
6. Abort and clean timers when unmounted.

### Styling

Extend the existing form styles in `app/globals.css` with state-specific classes rather than introducing a second visual system. Reuse project color, typography, spacing, focus, button, and breakpoint tokens. Match the Figma board’s sand form container, white status panels, 24–48px spacing rhythm, field error treatment, disabled appearance, and success card hierarchy. Adapt dimensions fluidly rather than copying fixed Figma board widths.

## Decisions

### Demonstrate submission entirely in the browser

- **Choice:** Use a no-I/O client adapter and no Server Action.
- **Alternatives:** Send to a real email address; persist fake inquiries; implement a server endpoint that discards data; keep the form inert.
- **Why:** A server hop would collect personal data without an operational purpose, while an inert form cannot demonstrate validation and recovery. A local adapter demonstrates the UX safely and honestly.
- **Reversible:** Yes. Pure validation and form-state boundaries can later connect to an authoritative server handler for a real client.
- **Informed by:** User direction, project purpose, the existing reservation-demo architecture, and Next.js form documentation distinguishing client validation from Server Action mutations.

### Keep the approved contact fields but require fictional data

- **Choice:** Preserve the complete form to demonstrate realistic UX, with prominent “use fictional information” guidance and no transmission/persistence.
- **Alternatives:** Remove name/contact fields; prefill them; disable them; implement a real submission.
- **Why:** Removing fields would no longer demonstrate the approved Private Dining workflow. Prefilling can obscure field interaction and validation. Explicit guidance plus no I/O best balances portfolio value and privacy.
- **Reversible:** A real client can replace demo guidance with an approved privacy notice and server contract.
- **Risk:** A visitor can still type real information into browser memory. Mitigate through prominent copy, autofill discouragement, no storage/network activity, and clearing values on completion.

### Expose failure as a secondary submit action

- **Choice:** Provide “Preview Error State” beside the primary action.
- **Alternatives:** Query parameters, random failures, dev-only controls, or no visible failure path.
- **Why:** Portfolio reviewers can reliably inspect failure handling without hidden instructions or flaky behavior, while validation remains identical for both scenarios.
- **Reversible:** Remove the secondary action when a real adapter owns failure behavior.

### Build reusable primitives without activating RSVP

- **Choice:** Generalize field/error/status presentation while keeping Private Dining state ownership feature-specific.
- **Alternatives:** Build all forms in one large client component; implement RSVP simultaneously; duplicate every field pattern.
- **Why:** This proves a reusable foundation without expanding scope or accidentally changing event availability and receipt semantics.
- **Reversible:** The Event RSVP feature can adopt the primitives and its own domain validator later.

### Clear contact data at demo completion

- **Choice:** Retain values through validation and retry, then clear them before success renders.
- **Alternatives:** Show a full submitted-data review; retain values until refresh; persist a draft.
- **Why:** Success does not need personal fields, and clearing minimizes the lifetime of accidentally entered personal information.
- **Reversible:** A real server workflow would define retention outside this client component.

## Versions

No dependency changes are required. Target the versions already locked in the repository:

- Next.js `16.3.1`
- React / React DOM `19.2.8`
- TypeScript 5.x
- Vitest `4.1.10`
- Playwright `1.62.1`

Relevant bundled Next.js documentation reviewed:

- Forms: native forms support both client validation and Server Actions; this demo intentionally uses client submission because there is no mutation or authoritative server result.
- Server and Client Components: retain the page as a Server Component and make only the interactive form a Client Component.
- Vitest and Playwright guidance: test pure/client behavior with Vitest and the integrated user journey against the production application with Playwright.

## Invariants

- The form performs zero network requests and has no `action` destination or Server Action.
- No inquiry, email, reservation, held date, or follow-up is created or promised.
- No entered value is persisted, logged, placed in a URL, or exposed outside the form component.
- Validation and simulated submission errors preserve values.
- Demo completion clears contact/free-text values and displays no entered personal data.
- Success language always includes “Demo” and never says “Inquiry received” without an explicit negation.
- Private Dining never routes through the reservation provider.
- Event RSVP behavior remains unchanged.
- The acknowledgment never implies that submission confirms an event.
- Pending operations are abortable and cannot update state after unmount.

## Error Behavior

- **Validation failure:** Focus the summary, link to every invalid field, render inline errors, preserve all values, and remain editable.
- **Intentional submission failure:** Announce a simulated global error, preserve values, state that nothing was sent or held, and offer retry/contact alternatives.
- **Unexpected adapter exception:** Map to the same safe global error; never expose stack traces or exception text.
- **Duplicate activation:** Disable fieldset and submitters while pending so only one local operation can resolve.
- **Unmount during pending:** Abort the adapter timer and suppress stale state updates.
- **Restart after success:** Return to a blank form and clear reference/error state.

## Testing Strategy

### Unit tests

- Normalize whitespace without mutating the original input.
- Validate every required field independently.
- Cover malformed email, empty phone, unknown select values, past/malformed preferred date, decimal/zero/negative guest count, and missing acknowledgment.
- Accept optional fields when empty.
- Use an injected clock for deterministic date boundaries.
- Generate demo references without embedding names, email, phone, or notes.
- Adapter covers success, intentional error, and abort.

### Component/integration tests

- Initial form contains the visible demo/privacy disclosure and all approved fields.
- Native submit defaults to the successful scenario.
- Empty/invalid submission focuses the summary and correctly associates inline errors.
- Correcting one field removes only its error and preserves other values.
- Pending disables fields/actions and announces truthful no-transmission copy.
- Error preview validates first, then preserves values through simulated failure.
- Retry succeeds without re-entering values.
- Completion uses “Demo inquiry complete,” shows a demo reference, makes no contact promise, and does not render entered personal data.
- Restart returns a blank form with useful focus.
- Unmount during pending aborts cleanly.
- Existing Event RSVP static-form tests remain unchanged/passing.

### End-to-end tests

Extend Playwright coverage for desktop and mobile:

1. Submit empty and verify summary focus plus field-level errors.
2. Enter fictional valid values, complete the demo, and verify truthful completion language.
3. Enter fictional valid values, preview failure, verify values remain, retry, and complete.
4. Observe requests during the journey and assert no form/server/provider request occurs.
5. Verify values are blank after restarting.
6. Verify the existing reservation and Event RSVP controls remain separate.

### Manual verification

- Compare validation, pending, error, and completion states to Figma `314:5658` at 1440px and 390px.
- Review 320px, an intermediate tablet width, and 200% zoom for clipping and horizontal overflow.
- Complete a keyboard-only pass: summary links, correction order, both submitters, retry, and restart focus.
- Confirm screen-reader announcements are concise and occur once per state transition.
- Inspect browser Network, Application, and console panels to confirm no request, storage, URL serialization, or value logging.
- Confirm browser autofill does not silently populate personal data where the browser honors the form’s opt-out.

Before delivery, run lint, type checking, focused tests, the full unit suite, Studio build, production build, relevant Playwright tests, and responsive visual review.

## Out of Scope

- Real Private Dining submission, persistence, email, CRM, webhook, or staff notification
- Server Actions, route handlers, API endpoints, spam protection, rate limiting, idempotency, or inquiry retention
- Collecting or storing real visitor information
- Confirming availability, holding a date, quoting pricing, capacity, deposits, or response times
- Event RSVP implementation
- Changing event status behavior
- Changing the standard reservation demo
- Creating provider accounts, secrets, or deployment configuration
- Claiming that the demo is a production submission backend
