# Fictional-site handoff readiness plan

## Scope and assumptions

Prepare the existing fictional Marsh & Ember portfolio site for a polished handoff-quality release without converting its preview interactions into real booking or submission systems.

The work includes:

- dependency vulnerability remediation;
- a sitewide link and navigation audit;
- correction of misleading, redundant, self-referential, or incomplete menu controls;
- completion of client-facing footer, legal, social, and Studio details while retaining generic fictional destinations where necessary;
- a complete accessibility, responsive, visual, performance, security, and production launch audit;
- fixes for defects found by those audits;
- a final verification record.

The work does not include:

- real Cal.com, email, persistence, spam protection, rate limiting, or customer-data handling;
- changes to the site's fictional positioning, indexing policy, or structured-data posture;
- custom social profiles, domain transfer, account transfer, or ownership handoff;
- publishing unrelated CMS content or redesigning approved Figma compositions.

## Baseline

At planning time:

- `main` is clean and matches `origin/main`.
- `CONTENT_SOURCE=fixtures pnpm check` passes, including lint, TypeGen, type checking, 93 unit tests, Studio build, and the Next.js production build.
- `CONTENT_SOURCE=fixtures pnpm test:e2e:run` passes 18 tests with 2 viewport-specific skips.
- All eight production routes return HTTP 200 at representative mobile and desktop widths without page-level overflow, console errors, or failed requests.
- `pnpm audit --prod` reports 3 high and 8 moderate transitive findings, primarily through the Sanity Studio CLI dependency graph.
- The Menus page contains controls that point to the section already containing the control, and the Dinner detail switcher suggests menu switching even though Dinner is the only approved detail-capable menu.
- Footer Privacy and Accessibility labels are noninteractive text, and social links intentionally point to generic platform destinations.
- The connected launch verification explicitly deferred a full accessibility, screen-reader, and Lighthouse audit.

# Phase 1 — Make every navigation choice useful

**Phase goal:** Every visitor-facing link or control has an accurate label, a valid destination, and a useful outcome.

## Task 1.1 — Add a sitewide destination inventory and regression test

- **Goal:** Identify and prevent broken anchors, invalid internal routes, accidental self-links, empty destinations, and controls whose labels overpromise their outcome.
- **Context:** Existing smoke tests cover critical journeys but do not enumerate all links. Several Menus controls technically resolve while providing no navigation because they target their own containing section.
- **Relevant files or references:** `app/**`, `components/**`, `lib/site-data.ts`, `tests/e2e/site-smoke.spec.ts`, production routes, Figma footer component `238:2469`.
- **Proposed approach:** Inventory internal links and fragment targets across all eight routes. Add focused automated coverage that follows unique internal destinations, verifies HTTP status and fragment existence, and explicitly rejects same-section CTA patterns. Review external, `mailto:`, and `tel:` destinations separately rather than attempting live side effects.
- **Acceptance criteria:**
  - Every internal route resolves successfully or intentionally returns the branded 404 in its dedicated test.
  - Every fragment points to an element on the destination page.
  - No visitor-facing CTA points to the section that already contains it.
  - Link labels accurately describe whether the result is a page, section, preview, external site, email, or telephone action.
- **Source reference:** User-reported broken/redundant links; Design Handoff global navigation and accessibility requirements.
- **Verify:** Focused Playwright link-integrity test, keyboard activation review, and full E2E suite.

## Task 1.2 — Correct the Menus information architecture

- **Goal:** Make menu navigation clear and useful without inventing unsupported menu detail content.
- **Context:** Figma `265:4144` and `265:4482` show four menu pathways and preview sections. The approved implementation scope provides a full detail experience only for Dinner. Brunch has limited preview content, Cocktails has one preview item, and Wine has no structured item list. Current controls inside Brunch, Cocktails, and Wine point back to their own sections, while the Dinner detail switcher can appear to promise full menu switching.
- **Relevant files or references:** `app/menus/page.tsx`, `app/menus/dinner/page.tsx`, `lib/content-types.ts`, `lib/content-fixtures.ts`, Sanity menu mappers/queries, Figma nodes `265:4144`, `265:4482`, `265:4704`, and `265:5092`.
- **Proposed approach:**
  - Keep the Menus landing pathway controls as useful jumps from the pathway area to the corresponding preview or Dinner detail.
  - Keep Dinner as the only full detail route.
  - Remove self-referential CTAs from inside Brunch, Cocktails, and Wine previews rather than creating fictional full menus.
  - Rename or restyle the Dinner detail menu switcher so it truthfully acts as cross-navigation back to landing-page sections instead of implying in-place detail switching.
  - Preserve server rendering and avoid adding client-side tab state solely to simulate unavailable content.
