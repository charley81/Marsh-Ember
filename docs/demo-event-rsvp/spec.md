# Demo Event RSVP workflow specification

**Status:** Implemented

## What

Replace the inert Event RSVP form with an accessible, client-side portfolio preview of the approved RSVP journey. Visitors can enter fictional details, exercise validation, observe a pending state, recover from a deterministic local failure, and reach a truthful completion state modeled on Figma `314:5874`. The workflow must never call a server action or endpoint, transmit or persist form values, send email, create an RSVP request, or imply confirmed attendance.

## Context

Marsh & Ember is a fictional portfolio project rather than an operating restaurant. The accepting event detail route currently renders six RSVP fields through `StaticForm` in `components/events/event-detail.tsx`, but its button is intentionally `type="button"` and the form states that online submission will be enabled later.

The repository already establishes the appropriate no-I/O portfolio pattern in:

- `components/reservations/reservation-dialog.tsx`
- `components/private-dining/demo-private-dining-form.tsx`
- `lib/private-dining-inquiry.ts`
- `lib/preview-scenario.ts`

Those experiences provide explicit fictional-use guidance, pure validation/domain logic, abortable local adapters, accessible state transitions, non-visible deterministic error scenarios, and truthful completion language. Event RSVP should use the same product and engineering approach without coupling the three workflows.

Existing event availability behavior in `lib/events.ts` and `components/events/event-detail.tsx` is authoritative for presentation:

- only `accepting` events render an RSVP experience;
- `closed`, `sold-out`, `cancelled`, and `past` render replacement panels with no RSVP controls;
- a request must never be described as confirmed attendance.

Approved design sources:

- Event detail: Figma `306:5232` and `307:4285`
- Event RSVP states: Figma `314:5874`
- Form fields: Figma component `199:2486`
- Status messages: Figma component `209:2593`
- Buttons: Figma component `181:2224`
- Requirements: `context/PROJECT_CONTEXT.md`, `context/DESIGN_HANDOFF.md`, and `AGENTS.md`

Figma `314:5874` defines validation, submitting, server-error, and request-received compositions. Because this feature is a local portfolio preview, production transaction language in those frames must be adapted without changing their visual hierarchy.

## Requirements

### Truthful portfolio boundary

1. A prominent notice before the fields must identify Marsh & Ember as fictional and instruct visitors to use fictional information only.
2. The notice must state that no RSVP request or form value will be sent, stored, emailed, or reviewed.
3. The notice must state that completing the preview does not confirm attendance or reserve event space.
4. The normal workflow must perform no `fetch`, Server Action, route-handler call, navigation submission, analytics event containing form values, logging, local storage, session storage, cookie write, or other persistence.
5. No entered value may be placed in a URL or deterministic preview reference.
6. Browser autofill should be discouraged for the preview while preserving correct input types and accessible labels.
7. Visitor-facing UI must not expose “Preview Error State,” “Simulate Failure,” debug controls, or test instructions.
8. The existing standard reservation and Private Dining workflows must remain separate and unchanged.

### Availability boundary

1. `EventRsvpSection` must continue to select between the RSVP experience and unavailable replacement panel during server rendering.
2. The interactive RSVP component must render only when `getEventAvailabilityPresentation(event).acceptsRequests` is true.
3. Closed, sold-out, cancelled, and past events must expose no RSVP form controls, client workflow, or `#rsvp` target.
4. The client component receives only the serializable event context needed for presentation: slug, title, date, and time.
5. The preview must not claim that it rechecked live or server-side availability.
6. A real submission-time availability recheck remains required for any future production handler, but is not simulated in this feature.

### Fields and validation

1. Preserve the six approved primary fields:
   - First name — required text input
   - Last name — required text input
   - Email address — required email input
   - Phone number — required telephone input
   - Number of guests — required select using the existing approved `1` through `6` options
   - Dietary or accessibility information — optional textarea
2. Preserve the required acknowledgment that completing a request does not confirm attendance and is separate from a standard dining reservation.
3. Normalize string values by trimming leading and trailing whitespace before validation or adapter use.
4. Validation must reject:
   - blank first name;
   - blank last name;
   - blank or malformed email address;
   - blank phone number;
   - an empty or unknown guest-count option;
   - a missing acknowledgment.
5. Optional dietary/accessibility information must not be required and must retain the existing warning not to include diagnoses or unrelated sensitive information.
6. Use `noValidate` so custom validation consistently reaches the approved summary while retaining semantic `required`, `type="email"`, `type="tel"`, and `aria-invalid` attributes.
7. Invalid submission must:
   - remain on the event detail page;
   - preserve all entered values;
   - render “We need a few more details” and concise review guidance;
   - list each invalid field in document order with an anchor to its control;
   - render a written error beside each invalid field;
   - connect controls to errors with `aria-describedby`;
   - focus the validation summary without initiating navigation.
