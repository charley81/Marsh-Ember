# Connected Sanity launch verification

- **Status:** Gate C in progress — production environment and Studio target configured; PR and production promotion pending
- **Verified connected-preview application commit:** `621c0d416ffbb25bc81a12501f7fdc0c7af1bbdc`
- **Application base commit:** `26c7a9616c75fd7d09a7de26bfd039ec2f45f6db`
- **Date:** 2026-08-19
- **Environment:** Local fixture checks, local connected builds, retained Netlify branch preview, and hosted Sanity Studio
- **Approved production origin:** `https://marshandember.netlify.app`
- **Approved retained connected-preview origin:** `https://feat-connected-sanity-launch--marshandember.netlify.app`
- **Approved Sanity Studio origin:** `https://marshandember.sanity.studio`

## Scope completed

Phases 0–2 and Gates A–B are complete. Gate C was explicitly approved. Production-scoped Netlify variables are configured and the hosted Studio now targets the approved production origin, but the frontend production deployment has not yet been promoted. No published content was changed.

The frontend and Studio resolve to the same operator-confirmed, account-owned public production dataset. The deployed read credential is Viewer-only. The temporary migration Editor credential was removed locally and the operator confirmed its revocation in Sanity Manage.

With Gate A approval:

- the registered `default` schema was deployed;
- exact credentialed CORS origins were confirmed for localhost, the retained preview, and production;
- two unrelated existing CORS entries were retained without modification;
- Studio's preview origin was set to the retained branch preview;
- the Studio deployment dry run passed;
- Studio was deployed to its approved hostname with auto-updates disabled;
- the operator configured the four required variables only for the approved Netlify branch context.

With Gate B approval, the branch was committed and pushed, Netlify produced the retained connected preview, and Presentation/Draft Mode verification was completed with a reversible draft-only edit.

The initial preflight started on `main` because the specification required synchronization with `origin/main`. The working tree contained the untracked specification and a generated-types formatting change, so the clean-tree starting condition was not strictly met. Work was moved to `feat/connected-sanity-launch` before commits, and TypeGen restored the generated artifact to its committed deterministic form.

## Checks run

| Check | Result |
| --- | --- |
| `git fetch origin` and commit comparison | Pass — application base matched `origin/main` |
| Safe frontend/Studio target comparison | Pass — configured targets matched |
| `CONTENT_SOURCE=fixtures pnpm check` | Pass |
| TypeGen artifact comparison | Pass — committed artifacts deterministic |
| `git diff --check` | Pass |
| `CONTENT_SOURCE=fixtures pnpm test:e2e:run` | Pass — 18 tests |
| `pnpm content:migrate:validate` | Pass — expected counts and zero reported issues |
| `pnpm sanity:validate` | Pass |
| `pnpm studio:build` | Pass |
| `CONTENT_SOURCE=sanity pnpm build` | Pass, including after both connected fixes |
| Unit suite after connected fixes | Pass — 86 tests, including the Studio URL regression test |
| Exact read-token scan of local `.next/static` browser assets | Pass — 31 files inspected, no match |
| `sanity schemas deploy --workspace default` | Pass |
| Approved-origin CORS reconciliation | Pass — three exact approved origins are credentialed; no wildcard |
| Studio deployment dry run with required schema | Pass |
| Hosted Studio reachability | Pass — HTTP 200 |
| Branch-scoped Netlify variables | Operator-confirmed — four required variables; no write token |
| Production-scoped Netlify variables | Operator-confirmed — four required variables with current Viewer token; no write token |
| Production-target Studio build, dry run, and deployment | Pass — hosted Studio remained reachable with HTTP 200 |
| Connected preview direct routes | Pass — all 8 public routes returned HTTP 200 |
| Connected preview client transitions | Pass — Menus, Dinner, Events, and Harvest navigation |
| Connected preview browser diagnostics | Pass — zero console errors, page errors, and failed requests during automated smoke |
| Responsive overflow | Pass — 320, 390, 768, 1024, and 1440px |
| Browser-visible Viewer token scan | Pass |
| Draft Mode authorization | Pass — unauthorized request returned 401; valid Presentation request redirected with 307 |
| Draft indicator and POST Exit preview | Pass |
| Draft/Stega route behavior | Pass — five representative draft routes, clean links, and metadata after the metadata fix |
| Presentation overlays | Pass — settings, Dinner, and Harvest opened the correct documents |
| Draft isolation | Pass — fictional tagline suffix appeared in Presentation and not in the public preview |
| Draft cleanup | Pass — operator used Discard; verification text count is zero and published content is restored |