- **Acceptance criteria:**
  - Visitors can choose Dinner, Brunch, Cocktails & Spirits, or Wine from a clear menu-navigation region.
  - Dinner opens its complete detail page.
  - Brunch, Cocktails, and Wine navigate to meaningful preview content exactly once and contain no redundant self-link.
  - No control implies a full detail menu exists when the CMS record has `hasDetailPage: false`.
  - Focus lands visibly and content is not hidden behind the sticky header after fragment navigation.
- **Source reference:** User feedback; approved Menus Figma frames; CMS invariant that only Dinner is initially detail-capable.
- **Verify:** Unit coverage for detail eligibility, focused Playwright navigation at desktop/mobile widths, keyboard review, and Figma comparison.

## Task 1.3 — Complete global visitor-facing details

- **Goal:** Remove unfinished affordances while retaining honest generic fictional contact and social destinations.
- **Context:** Footer Privacy and Accessibility labels currently look link-like but are static text. Instagram and Facebook intentionally have no project-specific profiles and should remain generic without implying otherwise. The Studio README is scaffold boilerplate.
- **Relevant files or references:** `components/site/site-shell.tsx`, `lib/content-types.ts`, `lib/site-data.ts`, `studio/README.md`, Sanity site settings schema and mapper, Figma footer component `238:2469`.
- **Proposed approach:**
  - Convert Privacy and Accessibility into useful lightweight informational routes or an equivalent clearly noninteractive treatment; prefer routes so footer expectations are satisfied.
  - Keep generic social destinations but label them honestly as platform links, with accessible external-window disclosure.
  - Confirm address, telephone, email, map, announcement, and contact actions all lead somewhere useful in the fictional experience.
  - Replace Studio boilerplate with project-specific authoring guidance.
- **Acceptance criteria:**
  - Footer items are not visually presented as unavailable links.
  - Generic social links remain functional and do not imply project-specific accounts.
  - New informational routes, if used, have unique titles, headings, metadata, canonical URLs, and sitemap entries.
  - Studio documentation explains settings, menus, events, statuses, Preview/Presentation, publishing, and validation.
- **Source reference:** User direction; Figma footer specification; project CMS workflow.
- **Verify:** Link inventory, metadata tests, sitemap test, keyboard review, and documentation walkthrough.

# Phase 2 — Remediate dependency vulnerabilities safely

**Phase goal:** The supported application and Studio dependency graph has no known actionable high-severity audit finding, without destabilizing connected Sanity or Next.js behavior.

## Task 2.1 — Update the Sanity dependency line

- **Goal:** Remove vulnerable transitive packages through supported upstream releases rather than arbitrary lockfile overrides.
- **Context:** The reported findings originate mainly through `sanity@6.9.2` / `@sanity/vision@6.9.2` and their CLI graph. Current compatible patch releases are available, while `@sanity/client` also has a newer major that requires separate compatibility evaluation.
- **Relevant files or references:** `package.json`, `studio/package.json`, `pnpm-lock.yaml`, `sanity/**`, `studio/**`, Sanity and next-sanity release/compatibility documentation.
- **Proposed approach:** Update Sanity and Vision together to the latest compatible stable release first. Refresh the lockfile and rerun the audit. Upgrade `@sanity/client` only if current `next-sanity`, mapper, migration, and Live Content compatibility is verified; do not combine unrelated ESLint, TypeScript, or Node major upgrades with vulnerability remediation.
- **Acceptance criteria:**
  - Sanity and Vision remain on the same compatible release line.
  - No direct dependency is downgraded or pinned to an unsupported combination.
  - Schema extraction, TypeGen, Studio build, migration dry run/validation, fixture mode, connected production build, Presentation configuration, and Live Content integration remain valid.
- **Source reference:** `pnpm audit --prod`; current Sanity package compatibility requirements.
- **Verify:** `pnpm audit --prod`, `pnpm sanity:typegen`, generated-artifact drift check, `pnpm studio:build`, unit tests, and both fixture and connected builds where credentials permit.

## Task 2.2 — Resolve or document residual advisories

