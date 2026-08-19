# Sitewide presentation polish specification

## What

Perform a systematic visual-spacing audit across every public route and refine the existing portfolio simulations so they feel like intentional restaurant experiences rather than developer test harnesses. Correct missing separation between content, action groups, cards, and section boundaries; remove visitor-facing error-preview controls; reduce repetitive “demo” terminology while preserving an unmistakable, concise disclosure that Marsh & Ember is fictional and no reservation or inquiry is transmitted, stored, or confirmed. Error and recovery states remain implemented and testable through a non-visible deterministic test seam.

## Context

The main page designs, event states, reservation preview, and Private Dining inquiry preview are implemented. A DOM geometry scan of the current production build at 1440px and 390px found repeated zero-gap transitions where action groups or direct CTA links immediately follow the preceding content. These are visible across Home, Menus, Dinner, Visit, Our Story, Private Dining, Events, Event Detail, and the not-found page. The problem is structural: `.actions` controls spacing between buttons but has no contextual separation from the content above it, while several direct `ButtonLink` instances also have no preceding margin.

The current simulations are truthful but expose test-oriented controls and repeated development language. In particular:

- Reservation introduction exposes “Preview Error State” beside “Start Demo.”
- Private Dining exposes “Preview Error State” beside “Complete Demo Inquiry.”
- Headings, badges, pending copy, action labels, references, and receipts repeat “demo,” “demonstration,” “preview,” and “simulated” more often than needed.

This makes intentionally polished interactions resemble a component showcase. The goal is not to disguise their fictional nature. The goal is to disclose it once, clearly and elegantly, then let the visitor experience a natural restaurant flow.

Approved visual sources remain the Figma frames documented in `context/DESIGN_HANDOFF.md`:

- All eight desktop page frames and eight mobile page frames
- Reservation states `314:5511`, `314:5552`, and `314:5574`
- Private Dining states `314:5658`
- Button component `181:2224`
- Status component `209:2593`

The current route/action scan identified these minimum review targets:

| Route | Targets requiring comparison/correction |
|---|---|
| `/` | menu preview → CTA; location facts → CTAs; closing heading → CTAs; hero and split-section CTAs |
| `/menus` | menu cards → text CTAs; dinner preview → CTA; brunch items → CTA; drinks content → CTAs; closing heading → CTAs |
| `/menus/dinner` | closing heading → CTAs; local menu navigation and section boundaries |
| `/visit` | accessibility copy → contact CTAs; gathering cards → text CTAs; closing heading → CTAs; hero/location actions |
| `/our-story` | desktop/mobile story intro CTA placement; closing heading → CTAs |
| `/private-dining` | Food & Beverage copy → CTA; form actions/status boundaries; direct contact heading → CTAs; closing heading → CTAs |
| `/events` | event card CTAs; private-events CTA; closing heading → CTAs; empty-event actions |
| `/events/[slug]` | hero availability note → CTAs; unavailable-state actions; RSVP/form boundaries; questions heading → CTAs; closing heading → CTAs |
| not found and route error states | status copy/heading → recovery actions |

## Requirements

### Sitewide spacing audit

1. Review every public route at the approved 1440px desktop and 390px mobile reference widths, plus 320px and at least one intermediate width.
2. Compare action placement, section padding, card padding, and content rhythm against the corresponding approved Figma frame; Figma takes precedence over a universal spacing value.
3. Ensure every action group has intentional separation from the preceding heading, paragraph, metadata, list, grid, card content, or status panel.
4. Ensure direct CTA links outside `.actions` have intentional separation from preceding content.
5. Preserve existing section-level top and bottom padding unless the Figma comparison confirms that the section itself is the source of the discrepancy.
6. Preserve intentional close relationships such as a heading with its introduction, a label with its field, or buttons within one action group.
7. Do not solve local issues by adding global button margins. Buttons must remain composable in headers, dialogs, cards, forms, action groups, and navigation.
8. Do not apply a universal margin to `.actions` if that would double spacing already provided by a parent grid, hero rule, dialog rule, or event-availability layout.
9. Prefer a small set of semantic flow rules or explicit action-context classes over one-off nth-child selectors.
10. As a default when the approved frame does not expose a distinct value, use the project rhythm: approximately 24px separation on mobile and 32px on desktop between a completed content block and its primary action group. Card text actions may use the smaller approved rhythm.
11. Preserve at least 44px touch targets and the existing 16px gap between sibling buttons unless Figma specifies otherwise.
12. Do not introduce horizontal overflow, clipped focus rings, or cramped button labels at any supported width.
13. Adjacent sections with the same background must still read as distinct content groups through correct internal spacing rather than arbitrary borders.

