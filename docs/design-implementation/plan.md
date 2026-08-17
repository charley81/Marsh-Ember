# Figma design implementation plan

## Scope

Implement the approved Marsh & Ember Figma designs as a production-quality responsive Next.js UI. This slice includes all eight public routes, shared navigation/footer, editorial media, accessible UI controls, static form interfaces, and the approved event-detail template populated from typed local fixture data.

This slice does **not** connect Sanity, Cal.com, email, persistence, rate limiting, spam protection, maps, analytics, or form submission handlers. Those integrations will be planned as later features. UI architecture must make those substitutions straightforward.

## Phase 1 — Establish the durable UI foundation

**Phase goal:** The application has a reusable design system, typed content boundary, optimized assets, and shared responsive shell matching the approved desktop and mobile frames.

### Task 1.1 — Model the static content boundary

- **Goal:** Keep route components independent from future CMS implementation details.
- **Context:** Current content is approved in Figma, but Sanity integration is intentionally deferred.
- **Relevant files or references:** `context/PROJECT_CONTEXT.md`, `context/DESIGN_HANDOFF.md`, approved Figma frames, new `content/` and `lib/` modules.
- **Proposed approach:** Define typed navigation, restaurant details, menu, event, FAQ, and form-option records in framework-agnostic modules. Route files consume selectors rather than embedding mutable shared data repeatedly.
- **Acceptance criteria:** Shared restaurant information has one source; event detail is represented by a reusable typed record; routes do not duplicate navigation/hours/contact constants.
- **Source reference:** Project Context “CMS direction”; Design Handoff “Content and data constraints.”
- **Verify:** `pnpm exec tsc --noEmit`.
- **Out of scope:** Sanity schemas, GROQ, preview mode, and live data.

### Task 1.2 — Build design tokens and shared primitives

- **Goal:** Encode the approved visual language once and avoid route-specific copies of typography, buttons, labels, cards, and section spacing.
- **Context:** Figma uses Libre Baskerville, Outfit, warm neutrals, deep navy, ember accents, consistent radii, and repeated action/eyebrow patterns.
- **Relevant files or references:** Figma components `181:2224`, `199:2486`, `209:2593`; Figma frame styles; `app/globals.css`; new `components/ui/`.
- **Proposed approach:** Use `next/font`, semantic CSS custom properties, fluid type/spacing tokens, reusable `ButtonLink`, `Eyebrow`, `SectionHeading`, `MediaFrame`, `MenuItem`, `Tag`, `Field`, and status primitives. Keep server components as the default.
- **Acceptance criteria:** Shared colors, fonts, spacing, focus treatment, and controls come from tokens/primitives; layouts remain usable from 320px through large desktop; reduced motion is respected.
- **Source reference:** Design Handoff “Responsive implementation,” “Accessibility checklist,” and approved components.
- **Verify:** Lint, type check, and responsive browser inspection.

### Task 1.3 — Build the global application shell

- **Goal:** Reproduce the approved announcement, desktop/mobile header, navigation, and footer on every route.
- **Context:** Header and announcement require limited client behavior; the rest should remain server-rendered.
- **Relevant files or references:** Figma nodes `225:2646`, `229:3212`, `233:4025`, `238:2469`; `app/layout.tsx`; new `components/site/`.
- **Proposed approach:** Implement a server-rendered shell with small client islands for announcement dismissal and the keyboard-accessible mobile menu. Use semantic landmarks, `aria-current`, Escape handling, focus restoration, scroll locking, and actionable contact links.
- **Acceptance criteria:** Desktop and mobile shells match their approved compositions; navigation reaches every implemented route; mobile navigation is keyboard operable and restores focus; announcement dismissal does not create hydration layout shift.
- **Source reference:** Design Handoff “Global behavior.”
- **Verify:** Keyboard review, 320/390/768/1024/1440px browser review, lint, and type check.

## Phase 2 — Deliver the editorial and menu routes

**Phase goal:** Visitors can browse the core restaurant story, menus, and visit information across responsive layouts.

### Task 2.1 — Implement Home

- **Goal:** Build `/` from approved frames `254:3955` and `254:4191`.
- **Context:** Home establishes the visual quality bar and validates repeated editorial section patterns.
- **Relevant files or references:** Figma Home frames and downloaded Home media; `app/page.tsx`; shared editorial components.
- **Proposed approach:** Compose hero, philosophy, menu discovery, atmosphere, private dining, visit, and closing CTA from reusable split-section and menu-preview patterns.
- **Acceptance criteria:** Approved hierarchy, copy, image crops, actions, colors, and responsive stacking are represented without horizontal overflow.
- **Source reference:** Figma `254:3955`, `254:4191`.
- **Verify:** Browser comparison at 390px and 1440px plus intermediate widths.

### Task 2.2 — Implement Menus and Dinner detail

- **Goal:** Build `/menus` and `/menus/dinner` from approved desktop/mobile frames.
- **Context:** Menu content must be structured for later CMS replacement, and dinner detail must remain a reusable menu presentation rather than a monolith.
- **Relevant files or references:** Figma `265:4144`, `265:4482`, `265:4704`, `265:5092`; menu content models.
- **Proposed approach:** Render typed menu/pathway/preview data through reusable menu item, dietary legend, local section navigation, and seasonal-note components. Use semantic lists and anchored sections.
- **Acceptance criteria:** Both routes preserve approved menu content, dietary indicators, seasonal notices, responsive navigation, and CTA hierarchy.
- **Source reference:** Approved Menus and Dinner frames.
- **Verify:** Navigate to Menus, open Dinner, exercise local anchor links, and inspect at 390px/1440px.

