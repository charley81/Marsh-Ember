import type {StructureResolver} from 'sanity/structure'

const settingsId = 'siteSettings'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Restaurant settings')
        .id(settingsId)
        .child(S.document().schemaType('siteSettings').documentId(settingsId)),
      S.divider(),
      S.documentTypeListItem('menu').title('Menus'),
      S.documentTypeListItem('event').title('Events'),
      S.divider(),
      S.documentTypeListItem('dietaryMarker').title('Reference data · Dietary markers'),
    ])