### Required spacing coverage

The audit must explicitly include and correct, where the Figma comparison confirms the current zero-gap result:

- `.section-heading + .actions`
- `.menu-preview + .actions`
- `.fact-grid + .actions`
- section copy or explanatory paragraphs followed by `.actions`
- event hero metadata followed by actions
- editorial-card copy/metadata followed by a CTA
- menu items or lists followed by direct CTAs
- split-section copy followed by direct CTAs
- form status/action/footer transitions
- not-found and error-state copy followed by recovery actions

Parent layouts that already supply an intentional `gap`—including event availability and dialog action stacks—must be checked but must not receive duplicate spacing.

### Demo presentation refinement

1. Remove every visitor-facing “Preview Error State” control from the reservation and Private Dining experiences.
2. Do not add replacement error toggles, debug menus, hidden focusable controls, or visible testing instructions.
3. Keep provider/submission error states, retry behavior, safe fallback actions, value preservation, focus management, and accessible announcements fully functional.
4. Retain one prominent but visually integrated disclosure at the start of each simulation stating:
   - Marsh & Ember is fictional or the interaction is a portfolio preview;
   - no reservation/inquiry is transmitted or stored;
   - no table/date is held and no confirmation/contact will occur.
5. After the initial disclosure, remove repetitive developer-oriented language where the surrounding context already establishes the preview.
6. Never relabel a local-only action “Reserve,” “Book,” “Send Inquiry,” or another phrase that would imply a real transaction completed.
7. Prefer natural but truthful labels such as:
   - Reservation: “Check Availability,” “Finish Preview,” “Reservation preview complete,” and “Start Over.”
   - Private Dining: “Complete Inquiry Preview,” “Inquiry preview complete,” and “Start Over.”
8. Replace “Demo reference” with “Preview reference” if a reference remains visible. The reference must continue to use a clearly non-operational prefix such as `PREVIEW-` or `DEMO-` and must be described as non-operational.
9. Error copy reached through the test seam should read like a credible provider/submission failure, not like a developer-triggered simulation. It must still state that nothing was submitted or held.
10. Remove phrases such as “This preview intentionally stopped the demo” from visitor-facing errors.
11. Keep fictional-data guidance on the Private Dining form and no-personal-data guidance in the reservation flow.
12. Preserve all no-I/O and data-clearing invariants from the approved reservation and Private Dining specifications.

### Non-visible error test seam

1. Preserve deterministic end-to-end access to each error path without a visible production control.
2. Use a narrowly scoped URL scenario parameter read only when the visitor activates the normal action, for example:
   - `?previewScenario=reservation-error`
   - `?previewScenario=private-dining-error`
3. The parameter must contain no visitor or form data and must never serialize entered values.
4. The error scenario must be consumed only for the initial provider/submission attempt; “Try Again” must use the normal successful path even while the parameter remains in the URL.
5. Normal URLs without the parameter must always use the success path.
6. The parameter must not be linked, displayed, announced, or documented in visitor-facing UI.
7. Component tests should continue to prefer injected adapters over URL state where practical; the URL seam exists to retain production-build E2E coverage.
8. Unknown parameter values must be ignored safely.

### Accessibility and interaction invariants

1. Removing preview controls must not disrupt initial focus, focus trapping, Escape behavior, or trigger-focus restoration in the reservation dialog.
2. The first meaningful reservation action after opening must receive focus and use the refined natural label.
3. Private Dining validation summary, field errors, pending state, error state, retry, completion, and restart focus behavior must remain unchanged except for approved copy.
4. Spacing changes must leave focus indicators fully visible at section/card boundaries.
5. Error and success states must remain understandable without color or icons.
6. Reduced-motion behavior remains unchanged.
7. Event RSVP behavior remains static in this feature.

### Scope discipline

1. Do not redesign page compositions, typography, color, imagery, or content hierarchy.
2. Do not add animation or a new CSS framework.
3. Do not change Sanity schemas, queries, fixtures, content-source behavior, or deployment configuration.
4. Do not implement the Event RSVP workflow in this feature.
5. Add no runtime dependency.

## Design

### Spacing implementation

Audit first, then classify each issue before editing CSS:

