# Connected Sanity deployment and verification specification

**Status:** Draft

## What

Activate and verify the existing Sanity-backed Marsh & Ember stack in a connected deployment. The work will validate the already-migrated published content, remove temporary migration credentials, configure exact trusted origins, deploy a Sanity-connected Netlify preview, verify Presentation and Draft Mode with a reversible draft-only edit, and promote the verified configuration only after explicit approval. It must not rerun the content import, mutate published content for testing, expose secrets, or silently fall back to fixtures in production.

## Context

The repository already contains the implementation approved in [`docs/sanity-cms/spec.md`](../sanity-cms/spec.md):

- standalone Studio under `studio/`;
- semantic schemas for settings, dietary markers, menus, and events;
- typed GROQ queries and mappers under `sanity/`;
- explicit fixture/Sanity content adapters;
- Live Content API integration through `ContentLive`;
- protected Draft Mode and Visual Editing through `PreviewTools`;
- Presentation document locations;
- deterministic migration and validation scripts;
- Netlify build configuration and credential-free fixture-mode CI.

Ignored local migration evidence currently shows:

- a dry run with no writes;
- a completed write for 1 settings document, 3 dietary markers, 4 menus, 4 events, and 12 assets;
- connected validation with those counts, one detail event (`harvest-at-the-hearth`), and no reported duplicate, reference, image-alt, or detail-completeness issues.

Ignored root and Studio environment files contain the expected variable names. The root environment still includes a migration write-token key, so temporary Editor credential cleanup is now a security priority. Values and credentials must not be copied into this specification, logs, commits, issues, or pull requests.

The repository does not contain a linked Netlify site state, GitHub deployment record, approved deployment origin, or committed connected-verification report. Therefore the next priority is connected deployment and editorial-workflow verification—not another migration write. Final whole-site Lighthouse and launch QA remain a later slice after the content path is proven.

Relevant files:

- `README.md`
- `.env.example`
- `studio/.env.example`
- `netlify.toml`
- `lib/content-source.ts`
- `lib/content.ts`
- `sanity/env.ts`
- `sanity/client.ts`
- `sanity/live.ts`
- `components/sanity/content-live.tsx`
- `components/sanity/preview-tools.tsx`
- `app/api/draft-mode/enable/route.ts`
- `studio/sanity.config.ts`
- `studio/sanity.cli.ts`
- `studio/presentation/resolve.ts`
- `migration/mappings.md`
- `migration/scripts/migrate.ts`
- `migration/scripts/validate.ts`

No new visual design is required. Connected pages must preserve the approved Figma frames and state hierarchy documented in `context/DESIGN_HANDOFF.md`.

## Requirements

### R1. Preflight and approval gates

1. Begin from a clean `main` synchronized with `origin/main` and record the commit being verified.
2. Confirm, without printing identifiers or secrets, that the local frontend and Studio resolve to the same intended Sanity project and dataset.
3. Confirm that the target is the account-owned public production dataset already used by the completed migration. Do not create another project or dataset.
4. Determine whether an existing Netlify site and Sanity-hosted Studio deployment already exist before creating anything.
5. Obtain the following explicit inputs before any external configuration or deployment mutation:
   - approved Netlify site or approval to create/link one;
   - exact connected preview origin;
   - exact production origin, if promotion is in scope;
   - approved Sanity Studio hostname, if Studio deployment is in scope;
   - approval to change Sanity CORS entries;
   - approval for a temporary draft-only verification edit.
6. Stop rather than inventing a site name, Studio hostname, custom domain, dataset, origin, or organization.
7. Treat these as separate human checkpoints:
   - **Gate A:** approve external configuration targets;
   - **Gate B:** approve preview deployment and draft-only verification;
   - **Gate C:** approve production promotion after evidence review.
8. Do not run `pnpm content:migrate:write` during this feature. Any discovered content mismatch requires a reviewed diff and separate write approval.
9. Read-only discovery commands may run before Gate A, but their output must be sanitized before it enters committed documentation.

### R2. Credential and secret hygiene

1. Confirm the migration write completed and connected validation is clean before retiring the Editor token.
2. Remove `SANITY_API_WRITE_TOKEN` from `.env.local` after validation and revoke/delete that temporary credential in Sanity Manage.
3. Never configure the write token in Netlify, Sanity Studio hosting, CI, GitHub, or another deployment service.
4. Confirm `SANITY_API_READ_TOKEN` is a least-privilege Viewer token suitable for draft preview—not an Editor or Administrator token.
5. Keep the Viewer token server-only and unprefixed. `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` remain the only frontend-public Sanity identifiers.
6. Configure deployment secrets through the provider’s encrypted environment-variable interface, not `netlify.toml`, shell history, command arguments, committed files, or PR text.
7. Scope variables deliberately:
   - production receives the approved production values;
   - a trusted connected deploy preview may receive the same read-only values only when its exact origin is approved;
   - untrusted branch previews must not receive the Viewer token or become trusted CORS origins.
