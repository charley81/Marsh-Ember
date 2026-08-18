import type {MenuItemRecord, MenuRecord, MenuSectionRecord} from '@/lib/content-types'
import {booleanValue, cleanText, image, numberValue, record, records, text} from './common'

const categories = new Set<MenuRecord['category']>(['dinner', 'brunch', 'spirits', 'wine'])

function mapItem(value: unknown): MenuItemRecord | null {
  const source = record(value)
  const name = text(source?.name)
  const description = text(source?.description)
  if (!name || !description) return null

  const dietaryTags = records(source?.dietaryMarkers).map((marker) => cleanText(marker.code)).filter((code): code is string => Boolean(code))
  const editorialTag = cleanText(source?.editorialTag)
  const tags = [...(editorialTag ? [editorialTag] : []), ...dietaryTags]

  return {name, description, price: text(source?.price) ?? undefined, tags: tags.length ? tags : undefined, featuredOnLanding: booleanValue(source?.featuredOnLanding)}
}

function mapSection(value: unknown): MenuSectionRecord | null {
  const source = record(value)
  const id = cleanText(source?.anchor)
  const title = text(source?.title)
  if (!id || !title) return null
  const items = records(source?.items).map(mapItem).filter((item): item is MenuItemRecord => item !== null)
  if (!items.length) return null
  return {id, title, items, image: image(source?.image) ?? undefined}
}

export function mapMenu(value: unknown): MenuRecord | null {
  const source = record(value)
  const slug = cleanText(source?.slug)
  const title = text(source?.title)
  const category = cleanText(source?.category)
  const summary = text(source?.summary)
  const displayOrder = numberValue(source?.displayOrder)
  if (!slug || !title || !category || !categories.has(category as MenuRecord['category']) || !summary || displayOrder === null) return null

  const sections = records(source?.sections).map(mapSection).filter((section): section is MenuSectionRecord => section !== null)
  const hasDetailPage = booleanValue(source?.hasDetailPage)
  if (hasDetailPage && !sections.length) return null

  return {
    slug,
    title,
    category: category as MenuRecord['category'],
    summary,
    service: text(source?.service) ?? undefined,
    displayOrder,
    hasDetailPage,
    updatedAt: cleanText(source?.updatedAt) ?? undefined,
    listingImage: image(source?.listingImage) ?? undefined,
    detailImage: image(source?.detailImage) ?? undefined,
    sections,
  }
}

export function mapMenus(value: unknown): MenuRecord[] {
  return Array.isArray(value)
    ? value.map(mapMenu).filter((menu): menu is MenuRecord => menu !== null).sort((a, b) => a.displayOrder - b.displayOrder || a.title.localeCompare(b.title))
    : []
}
