# Fictional-site handoff readiness verification

- **Status:** Implementation complete; local and connected verification complete; deployment not requested
- **Date:** 2026-08-20
- **Branch:** `main` working tree, uncommitted
- **Production origin reviewed before implementation:** `https://marshandember.netlify.app`
- **Local verification modes:** fixture content and connected Sanity content

## Scope completed

- Replaced inert Home menu labels with four functional menu destinations.
- Kept Dinner as the only complete detail menu while making Brunch, Cocktails & Spirits, and Wine navigation point to useful landing-page previews.
- Removed Brunch, Cocktails, and Wine calls to action that targeted their own containing sections.
- Clarified the Dinner detail navigation as cross-navigation to menu previews.
- Added a route-wide internal destination/fragment regression test.
- Added functional Privacy and Accessibility pages and footer links.
- Kept generic Instagram and Facebook platform destinations with accessible external-window context.
- Replaced the generic Sanity Studio README with project-specific authoring, preview, validation, migration, and deployment guidance.
- Added a global application error fallback.
- Added Content Security Policy, Referrer Policy, Permissions Policy, and MIME-sniffing protection while permitting the approved Sanity Studio to embed Presentation.
- Disabled the framework-identifying response header.
- Updated Sanity and Vision from 6.9.2 to 6.10.1.
- Applied narrowly scoped transitive overrides for patched `js-yaml`, `smol-toml`, and `uuid` releases after tracing each advisory path and validating affected Studio workflows.
- Added a production audit command and CI audit gate.
- Added automated WCAG A/AA scans for all public routes and critical dialog/form/mobile-navigation states.
- Deferred reservation-dialog JavaScript with a client-side dynamic import and updated image priority/sizing hints.
- Increased Dinner local-navigation and mobile-header target sizing.
- Added stable Playwright concurrency settings after automated accessibility scans exposed local CPU contention at six parallel workers.

## Automated checks

| Check | Result |
| --- | --- |
| `pnpm audit:prod` | Pass — no known vulnerabilities found |
| `CONTENT_SOURCE=fixtures pnpm check` | Pass |
| Lint | Pass — frontend and Studio |
| Sanity schema extraction and TypeGen | Pass — 7 queries and 27 schema types; generated artifacts unchanged |
| Type checking | Pass |
| Unit/component tests | Pass — 17 files, 93 tests |
| Sanity Studio build | Pass |
| Next.js fixture production build | Pass — 16 static/generated routes |
| `CONTENT_SOURCE=fixtures pnpm test:e2e:run` | Pass — 51 passed, 3 viewport-specific skips, 54 total |
| Axe WCAG A/AA scans | Pass — 10 public routes at desktop/mobile plus reservation, validation, and mobile-menu states |
| Internal destination/fragment test | Pass |
| Security-header E2E test | Pass |
| Sanity connected production build | Pass |
| `pnpm sanity:validate` | Pass — 13 documents, 0 errors, 0 warnings |
| `pnpm content:migrate:validate` | Pass — expected counts and no reported issues |
| `pnpm content:migrate:dry-run` | Pass — no writes performed |
| `git diff --check` | Pass |

## Browser and responsive review

A scripted route/geometry review exercised all 10 public routes at 320, 390, 768, 1024, and 1440 CSS pixels: 50 route/viewport combinations.

Results:

- no page-level horizontal overflow;
- exactly one visible `h1` per route;
- no visible broken image;
- no visible interactive target below 24×24 CSS pixels after excluding intentionally hidden skip-link content;
- no console errors or failed requests in fixture mode;
- cross-route menu fragments settle below the sticky header;
- affected Home, Menus, Dinner, Privacy, Accessibility, and footer compositions were visually reviewed at 390px and 1440px;
- updated Home and Menus compositions retain the approved Figma hierarchy without adding unsupported menu detail content.

Additional Firefox and WebKit smoke checks exercised all 10 public routes at 390px, the Home-to-Brunch fragment journey, and reservation-dialog focus restoration. Both engines returned successful routes with no overflow, console errors, or failed requests.

A connected Sanity browser smoke at the approved `http://localhost:3000` CORS origin loaded without console errors or failed requests after the security-header changes. A test on an unapproved alternate local port correctly failed Sanity Live CORS and was not treated as a product defect.

A 720 CSS-pixel reflow review was used as the layout equivalent of a 1440px desktop viewport at 200% browser zoom. All routes retained zero page-level overflow; a two-pixel mobile Reserve-label sizing issue found by that review was corrected.

## Accessibility review

Automated and behavior coverage confirms:

- landmarks and page headings are present;
- menu destinations and fragment targets are valid;
- mobile navigation moves, traps, and restores focus;
- reservation dialogs restore focus to the exact trigger;
- form validation summaries, errors, and completion states remain accessible;
- announcement dismissal persists and moves focus safely;
- reduced-motion CSS remains in place;
- visible interactive targets meet the WCAG 2.2 24×24 minimum in the reviewed route matrix;
- Axe reports no WCAG A/AA violation in scanned routes and interaction states.

No manual test with VoiceOver, NVDA, or another screen reader was performed. Axe and keyboard/focus behavior tests do not replace a user-led assistive-technology review.

## Lighthouse audit

Lighthouse 13.4.1 was run against a local optimized production server using mobile throttling for Home, Menus, Dinner, Events, event detail, and Private Dining.

- Accessibility: 100 on all six routes
- Best Practices: 100 on all six routes
- SEO: 100 on all six routes
- CLS: 0 on all six routes
- TBT: 50–150ms across the measured runs
- Performance: 86–94 across measured runs

The image audit initially reported missing LCP priority hints. Hero art-direction images now use `fetchpriority="high"`, and responsive sizing hints were tightened. The remaining local simulated performance score is primarily LCP and approximately 29 KiB of framework/shared client JavaScript. The reservation dialog is now loaded on demand. The documented aspirational 95+ mobile performance score was not consistently reached in local throttled runs; production CDN field data is not available and no production deployment was requested.

Raw Lighthouse JSON and visual screenshots were kept in temporary local files and were not added to the repository.

## Security and dependency notes

`pnpm audit:prod` initially reported 3 high and 8 moderate findings in the Sanity CLI graph. Updating Sanity/Vision removed the vulnerable Undici paths. Supported targeted overrides removed the remaining vulnerable `@vercel/frameworks` YAML/TOML parsers and `typeid-js` UUID dependency. The final audit reports no known vulnerability.

Sanity 6.10.1 currently emits a peer warning from its internal alpha Workbench package requesting an `@sanity/sdk` 3 release candidate while the resolved graph also contains SDK 2.19.0. No prerelease SDK override was added. Schema extraction, TypeGen, lint, document validation, migration validation, Studio build, connected frontend build, Live Content browser smoke, and Presentation-compatible headers all pass.

## Known limitations

- The updated code has not been committed, pushed, deployed, or verified on the production Netlify origin because those actions were not requested.
- A manual screen-reader session was not performed.
- Lighthouse performance remains below 95 in local mobile simulation on some routes; production field metrics are unavailable.
- Privacy and Accessibility content is appropriate to the fictional portfolio preview and is not legal advice.
- Social destinations remain generic platform homepages by design.
- Reservation, Private Dining, and event RSVP interactions remain no-I/O portfolio previews by design.