8. Inspect the production browser bundles and network-visible configuration to confirm no read/write token is present.
9. Preserve Netlify secret scanning of source, server output, and browser assets. Do not broaden `SECRETS_SCAN_OMIT_PATHS` beyond the existing disposable Turbopack cache exclusion.
10. Never print environment files, token values, project IDs, or full provider configuration in command output captured for review.

### R3. Connected content and schema preflight

1. Run the deterministic fixture-mode project checks first so external configuration cannot mask a repository regression.
2. Run `pnpm content:migrate:validate` against the selected published dataset using the Viewer token.
3. Run `pnpm sanity:validate` against the connected dataset.
4. Verify the expected published inventory:
   - 1 `siteSettings` singleton;
   - 3 dietary markers;
   - 4 menus;
   - 4 events;
   - 12 source assets represented by the migration;
   - exactly one event detail route for `harvest-at-the-hearth`;
   - exactly one menu detail route for `dinner`.
5. Verify references, unique slugs/codes, image assets, contextual alt text, accepting-event labels, date ranges, and detail completeness.
6. Compare representative mapped output with fixture output for settings, Dinner, the featured event, and every event status. Differences must be reviewed as editorial differences, transformation defects, or intentional CMS evolution.
7. Do not declare a successful empty event query, malformed content, or CMS transport failure equivalent. Preserve the distinct behavior defined by the CMS specification.
8. If the connected dataset fails validation, stop before CORS changes or deployment promotion. Do not repair it by rerunning the whole migration automatically.

### R4. Schema, CORS, and Studio configuration

1. Build the Studio locally before external deployment.
2. Deploy the registered `default` workspace schema to the selected dataset only after Gate A approval. Use the installed CLI and require schema deployment success.
3. List current Sanity CORS origins and compare them with the approved exact-origin set.
4. The intended trusted set is limited to:
   - `http://localhost:3000` for local Presentation development;
   - the exact approved connected Netlify preview origin, when that preview is retained;
   - the exact approved production frontend origin.
5. Trusted Presentation/frontend origins must allow credentials because Draft Mode and authenticated editing depend on credentialed requests.
6. Never add `*`, `*.netlify.app`, an uncontrolled branch wildcard, an origin with a path, or a hostname not owned/approved by the user.
7. Add missing exact origins only after approval. Do not delete an existing origin until its owner and purpose are understood and deletion is separately approved.
8. Configure `SANITY_STUDIO_PREVIEW_ORIGIN` to one exact deployed frontend origin; it must not point to localhost in the deployed Studio.
9. Run a Sanity Studio deployment dry run before upload.
10. If deploying to Sanity hosting, use the approved explicit hostname and require schema success. Do not accept an interactive generated hostname without review.
11. Keep Studio auto-updates disabled as currently configured so the deployed artifact matches the lockfile and verified build.
12. A failed or deferred Studio deployment must not block the public frontend; local Studio remains the safe editorial-verification fallback.

### R5. Netlify connected preview

