import type {DetailEventRecord, EventAvailability, EventDetail, EventRecord} from '@/lib/events'
import {booleanValue, cleanText, image, record, records, text} from './common'

const dateFormatter = (timeZone: string) => new Intl.DateTimeFormat('en-US', {timeZone, month: 'long', day: 'numeric', year: 'numeric'})
const timeFormatter = (timeZone: string) => new Intl.DateTimeFormat('en-US', {timeZone, hour: 'numeric', minute: '2-digit'})

function formatTime(date: Date, timeZone: string) {
  return timeFormatter(timeZone).format(date).replace(':00', '').replace(/\s/g, ' ')
}

function compactRange(start: string, end: string) {
  const startPeriod = start.match(/ (AM|PM)$/)?.[1]
  const endPeriod = end.match(/ (AM|PM)$/)?.[1]
  return startPeriod && startPeriod === endPeriod ? `${start.replace(` ${startPeriod}`, '')}–${end}` : `${start}–${end}`
}

export function formatEventSchedule(input: {startsAt: string; endsAt: string; timeZone: string; location: string; approximateEnd: boolean}) {
  const start = new Date(input.startsAt)
  const end = new Date(input.endsAt)
  if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) return null
  try {
    const date = dateFormatter(input.timeZone).format(start)
    const startTime = formatTime(start, input.timeZone)
    const endTime = formatTime(end, input.timeZone)
    const time = input.approximateEnd ? startTime : compactRange(startTime, endTime)
    const scheduleEnd = input.approximateEnd ? `${startTime} – Approximately ${endTime}` : compactRange(startTime, endTime)
    return {date, time, schedule: `${date} · ${scheduleEnd} · ${input.location}`}
  } catch {
    return null
  }
}

function mapAvailability(statusValue: unknown, acceptingLabelValue: unknown): EventAvailability | null {
  const status = cleanText(statusValue)
  if (status === 'accepting') {
    const label = cleanText(acceptingLabelValue)
    if (label === 'open') return {state: 'accepting', label: 'RSVP Open'}
    if (label === 'limited') return {state: 'accepting', label: 'Limited Availability'}
    return null
  }
  if (status === 'closed' || status === 'cancelled' || status === 'past') return {state: status}
  if (status === 'soldOut') return {state: 'sold-out'}
  return null
}

function mapDetail(source: Record<string, unknown>): EventDetail | undefined {
  const hero = image(source.heroImage)
  const introTitle = text(source.introTitle)
  const paragraphs = Array.isArray(source.introParagraphs) ? source.introParagraphs.map(text).filter((item): item is string => Boolean(item)) : []
  const introImages = records(source.introImages).map((item) => image(item)).filter((item): item is NonNullable<ReturnType<typeof image>> => item !== null)
  const facts = records(source.facts).flatMap((item) => {
    const label = text(item.label)
    const value = text(item.value)
    return label && value ? [{label, value}] : []
  })
  const expectations = records(source.expectations).flatMap((item) => {
    const title = text(item.title)
    const copy = text(item.copy)
    return title && copy ? [{title, copy}] : []
  })
  const courses = records(source.courses).flatMap((item) => {
    const name = text(item.name)
    const description = text(item.description)
    if (!name || !description) return []
    const tags = records(item.dietaryMarkers).map((marker) => cleanText(marker.code)).filter((code): code is string => Boolean(code))
    return [{name, description, tags: tags.length ? tags : undefined}]
  })

  if (!hero || !introTitle || !paragraphs.length || !introImages.length || !facts.length || !expectations.length || !courses.length) return undefined
  return {
    heroImage: hero.src,
    heroAlt: hero.alt,
    availabilityNote: text(source.availabilityNote) ?? undefined,
    facts,
    intro: {title: introTitle, paragraphs, images: introImages},
    expectations,
    courses,
  }
}

export function mapEvent(value: unknown): EventRecord | null {
  const source = record(value)
  const slug = cleanText(source?.slug)
  const title = text(source?.title)
  const summary = text(source?.summary)
  const format = text(source?.format)
  const startsAt = cleanText(source?.startsAt)
  const endsAt = cleanText(source?.endsAt)
  const timeZone = cleanText(source?.timeZone)
  const location = text(source?.location)
  const listingImage = image(source?.listingImage)
  const availability = mapAvailability(source?.status, source?.acceptingLabel)
  if (!source || !slug || !title || !summary || !format || !startsAt || !endsAt || !timeZone || !location || !listingImage || !availability) return null

  const formatted = formatEventSchedule({startsAt, endsAt, timeZone, location, approximateEnd: booleanValue(source.approximateEnd)})
  if (!formatted) return null
  const detail = mapDetail(source)

  return {slug, title, summary, listingImage, startsAt, endsAt, ...formatted, location, format, availability, detail}
}

export function mapEvents(value: unknown): EventRecord[] {
  return Array.isArray(value) ? value.map(mapEvent).filter((event): event is EventRecord => event !== null) : []
}

export function mapDetailEvent(value: unknown): DetailEventRecord | null {
  const event = mapEvent(value)
  return event?.detail ? event as DetailEventRecord : null
}
