# Initial content migration mapping

The source is the committed fixture boundary in `lib/content-fixtures.ts`, `lib/site-data.ts`, and the approved local images under `public/images/`.

| Source | Sanity target | Identity / relationships |
| --- | --- | --- |
| `restaurant` and announcement | `siteSettings` singleton | Fixed ID `siteSettings`; featured event patched after event upsert. |
| `dietaryMarkers` | `dietaryMarker` documents | Located by `sourceKey=fixture:dietary:<code>`; referenced by menu items and event courses. |
| `fixtureMenus` | `menu` documents | Located by `sourceKey=fixture:menu:<slug>`; sections/items remain embedded with stable keys. |
| `events` | `event` documents | Located by `sourceKey=fixture:event:<slug>`; facts, intro, expectations, and courses remain embedded. |
| Local image paths | Sanity image assets | Upload the original file once, then write an owning `editorialImage` field with contextual alt text. |

## Judgment calls

- Menu-item tags matching a dietary marker code become references. Other tags, currently `Hearth-Baked`, remain an editorial label.
- Existing display dates are transformed to explicit `America/New_York` datetimes. The event status remains explicit and is not derived from those dates.
- Harvest is the initial featured event and the only event with complete detail content.
- Dinner is the only initial menu with an approved detail page.
- Local mobile-specific crops remain static presentation fallbacks. Sanity desktop/original images use hotspot/crop for new editorial selection.

## Write order

1. Upload/deduplicate assets.
2. Upsert dietary markers and retain their IDs.
3. Upsert menus with marker references.
4. Upsert events with marker references.
5. Replace the `siteSettings` singleton with the featured-event reference.
6. Validate counts, references, required detail fields, and public mappers.

`pnpm content:migrate:dry-run` performs no remote calls or writes. `pnpm content:migrate:write` requires `SANITY_API_WRITE_TOKEN` and explicit human approval.