1. Use the existing `netlify.toml` build contract: `pnpm build` with `.next` as the publish output.
2. Reuse an existing approved Netlify site when one exists. Creating or linking a new site requires explicit approval.
3. Configure the connected preview with exactly:
   - `CONTENT_SOURCE=sanity`;
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`;
   - `NEXT_PUBLIC_SANITY_DATASET`;
   - `SANITY_API_READ_TOKEN`.
4. Do not configure `SANITY_API_WRITE_TOKEN` or Studio-only variables in the frontend deployment.
5. Deploy a non-production connected preview first. The production alias/domain must not change at Gate B.
6. A Sanity-mode build must fail clearly if required public identifiers are missing. It must not silently build from fixtures.
7. Verify the deployed server actually reports Sanity-backed behavior through content comparison and controlled editorial preview—not merely through successful compilation.
8. Verify all public routes and in-app client transitions. Direct URL loads and Next.js `<Link>` navigation must both work without browser console or hydration errors.
9. Verify the deployment performs no unexpected customer-data submission; the reservation, Private Dining, and Event RSVP experiences remain local portfolio previews.
10. Promote the same verified commit/configuration to production only after Gate C approval.
11. Preserve the previous successful deployment as the immediate rollback target.

### R6. Connected public-content verification

1. Verify the shared announcement, restaurant settings, contact details, hours, menu summaries, Dinner detail, event listing, and Harvest detail render from published CMS content.
2. Verify Sanity images load through the approved image pipeline with correct dimensions, responsive sizing, crops/hotspots, and alt text.
3. Verify the featured event is promoted without duplicate cards.
4. Verify all explicit event states remain exhaustive and accurate:
   - accepting;
   - closed;
   - sold out;
   - cancelled;
   - past excluded from the active event listing where specified.
5. Verify only detail-capable records produce detail links and static params.
6. Verify unavailable events never expose RSVP controls.
7. Verify successful empty results use the designed empty state only when an approved test dataset or controlled mock can produce that condition. Do not add a public query-string backdoor.
8. Verify a transport/configuration failure produces temporary-unavailable behavior and never stale fixture event availability. Perform this through a local/isolated environment, not by breaking production configuration.
9. Compare the connected pages against the approved 390px and 1440px visual hierarchy and check intermediate responsive widths.
10. Any public-content discrepancy blocks production promotion until classified and resolved.

### R7. Presentation and Draft Mode verification

1. Verify Presentation opens the connected frontend at the configured origin and enables Draft Mode through `/api/draft-mode/enable`.
2. Verify the visible “Draft preview is on” indicator and POST-based “Exit preview” control.
3. Verify document locations for:
   - site settings → Home;
   - menus → Menus and approved detail route when eligible;
   - events → Events and approved detail route when eligible.
4. Verify click-to-edit overlays target representative settings, menu, and event fields.
5. With Gate B approval, make one harmless, clearly fictional draft-only text edit to an existing document.
6. Confirm the draft edit appears live in Presentation without appearing on the public published page.
7. Confirm route logic, IDs, status comparisons, links, and metadata remain correct while stega strings are present.
8. Exit Draft Mode and confirm published content returns with no draft marker.
9. Discard the temporary draft mutation and confirm no verification draft remains.
10. Do not publish a content change solely to test invalidation. If the user separately approves a reversible published-content test, document the exact change, observation, revert, and final published value.
11. If published Live Content invalidation is not independently exercised, record that limitation rather than claiming it passed.
12. Do not use real customer information or operational claims in any draft test.

### R8. Evidence and handoff

1. Create a sanitized connected-verification record at `docs/connected-sanity-launch/verification.md` during execution.
2. The record must include:
   - verified Git commit;
   - public deployment and Studio origins, if approved for documentation;
   - date and environment tested;
   - commands/checks run and actual results;
   - published document/asset counts without document IDs;
   - route and Presentation checks;
   - rollback target or method;
   - limitations and deferred checks.
3. Never include tokens, project IDs, dataset internal IDs, organization details, document IDs, raw environment output, or migration reports containing environment-specific data.
4. Update `README.md` only when the final approved workflow, origins, or commands differ from the existing documentation.
5. Keep ignored migration reports ignored. Do not commit generated remote snapshots or provider state.
6. Leave the working tree clean of deployment caches, Netlify state, Studio build output, screenshots containing editor identity, and temporary verification content.

## Design

### Delivery phases

```text
Phase 0: local/read-only preflight
  -> fixture checks
  -> connected validation
  -> inventory comparison
  -> credential-role review

Gate A: approve exact external targets

Phase 1: external configuration
  -> deploy schema
  -> reconcile exact CORS origins
  -> configure provider environment
  -> Studio deployment dry run

Gate B: approve connected preview and draft-only edit

Phase 2: connected preview
  -> deploy immutable commit to Netlify preview
  -> verify Sanity-backed routes and states
  -> verify local/deployed Presentation
  -> discard temporary draft
  -> produce sanitized evidence

Gate C: approve production promotion

Phase 3: promotion and rollback readiness
  -> promote verified commit/configuration
  -> smoke-test public routes
  -> confirm previous deployment rollback path
  -> revoke/remove temporary migration credentials
