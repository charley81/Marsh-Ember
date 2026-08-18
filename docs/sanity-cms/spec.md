# Sanity CMS Integration Specification

**Status:** Approved

## What

Add a standalone Sanity Studio and a typed content-access layer to Marsh & Ember so editors can manage shared restaurant details, announcements, menus, dietary markers, and events without code changes. The public Next.js application will render published Sanity content through typed GROQ queries and framework-independent mappers, while authorized editors can preview drafts through Sanity Presentation and Next.js Draft Mode. Existing local content will become deterministic fixtures and the source for a reviewable, idempotent initial-content migration; it will not silently replace Sanity in production.

## Context

The approved site currently renders eight routes from TypeScript literals in [`lib/site-data.ts`](../../lib/site-data.ts), [`lib/events.ts`](../../lib/events.ts), and page components. Event status behavior is already modeled as a discriminated domain type and must remain intact. The site has Vitest, Playwright, and CI, but no CMS project, Studio, query layer, preview path, or content migration.

This specification implements Phase 3 of the production-completion direction: production schemas, typed queries and mapping, resilient optional-content behavior, preview, and current-content seeding. It follows the project CMS rules in `AGENTS.md` and the Sanity toolkit guidance committed under `.pi/skills/`.

## Requirements

### R1. Project and Studio boundary

1. Add a standalone Sanity Studio under `studio/`, managed in the existing pnpm workspace but independently runnable and deployable from the Next.js app.
2. Configure the Studio from environment variables; do not commit a project ID chosen for a private account, write token, read token, or preview secret.
3. Provide a curated desk structure with clear groups for Restaurant, Menus, Events, and Reference Data.
4. Enforce singleton editing for shared site settings and remove duplicate/create actions for that type.
5. Add root scripts for Studio development/build, schema extraction, TypeGen, document validation, and initial-content migration/validation.

### R2. Content model

The schema must represent the current approved content without encoding React component names or Figma layout details.

1. **`siteSettings` singleton document**
   - Restaurant name, descriptor, tagline.
   - Structured street address and a derived/display address where needed.
   - Phone display value and normalized telephone URI value.
   - General email and event-contact details.
   - Hours as ordered day/time rows.
   - Social and map URLs.
   - Optional announcement with enabled state, text, optional internal link label/path, and an editor-controlled dismissal version so changed announcements can be shown again.
   - Optional reference to the featured event.
2. **`dietaryMarker` document**
   - Unique short code, label, and guidance detail.
   - Menu items and event courses reference these records rather than duplicating marker definitions.
3. **`menu` document**
   - Title, stable unique slug, summary, service/availability copy, menu category, display order, and editorial update date.
   - Optional listing/detail images using Sanity image fields with hotspot and required contextual alt text when an image is supplied.
   - Ordered embedded menu sections and ordered embedded menu items. Items include name, optional display price, description, and dietary-marker references.
   - A menu may have teaser content without a public detail route. The Dinner record is the only initial detail-route record; adding generic detail page designs is out of scope.
4. **`event` document**
   - Title, stable unique slug, summary, semantic start/end datetimes, IANA time zone, format, and location display data.
   - Explicit status enum: `accepting`, `closed`, `soldOut`, `cancelled`, or `past`; accepting events also select `open` or `limited` as the public label.
   - Required listing image with hotspot and alt text.
   - Optional detail content that controls eligibility for `/events/[slug]`: hero image/alt, availability note, ordered facts, intro title and paragraphs, intro images, expectations, and courses with dietary-marker references.
   - Dates drive display and sorting, but never silently override the explicit operational status.
5. Use embedded object types for sections, items, facts, expectations, courses, hours, announcement, address, and owned images because they have no independent lifecycle. Use references only for independently managed/reused records.
6. Apply schema validation for required operational fields, URL/email/telephone shapes, unique slugs/codes, valid date ranges, detail completeness, conditional accepting labels, and image alt text. Add descriptions and fieldsets where they improve editor comprehension.
7. Do not store reservation, private-dining inquiry, RSVP submission, or other customer data in Sanity.

