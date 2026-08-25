import {describe, expect, it} from 'vitest'
import {formatEventSchedule, mapEvent, mapMenu, mapSiteSettings} from './index'

const image = (alt = 'A seasonal plate') => ({
  asset: {_ref: 'image-1234567890abcdef1234567890abcdef12345678-1600x1000-jpg'},
  alt,
})

const baseEvent = {
  slug: 'harvest-at-the-hearth',
  title: 'Harvest at the Hearth',
  summary: 'A shared seasonal dinner.',
  format: 'Multi-course dinner',
  startsAt: '2026-09-24T22:30:00Z',
  endsAt: '2026-09-25T01:00:00Z',
  approximateEnd: true,
  timeZone: 'America/New_York',
  location: 'Marsh & Ember, Charleston',
  status: 'accepting',
  acceptingLabel: 'open',
  listingImage: image(),
}

describe('Sanity event mapping', () => {
  it('maps semantic schedule data and explicit availability', () => {
    const event = mapEvent(baseEvent)

    expect(event).toMatchObject({
      date: 'September 24, 2026',
      time: '6:30 PM',
      schedule: 'September 24, 2026 · 6:30 PM – Approximately 9 PM · Marsh & Ember, Charleston',
      availability: {state: 'accepting', label: 'RSVP Open'},
    })
  })

  it('maps soldOut explicitly and rejects an unknown status', () => {
    expect(mapEvent({...baseEvent, status: 'soldOut', acceptingLabel: undefined})?.availability).toEqual({state: 'sold-out'})
    expect(mapEvent({...baseEvent, status: 'waitlist'})).toBeNull()
  })

  it('only exposes detail content when every required group is valid', () => {
    expect(mapEvent({...baseEvent, heroImage: image('Dinner table')})?.detail).toBeUndefined()

    const complete = mapEvent({
      ...baseEvent,
      heroImage: image('Dinner table'),
      facts: [{label: 'Date', value: 'September 24, 2026'}],
      introTitle: 'An evening around the hearth',
      introParagraphs: ['A one-night dinner.'],
      introImages: [image('Ingredients being prepared')],
      expectations: [{title: 'Shared menu', copy: 'One menu is served.'}],
      courses: [{name: 'Hearth Bread', description: 'Benne and butter', dietaryMarkers: [{code: 'V'}]}],
    })

    expect(complete?.detail?.courses[0].tags).toEqual(['V'])
  })

  it('formats a same-period non-approximate range compactly', () => {
    expect(formatEventSchedule({
      startsAt: '2026-10-11T20:00:00Z',
      endsAt: '2026-10-11T23:00:00Z',
      timeZone: 'America/New_York',
      location: 'Charleston',
      approximateEnd: false,
    })?.time).toBe('4–7 PM')
  })

  it('formats through the configured time zone across daylight-saving transitions', () => {
    expect(formatEventSchedule({
      startsAt: '2026-11-01T05:30:00Z',
      endsAt: '2026-11-01T07:30:00Z',
      timeZone: 'America/New_York',
      location: 'Charleston',
      approximateEnd: false,
    })).toMatchObject({date: 'November 1, 2026', time: '1:30–2:30 AM'})
  })
})

describe('Sanity menu mapping', () => {
  it('expands dietary references and preserves an editorial tag', () => {
    const menu = mapMenu({
      slug: 'dinner',
      title: 'Dinner',
      category: 'dinner',
      summary: 'Seasonal dinner.',
      displayOrder: 10,
      hasDetailPage: true,
      sections: [{
        anchor: 'to-begin',
        title: 'To Begin',
        items: [{name: 'Hearth Bread', description: 'Benne and butter', editorialTag: 'Hearth-Baked', featuredOnLanding: true, dietaryMarkers: [{code: 'V'}]}],
      }],
    })

    expect(menu?.sections[0].items[0]).toMatchObject({tags: ['Hearth-Baked', 'V'], featuredOnLanding: true})
  })

  it('rejects a detail menu without valid sections', () => {
    expect(mapMenu({slug: 'dinner', title: 'Dinner', category: 'dinner', summary: 'Seasonal.', displayOrder: 10, hasDetailPage: true, sections: []})).toBeNull()
  })
})

describe('Sanity settings mapping', () => {
  it('normalizes address lines', () => {
    const settings = mapSiteSettings({
      name: 'Marsh & Ember', descriptor: 'lowcountry culinary fire', tagline: 'Seasonal cooking.',
      address: {street: '184 King Street', city: 'Charleston', region: 'SC', postalCode: '29401'},
      mapUrl: 'https://maps.google.com/', phone: '843-555-0148', phoneHref: 'tel:+18435550148', email: 'hello@example.com',
      eventEmail: 'events@example.com', eventPhone: '(843) 555-0100', eventPhoneHref: 'tel:+18435550100',
      privateDiningEmail: 'events@example.com', privateDiningPhone: '(843) 555-0180', privateDiningPhoneHref: 'tel:+18435550180',
      hours: [{days: 'Sunday–Thursday', time: '5–10 PM'}],
    })

    expect(settings?.addressLines).toEqual(['184 King Street', 'Charleston, SC 29401'])
  })
})