8. Correcting a field must clear that field’s error. The summary remains until all current errors are resolved.

### Pending state

1. A valid submit enters a pending state before completion or failure.
2. The pending hierarchy must follow Figma state B while using truthful preview copy, such as:
   - title: “Completing the RSVP preview…”
   - message: “No information is being transmitted. Please wait while the local preview finishes.”
3. All form controls, acknowledgment, and submit action must be disabled together while pending.
4. The submit label must change to “Completing Preview…” while pending.
5. Duplicate submission must be ignored while an attempt is active.
6. Pending status must use `role="status"` with polite announcement behavior.
7. The local delay may be removed when `prefers-reduced-motion: reduce` is active.
8. An active local attempt must be aborted when the component unmounts or another lifecycle explicitly replaces it.

### Error and retry state

1. Unexpected local adapter errors must render one safe global state modeled on Figma state C.
2. Error copy must be credible but explicit about the result:
   - title: “We couldn’t complete the RSVP preview”;
   - no request was submitted;
   - no email was sent;
   - attendance is not confirmed.
3. The global error must receive focus and be announced with `role="alert"` when it appears.
4. All values must remain intact and editable after failure.
5. Error UI must expose:
   - “Try Again” as the primary action;
   - “Explore All Events” as the secondary action.
6. Retry must reuse the preserved normalized values, return to pending, and follow the normal successful local path.
7. Internal exception text and stack details must never render or be logged with form values.

### Non-visible error scenario

1. Extend the existing preview scenario contract with `event-rsvp-error`.
2. `?previewScenario=event-rsvp-error` may force only the first valid RSVP attempt on the matching event page to fail.
3. The parameter must be read only when the visitor activates the normal submit action; it must not create a new route-rendering or Suspense boundary.
4. The scenario must be consumed after the first matching attempt so “Try Again” succeeds while the parameter remains in the URL.
5. Normal URLs always use the success path, and unknown scenario values are ignored.
6. The scenario parameter contains no event visitor data and must never be surfaced in visitor-facing UI.
7. Component tests should prefer injected adapters; the URL scenario exists for integrated production-build E2E coverage.

### Completion state

1. Successful local completion must replace the form with a state modeled on Figma state D.
2. Completion must use truthful language such as:
   - title: “RSVP preview complete”;
   - message: “No RSVP request was created, no information was submitted, no email was sent, and attendance is not confirmed.”
3. Completion must never use “request received,” “with our team,” “confirmed,” or another phrase that implies a real transaction, except in an explicit negation.
4. The completion state may retain only non-sensitive summary data needed to reproduce the approved hierarchy:
   - event title;
   - event date;
   - event time;
   - selected party size.
5. Do not display or retain first name, last name, email, phone, or dietary/accessibility text after completion.
6. Clear all form values from component state before rendering completion. Store any retained party-size summary separately from the cleared form object.
7. Show a deterministic non-operational preview reference with a visibly non-production prefix, for example `PREVIEW-ER-LOCAL-0001`.
8. The preview reference must not encode names, contact details, notes, party size, event slug, or other submitted values.
9. Label the value “Preview reference” and explain that it is not an RSVP receipt or evidence of attendance.
10. Preserve the approved completion actions:
    - primary: “Explore All Events” → `/events`
    - secondary: “Plan Your Visit” → `/visit`
11. Move focus to a programmatically focusable completion heading when the state appears.
12. Completion status must be announced once using polite status semantics.

### Accessibility and responsive behavior

1. Keep visible labels and supplemental placeholders; never use a placeholder as the only label.
2. Preserve logical heading order inside the event page and form card.
3. Error and status communication must not rely on icon or color alone.
4. All actions must remain keyboard operable with visible focus indicators and approximately 44px minimum targets.
5. Fields must remain operable at 200% zoom and from 320px through large desktop widths.
6. At narrow widths, fields and actions stack without clipped labels, overflow, or horizontal scrolling.
7. Error-summary links must move focus/scroll to their associated controls through native fragment behavior.
8. The disabled pending fieldset must not permit edits or duplicate activation.
9. Existing reduced-motion behavior must remain intact.
10. Focus movement must avoid smooth scrolling under reduced motion and use the project’s existing immediate reveal pattern.

## Design

### Domain model

Add a framework-independent RSVP module such as `lib/event-rsvp.ts`:

```ts
type EventRsvpValues = {
  firstName: string
  lastName: string
  email: string
  phone: string
  guestCount: string
  details: string
  acknowledgment: boolean
}

type EventRsvpField = keyof EventRsvpValues
type EventRsvpErrors = Partial<Record<EventRsvpField, string>>

type EventRsvpContext = {
  slug: string
  title: string
  date: string
  time: string
}

type DemoEventRsvpResult = {
  previewReference: `PREVIEW-ER-${string}`
}

type DemoEventRsvpScenario = 'success' | 'error'

interface DemoEventRsvpAdapter {
  complete(
    request: EventRsvpValues,
    signal: AbortSignal,
    scenario?: DemoEventRsvpScenario,
  ): Promise<DemoEventRsvpResult>
}
```

The module owns:

- empty values;
- guest-count options;
- ordered field names;
- normalization;
- pure validation;
- deterministic local adapter behavior;
- abort-aware delay handling;
- non-sensitive preview-reference generation.

Validation must remain independent of React so a future authoritative server handler can reuse the rules while adding server-only availability checks, abuse controls, and persistence.

### Client workflow

Add `components/events/demo-event-rsvp-form.tsx` as a focused Client Component. It owns controlled values and a discriminated state machine:

```text
editing
  -> validation-error
  -> pending(success) -> complete
  -> pending(error)   -> submission-error

validation-error
  -> editing / validation-error as fields are corrected
  -> pending(success|error)

submission-error
  -> editing as values change
  -> pending(success) -> complete

complete
  -> terminal page state with navigation actions
```

A suitable workflow type is:

```ts
type WorkflowState =
  | {phase: 'editing' | 'validation-error' | 'pending' | 'submission-error'; errors: EventRsvpErrors}
  | {phase: 'complete'; previewReference: string; partySize: string}
```

Use refs for the validation summary, global error, completion heading, first field, active `AbortController`, and one-time URL-error consumption. Follow the existing Private Dining focus/reveal pattern rather than introducing a new focus utility unless extraction is clearly reusable without changing behavior.

### Server/client boundary

Keep `EventRsvpSection` as the server-rendered availability boundary:

1. Resolve `getEventAvailabilityPresentation(event)`.
2. Render the existing unavailable panel for non-accepting states.
3. For accepting state, render the current section wrapper and pass a minimal `EventRsvpContext` to `DemoEventRsvpForm`.
4. Do not pass the full `DetailEventRecord` into the client bundle.

This keeps all editorial content and lifecycle selection server-rendered while limiting client JavaScript to the interactive form.

### Form primitives and styling

Reuse `FormFieldShell` and `FormStatus` from `components/forms.tsx`. The inert `StaticForm` can remain for other uses, but Event RSVP should no longer use it.

Add event-specific workflow classes only where the existing form and Private Dining styles do not already express the approved design. Do not style RSVP through selectors named for Private Dining. Extract a neutral shared workflow class only when the markup proves identical and the refactor does not alter Private Dining behavior.

Match Figma `314:5874`:

- validation/status panel above the field grid;
- two-column desktop and single-column mobile fields;
- disabled visual treatment during pending;
- preserved values and actions after failure;
- sand completion container with white status/summary card;
- summary dividers, preview reference, disclaimer, and action row.

Use existing tokens and do not introduce a CSS framework or animation library.

### Data lifecycle

1. Controlled values exist only in React memory while the form is mounted.
2. Valid submit creates a normalized in-memory snapshot for the active local adapter call.
3. Failure preserves controlled values for correction/retry.
4. Completion copies only party size into completion state, clears the complete values object, and drops the request snapshot.
5. No personal value is serialized, persisted, logged, or displayed after completion.
6. Unmount aborts pending work and releases component state.

### Expected files

Likely changes:

- `components/events/event-detail.tsx`
- `components/events/demo-event-rsvp-form.tsx`
- `components/events/demo-event-rsvp-form.test.tsx`
- `components/events/event-detail.test.tsx`
- `components/forms.tsx` only if a small neutral primitive extension is required
- `lib/event-rsvp.ts`
- `lib/event-rsvp.test.ts`
- `lib/preview-scenario.ts`
- `lib/preview-scenario.test.ts`
- `app/globals.css`
- `tests/e2e/site-smoke.spec.ts`

No route handler, Server Action, schema, migration, or runtime dependency is expected.

## Decisions

### Use a local client adapter, not a server submission