### R3. Typed query and domain boundary

1. Put frontend Sanity configuration, queries, generated types, image helpers, and content adapters under a dedicated `sanity/` boundary; Studio schema code stays under `studio/`.
2. Wrap every GROQ query in `defineQuery`, keep query projections beside the content-access code, and use parameters rather than string interpolation.
3. Configure Sanity TypeGen from the extracted Studio schema. Generated files are committed and checked for drift in CI.
4. Queries must project only fields needed by their consumer and must support:
   - Shared site settings and announcement.
   - Ordered menu summaries and a menu by slug.
   - Upcoming/active event summaries, featured-event selection, detail-capable slugs, and one event by slug.
5. Keep public components independent of raw Sanity result types. Mapping functions convert nullable query output into domain records used by components.
6. Preserve the existing event availability union and exhaustive presentation logic. Sanity status values must be mapped explicitly, including `soldOut` to the domain's `sold-out` state.
7. Use `cleanStega` before comparing, switching on, validating, or constructing paths from stega-encoded strings in draft mode.
8. Use `@sanity/image-url` for Sanity assets, preserve hotspot/crop data, supply responsive dimensions/sizes through `next/image`, and update `next.config.ts` to allow only the required Sanity CDN host.
9. Published list queries must have deterministic ordering. Event order is by semantic start datetime, with the explicit featured-event reference promoted separately rather than relying on “first item” semantics.

### R4. Route integration and content behavior

1. Convert the site shell to load site settings server-side and pass only required announcement/header/footer data to client components.
2. Replace local menu and event fixture reads on `/menus`, `/menus/dinner`, `/events`, and `/events/[slug]` with the typed content service while preserving approved route URLs, hierarchy, copy hierarchy, responsive behavior, and event state presentations.
3. Generate event static params from published, detail-capable event slugs. A missing or invalid event detail record returns the existing not-found experience and does not expose a partially authored page.
4. Preserve the approved no-upcoming-events state when a successful query contains no eligible records.
5. Missing optional images/copy must omit the relevant optional block or use an explicitly approved local presentation fallback without broken image URLs or empty headings.
6. Invalid individual list records must be excluded safely and reported server-side; one malformed document must not break an otherwise valid list page.
7. A CMS transport/configuration failure must not be presented as “no upcoming events.” Route-level unavailable handling must avoid RSVP calls to action and provide a safe contact/retry path. Shared shell settings may use a minimal committed operational fallback so the whole site remains navigable.
8. `CONTENT_SOURCE=fixtures` is the explicit deterministic adapter for tests, CI, and disconnected local work. Production uses `CONTENT_SOURCE=sanity` and fails configuration validation when required public Sanity values are absent. There is no automatic production failover from Sanity to mutable local menu/event fixtures.
9. Keep fixture records as test data and migration input, not as a second production authoring source.

### R5. Live published content and draft preview

1. Integrate the current `next-sanity` Live Content API pattern (`defineLive` plus one root `SanityLive`) so published CMS changes invalidate affected cached content without a custom webhook.
2. Use the public CDN for published reads. Draft reads use a least-privilege Viewer token only in server code.
3. Add a protected Draft Mode enable handler using the official `next-sanity` helper and a POST-based exit action/handler. Do not implement an unvalidated arbitrary redirect; preview locations are resolved from known schema types and validated internal paths.
4. Render `VisualEditing` only when Draft Mode is enabled and include a visible, accessible preview indicator with an exit control.
5. Configure the Studio Presentation tool with document locations for site settings, menus, event listings, and event detail routes.
6. Public visitors must never receive drafts. Tokens must not appear in client bundles, logs, committed files, query strings generated by application code, or test snapshots.
7. Document required Sanity CORS origins with credentials for local and approved preview/production origins. Do not create or modify remote CORS settings without explicit user approval.

### R6. Initial-content migration