Raw command output was kept outside the repository and is not part of this record.

## Published inventory

Connected validation and read-only inventory queries reported:

- 1 restaurant settings document;
- 3 dietary markers;
- 4 menus;
- 4 events;
- 12 image assets;
- exactly 1 detail-capable menu (`dinner`);
- exactly 1 detail-capable event (`harvest-at-the-hearth`);
- event statuses in the connected dataset: 4 accepting, 0 closed, 0 sold out, 0 cancelled, and 0 past;
- no duplicate marker codes, menu slugs, or event slugs;
- no unresolved references;
- no reported image-alt or event-detail completeness issues.

The ignored migration reports remain ignored and are not committed.

## Defects found and resolved

### Netlify Viewer credential mismatch

Presentation initially returned HTTP 500 because the branch runtime held an outdated Viewer token. A temporary sanitized diagnostic confirmed that the token was present and well-formed but rejected by Sanity. The operator replaced it with the current Viewer token, after which the runtime access check passed and authenticated Draft Mode returned its expected redirect. The diagnostic endpoint was removed immediately.

### Missing visual-editing stega configuration

Draft Mode loaded, but overlays had no targets because the frontend Sanity client did not define `stega.studioUrl`. The client now uses the approved hosted Studio URL, and a focused regression test protects this configuration. Deployed draft HTML was confirmed to contain stega metadata before overlay verification was repeated.

### Stega in event metadata

Connected draft-route verification found stega characters in Harvest detail metadata. Event metadata now fetches with `stega: false`. The deployed title was rechecked and is clean while body content retains overlay metadata.

## Presentation evidence

- Presentation loads the retained Netlify preview from the hosted Studio.
- The visible “Draft preview is on” indicator appears.
- The POST-based “Exit preview” control clears the Draft Mode cookie and indicator.
- Settings, Dinner, and Harvest overlays target the correct documents.
- The configured location resolver maps settings to Home, Dinner to Menus and its detail route, and Harvest to Events and its detail route. Overlay document targeting was manually verified; the location-label list was verified from the deployed resolver configuration rather than separately recorded from the Studio UI.
- A harmless fictional tagline suffix appeared live in Presentation.
- The suffix did not appear in a separate public preview session.
- The operator discarded the edit, the original tagline returned, and no verification text remains.

## Limitations and deferred checks

- Published Live Content invalidation was not exercised because no published content mutation was approved.
- The connected dataset currently contains only accepting events. Closed, sold-out, cancelled, past, empty-result, and transport-failure behavior remains covered by deterministic tests rather than live connected records.
- The representative standalone mapper-comparison script could not load the framework `server-only` boundary. Connected validation, inventory queries, rendered route checks, and the completed deterministic migration reports were used instead.
- A full accessibility, screen-reader, and Lighthouse launch audit remains out of scope for this slice.
- The operator confirmed that the currently published Netlify deployment remains available through the provider's rollback/publish-deploy action.

## Rollback

- **Dataset:** No migration write or published mutation occurred. The temporary draft edit was discarded.
- **Frontend preview:** Remove or stop the retained branch deploy if necessary.
- **Studio:** The frontend remains independent; local Studio is the fallback.
- **CORS:** Changes were additive. Existing unrelated origins were retained.
- **Credentials:** The old migration credential is revoked. If the Viewer token is suspected exposed, rotate it, update approved scopes, and redeploy.
- **Production:** No promotion has occurred. The operator confirmed the currently successful production deployment is available as the immediate rollback target.

## Gate C progress

Gate C was explicitly approved. Production-scoped environment configuration and the production-target Studio redeployment are complete. Remaining work is to review and merge the branch PR, allow Netlify to build production, run production smoke and Draft Mode checks, and roll back immediately if those checks fail. Gate C does not authorize content publication.
