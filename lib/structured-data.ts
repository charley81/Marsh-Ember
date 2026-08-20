import {stegaClean} from '@sanity/client/stega'
import type {RestaurantSettings} from './content-types'
import type {DetailEventRecord, EventAvailability} from './events'
import {absoluteUrl, DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL} from './seo'

export type JsonLdValue = null | boolean | number | string | JsonLdValue[] | {[key: string]: JsonLdValue | undefined}

function clean(value: string): string {
  return stegaClean(value).trim()
}

function socialProfile(url: string): string | null {
  try {
    const parsed = new URL(clean(url))
    return parsed.pathname === '/' ? null : parsed.toString()
  } catch {
    return null
  }
}

function eventStatus(availability: EventAvailability): string {
  return availability.state === 'cancelled'
    ? 'https://schema.org/EventCancelled'
    : 'https://schema.org/EventScheduled'
}

export function createRestaurantJsonLd(settings: RestaurantSettings): JsonLdValue {
  const profiles = [settings.instagramUrl, settings.facebookUrl].map(socialProfile).filter((url): url is string => Boolean(url))

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        inLanguage: 'en-US',
        publisher: {'@id': `${SITE_URL}/#restaurant`},
      },
      {
        '@type': 'Restaurant',
        '@id': `${SITE_URL}/#restaurant`,
        name: clean(settings.name),
        description: clean(settings.tagline),
        url: SITE_URL,
        image: absoluteUrl('/images/home-hero-image.jpg'),
        telephone: clean(settings.phoneHref).replace(/^tel:/, ''),
        email: clean(settings.email),
        address: {
          '@type': 'PostalAddress',
          streetAddress: clean(settings.addressLines[0]),
          addressLocality: 'Charleston',
          addressRegion: 'SC',
          postalCode: '29401',
          addressCountry: 'US',
        },
        servesCuisine: ['Lowcountry', 'Southern', 'Seafood'],
        hasMenu: absoluteUrl('/menus/dinner'),
        openingHours: settings.hours.map((row) => `${clean(row.days)} ${clean(row.time)}`),
        sameAs: profiles.length ? profiles : undefined,
      },
    ],
  }
}

export function createEventJsonLd(event: DetailEventRecord, settings: RestaurantSettings): JsonLdValue {
  const eventUrl = absoluteUrl(`/events/${clean(event.slug)}`)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Event',
        '@id': `${eventUrl}#event`,
        name: clean(event.title),
        description: clean(event.summary),
        url: eventUrl,
        image: [absoluteUrl(clean(event.detail.heroImage)), absoluteUrl(clean(event.listingImage.src))],
        startDate: clean(event.startsAt),
        endDate: clean(event.endsAt),
        eventStatus: eventStatus(event.availability),
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: {
          '@type': 'Place',
          name: clean(settings.name),
          address: {
            '@type': 'PostalAddress',
            streetAddress: clean(settings.addressLines[0]),
            addressLocality: 'Charleston',
            addressRegion: 'SC',
            postalCode: '29401',
            addressCountry: 'US',
          },
        },
        organizer: {'@id': `${SITE_URL}/#restaurant`},
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${eventUrl}#breadcrumb`,
        itemListElement: [
          {'@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL},
          {'@type': 'ListItem', position: 2, name: 'Events', item: absoluteUrl('/events')},
          {'@type': 'ListItem', position: 3, name: clean(event.title), item: eventUrl},
        ],
      },
    ],
  }
}

export function serializeJsonLd(data: JsonLdValue): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