1. Inventory the current restaurant, announcement, dietary, menu, event, and associated asset records in a committed migration mapping document.
2. Add committed transformation/import and validation scripts under `migration/`; gitignore generated snapshots, reports containing environment-specific data, and import artifacts unless intentionally checked in as sanitized fixtures.
3. The migration must be repeatable and idempotent. Singleton IDs may be fixed. Ordinary documents should be found by a migration/source key and updated when present, while allowing Sanity to generate their document IDs on first creation.
4. Upload original local assets, preserve one canonical asset per source file, and write crop/alt metadata on the owning image field.
5. Support a dry run that reports creates, updates, skipped records, unresolved references, validation errors, and asset work without writing remotely.
6. Require an explicit write flag and authenticated CLI session/token for remote mutations. Stop for human review after dry-run artifacts; do not run a remote import as part of implementation without separate approval.
7. Validation must compare source/destination counts, required fields, references, detail-route eligibility, image assets/alt text, slugs, and mapped frontend output.

### R7. Documentation and operations

1. Add sanitized root and Studio environment examples and document which values are public identifiers versus secrets.
2. Update the README with local frontend/Studio commands, initial setup, schema/TypeGen workflow, fixture mode, preview setup, content validation, and migration dry-run/write instructions.
3. Document the external setup checklist: select/create the Sanity project and public dataset, authenticate the CLI, create a Viewer token, configure CORS, set deployment variables, and manually verify Presentation.
4. Ensure CI can run without production credentials by using fixture mode for public app checks while still building the Studio, extracting/checking the schema and generated types, and running mapper/schema-focused tests.

## Design

### Repository layout

```text
studio/
  package.json
  sanity.config.ts
  sanity.cli.ts
  structure/
  schemaTypes/
sanity/
  env.ts
  client.ts
  live.ts
  image.ts
  queries/
  mappers/
  content.ts
  types.generated.ts
migration/
  README.md
  mappings.md
  scripts/
app/api/draft-mode/enable/route.ts
components/sanity/preview-indicator.tsx
sanity-typegen.json
.env.example
studio/.env.example
```

Exact filenames may follow generator conventions, but the Studio, frontend adapter, and migration concerns must remain separate.

### Content flow

```text
Sanity document
  -> parameterized defineQuery projection
  -> TypeGen result
  -> runtime mapper/validation
  -> framework-independent domain record
  -> existing server page/presentational component
```

`sanity/content.ts` exposes use-case-oriented reads rather than a generic query function. The adapter selects Sanity or fixtures from validated server configuration. Components receive domain props and do not import the Sanity client or generated query-result types.

### Query contracts

- **Site settings:** returns exactly one singleton. The mapper normalizes links, telephone/mail values, hours, event contact, featured event, and announcement state.
- **Menu listing:** returns display metadata and the bounded item data needed by the approved landing presentation.
- **Menu detail:** accepts a slug parameter and returns ordered sections/items with expanded marker code/label data.
- **Event listing:** returns eligible published events with listing images and explicit status, sorted by start time. Featured content comes from the settings reference and is de-duplicated from upcoming cards.
- **Event detail:** accepts a slug and returns a record only when detail content is complete enough to map.
- **Static params:** returns only slugs for published detail-capable events.

Array projections use `coalesce(..., [])` where an empty collection is valid. Required singleton/detail objects remain nullable in generated types and are handled deliberately by mappers.

### Runtime and caching

The frontend uses one `createClient` configuration with a pinned API version and `useCdn: true` for published reads. `defineLive` owns live invalidation and draft-aware fetching. One `<SanityLive />` is rendered at the root. A custom revalidation webhook is intentionally not added because it would duplicate the Live Content API; it can be added later only if the deployment platform proves incompatible.

Fixture mode is selected explicitly before content reads. Environment validation must happen on the server and produce actionable startup/build errors for an invalid production Sanity configuration.

### Preview flow