1. **Section action spacing** — action clusters following a complete heading/content block.
2. **Content CTA spacing** — one CTA following a paragraph, list, menu item group, or split-section copy.
3. **Card CTA spacing** — text or secondary actions inside editorial cards.
4. **State/action spacing** — form and status messages followed by recovery/completion actions.
5. **Existing layout gap** — parent grid/flex layout already owns spacing; no additional margin.

Introduce the smallest semantic API that covers proven repetition. Expected options include:

- an `Actions` spacing/context prop that emits a modifier class such as `actions--section`;
- a reusable flow class for content blocks whose direct children use the project spacing rhythm;
- targeted adjacency rules for stable shared structures such as `.section-heading + .actions` and `.menu-preview + .actions`.

Do not put top/bottom margins directly on `.button`. Do not rely on `:nth-child` for action spacing. Do not use `!important`.

Implementation should keep spacing ownership at one level: either the parent layout `gap` or the child/context margin, never both. Existing hero and dialog rules must be reconciled explicitly when a new shared rule overlaps them.

### Presentation copy

Refine both interactions as one content system:

- **Initial state:** one concise disclosure, then a natural primary action.
- **Selection/form state:** use “fictional” or “preview” only where needed to prevent misunderstanding; avoid repeating it in every sentence.
- **Pending state:** describe the action (“Checking availability…” / “Completing inquiry preview…”) and retain concise no-transmission reassurance.
- **Error state:** credible failure title, clear no-transaction consequence, retry and fallback.
- **Completion state:** “preview complete,” explicit no reservation/inquiry, and non-operational reference.

The disclosure cannot be reduced to a badge alone. Written copy must remain available to assistive technology and visible without interaction.

### Error scenario resolution

Add a small pure helper in the relevant demo adapter module or a shared test-scenario module:

```ts
type PreviewScenario = 'reservation-error' | 'private-dining-error'

function readPreviewScenario(search: string): PreviewScenario | null
```

The components may read `window.location.search` inside the user-initiated action handler, not during server rendering. Each component keeps a consumed/error-attempt ref so retry bypasses the forced scenario. This avoids hydration differences and preserves static rendering.

Do not use `useSearchParams` solely for the test seam, because these static routes do not need a new Suspense/client-rendering boundary.

### Expected files

Likely modifications include:

- `app/globals.css`
- `components/ui.tsx`
- public route components containing direct CTA placement
- `components/reservations/reservation-dialog.tsx`
- `components/reservations/demo-reservation-adapter.ts` or a small scenario helper
- `components/private-dining/demo-private-dining-form.tsx`
- affected component and Playwright tests

The exact route-file list must be determined by the completed visual audit rather than assumed from the current DOM scan alone.

## Decisions

### Prioritize presentation polish before Event RSVP

- **Choice:** Complete the sitewide spacing and demo-presentation pass next, then build Event RSVP.
- **Alternatives:** Implement RSVP immediately; fix only reported individual gaps; postpone demo cleanup until launch.
- **Why:** The issue repeats across every route and affects the perceived quality of the whole site. Refining the simulation language now also establishes the presentation pattern that Event RSVP should follow, avoiding immediate rework.
- **Reversible:** Individual spacing and copy changes are reversible, but the shared pattern should become the default for RSVP.
- **Informed by:** User feedback, DOM geometry audit at 1440px/390px, approved responsive frames, and current reservation/Private Dining code.

### Keep truthful disclosure but remove test-harness affordances

- **Choice:** Remove visible failure controls and repetitive demo terminology while retaining one clear disclosure and truthful receipts.
- **Alternatives:** Hide all fictional/demo language; leave the current showcase controls; remove error handling entirely.
- **Why:** Hiding the fictional nature would be misleading, while visible scenario controls make the site look unfinished. The balanced approach protects trust and improves presentation.
- **Reversible:** Yes; internal scenario controls could be restored in a non-public Storybook or design-system environment later.

### Use a URL-only E2E scenario seam

- **Choice:** Use a narrow, non-linked query parameter to trigger one initial failure in production-build E2E tests.
- **Alternatives:** Drop E2E error coverage; retain visible buttons; expose hidden DOM controls; monkey-patch browser APIs; introduce a test-only build mode.
- **Why:** This preserves critical recovery-path coverage against the integrated application without visible test UI, personal-data transport, environment complexity, or fragile runtime patching.
- **Reversible:** Yes. A real provider/backend would replace this seam with controlled mocks or sandbox failures.
- **Risk:** A visitor who manually discovers the parameter can trigger a safe failure. The result remains truthful and retry recovers normally.

### Use semantic spacing ownership, not global button margins