- **Goal:** Ensure the final security record distinguishes fixed vulnerabilities from unreachable tooling-only findings or advisories awaiting upstream fixes.
- **Context:** Some audit paths may remain in build/CLI tooling despite updating top-level packages. Blind `pnpm.overrides` can violate package compatibility and is not an acceptable default.
- **Relevant files or references:** `pnpm-lock.yaml`, `pnpm audit` paths, upstream advisory and package release notes, final launch verification.
- **Proposed approach:** Trace each remaining high/moderate finding. Prefer supported upstream updates or deduplication. Use an override only when the patched version satisfies every consumer's declared range and all affected workflows pass. Record any unavoidable tooling-only residual with reachability, environment, upstream status, and mitigation.
- **Acceptance criteria:**
  - Zero unresolved high-severity findings, unless an upstream-only exception is explicitly documented with evidence and accepted before release.
  - Moderate residuals are either fixed or documented with concrete scope and mitigation.
  - CI runs the agreed audit command so regressions are visible.
- **Source reference:** General engineering and testing requirements; audit output.
- **Verify:** Clean install, audit, full CI-equivalent check, and Studio workflow checks.

# Phase 3 — Complete the launch audit and fix findings

**Phase goal:** The deployed fictional site has documented, repeatable evidence for accessibility, responsive fidelity, performance, security, and production reliability.

## Task 3.1 — Accessibility audit and remediation

- **Goal:** Complete the deferred WCAG 2.2 AA-oriented audit across content and critical interactions.
- **Context:** Existing tests cover important focus behavior and validation, but a full screen-reader-oriented, contrast, zoom, and route-level audit has not been completed.
- **Relevant files or references:** All public routes; reservation dialog; mobile navigation; Private Dining and RSVP forms; announcement; menus; `app/globals.css`; approved accessibility checklist.
- **Proposed approach:** Audit landmarks, heading order, names/roles/values, contrast, visible focus, touch targets, fragment focus, dialog semantics, focus trap/restoration, validation summaries, live regions, announcement dismissal, reduced motion, keyboard-only use, screen-reader output, and 200% zoom. Add focused automated checks where repeatable and manually verify the remainder.
- **Acceptance criteria:**
  - No critical or serious accessibility issue remains.
  - Every route and critical journey works with keyboard alone.
  - Dialog, mobile menu, forms, status changes, and anchor navigation expose coherent focus and announcements.
  - All content remains usable at 200% zoom and 320px width.
  - Manual checks are recorded without claiming unsupported screen-reader coverage.
- **Source reference:** Project accessibility requirements; Next.js accessibility guidance; Figma component specifications.
- **Verify:** Lint, focused component/E2E tests, keyboard review, screen-reader-oriented review, contrast checks, reduced-motion review, and 200% zoom matrix.

## Task 3.2 — Responsive and Figma visual audit

- **Goal:** Verify all approved page compositions and production states, then fix visual regressions without redesigning them.
- **Context:** Connected launch checks confirmed overflow but did not constitute a full frame-by-frame design audit.
- **Relevant files or references:** All 16 approved desktop/mobile page frames, eight production-state boards, approved shared components, all public routes and interactive states.
- **Proposed approach:** Review every route at 320, 390, 768, 1024, and 1440px. Compare typography, spacing, hierarchy, image crop, action wrapping, section boundaries, sticky offsets, form/status composition, empty states, and unavailable event states. Use DOM geometry as a diagnostic, not as the design source of truth.
- **Acceptance criteria:**
  - No horizontal overflow, clipped text, overlapping controls, hidden fragment target, or unstable layout exists at reviewed widths.
  - Desktop and mobile match the approved hierarchy and intermediate widths interpolate cleanly.
  - Reservation, form, empty-event, and availability states remain consistent with their approved boards.
- **Source reference:** `context/DESIGN_HANDOFF.md` and documented Figma nodes.
- **Verify:** Recorded route/state/viewport matrix and responsive browser review.

## Task 3.3 — Performance and production audit

- **Goal:** Validate production behavior and reach the project's Lighthouse target where realistic.
- **Context:** Production routes are healthy in smoke checks, but Lighthouse, Core Web Vitals diagnostics, bundle review, and a final header/cache assessment remain deferred.
- **Relevant files or references:** Production deployment, `next.config.ts`, `netlify.toml`, `app/layout.tsx`, image/font usage, Next.js production checklist.
- **Proposed approach:** Run Lighthouse in a clean browser profile on Home, Menus, Dinner, Events, event detail, and one interaction-heavy form route. Review LCP, CLS, INP proxies, image sizing/loading, font loading, client bundle boundaries, caching, headers, and third-party requests. Add only security headers compatible with Sanity Presentation and the deployed architecture.
- **Acceptance criteria:**
  - No critical performance, security-header, caching, or secret-exposure defect remains.
  - Lighthouse categories reach 95+ where realistic, or each exception has a measured explanation and accepted follow-up.
  - No unnecessary client dependency or hydration-driven layout shift is introduced.
  - Production and Presentation continue to function after header changes.