1. An authenticated editor opens a known document in Studio Presentation.
2. The Studio calls the protected enable endpoint using the official signed/validated integration.
3. Next.js enables Draft Mode and redirects only to a location generated by the application for that schema type.
4. Server queries use draft perspective with the server-only Viewer token; stega metadata enables overlays.
5. The page displays a preview indicator and Visual Editing overlays.
6. The editor exits through a form/POST action, which disables Draft Mode and redirects to a safe internal path.

### Migration flow

1. Extract an inventory from committed TypeScript fixtures and page-owned menu/event literals into a sanitized transform input.
2. Validate and transform to semantic schema records with stable source keys and stable array `_key` values.
3. Dry-run against local transformation rules and, when credentials are available, inspect existing destination records by source key.
4. Upload assets, upsert reusable markers, upsert primary documents, then patch references/settings.
5. Run Sanity document validation and frontend mapper checks, generate a report, and stop for editorial review.

## Decisions

### D1. Standalone nested Studio

- **Choice:** A standalone Studio in `studio/` within the pnpm workspace.
- **Alternatives:** Embed Studio in the Next.js route tree; maintain Studio in a separate repository.
- **Why:** Sanity recommends a standalone Studio for independent configuration/deployment, while keeping it in this repository makes schemas, TypeGen, migrations, and CI atomic.
- **Reversibility:** High; Studio can later move repositories without changing public content contracts.
- **Research:** Sanity project-structure and getting-started guidance from the committed toolkit.

### D2. Semantic documents with owned embedded objects

- **Choice:** Documents for independently managed site settings, menus, events, and dietary markers; embedded arrays for owned subcontent.
- **Alternatives:** One page-shaped document per route; documents for every menu item/course/fact.
- **Why:** This avoids presentation coupling and unnecessary editorial fragmentation while preserving references for genuinely reused dietary definitions.
- **Reversibility:** Moderate; schemas can evolve through Sanity migrations.
- **Research:** Sanity content-modeling guidance on separation of concerns, reuse, and references versus embedding.

### D3. Domain mapping instead of raw generated types in UI

- **Choice:** Map TypeGen query results into existing domain models at one boundary.
- **Alternatives:** Pass raw query results directly into components; replace domain models with generated types.
- **Why:** GROQ results are nullable and CMS-shaped. A mapper preserves tested event invariants, contains stega cleanup, and gives malformed-content handling one home.
- **Reversibility:** Moderate, but this boundary is intentionally durable.
- **Research:** Sanity TypeGen/GROQ guidance and the repository's current typed event-state architecture.

### D4. Live Content API instead of a custom webhook

- **Choice:** `defineLive`/`SanityLive` for published invalidation and draft refresh.
- **Alternatives:** Time-based ISR; a custom Sanity webhook calling `revalidateTag`/`revalidatePath`.
- **Why:** This is the current `next-sanity` recommendation and avoids maintaining webhook authorization and document-to-tag routing. Next.js 16 recommends tag-based on-demand revalidation for CMS data, but Live Content already supplies the invalidation path.
- **Reversibility:** High; a webhook can be added if hosting constraints require it.
- **Research:** Current `next-sanity` guidance and installed Next.js 16 Draft Mode/revalidation documentation.

### D5. Explicit fixture adapter, not silent production fallback

- **Choice:** Fixtures are selected explicitly for CI/tests/disconnected development; production Sanity failures use safe unavailable behavior.
- **Alternatives:** Always fall back to local fixtures; require live Sanity in every CI job.
- **Why:** Silent fallback can publish stale hours, prices, or event availability. Explicit fixtures keep builds deterministic without disguising a production outage as valid current content.
- **Reversibility:** High.

### D6. Public production dataset with server-only draft token

- **Choice:** Use a public dataset for public restaurant content; use a least-privilege Viewer token only for draft preview.
- **Alternatives:** Private dataset requiring authenticated published reads; expose a browser token for live draft fetching.
- **Why:** Published content is inherently public and CDN-friendly. Keeping the token server-only limits exposure of drafts and account credentials.
- **Reversibility:** Moderate; dataset visibility can be changed with corresponding client/token configuration.
- **Assumption:** The user will select or create an account-owned Sanity project with a `production` dataset before connected implementation verification.