### Task 2.3 — Implement Visit and Our Story

- **Goal:** Build `/visit` and `/our-story` from their approved desktop/mobile frames.
- **Context:** These routes share editorial compositions but have route-specific details such as FAQs, contact actions, team profiles, and image mosaics.
- **Relevant files or references:** Figma `277:4828`, `277:4903`, `283:4798`, `283:4873`.
- **Proposed approach:** Reuse editorial split sections and an accessible native disclosure pattern for FAQs. Keep map actions as external links/placeholders only where a real destination is already established by approved content.
- **Acceptance criteria:** Copy, leadership profiles, sourcing story, location/hours, accessibility details, and FAQ presentation match the approved responsive hierarchy.
- **Source reference:** Approved Visit and Our Story frames.
- **Verify:** Keyboard-operate FAQs and inspect both routes at mobile/desktop widths.

## Phase 3 — Deliver gathering and event routes

**Phase goal:** Visitors can understand private dining and events and view the complete static inquiry/RSVP interfaces without any false confirmation behavior.

### Task 3.1 — Implement Private Dining UI

- **Goal:** Build `/private-dining` from frames `295:4750` and `295:5065`.
- **Context:** Submission behavior is deferred, but the complete form and explanatory safeguards belong in the page UI now.
- **Relevant files or references:** Approved frames; shared form primitives; typed option data.
- **Proposed approach:** Compose experience, spaces, food/beverage, process, FAQ, complete labeled inquiry form, direct contact, and dining distinction sections. Keep controls enabled for visual/keyboard review but prevent submission with an explicit non-submitting UI boundary.
- **Acceptance criteria:** Every approved field and acknowledgment is present with visible labels and help text; copy never implies a date is held or an event confirmed; responsive layout matches the approved hierarchy.
- **Source reference:** Design Handoff “Private Dining”; Figma private dining frames.
- **Verify:** Keyboard traverse every field at 390px and 1440px; confirm no network request occurs.

### Task 3.2 — Implement Events landing

- **Goal:** Build `/events` from frames `302:5073` and `302:5327`.
- **Context:** Event records will later come from Sanity, so card and status rendering must be data-driven now.
- **Relevant files or references:** Approved Events frames; typed event fixture data.
- **Proposed approach:** Render featured and upcoming records through reusable event-card/status components, followed by experience, registration clarification, private dining, and reservation pathways.
- **Acceptance criteria:** Featured/upcoming hierarchy, labels, fictional content, responsive cards, and route links match approved designs.
- **Source reference:** Figma `302:5073`, `302:5327`.
- **Verify:** Navigate from Events to the event detail route and inspect responsive layouts.

### Task 3.3 — Implement reusable Event detail template

- **Goal:** Build `/events/[slug]` using the approved Harvest at the Hearth content from frames `306:5232` and `307:4285`.
- **Context:** The page must be reusable for future CMS records and must not claim RSVP confirmation.
- **Relevant files or references:** Approved Event detail frames; event data selector; dynamic route docs.
- **Proposed approach:** Use a statically generated dynamic route backed by typed local records. Compose facts, expectation cards, course preview, clarification, complete labeled RSVP request form, contact, and closing path. Return not-found for unknown slugs.
- **Acceptance criteria:** The approved example renders at `/events/harvest-at-the-hearth`; all facts, five courses, six fields, and acknowledgment are present; wording clearly distinguishes request receipt from confirmed attendance.
- **Source reference:** Design Handoff “Events”; Figma event detail frames.
- **Verify:** Build, load the approved slug, verify an unknown slug returns 404, and keyboard traverse the form.

## Phase 4 — Harden and verify the UI slice

**Phase goal:** The complete static site passes available automated checks and a focused responsive/accessibility review.

### Task 4.1 — Add route metadata and resilient fallbacks

- **Goal:** Give every route appropriate page metadata and provide coherent not-found/error UI.
- **Context:** The UI should be production-shaped even though integrations are deferred.
- **Relevant files or references:** Next.js metadata docs; route files; `app/not-found.tsx`, `app/global-error.tsx` if needed.
- **Proposed approach:** Add static metadata for public pages and generated metadata for event records; add a branded 404 while keeping all data static and prerenderable.
- **Acceptance criteria:** Every route has a meaningful title/description; unknown events render the branded 404; no scaffold metadata remains.
- **Source reference:** Next.js 16.3.1 metadata guidance.
- **Verify:** Production build and document-head inspection.

### Task 4.2 — Run full quality checks and manual review

- **Goal:** Hand off a clean, reviewable implementation without committing it.
- **Context:** The user will approve before any commit.
- **Relevant files or references:** Entire changed tree; project verification requirements.
- **Proposed approach:** Run formatting check where available, ESLint, TypeScript, and production build. Start the built application and review all routes at representative mobile, tablet, laptop, and desktop widths, plus keyboard navigation and 200% zoom on interaction-heavy pages.
- **Acceptance criteria:** No lint, type, or build errors; no page-level horizontal overflow; all routes render; interactive controls remain keyboard accessible; any deferred integrations are clearly reported rather than simulated.
- **Source reference:** `AGENTS.md` verification requirements.
- **Verify:** `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`, and manual route checklist.
- **Out of scope:** Commit, push, deployment, CMS/service configuration, automated submission tests, and live booking behavior.