- **Source reference:** Project quality targets; Next.js production checklist; connected launch verification deferrals.
- **Verify:** Lighthouse reports, production HTTP/header review, bundle/runtime request review, browser diagnostics, and Presentation smoke test.

## Task 3.4 — Harden critical end-to-end coverage

- **Goal:** Make launch regressions visible in CI.
- **Context:** Current E2E coverage is strong for preview workflows but not exhaustive for links, announcement behavior, empty events, unavailable event states, all responsive breakpoints, or Firefox/WebKit behavior.
- **Relevant files or references:** `tests/e2e/site-smoke.spec.ts`, `playwright.config.ts`, event state component tests, CI workflow.
- **Proposed approach:** Add the smallest stable coverage for link integrity, menu pathways, footer details, announcement dismissal/focus, critical state rendering, and any audit-found regression. Evaluate one additional browser engine only if the resulting suite is stable and provides meaningful coverage; do not add exhaustive screenshot infrastructure.
- **Acceptance criteria:**
  - Every corrected navigation defect has a regression test.
  - Critical visitor journeys remain covered at desktop and mobile sizes.
  - Tests assert meaningful outcomes rather than implementation details.
  - CI remains deterministic and within its timeout.
- **Source reference:** Project critical E2E journey list and user-reported navigation defects.
- **Verify:** Repeated local E2E runs and CI-equivalent execution.

# Phase 4 — Finalize the fictional-site handoff package

**Phase goal:** The repository clearly explains how to run, edit, validate, and assess the finished portfolio site.

## Task 4.1 — Complete project and Studio documentation

- **Goal:** Replace remaining scaffold documentation and capture the actual operating workflow.
- **Context:** Root documentation covers setup and connected Sanity, but Studio documentation remains generic and launch-audit procedures are scattered across specs and verification files.
- **Relevant files or references:** `README.md`, `studio/README.md`, `.env.example`, `studio/.env.example`, migration docs, connected launch verification.
- **Proposed approach:** Document content editing, preview/publish behavior, event status handling, fictional interaction boundaries, validation commands, deployment assumptions, rollback reference, dependency audit, and launch-audit commands. Keep secrets and provider-specific private values out of Git.
- **Acceptance criteria:** A new contributor can run the frontend and Studio, edit representative content, preview safely, execute all checks, and understand the intentionally simulated interactions from repository documentation alone.
- **Source reference:** User request for client-facing completion; existing project workflow.
- **Verify:** Follow the documented setup/check flow from a clean install where practical and review every documented link/command.

## Task 4.2 — Produce final release verification

- **Goal:** Record exactly what was checked, fixed, deferred, and deployed.
- **Context:** The connected Sanity verification is excellent but predates this handoff-readiness pass.
- **Relevant files or references:** New `docs/handoff-readiness/verification.md`, production deployment, CI, audit outputs, Figma review matrix.
- **Proposed approach:** Record dependency audit results, changed destinations, accessibility findings, visual viewport/state matrix, Lighthouse results, full automated checks, production smoke results, and known limitations. Keep raw reports or screenshots out of Git unless they are sanitized and intentionally approved.
- **Acceptance criteria:**
  - Verification distinguishes automated, manual, and unperformed checks.
  - Every known limitation has impact and disposition.
  - The working tree is clean after deterministic generation and all committed artifacts are current.
- **Source reference:** Project verification requirements and connected launch verification format.
- **Verify:** `git diff --check`, generated-artifact drift check, `pnpm audit --prod`, `CONTENT_SOURCE=fixtures pnpm check`, `CONTENT_SOURCE=fixtures pnpm test:e2e:run`, connected build/validation where credentials permit, production route/link/image diagnostics, and final manual review.

## Implementation order after approval

1. Task 1.1 — destination inventory and regression seam.
2. Task 1.2 — menu navigation corrections.
3. Task 1.3 — footer/legal/social and Studio-facing details.
4. Tasks 2.1–2.2 — dependency remediation and audit closure.
5. Tasks 3.1–3.3 — launch audits, fixing findings as they are discovered.
6. Task 3.4 — retain stable regression coverage for those fixes.
7. Tasks 4.1–4.2 — documentation and final verification.

## Specification decision

A separate implementation specification is not required before Task 1.1. The existing architecture, approved Figma frames, CMS contracts, and this plan provide enough direction, and the proposed Menus behavior is explicitly constrained above. If the dependency update exposes a Sanity major-version migration or the audit reveals a cross-cutting architectural change, pause and write a focused specification for that change before proceeding.