- **Choice:** Implement a no-I/O, abortable local adapter.
- **Alternatives:** Add a Server Action that discards data; send email; persist fake requests; leave the form inert.
- **Why:** Sending personal data to a server without an operating restaurant, recipient, retention policy, or legitimate workflow creates privacy risk without product value. An inert form cannot demonstrate validation and recovery. The established local-adapter pattern demonstrates the UX honestly and remains replaceable.
- **Reversible:** Yes. A future provider can implement an authoritative server contract while retaining most field and state UI.
- **Informed by:** Existing reservation and Private Dining architecture, project purpose, and Next.js 16.3.1 form guidance distinguishing client validation from real Server Action mutations.

### Keep availability selection on the server

- **Choice:** Preserve `EventRsvpSection` as a Server Component and mount the client workflow only for accepting events.
- **Alternatives:** Pass every status into one client component; hide unavailable forms with CSS; re-evaluate fixture status in the browser.
- **Why:** Unavailable controls must never enter the accessibility tree or flash during hydration. The current typed availability selector already owns this decision.
- **Reversible:** A future server-backed submission can add an authoritative recheck without changing the initial rendering boundary.

### Pass minimal event context to the client

- **Choice:** Serialize only slug, title, date, and time.
- **Alternatives:** Pass the full event detail record; read fixture/CMS modules from the client; duplicate event copy in the form.
- **Why:** The full record includes editorial content and media the workflow does not need. A narrow contract reduces client payload and keeps CMS access server-side.
- **Reversible:** The context can be extended if an approved summary later requires another stable field.

### Preserve design hierarchy while replacing transaction claims

- **Choice:** Reproduce all four Figma state compositions with explicit preview-safe language.
- **Alternatives:** Copy production “request received” wording; omit completion/error states; redesign the form as a component showcase.
- **Why:** The hierarchy is approved, but production wording would falsely imply an operational request and email workflow.
- **Reversible:** A real service can replace preview copy only after authoritative persistence and operational ownership exist.

### Do not retain personal data in completion

- **Choice:** Clear names, email, phone, and notes before rendering success; retain only party size alongside server-provided event context.
- **Alternatives:** Reproduce the Figma guest/email summary exactly; retain all values until navigation; clear every summary field.
- **Why:** The preview has no operational need to display contact data after completion. Event/date/time/party size preserve the approved summary hierarchy without unnecessarily retaining personal information.
- **Reversible:** A production receipt could render a server-approved masked summary under a defined privacy policy.

### Use the existing URL-only error seam

- **Choice:** Add `event-rsvp-error` to `readPreviewScenario` and consume it once on valid submission.
- **Alternatives:** Add a visible failure button; drop E2E error coverage; introduce a test-only build mode; encode a scenario in submitted values.
- **Why:** The narrow parameter keeps failure recovery testable against a production build without visitor-facing test controls or personal-data transport.
- **Reversible:** A production backend can replace it with controlled mocks or sandbox failure coverage.

### Add no validation dependency

- **Choice:** Use a small pure validator consistent with `lib/private-dining-inquiry.ts`.
- **Alternatives:** Add Zod or another schema package solely for six fields; rely only on native browser validation.
- **Why:** The repository does not currently depend on a validation library, the rules are small, and custom summary/error behavior requires an explicit normalized result.
- **Reversible:** Shared server/client schemas can adopt a validation package if a real submission layer creates enough complexity to justify it.

## Versions

No dependency changes are required. Continue using the repository’s current versions:

- Next.js `16.3.1`
- React and React DOM `19.2.8`
- TypeScript `5.x`
- Vitest `4.1.10`
- React Testing Library `16.3.2`
- Playwright `1.62.1`

Research against the bundled Next.js 16.3.1 documentation confirms:

- Server Actions receive `FormData` and are intended for server mutations; this no-mutation preview intentionally remains client-side.
- Native attributes can provide baseline semantics while custom validation exposes structured errors.
- pending controls should be disabled during active submission.
- synchronous Client Components are appropriate for Vitest; async Server Component route behavior should remain covered through E2E tests.
- Playwright should run against the production application, matching the existing project configuration.

## Invariants

1. Only accepting events render the RSVP preview.
2. No form value leaves browser memory or appears in a URL, log, storage API, cookie, or analytics event.
3. No request, email, held space, waitlist entry, or confirmed attendance is created or implied.
4. Event RSVP remains separate from standard reservations and Private Dining.
5. Unavailable event states expose no RSVP controls or `#rsvp` target.
6. Personal/contact values survive validation and retry but are cleared before completion renders.
7. Completion retains only event context, party size, and a non-operational reference.
8. The default UI exposes no failure-preview control.
9. The forced failure scenario affects only the first matching valid attempt; retry succeeds.
10. Unknown preview scenarios are ignored.
11. No Resy or OpenTable reference is introduced.
12. Existing Sanity schemas, queries, content mapping, and event availability behavior remain unchanged.

