import {describe, expect, it} from 'vitest'
import {events, restaurant} from './site-data'
import {createEventJsonLd, createRestaurantJsonLd, serializeJsonLd} from './structured-data'
import {getDetailEvent} from './events'

const harvest = getDetailEvent(events, 'harvest-at-the-hearth')!

describe('structured data', () => {
  it('describes the restaurant and website using canonical URLs', () => {
    const serialized = serializeJsonLd(createRestaurantJsonLd(restaurant))

    expect(serialized).toContain('"@type":"Restaurant"')
    expect(serialized).toContain('"@type":"WebSite"')
    expect(serialized).toContain('https://marshandember.netlify.app/menus/dinner')
    expect(serialized).not.toContain('https://instagram.com"')
  })

  it('describes the event with machine-readable dates and breadcrumbs', () => {
    const serialized = serializeJsonLd(createEventJsonLd(harvest, restaurant))

    expect(serialized).toContain('"@type":"Event"')
    expect(serialized).toContain('"startDate":"2026-09-24T22:30:00Z"')
    expect(serialized).toContain('"endDate":"2026-09-25T01:00:00Z"')
    expect(serialized).toContain('"@type":"BreadcrumbList"')
    expect(serialized).toContain('https://schema.org/EventScheduled')
  })

  it('escapes markup-significant characters before embedding JSON-LD', () => {
    expect(serializeJsonLd({'@context': 'https://schema.org', name: '</script>'})).not.toContain('</script>')
  })
})