```

The phases are deliberately sequential. A clean fixture build does not prove connected content, and a valid dataset does not prove CORS, Draft Mode, provider environment, or deployed Presentation.

### Environment matrix

| Environment | Content source | Published identifiers | Viewer token | Write token | Trusted CORS |
| --- | --- | --- | --- | --- | --- |
| CI | `fixtures` | deterministic test values | deterministic CI placeholder | never | none required |
| Local connected | `sanity` | approved project/dataset | local Viewer secret | removed after migration | exact localhost origin |
| Trusted deploy preview | `sanity` | approved project/dataset | provider Viewer secret | never | exact retained preview origin only |
| Production | `sanity` | approved project/dataset | provider Viewer secret | never | exact production origin |
| Untrusted branch preview | fixtures or no deploy | no production secret | never | never | never |

### Expected repository changes

The execution should be operations- and evidence-focused. Expected committed changes are limited to:

- `docs/connected-sanity-launch/verification.md`;
- `README.md` only if final operational guidance changes;
- narrowly scoped code/config fixes only when connected verification exposes a reproducible defect;
- focused regression tests for any such defect.

Do not commit `.env.local`, `studio/.env.local`, `.netlify/`, provider exports, deployment caches, migration reports, or secrets.

### Rollback model

- **Dataset:** No migration rerun or destructive content operation is part of this feature. Draft verification is discarded.
- **Frontend:** Roll back to the previous successful Netlify deployment if connected content or runtime behavior fails after promotion.
- **Studio:** A Studio deployment failure leaves the frontend unaffected; continue with local Studio until corrected.
- **CORS:** Additive exact-origin changes are preferred. Deletion occurs only after ownership review; record prior entries before approved changes.
- **Credentials:** If a Viewer token is suspected exposed, rotate it, update approved deployment scopes, rebuild, and confirm the old token no longer works.

## Decisions

### D1. Treat the migration as complete pending revalidation

- **Choice:** Validate the existing migrated dataset and do not seed it again.
- **Alternatives:** Rerun `content:migrate:write`; discard the dataset and import into a new one; manually recreate records.
- **Why:** Local write and validation reports already show the expected complete inventory. Another import adds asset duplication and content-overwrite risk without evidence of a defect.
- **Reversible:** Yes. The idempotent script remains available for a separately reviewed reconciliation.
- **Research:** Existing ignored migration reports, committed mapping/script behavior, and Sanity migration guidance requiring validation before cutover.

### D2. Netlify preview before production promotion

- **Choice:** Prove the connected stack on an exact-origin deploy preview, then promote only after review.
- **Alternatives:** Configure production directly; verify only locally; keep production in fixture mode.
- **Why:** Local verification cannot prove provider environment, server bundles, exact CORS, or deployed Draft Mode. Direct production configuration provides no safe review or rollback checkpoint.
- **Reversible:** High; the preview can be removed and the previous production deployment remains intact.
- **Research:** Existing `netlify.toml`, README deployment guidance, and project rule to deploy previews before launch.

### D3. Exact trusted origins, never Netlify wildcards

- **Choice:** Add credentialed CORS entries only for exact, retained origins.
- **Alternatives:** Trust `*.netlify.app`; trust every branch deploy; disable credentials.
- **Why:** Wildcards would let uncontrolled previews participate in an authenticated editorial flow. Draft Mode and Presentation require credentials on trusted origins.
- **Reversible:** High; exact origins can be added or removed after ownership review.
- **Research:** Installed Sanity CLI `cors add` contract and Sanity Next.js standalone-Studio guidance.

### D4. Draft-only Presentation test by default

- **Choice:** Use a reversible draft edit and discard it after verifying preview isolation/live updates.
- **Alternatives:** Publish and revert visible content; create permanent test documents; skip editorial verification.
- **Why:** A draft proves authentication, stega, overlays, document locations, Live Content, and published isolation without changing the public portfolio.
- **Reversible:** Yes; the draft is discarded.
- **Research:** Sanity Presentation/Visual Editing guidance and the project requirement that public visitors never receive drafts.

### D5. Sanity-hosted Studio only with an explicit hostname

- **Choice:** Deploy the existing standalone Studio to an approved explicit Sanity hostname when the user approves editor hosting.
- **Alternatives:** Accept an interactive generated hostname; embed Studio in Next.js; require local Studio forever.
- **Why:** The repository already uses the recommended standalone architecture. An explicit hostname prevents accidental external-resource naming and makes Presentation configuration reviewable.
- **Reversible:** High; local Studio continues to work and hosted Studio can be replaced.
- **Research:** Installed `sanity deploy` CLI contract and Sanity standalone-Studio guidance.

### D6. Remove and revoke the migration Editor token

- **Choice:** Retire the write credential after connected validation.
- **Alternatives:** Keep it indefinitely in `.env.local`; configure it in deployment; rotate but retain an unused Editor token.
- **Why:** The public runtime and Draft Mode need only Viewer access. Retaining write authority increases impact if a local machine or environment file is compromised.
- **Reversible:** A new temporary Editor token can be issued for a separately approved migration repair.
- **Research:** Least-privilege requirements in the approved CMS specification and current local environment key inventory.

### D7. Keep production failure explicit

- **Choice:** Production remains `CONTENT_SOURCE=sanity` with no automatic fixture failover.
- **Alternatives:** Fall back to fixtures on query/configuration failures; deploy fixtures permanently.
- **Why:** Fixtures may contain stale hours, event availability, or editorial details. An explicit unavailable state is safer than presenting stale mutable content as current.
- **Reversible:** High at configuration level, but silent failover remains intentionally prohibited.
- **Research:** Existing content adapter and approved Sanity CMS invariants.

### D8. No Netlify CLI dependency

- **Choice:** Use the provider’s approved UI/Git integration or an ephemeral authenticated CLI supplied by the operator; do not add `netlify-cli` to application dependencies.
- **Alternatives:** Commit Netlify CLI as a dev dependency; build custom deployment scripts.
- **Why:** Deployment tooling is operational and does not belong in the runtime dependency graph. The repository already defines the build contract through `netlify.toml`.
- **Reversible:** Yes; a pinned deployment tool can be added later if reproducible CI deployment becomes a requirement.
- **Research:** npm registry shows `netlify-cli` 27.1.2 currently requires Node `>=22.13`; no repository feature depends on it.

## Versions

Use the repository lockfile and installed tools for verification:

| Tool/runtime | Verified version | Role |
| --- | --- | --- |
| Node.js | local `24.19.0`; CI 22.x | Local operations and CI; Sanity requires Node `>=22.12` |
| pnpm | `10.32.1` | Package and script runner |
| Next.js | `16.3.1` | Frontend production build/runtime |
| `next-sanity` | `13.3.3` | Live Content, Draft Mode, Visual Editing |
| `@sanity/client` | `7.26.2` | Connected validation/runtime client |
| Sanity Studio/CLI | installed `6.9.2` | Schema, document validation, Studio build/deploy |
| `@sanity/vision` | installed `6.9.2` | Authenticated Studio query inspection |
| Netlify CLI | latest researched `27.1.2`, not installed | Optional ephemeral operator tool only |

Do not upgrade dependencies as part of connected activation. Sanity `6.10.1` is available, but changing tool versions while validating deployment would mix upgrade risk with configuration risk.

## Invariants

1. No secret, project identifier, provider state, or environment file is committed or exposed to browser JavaScript.
2. Production reads published Sanity content only; drafts require an authorized Draft Mode session.
3. Production never silently falls back to local menu/event fixtures.
4. The migration write command is not run as part of this feature.
5. The temporary Editor token is never deployed and is revoked after validation.
6. Only exact approved origins receive credentialed Sanity CORS access.
7. Untrusted deploy previews never receive the Viewer token.
8. Existing public URLs, approved responsive hierarchy, and event availability behavior remain unchanged.
9. Standard reservations, Private Dining, and Event RSVP remain non-networked portfolio previews and store no visitor data in Sanity.
10. Draft verification content is fictional, unpublished, and discarded after testing.
11. Connected validation must pass before deployment promotion.
12. A production promotion requires explicit Gate C approval.

## Error Behavior

- **Missing target/ownership information:** Stop and request the exact existing site/project/origin. Do not create a substitute.
- **Dataset validation failure:** Produce a sanitized mismatch summary and stop. Do not rerun migration write.
- **Schema deployment failure:** Keep existing schema active, make no Studio/frontend promotion, and report the CLI failure without environment values.
- **CORS 403:** Verify exact scheme/host/port and credentials flag. Do not weaken to a wildcard.
- **Draft Mode 401/403:** Verify Viewer role, token scope, CORS, and configured preview origin; do not expose token details.
- **Connected build configuration failure:** Fail the preview build with the existing actionable environment error; do not switch to fixtures.
- **CMS transport failure:** Show the specified unavailable behavior. Do not present an empty-events state or stale fixture RSVP controls.
- **Malformed individual record:** Exclude that record, preserve valid records, and record the sanitized server diagnostic.
- **Missing detail document:** Preserve the existing branded not-found route.
- **Studio deployment failure:** Continue with local Studio; public frontend remains unchanged.
- **Preview regression:** Do not promote. Remove/revert preview configuration and preserve the previous production deployment.
- **Draft cleanup failure:** Stop promotion until the temporary draft is discarded or explicitly reviewed.
- **Suspected secret exposure:** Rotate/revoke immediately, remove it from affected scopes, rebuild, and verify the old token is invalid.
- **Production smoke failure after promotion:** Roll back to the previous successful deployment, then investigate in a non-production preview.

## Testing strategy

### Local deterministic checks

Run before external changes:

- `git diff --check`
- `pnpm check`
- `pnpm test:e2e:run`
- verify generated Sanity artifacts remain unchanged after TypeGen

These continue to use fixture mode and prove repository determinism.

### Connected validation

With approved local secrets, run:

- `pnpm content:migrate:validate`
- `pnpm sanity:validate`
- `pnpm studio:build`
- a production frontend build with `CONTENT_SOURCE=sanity`
- representative mapper/source comparison without logging document content or IDs

Verify counts, references, assets, detail eligibility, and schema validation before deployment.

### Connected preview smoke tests

Against the exact Netlify preview origin:

1. Load every public route directly.
2. Navigate through Next.js links to Menus, Dinner, Events, and Harvest detail.
3. Verify CMS images and alt text.
4. Verify accepting and unavailable event presentations.
5. Exercise all three local demo workflows and confirm no submission XHR/fetch.
6. Check browser console, hydration, and failed network requests.
7. Inspect browser assets/configuration for token leakage.
8. Verify no page-level horizontal overflow at 320, 390, 768, 1024, and 1440px.
9. Verify keyboard navigation and 200% zoom on navigation, preview indicator, and affected content routes.

### Presentation tests

With Gate B approval:

1. Open deployed Studio Presentation.
2. Verify Draft Mode enable, visible indicator, and exit behavior.
3. Verify settings/menu/event locations and overlays.
4. Apply one draft-only fictional text edit.
5. Confirm live draft visibility in Presentation.
6. Confirm public published content is unchanged.
7. Confirm metadata, links, route logic, event states, and image helpers remain valid with stega.
8. Exit preview and discard the draft.
9. Reopen public and Presentation views to verify clean final state.

### Production promotion smoke

After Gate C approval:

- verify the deployed commit and environment;
- repeat the critical Menus and Events journeys;
- verify Draft Mode remains inaccessible without authorized Presentation context;
- confirm public content is published-only;
- confirm rollback to the prior deployment is available;
- record actual results in `docs/connected-sanity-launch/verification.md`.

## Acceptance criteria

1. The selected dataset passes migration and Sanity document validation with the expected inventory and no unresolved references.
2. The temporary Editor token is removed locally and revoked; deployment contains only the Viewer token.
3. Exact approved CORS origins are configured with credentials and no broad Netlify wildcard is present.
4. A connected Netlify preview builds and renders Sanity content without fixture fallback or secret leakage.
5. Every CMS-backed route, image, event state, and detail eligibility rule behaves as specified.
6. Presentation opens the deployed frontend, locations/overlays work, drafts update live, and public content remains unchanged.
7. The temporary draft is discarded and no test content remains.
8. Fixture CI and full project checks remain green.
9. A sanitized verification record documents what actually passed and what remains unverified.
10. Production is promoted only after explicit approval and retains a tested rollback path.

## Out of scope

- Rerunning the initial content migration write
- Creating a new Sanity project/dataset when the migrated target exists
- Editing or redesigning schemas, GROQ contracts, or frontend content models unless verification exposes a defect
- Publishing content solely for testing without separate approval
- Editorial rewriting, new events, new menus, or image replacement
- Storing reservation, Private Dining, RSVP, or customer data in Sanity
- Real Cal.com, email, persistence, spam protection, or rate limiting
- Custom DNS transfer, domain purchase, or DNS changes
- A generic menu-detail template beyond Dinner
- Localization, content releases, scheduled publishing, or experimentation
- Adding webhook revalidation unless Live Content is proven incompatible
- Adding Netlify CLI to the repository
- Full Lighthouse optimization, SEO expansion, analytics, monitoring, or final launch audit
- Committing provider state, migration reports, screenshots with editor identity, or environment files

## External inputs required before execution

- Confirmation of the existing Sanity project/dataset target and public-dataset intent
- Approved existing Netlify site or permission to create/link one
- Exact connected preview and production frontend origins
- Approved Sanity Studio hostname, if deploying Studio
- Permission to reconcile exact CORS entries
- Permission to deploy schema/Studio/frontend resources
- Permission for one reversible draft-only verification edit
- Separate approval before production promotion
