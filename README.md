# Marsh & Ember

Production website and content studio for the Marsh & Ember restaurant concept.

## Requirements

- Node.js 22.12 or newer
- pnpm 10.32.1
- A Sanity project and public `production` dataset for connected content

## Local setup

```bash
pnpm install
cp .env.example .env.local
cp studio/.env.example studio/.env.local
```

Use `CONTENT_SOURCE=fixtures` for credential-free development and CI. Use `CONTENT_SOURCE=sanity` with the public project ID/dataset and a server-only Viewer token for connected content and Draft Mode. Never commit `.env.local` files.

```bash
pnpm dev          # Next.js at http://localhost:3000
pnpm studio:dev   # Sanity Studio at http://localhost:3333
```

The Studio uses `SANITY_STUDIO_PREVIEW_ORIGIN` to open the frontend in Presentation.

## Content workflow

Schemas live in `studio/schemaTypes/`. GROQ queries, mappers, and generated types live in `sanity/`.

After changing a schema or query:

```bash
pnpm sanity:typegen
```

This extracts `studio/schema.json` and regenerates `sanity/types.generated.ts`; both are committed. Validate connected documents with:

```bash
pnpm sanity:validate
```

The Studio desk groups Restaurant settings, Menus, Events, and Dietary markers. Restaurant settings is a singleton. Published content is delivered through the Sanity Live Content API. Drafts are available only through the protected Presentation/Draft Mode flow.

## Initial content migration

Review `migration/mappings.md` first. The default command performs no remote writes:

```bash
pnpm content:migrate:dry-run
```

It writes an ignored report to `migration/reports/dry-run.json`. After reviewing that report, add a local-only `SANITY_API_WRITE_TOKEN` with Editor access and obtain explicit approval before running:

```bash
pnpm content:migrate:write
```

The migration uploads source assets and upserts fixture-owned records by `sourceKey`. After an approved write, run `pnpm content:migrate:validate` and `pnpm sanity:validate`. Never put the write token in Netlify; revoke it after the initial import if no longer needed.

## Sanity and Netlify configuration

Frontend variables:

- `CONTENT_SOURCE=sanity`
- `NEXT_PUBLIC_SANITY_PROJECT_ID` (public)
- `NEXT_PUBLIC_SANITY_DATASET=production` (public)
- `SANITY_API_READ_TOKEN` (secret Viewer token, server-only)

Studio variables:

- `SANITY_STUDIO_PROJECT_ID`
- `SANITY_STUDIO_DATASET=production`
- `SANITY_STUDIO_PREVIEW_ORIGIN` (exact frontend origin)

The hosted Studio is `https://marshandember.sanity.studio`, and the approved production frontend origin is `https://marshandember.netlify.app`. The visual-editing Studio URL in `sanity/env.ts` must remain aligned with the hosted Studio origin. Verify changes through an exact retained preview origin before updating the deployed Studio preview origin or promoting production.

In Sanity Manage, add `http://localhost:3000`, the production frontend origin, and any explicitly trusted preview origin to API CORS origins with credentials enabled. Do not use a broad `*.netlify.app` origin.

Netlify production and trusted deploy previews need the frontend variables above. The write token is never a deployment variable. `netlify.toml` excludes only `.next/cache/**` from secret scanning because Turbopack may cache the server-only Viewer token there; source, server output, and browser assets remain scanned. CI intentionally uses fixture mode and needs no production credential.

## Quality checks

```bash
pnpm audit:prod
pnpm check
pnpm test:e2e:run
```

`pnpm audit:prod` fails on known high-severity production dependency findings. `pnpm check` runs lint, schema extraction/TypeGen, type checking, unit tests, the Studio build, and the Next.js production build. The Playwright suite covers critical visitor journeys, internal destinations and fragments, responsive desktop/mobile behavior, and automated WCAG A/AA checks for every public route and key interaction states.

The public route set includes Home, Menus, Dinner, Visit, Our Story, Private Dining, Events, the reusable event detail, Privacy, and Accessibility. Reservation, inquiry, and RSVP experiences remain intentionally local, no-I/O portfolio previews.