### D7. Scripted, approval-gated seed migration

- **Choice:** Commit idempotent migration/validation scripts and stop before remote writes.
- **Alternatives:** Enter records manually; commit a one-shot opaque export; mutate Sanity during implementation.
- **Why:** Scripts make the initial content reviewable and repeatable while respecting the rule against creating external resources or writing remotely without approval.
- **Reversibility:** High before write; migrated content remains editable and scripts can reconcile updates.
- **Research:** Sanity migration playbook, including dry runs, asset-first ordering, deterministic array keys, and human checkpoints.

## Versions

Versions were checked against the npm registry during specification research. Implementation should use these compatible stable lines unless a newer stable release is re-verified immediately before installation:

| Dependency/runtime | Version | Notes |
| --- | --- | --- |
| Node.js | CI Node 22 (must resolve to `>=22.12`) | Satisfies current Sanity and next-sanity engines; local Node 24 is also compatible. |
| pnpm | `10.32.1` | Existing pinned package manager. |
| Next.js | `16.3.1` | Existing application version. |
| React / React DOM | `19.2.8` | Existing application version; satisfies next-sanity peer range. |
| `sanity` | `6.9.2` | Current stable checked from npm; requires Node `>=22.12`. |
| `@sanity/vision` | `6.9.2` | Match the Studio major/version line. |
| `next-sanity` | `13.3.3` | Current stable checked from npm; supports Next 16, React 19.2, and Sanity 5/6. |
| `@sanity/image-url` | `2.1.1` | Current stable checked from npm. |

The Sanity API date is pinned as a source constant chosen at implementation time; it is not `new Date()` and not a deployment environment variable.

## Invariants

1. Existing public URLs and approved responsive layouts remain unchanged.
2. Standard reservations, Private Dining inquiries, and Event RSVP requests remain separate flows; Sanity stores none of their submissions.
3. An RSVP request is never described as confirmed attendance.
4. Event operational status remains explicit and exhaustively handled; dates do not auto-open or auto-close requests.
5. Only events with valid detail content receive links, static params, and detail pages.
6. Public requests can read only published content. Draft content requires a valid Draft Mode session.
7. No secret or customer data reaches client JavaScript, Git, logs, snapshots, or migration fixtures.
8. Missing optional CMS media/copy does not produce broken URLs, empty interactive controls, or invalid heading structure.
9. The no-events presentation is used only for a successful empty query, never for a CMS failure.
10. `pnpm check` and `pnpm test:e2e:run` remain green in credential-free fixture-mode CI.

## Error Behavior

- **Missing/invalid environment:** Sanity mode fails early with a concise server-side configuration error naming the missing variable; secrets are never printed.
- **Site settings missing or malformed:** Log a sanitized diagnostic and render a minimal committed shell fallback for navigation/contact continuity. Draft preview also surfaces an editor-visible warning.
- **Menu/event list query failure:** Render an accessible temporary-unavailable state with retry/contact guidance. Do not claim there are no events and do not show stale RSVP actions.
- **Successful empty event query:** Render the approved no-upcoming-events state.
- **Malformed list document:** Exclude only that document, emit a sanitized server diagnostic, and continue with valid records.
- **Missing/malformed detail record:** Return the existing not-found route; in Draft Mode, additionally expose a non-public editor diagnostic where practical.
- **Missing optional image/copy:** Omit the optional region or use the documented static visual fallback; never construct a URL from `null`.
- **Draft authorization failure:** Return `401`/`403` without enabling Draft Mode or redirecting.
- **Unsafe preview destination:** Reject it; only application-generated relative paths are accepted.
- **Migration validation failure:** Exit non-zero before mutation. In write mode, stop the affected record, report it, and do not delete destination content.
- **Asset upload failure:** Keep the owning document unchanged for that image, report the source path, and allow an idempotent retry.

## Testing Strategy

### Unit tests