- **Choice:** Assign spacing to action contexts/flow containers and shared structural relationships.
- **Alternatives:** Add `margin-top` to every `.button`; add margin to all `.actions`; patch each route with arbitrary values.
- **Why:** Buttons appear in horizontal groups, headers, cards, dialogs, and forms. Global margins would break alignment or double existing layout gaps. Semantic ownership is maintainable and responsive.
- **Reversible:** Yes, provided modifiers are narrowly named and documented by usage.

## Versions

No dependency changes are required. Continue using the versions locked by the repository, including Next.js `16.3.1`, React `19.2.8`, Vitest `4.1.10`, and Playwright `1.62.1`.

Relevant current Next.js constraints:

- Keep page routes and layouts as Server Components.
- Read the optional error scenario only inside existing Client Components during user actions.
- Do not add `useSearchParams` and a Suspense boundary for this test-only behavior.

## Invariants

- Default reservation and Private Dining paths contain no visible error-preview control.
- Normal user activation follows the successful local preview path.
- Error and retry states remain implemented, accessible, and deterministically testable.
- No reservation, inquiry, email, persistence, provider request, or held date is created.
- Private Dining values are preserved through failure and cleared on completion.
- One clear fictional/no-transaction disclosure remains before each interaction.
- No button receives a global margin that changes header, dialog, navigation, or sibling-button alignment.
- Every public route remains responsive without horizontal overflow at 320px and above.
- Event RSVP availability and static form behavior do not change.
- Existing CMS rendering and content fallbacks do not change.

## Error Behavior

- **Normal reservation availability failure:** Present the existing safe provider-error hierarchy with refined natural copy, no reservation claim, retry, contact fallback, and close behavior.
- **Normal Private Dining failure:** Preserve values, announce the global error, state that nothing was sent/held, and offer retry/contact alternatives.
- **Forced scenario parameter:** Affect only the matching feature and only its first attempt; ignore malformed/unrelated values.
- **Retry:** Always bypass the forced scenario and attempt local success.
- **Unexpected local errors:** Continue to normalize to the same safe error UI without exception details.
- **Spacing regression:** If a shared rule doubles an existing grid gap or creates overflow, remove the overlap and assign spacing to one owner rather than overriding it at another breakpoint.

## Testing Strategy

### Automated behavior tests

Update reservation and Private Dining tests to prove:

- no “Preview Error State” control is rendered in the default UI;
- refined primary labels drive the normal successful path;
- initial disclosures remain visible and truthful;
- adapter-injected failures still render error/retry behavior;
- URL error scenarios trigger the matching integrated error once;
- retry succeeds while the scenario parameter remains present;
- unknown scenarios do nothing;
- completion copy and references remain explicitly non-operational;
- reservation dialog focus trap, Escape, and trigger restoration remain intact;
- Private Dining validation/value preservation/clearing/focus behavior remains intact.

### End-to-end tests

1. Complete the default reservation preview with no visible test controls.
2. Open a reservation URL with `previewScenario=reservation-error`, activate the normal action, verify safe failure, retry, and continue.
3. Complete the default Private Dining preview with no visible test controls and no network request.
4. Open Private Dining with `previewScenario=private-dining-error`, submit valid fictional values, verify preservation, retry, and complete.
5. Confirm event RSVP remains static and separate.
6. Retain mobile navigation coverage.

### Visual spacing audit

Capture or inspect every route in the route matrix at:

- 1440px desktop
- 1024px/intermediate desktop or tablet
- 768px/tablet
- 390px mobile reference
- 320px narrow mobile

For each route:

- compare against its approved Figma frame;
- inspect every action cluster and direct CTA;
- inspect the first and last content block within each section;
- inspect cards, forms, statuses, and adjacent same-background sections;
- verify button wrapping and touch targets;
- verify no horizontal overflow;
- record all reviewed routes in the implementation report.

Use DOM geometry as a diagnostic to find accidental zero-gap transitions, not as the sole design oracle. Automated pixel-perfect visual regression infrastructure is not required.

### Final checks

Run:

- `git diff --check`
- lint
- type checking
- focused component/unit tests
- full unit suite
- Studio build
- production build
- full Playwright suite
- responsive visual review of all public routes

## Out of Scope

- Event RSVP interaction implementation
- Real Cal.com integration
- Real inquiry/RSVP handlers, email, persistence, spam protection, or rate limiting
- New page designs or content rewrites
- New motion or animation
- Sanity schema/content changes
- SEO, production deployment, and repository marketing work
- Pixel-perfect screenshot regression infrastructure
