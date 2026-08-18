import {defineQuery} from 'next-sanity'

const eventFields = `
  _id,
  title,
  "slug": slug.current,
  summary,
  format,
  startsAt,
  endsAt,
  approximateEnd,
  timeZone,
  location,
  status,
  acceptingLabel,
  listingImage{asset, crop, hotspot, alt},
  heroImage{asset, crop, hotspot, alt},
  availabilityNote,
  facts[]{_key, label, value},
  introTitle,
  introParagraphs,
  introImages[]{_key, asset, crop, hotspot, alt},
  expectations[]{_key, title, copy},
  courses[]{
    _key,
    name,
    description,
    dietaryMarkers[]->{code, label}
  }
`

export const EVENT_LIST_QUERY = defineQuery(`
  *[_type == "event" && defined(slug.current) && status != "past"] | order(startsAt asc){
    ${eventFields}
  }
`)

export const EVENT_BY_SLUG_QUERY = defineQuery(`
  *[_type == "event" && slug.current == $slug][0]{
    ${eventFields}
  }
`)

export const EVENT_DETAIL_SLUGS_QUERY = defineQuery(`
  *[_type == "event" && defined(slug.current) && defined(heroImage.asset)] | order(startsAt asc){
    "slug": slug.current
  }
`)