## Error behavior

- **Validation failure:** Preserve values, render and focus the linked summary, mark invalid fields, and make no adapter call.
- **Pending duplicate:** Ignore subsequent submits while the active attempt remains pending.
- **Adapter failure:** Preserve values, focus and announce one safe global error, expose retry and Events navigation, and reveal no exception details.
- **Retry:** Use preserved normalized values, return to pending, and bypass a consumed forced-error scenario.
- **Abort:** Silently ignore expected `AbortError` results after unmount/replacement; render no stale state.
- **Unknown scenario:** Ignore it and follow normal success behavior.
- **Unavailable event:** Continue rendering the existing server-selected replacement panel; do not initialize the client workflow.
- **Future CMS status change while an already-open page remains mounted:** Not represented as a live recheck; the preview must not claim otherwise.

## Testing strategy

### Unit tests

Add pure tests for `lib/event-rsvp.ts`:

- normalization trims every string value without mutating input;
- blank required values produce ordered field errors;
- malformed email is rejected;
- unknown/empty guest counts are rejected;
- approved guest-count options are accepted;
- optional details may be empty;
- acknowledgment is required;
- the local adapter succeeds deterministically;
- forced error rejects without exposing input;
- abort rejects with `AbortError`;
- preview references use `PREVIEW-ER-` and contain no submitted value.

Extend preview-scenario tests:

- `event-rsvp-error` is recognized;
- unrelated and malformed values remain ignored.

### Component tests

Test the interactive component with React Testing Library and injected adapters:

1. Initial state displays the fictional/no-I-O disclosure and no visible error-preview control.
2. Empty submit focuses the summary, links errors to fields, and does not call the adapter.
3. Correcting a field removes its error while preserving other errors.
4. Valid submit disables the complete fieldset, announces truthful pending copy, and blocks duplicate submission.
5. Successful completion clears personal values, shows only non-sensitive summary fields, renders a `PREVIEW-ER-` reference, and focuses the completion heading.
6. Adapter failure preserves all values, focuses/announces the error, and retry succeeds.
7. Unmount aborts pending work without a stale update.
8. `EventRsvpSection` still renders the client form only for accepting and no controls for all four unavailable states.

### End-to-end tests

Extend the existing event journey in `tests/e2e/site-smoke.spec.ts`:

1. Navigate Events → Harvest at the Hearth.
2. Confirm the fictional-use disclosure and absence of visible failure controls.
3. Submit empty and verify focused validation summary.
4. Fill the six-field form with reserved fictional values and acknowledgment.
5. Observe completion and verify it explicitly denies submission/email/attendance confirmation.
6. Verify personal values are absent from completion and only the approved non-sensitive summary remains.
7. Assert no RSVP-related `fetch` or XHR request occurs.
8. Open `/events/harvest-at-the-hearth?previewScenario=event-rsvp-error`, submit valid values, verify failure and preservation, retry, and complete.
9. Retain unsupported-slug and unavailable-state coverage.

### Responsive and accessibility review

Review initial, validation, pending, error, and completion states at:

- 1440px desktop reference
- 1024px intermediate
- 768px tablet
- 390px mobile reference
- 320px narrow mobile
- 200% browser zoom

Verify:

- comparison with Figma `314:5874`, `306:5232`, and `307:4285`;
- field/action stacking and absence of horizontal overflow;
- keyboard traversal, summary links, focus movement, and retry;
- visible focus rings and minimum target sizes;
- status/error announcements through a basic screen-reader-oriented review;
- reduced-motion behavior.

### Final checks

Run:

- `git diff --check`
- `pnpm lint`
- `pnpm typecheck`
- focused RSVP and preview-scenario tests
- `pnpm test`
- `pnpm studio:build`
- `pnpm build`
- `pnpm test:e2e:run`
- responsive manual review of every RSVP state

## Out of scope

- Real RSVP submission, persistence, email, CRM, webhook, or staff notification
- Server Actions, RSVP route handlers, API endpoints, spam protection, rate limiting, idempotency, or retention
- Real-time or submission-time event availability rechecks
- Creating or claiming confirmed attendance
- Waitlist behavior
- Collecting or storing real visitor information
- New Sanity schemas, fields, queries, migrations, or content changes
- Automatic date/time-zone transitions to `past`
- Changes to standard reservations or Private Dining
- Changes to unavailable event panels or the Events empty state
- Provider accounts, secrets, deployment configuration, analytics, or production operations
- New runtime dependencies
