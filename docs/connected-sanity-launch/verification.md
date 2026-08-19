# Connected Sanity launch verification

**Status:** Gate B in progress — connected preview deployment and draft-only verification underway  
**Verified application base commit:** `26c7a9616c75fd7d09a7de26bfd039ec2f45f6db`  
**Date:** 2026-08-19  
**Environment:** Local fixture and local connected production builds  
**Approved existing Netlify site and production origin:** `https://marshandember.netlify.app`  
**Approved retained connected-preview origin:** `https://feat-connected-sanity-launch--marshandember.netlify.app`  
**Approved Sanity Studio origin:** `https://marshandember.sanity.studio`

## Scope completed

Phase 0 local and read-only preflight is complete. With Gate A approval, the registered `default` schema was deployed, the missing exact preview CORS origin was added with credentials, and the Studio was deployed to its approved hostname. The operator confirmed that the four required variables were configured only for the approved Netlify branch context. No content or production deployment mutation has been performed.

The frontend and Studio environment files resolved to the same configured Sanity target without exposing identifiers. The operator confirmed that this is the account-owned public production dataset and that the read credential is Viewer-only. The configured content source was Sanity, the local migration write-token key was removed after connected validation, and the operator confirmed that the temporary Editor credential was revoked in Sanity Manage.

The branch was `main`, and the verified commit matched `origin/main` after a fetch. The initial working tree also contained the untracked launch specification and a generated-types formatting change, so the specification's clean-tree starting condition was not strictly met. TypeGen restored the generated artifact to its committed deterministic form.

## Checks run

| Check | Result |
| --- | --- |
| `git fetch origin` and commit comparison | Pass — local commit matched `origin/main` |
| Safe frontend/Studio target comparison | Pass — configured targets matched |
| `CONTENT_SOURCE=fixtures pnpm check` | Pass |
| TypeGen artifact comparison | Pass after regeneration — committed artifact is deterministic |
| `git diff --check` | Pass |
| `CONTENT_SOURCE=fixtures pnpm test:e2e:run` | Pass — 18 tests |
| `pnpm content:migrate:validate` | Pass — expected counts and zero reported issues |
| `pnpm sanity:validate` | Pass |
| `pnpm studio:build` | Pass |
| `CONTENT_SOURCE=sanity pnpm build` | Pass |
| Exact read-token scan of `.next/static` browser assets | Pass — 31 files inspected, no match |
| Read-only Sanity CORS listing | Pass — four initial entries, localhost present, no wildcard observed |
| `sanity schemas deploy --workspace default` | Pass |
| Approved-origin CORS reconciliation | Pass — localhost, retained preview, and production are exact and credentialed; two unrelated existing entries were retained |
| Studio deployment dry run with required schema | Pass |
| Studio deployment to `https://marshandember.sanity.studio` | Pass — HTTP 200 after deployment |
| Post-deployment TypeGen regeneration | Pass — generated artifacts returned to their committed deterministic form |
| Netlify local-link discovery | No linked `.netlify` state found |
| Branch-scoped Netlify variables | Operator-confirmed — four required variables; no write token; production unchanged |
| Representative fixture/mapped-output comparison | Deferred — the temporary standalone comparison could not load the framework `server-only` boundary; no product code was changed |

Raw command output was kept outside the repository and is not part of this record.

## Published inventory

Connected validation reported:

- 1 restaurant settings document;
- 3 dietary markers;
- 4 menus;
- 4 events;
- exactly 1 detail-capable event (`harvest-at-the-hearth`);
- no duplicate marker codes, menu slugs, or event slugs;
- no unresolved references;
- no reported image-alt or event-detail completeness issues.

The ignored completed migration report records 12 migrated assets and exactly one menu detail route (`dinner`). These reports remain ignored and are not committed.

## External verification pending

The following checks require Gate A and Gate B inputs and were not performed:

- determine the existing Netlify site's provider-side deployment and rollback state;
- commit and push the verified branch to trigger the connected Netlify preview;
- deploy and verify the connected Netlify preview;
- verify public routes, client transitions, responsive layouts, console/network behavior, and token absence on a deployed origin;
- verify Presentation locations, overlays, Draft Mode enable/exit, draft isolation, and cleanup using an approved draft-only edit;
- exercise published Live Content invalidation;
- promote to production or perform production smoke tests.

The operator approved the existing Netlify site and production origin at `https://marshandember.netlify.app`, plus the retained branch-preview origin at `https://feat-connected-sanity-launch--marshandember.netlify.app`. No external rollback target exists in local repository state; before promotion, the provider's previous successful production deployment must be recorded as the rollback target.

## Gate A inputs required

Execution is paused pending explicit approval of:

1. commit/push and connected preview deployment;
2. one harmless fictional draft-only edit for Gate B verification.

Production promotion remains a separate Gate C approval after preview evidence review.
