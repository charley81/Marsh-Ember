import {defineQuery} from 'next-sanity'

export const DIETARY_MARKERS_QUERY = defineQuery(`
  *[_type == "dietaryMarker"] | order(code asc){code, label, detail}
`)
