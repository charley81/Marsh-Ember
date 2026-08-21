# Marsh & Ember Content Studio

Sanity Studio for the fictional Marsh & Ember restaurant portfolio site.

- Local Studio: `http://localhost:3333`
- Local frontend: `http://localhost:3000`
- Hosted Studio: `https://marshandember.sanity.studio`
- Production frontend: `https://marshandember.netlify.app`

## Local setup

From the repository root:

```bash
cp studio/.env.example studio/.env.local
pnpm install
pnpm studio:dev
```

Set these values in `studio/.env.local`:

```dotenv
SANITY_STUDIO_PROJECT_ID=<project-id>
SANITY_STUDIO_DATASET=production
SANITY_STUDIO_PREVIEW_ORIGIN=http://localhost:3000
```

Run `pnpm dev` in a second terminal to use Presentation against the local frontend.

## Content areas

### Restaurant settings

The singleton Restaurant settings document controls shared restaurant details, including:

- name, descriptor, and tagline;
- address, map, telephone, and email values;
- event and Private Dining contact values;
- opening hours;
- generic social destinations;
- announcement content, link, dismissal version, and enabled state.

Increment the announcement dismissal version when an updated campaign should reappear for visitors who dismissed an earlier version.

### Menus

Menus contain structured sections and items, including prices, descriptions, display order, dietary markers, and optional media.

Dinner is the only initial menu with an approved full detail page. Brunch, Cocktails & Spirits, and Wine appear as landing-page previews unless an approved detail design and complete content model are added later. Do not mark an incomplete menu as detail-capable.

### Events

Events control the Events landing page and reusable event-detail template. Event availability is editorially controlled rather than inferred from the visitor's clock.

Supported states:

- accepting RSVP requests;
- RSVP closed;
- sold out;
- cancelled;
- past event.

Only events with complete detail content receive a public detail link. A successful RSVP preview never confirms attendance.

### Dietary markers

Dietary markers are reusable referenced records. Keep codes short and labels/descriptions clear. Menu labels are guidance, not allergen-free guarantees.

## Preview and publishing

Use Presentation to review draft content in the configured frontend origin.

1. Open Presentation in the Studio.
2. Navigate to a supported page or use a document location.
3. Confirm the frontend displays **Draft preview is on**.
4. Review overlays, links, responsive behavior, and content.
5. Publish only intentionally approved content.
6. Use **Exit preview** to return to published-only browsing.

Draft content is visible only through the authorized Draft Mode flow. Public visitors receive published content.

## Validation and generated types

After changing schemas or GROQ queries, run from the repository root:

```bash
pnpm sanity:typegen
pnpm sanity:validate
pnpm check
```

TypeGen updates both `studio/schema.json` and `sanity/types.generated.ts`. Commit both generated artifacts when they change. CI fails when generated artifacts drift.

## Initial migration

The migration commands are retained for repeatability, but remote writes require explicit approval and a temporary local Editor token.

```bash
pnpm content:migrate:dry-run
pnpm content:migrate:validate
```

Do not add `SANITY_API_WRITE_TOKEN` to Netlify or commit it. See `../migration/mappings.md` and the root `README.md` before any migration work.

## Fictional interaction boundary

The reservation, Private Dining, and event RSVP experiences are browser-only portfolio previews. They do not send, persist, email, or confirm visitor data. Sanity stores restaurant content only and must never be used for customer submissions.

## Deployment safety

- Keep frontend and Studio project IDs/datasets aligned.
- Keep `SANITY_STUDIO_PREVIEW_ORIGIN` on an explicitly approved origin.
- Use exact credentialed CORS origins; do not add a broad `*.netlify.app` wildcard.
- The frontend uses a server-only Viewer token for Draft Mode. Never expose it to browser code.
- Run the root quality and audit commands before deploying:

```bash
pnpm audit:prod
pnpm check
pnpm test:e2e:run
```
