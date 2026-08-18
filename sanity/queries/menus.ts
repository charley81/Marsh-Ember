import {defineQuery} from 'next-sanity'

const menuFields = `
  _id,
  title,
  "slug": slug.current,
  category,
  summary,
  service,
  displayOrder,
  hasDetailPage,
  updatedAt,
  listingImage{asset, crop, hotspot, alt},
  detailImage{asset, crop, hotspot, alt},
  sections[]{
    _key,
    title,
    anchor,
    image{asset, crop, hotspot, alt},
    items[]{
      _key,
      name,
      price,
      description,
      editorialTag,
      featuredOnLanding,
      dietaryMarkers[]->{code, label}
    }
  }
`

export const MENU_LIST_QUERY = defineQuery(`
  *[_type == "menu" && defined(slug.current)] | order(displayOrder asc, title asc){
    ${menuFields}
  }
`)

export const MENU_BY_SLUG_QUERY = defineQuery(`
  *[_type == "menu" && slug.current == $slug][0]{
    ${menuFields}
  }
`)
