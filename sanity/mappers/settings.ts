import type {RestaurantSettings} from '@/lib/content-types'
import {cleanText, record, records, text} from './common'

export function mapSiteSettings(value: unknown): RestaurantSettings | null {
  const source = record(value)
  if (!source) return null
  const address = record(source.address)
  const name = text(source?.name)
  const descriptor = text(source?.descriptor)
  const tagline = text(source?.tagline)
  const street = text(address?.street)
  const city = text(address?.city)
  const region = text(address?.region)
  const postalCode = text(address?.postalCode)
  const mapUrl = cleanText(source.mapUrl)
  const phone = text(source.phone)
  const phoneHref = cleanText(source.phoneHref)
  const email = cleanText(source.email)
  const eventEmail = cleanText(source.eventEmail)
  const eventPhone = text(source.eventPhone)
  const eventPhoneHref = cleanText(source.eventPhoneHref)
  const privateDiningEmail = cleanText(source.privateDiningEmail)
  const privateDiningPhone = text(source.privateDiningPhone)
  const privateDiningPhoneHref = cleanText(source.privateDiningPhoneHref)

  if (!name || !descriptor || !tagline || !street || !city || !region || !postalCode || !mapUrl || !phone || !phoneHref || !email || !eventEmail || !eventPhone || !eventPhoneHref || !privateDiningEmail || !privateDiningPhone || !privateDiningPhoneHref) return null

  const hours = records(source?.hours).flatMap((row) => {
    const days = text(row.days)
    const time = text(row.time)
    return days && time ? [{days, time}] : []
  })
  if (!hours.length) return null

  return {
    name,
    descriptor,
    tagline,
    addressLines: [street, `${city}, ${region} ${postalCode}`],
    address: `${street}, ${city}, ${region} ${postalCode}`,
    mapUrl,
    phone,
    phoneHref,
    email,
    eventEmail,
    eventPhone,
    eventPhoneHref,
    privateDiningEmail,
    privateDiningPhone,
    privateDiningPhoneHref,
    hours,
    instagramUrl: cleanText(source.instagramUrl) ?? 'https://instagram.com',
    facebookUrl: cleanText(source.facebookUrl) ?? 'https://facebook.com',
  }
}
