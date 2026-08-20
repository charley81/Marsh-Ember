import type {MetadataRoute} from 'next'
import {getDetailEventSlugs} from '@/lib/content'
import {absoluteUrl} from '@/lib/seo'

const staticRoutes = ['/', '/menus', '/menus/dinner', '/visit', '/our-story', '/private-dining', '/events'] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const eventSlugs = await getDetailEventSlugs()

  return [
    ...staticRoutes.map((path) => ({url: absoluteUrl(path)})),
    ...eventSlugs.map((slug) => ({url: absoluteUrl(`/events/${slug}`)})),
  ]
}
