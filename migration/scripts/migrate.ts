import {createHash} from 'node:crypto'
import {createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {basename, join} from 'node:path'
import {createClient, type SanityClient} from 'next-sanity'
import {fixtureMenus, fixtureSettings} from '../../lib/content-fixtures'
import {dietaryMarkers, events} from '../../lib/site-data'
import type {ContentImage, MenuItemRecord} from '../../lib/content-types'

const write = process.argv.includes('--write')
const root = process.cwd()

function loadLocalEnv() {
  const path = join(root, '.env.local')
  if (!existsSync(path)) return
  for (const raw of readFileSync(path, 'utf8').split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const [key, ...rest] = line.split('=')
    if (!process.env[key]) process.env[key] = rest.join('=').trim().replace(/^(['"])(.*)\1$/, '$2')
  }
}

loadLocalEnv()

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
if (!projectId || !dataset) throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET')
if (write && !process.env.SANITY_API_WRITE_TOKEN) throw new Error('Write mode requires SANITY_API_WRITE_TOKEN')

const client = write ? createClient({projectId, dataset, apiVersion: '2026-08-17', useCdn: false, token: process.env.SANITY_API_WRITE_TOKEN}) : null
const key = (value: string) => createHash('sha1').update(value).digest('hex').slice(0, 16)
const sourceKey = (type: string, id: string) => `fixture:${type}:${id}`
const ref = (id: string) => ({_type: 'reference', _ref: id})

const eventTimes: Record<string, {startsAt: string; endsAt: string; approximateEnd: boolean}> = {
  'harvest-at-the-hearth': {startsAt: '2026-09-24T22:30:00Z', endsAt: '2026-09-25T01:00:00Z', approximateEnd: true},
  'lowcountry-oyster-roast': {startsAt: '2026-10-11T20:00:00Z', endsAt: '2026-10-11T23:00:00Z', approximateEnd: false},
  'benne-and-bourbon': {startsAt: '2026-11-05T23:30:00Z', endsAt: '2026-11-06T02:00:00Z', approximateEnd: true},
  'sunday-supper': {startsAt: '2026-11-22T22:00:00Z', endsAt: '2026-11-23T01:00:00Z', approximateEnd: true},
}

const menuSectionImages: Record<string, ContentImage> = {
  vegetables: {src: '/images/dinner-vegetables-image.jpg', alt: 'Seasonal vegetables from Lowcountry farms'},
  hearth: {src: '/images/dinner-hearth-image.jpg', alt: 'Cooking directly over the hearth'},
}

const assetPaths = new Set<string>()
for (const menu of fixtureMenus) {
  if (menu.listingImage) assetPaths.add(menu.listingImage.src)
  if (menu.detailImage) assetPaths.add(menu.detailImage.src)
}
for (const image of Object.values(menuSectionImages)) assetPaths.add(image.src)
for (const event of events) {
  assetPaths.add(event.listingImage.src)
  if (event.detail) {
    assetPaths.add(event.detail.heroImage)
    for (const image of event.detail.intro.images) assetPaths.add(image.src)
  }
}

async function uploadImages(sanity: SanityClient) {
  const ids = new Map<string, string>()
  for (const source of assetPaths) {
    const filePath = join(root, 'public', source.replace(/^\//, ''))
    if (!existsSync(filePath)) throw new Error(`Missing migration asset: ${source}`)
    const asset = await sanity.assets.upload('image', createReadStream(filePath), {filename: basename(filePath)})
    ids.set(source, asset._id)
    console.log(`asset ${source} -> ${asset._id}`)
  }
  return ids
}

function imageValue(image: ContentImage | undefined, assets: Map<string, string>) {
  if (!image) return undefined
  const id = assets.get(image.src)
  if (!id) throw new Error(`Unresolved image asset: ${image.src}`)
  return {_type: 'image', asset: ref(id), alt: image.alt}
}

type MigrationDocument = Record<string, unknown> & {_type: string; sourceKey: string}

async function upsertOrdinary(sanity: SanityClient, document: MigrationDocument) {
  const type = String(document._type)
  const migrationKey = String(document.sourceKey)
  const existingId = await sanity.fetch<string | null>(`*[_type == $type && sourceKey == $sourceKey][0]._id`, {type, sourceKey: migrationKey})
  if (existingId) {
    await sanity.createOrReplace({...document, _id: existingId} as MigrationDocument & {_id: string})
    return existingId
  }
  const created = await sanity.create(document)
  return created._id
}

function itemValue(item: MenuItemRecord, path: string, markerIds: Map<string, string>) {
  const dietary = (item.tags ?? []).filter((tag) => markerIds.has(tag))
  const editorialTag = (item.tags ?? []).find((tag) => !markerIds.has(tag))
  return {
    _type: 'menuItem',
    _key: key(path),
    name: item.name,
    ...(item.price ? {price: item.price} : {}),
    description: item.description,
    ...(editorialTag ? {editorialTag} : {}),
    featuredOnLanding: item.featuredOnLanding ?? false,
    dietaryMarkers: dietary.map((code) => ({...ref(markerIds.get(code)!), _key: key(`${path}:${code}`)})),
  }
}

async function runWrite(sanity: SanityClient) {
  const assets = await uploadImages(sanity)
  const markerIds = new Map<string, string>()
  for (const marker of dietaryMarkers) {
    const id = await upsertOrdinary(sanity, {
      _type: 'dietaryMarker', sourceKey: sourceKey('dietary', marker.code), code: marker.code, label: marker.label, detail: marker.detail,
    })
    markerIds.set(marker.code, id)
  }

  for (const menu of fixtureMenus) {
    await upsertOrdinary(sanity, {
      _type: 'menu',
      sourceKey: sourceKey('menu', menu.slug),
      title: menu.title,
      slug: {_type: 'slug', current: menu.slug},
      category: menu.category,
      summary: menu.summary,
      ...(menu.service ? {service: menu.service} : {}),
      displayOrder: menu.displayOrder,
      hasDetailPage: menu.hasDetailPage,
      ...(menu.updatedAt ? {updatedAt: menu.updatedAt} : {}),
      ...(menu.listingImage ? {listingImage: imageValue(menu.listingImage, assets)} : {}),
      ...(menu.detailImage ? {detailImage: imageValue(menu.detailImage, assets)} : {}),
      sections: menu.sections.map((section) => ({
        _type: 'menuSection',
        _key: key(`${menu.slug}:section:${section.id}`),
        title: section.title,
        anchor: section.id,
        ...(menuSectionImages[section.id] ? {image: imageValue(menuSectionImages[section.id], assets)} : {}),
        items: section.items.map((item) => itemValue(item, `${menu.slug}:${section.id}:${item.name}`, markerIds)),
      })),
    })
  }

  const eventIds = new Map<string, string>()
  for (const event of events) {
    const timing = eventTimes[event.slug]
    if (!timing) throw new Error(`Missing semantic event timing: ${event.slug}`)
    const status = event.availability.state === 'sold-out' ? 'soldOut' : event.availability.state
    const acceptingLabel = event.availability.state === 'accepting'
      ? event.availability.label === 'RSVP Open' ? 'open' : 'limited'
      : undefined
    const detail = event.detail
    const id = await upsertOrdinary(sanity, {
      _type: 'event',
      sourceKey: sourceKey('event', event.slug),
      title: event.title,
      slug: {_type: 'slug', current: event.slug},
      summary: event.summary,
      format: event.format,
      listingImage: imageValue(event.listingImage, assets),
      ...timing,
      timeZone: 'America/New_York',
      location: event.schedule.split(' · ').at(-1) ?? event.location,
      status,
      ...(acceptingLabel ? {acceptingLabel} : {}),
      ...(detail ? {
        heroImage: imageValue({src: detail.heroImage, alt: detail.heroAlt}, assets),
        ...(detail.availabilityNote ? {availabilityNote: detail.availabilityNote} : {}),
        facts: detail.facts.map((fact) => ({_type: 'eventFact', _key: key(`${event.slug}:fact:${fact.label}`), ...fact})),
        introTitle: detail.intro.title,
        introParagraphs: [...detail.intro.paragraphs],
        introImages: detail.intro.images.map((item) => ({...imageValue(item, assets), _key: key(`${event.slug}:intro:${item.src}`)})),
        expectations: detail.expectations.map((item) => ({_type: 'eventExpectation', _key: key(`${event.slug}:expectation:${item.title}`), title: item.title, copy: item.copy})),
        courses: detail.courses.map((course) => ({
          _type: 'eventCourse', _key: key(`${event.slug}:course:${course.name}`), name: course.name, description: course.description,
          dietaryMarkers: (course.tags ?? []).filter((tag) => markerIds.has(tag)).map((code) => ({...ref(markerIds.get(code)!), _key: key(`${event.slug}:course:${course.name}:${code}`)})),
        })),
      } : {}),
    })
    eventIds.set(event.slug, id)
  }

  await sanity.createOrReplace({
    _id: 'siteSettings',
    _type: 'siteSettings',
    name: fixtureSettings.name,
    descriptor: fixtureSettings.descriptor,
    tagline: fixtureSettings.tagline,
    address: {_type: 'address', street: fixtureSettings.addressLines[0], city: 'Charleston', region: 'SC', postalCode: '29401', country: 'US'},
    mapUrl: fixtureSettings.mapUrl,
    phone: fixtureSettings.phone,
    phoneHref: fixtureSettings.phoneHref,
    email: fixtureSettings.email,
    eventEmail: fixtureSettings.eventEmail,
    eventPhone: fixtureSettings.eventPhone,
    eventPhoneHref: fixtureSettings.eventPhoneHref,
    privateDiningEmail: fixtureSettings.privateDiningEmail,
    privateDiningPhone: fixtureSettings.privateDiningPhone,
    privateDiningPhoneHref: fixtureSettings.privateDiningPhoneHref,
    instagramUrl: fixtureSettings.instagramUrl,
    facebookUrl: fixtureSettings.facebookUrl,
    hours: fixtureSettings.hours.map((hours) => ({_type: 'serviceHours', _key: key(`hours:${hours.days}`), ...hours})),
    featuredEvent: ref(eventIds.get('harvest-at-the-hearth')!),
  })

  return {markers: markerIds.size, menus: fixtureMenus.length, events: eventIds.size, assets: assets.size, settings: 1}
}

const planned = {
  mode: write ? 'write' : 'dry-run',
  writesPerformed: write,
  documents: {settings: 1, dietaryMarkers: dietaryMarkers.length, menus: fixtureMenus.length, events: events.length},
  assets: [...assetPaths].sort(),
  detailRoutes: events.filter((event) => event.detail).map((event) => `/events/${event.slug}`),
  menuDetailRoutes: fixtureMenus.filter((menu) => menu.hasDetailPage).map((menu) => `/menus/${menu.slug}`),
}

async function main() {
  const result = client ? await runWrite(client) : null
  mkdirSync(join(root, 'migration/reports'), {recursive: true})
  writeFileSync(join(root, 'migration/reports', write ? 'write.json' : 'dry-run.json'), JSON.stringify({...planned, result}, null, 2))
  console.log(JSON.stringify({...planned, result}, null, 2))
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Migration failed')
  process.exitCode = 1
})
