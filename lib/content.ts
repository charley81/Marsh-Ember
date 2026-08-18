import 'server-only'
import {stegaClean} from 'next-sanity'
import type {DietaryMarker, MenuRecord, RestaurantSettings} from './content-types'
import type {DetailEventRecord, EventRecord} from './events'
import {fixtureContent, fixtureMenus, fixtureSettings} from './content-fixtures'
import {getContentSource} from './content-source'

function warnDropped(type: string, source: unknown, mappedCount: number) {
  const sourceCount = Array.isArray(source) ? source.length : 0
  if (sourceCount > mappedCount) console.error(`[content] Excluded ${sourceCount - mappedCount} invalid ${type} record(s)`) // No document content or secrets.
  if (sourceCount > 0 && mappedCount === 0) throw new Error(`No valid ${type} content is available`)
}

export async function getSiteSettings(): Promise<RestaurantSettings> {
  if (getContentSource() === 'fixtures') return fixtureSettings
  try {
    const [{sanityFetch}, {SITE_SETTINGS_QUERY}, {mapSiteSettings}] = await Promise.all([
      import('@/sanity/live'), import('@/sanity/queries'), import('@/sanity/mappers'),
    ])
    const {data} = await sanityFetch({query: SITE_SETTINGS_QUERY})
    const settings = mapSiteSettings(data)
    if (!settings) throw new Error('Restaurant settings are missing or invalid')
    return settings
  } catch (error) {
    console.error('[content] Restaurant settings unavailable; using operational shell fallback', error instanceof Error ? error.message : 'Unknown error')
    return fixtureSettings
  }
}

export async function getMenus(): Promise<MenuRecord[]> {
  if (getContentSource() === 'fixtures') return [...fixtureMenus]
  const [{sanityFetch}, {MENU_LIST_QUERY}, {mapMenus}] = await Promise.all([
    import('@/sanity/live'), import('@/sanity/queries'), import('@/sanity/mappers'),
  ])
  const {data} = await sanityFetch({query: MENU_LIST_QUERY})
  const menus = mapMenus(data)
  warnDropped('menu', data, menus.length)
  if (!menus.length) throw new Error('No published menu content is available')
  return menus
}

export async function getMenuBySlug(slug: string): Promise<MenuRecord | null> {
  if (getContentSource() === 'fixtures') return fixtureMenus.find((menu) => menu.slug === slug) ?? null
  const [{sanityFetch}, {MENU_BY_SLUG_QUERY}, {mapMenu}] = await Promise.all([
    import('@/sanity/live'), import('@/sanity/queries'), import('@/sanity/mappers'),
  ])
  const {data} = await sanityFetch({query: MENU_BY_SLUG_QUERY, params: {slug}})
  return mapMenu(data)
}

export async function getDietaryMarkers(): Promise<DietaryMarker[]> {
  if (getContentSource() === 'fixtures') return [...fixtureContent.dietaryMarkers]
  const [{sanityFetch}, {DIETARY_MARKERS_QUERY}] = await Promise.all([
    import('@/sanity/live'), import('@/sanity/queries'),
  ])
  const {data} = await sanityFetch({query: DIETARY_MARKERS_QUERY})
  if (!Array.isArray(data)) return []
  return data.flatMap((value) => {
    if (!value || typeof value !== 'object') return []
    const item = value as Record<string, unknown>
    return typeof item.code === 'string' && typeof item.label === 'string' && typeof item.detail === 'string'
      ? [{code: stegaClean(item.code), label: stegaClean(item.label), detail: stegaClean(item.detail)}]
      : []
  })
}

export async function getEvents(): Promise<EventRecord[]> {
  if (getContentSource() === 'fixtures') return [...fixtureContent.events]
  const [{sanityFetch}, {EVENT_LIST_QUERY, SITE_SETTINGS_QUERY}, {mapEvents}] = await Promise.all([
    import('@/sanity/live'), import('@/sanity/queries'), import('@/sanity/mappers'),
  ])
  const [{data}, {data: settings}] = await Promise.all([
    sanityFetch({query: EVENT_LIST_QUERY}),
    sanityFetch({query: SITE_SETTINGS_QUERY, stega: false}),
  ])
  const events = mapEvents(data)
  warnDropped('event', data, events.length)
  const featuredSlug = settings && typeof settings === 'object' && 'featuredEventSlug' in settings
    ? (settings as {featuredEventSlug?: unknown}).featuredEventSlug
    : undefined
  if (typeof featuredSlug !== 'string') return events
  const featuredIndex = events.findIndex((event) => event.slug === featuredSlug)
  if (featuredIndex <= 0) return events
  return [events[featuredIndex], ...events.slice(0, featuredIndex), ...events.slice(featuredIndex + 1)]
}

export async function getEventBySlug(slug: string): Promise<DetailEventRecord | null> {
  if (getContentSource() === 'fixtures') {
    const event = fixtureContent.events.find((candidate) => candidate.slug === slug)
    return event?.detail ? event as DetailEventRecord : null
  }
  const [{sanityFetch}, {EVENT_BY_SLUG_QUERY}, {mapDetailEvent}] = await Promise.all([
    import('@/sanity/live'), import('@/sanity/queries'), import('@/sanity/mappers'),
  ])
  const {data} = await sanityFetch({query: EVENT_BY_SLUG_QUERY, params: {slug}})
  return mapDetailEvent(data)
}

export async function getDetailEventSlugs(): Promise<string[]> {
  if (getContentSource() === 'fixtures') return fixtureContent.events.filter((event) => event.detail).map((event) => event.slug)
  const [{client}, {EVENT_DETAIL_SLUGS_QUERY}] = await Promise.all([
    import('@/sanity/client'), import('@/sanity/queries'),
  ])
  const data = await client.fetch(EVENT_DETAIL_SLUGS_QUERY)
  return Array.isArray(data) ? data.flatMap((item) => item?.slug && typeof item.slug === 'string' ? [item.slug] : []) : []
}