- Mapper tests for complete, optional, `null`, malformed, empty-array, unknown-status, and stega-encoded query results.
- Date/time formatting tests across the configured event time zone and daylight-saving boundaries.
- Event status mapping and existing availability presentation regression tests.
- Featured-event de-duplication, deterministic sorting, detail eligibility, menu ordering, dietary-reference expansion, and announcement dismissal-version behavior.
- Environment validation and fixture/Sanity adapter selection.
- Image helper behavior for absent assets, dimensions, crop/hotspot, and alt text.
- Migration transform tests for stable keys, source identity, reference resolution, validation failures, and dry-run summaries.

### Integration tests

- Mock Sanity fetch responses at the content boundary and verify route behavior for valid, empty, malformed, and transport-failure results.
- Test Draft Mode enable rejection/acceptance and POST exit behavior without using a production token.
- Verify generated static params include only valid detail events.
- Verify published and draft query perspectives are selected correctly and the token remains server-only.
- Run schema extraction, TypeGen, generated-file drift check, Studio build, and Sanity document validation against sanitized local fixtures where supported.

### End-to-end and manual verification

- Run the existing critical journeys in fixture mode, including menus, event states, no-events state, mobile navigation, and event detail.
- With an approved nonproduction dataset and credentials, manually:
  1. Author representative settings, menu, dietary marker, accepting event, unavailable event, and detail-less event.
  2. Confirm published edits update affected pages through Live Content.
  3. Confirm unpublished edits are invisible publicly and visible in Presentation/Draft Mode.
  4. Confirm preview overlays, known document locations, exit behavior, and keyboard focus.
  5. Confirm missing optional content and malformed drafts degrade as specified.
  6. Verify responsive rendering at mobile, tablet, laptop, and desktop sizes and basic keyboard/200% zoom behavior.
- Before handoff run formatting if configured, lint, TypeGen drift check, type checking, focused tests, Studio build, Next.js production build, and Playwright smoke tests.

## Acceptance Criteria

1. Editors can model every current settings, announcement, dietary, menu, and event record, including every supported event status and the no-events state.
2. The four CMS-backed public route families render from mapped typed queries in Sanity mode and deterministic fixtures in CI mode.
3. Current visual hierarchy and public URLs remain intact; Dinner and the Harvest event remain the only initial detail-route experiences their approved designs support.
4. Published edits refresh through the Live Content API; authorized drafts are visible only in an indicated Draft Mode session.
5. Missing optional content, malformed individual records, an empty event result, and a CMS outage each produce their distinct specified behavior.
6. Schema extraction and TypeGen are reproducible, generated types are committed, and drift fails CI.
7. The migration dry run is deterministic, reports all intended content/assets/references, performs no remote write by default, and requires explicit approval before import.
8. No credentials, tokens, customer data, or production secrets are committed or exposed to the browser.
9. All required automated checks and the connected manual preview checklist pass before the feature is considered complete.

## Out of Scope

- Creating the Sanity organization/project/dataset, changing remote CORS settings, issuing tokens, deploying Studio, or importing content without explicit approval.
- Final editorial approval of migrated copy, dates, prices, contact details, or licensed imagery.
- CMS authoring of every marketing-page paragraph or layout section; only the shared, menu, event, and associated media domains named above are included.
- A generic public detail template for Brunch, Cocktails & Spirits, or Wine.
- Reservation-provider integration, functional Private Dining submission, functional Event RSVP submission, email delivery, persistence, spam protection, or rate limiting.
- Customer-data storage in Sanity.
- Localization, scheduled publishing, content releases, experimentation, or a custom media-library integration.
- A custom webhook revalidation endpoint unless Live Content proves incompatible with the selected hosting environment.
- Production deployment or DNS changes.

## External Inputs Required Before Connected Verification

- Sanity project ID and approved dataset name (`production` is assumed).
- Confirmation that the dataset may be public.
- Authenticated Sanity CLI access for the user.
- A least-privilege Viewer token supplied through local/deployment secrets.
- Approved local, preview, and production origins for Sanity CORS and Presentation.
- Explicit approval before any migration script writes to Sanity.
