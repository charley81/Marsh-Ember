import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {createClient} from '@sanity/client'

const root = process.cwd()
const envPath = join(root, '.env.local')
if (existsSync(envPath)) {
  for (const raw of readFileSync(envPath, 'utf8').split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const [key, ...rest] = line.split('=')
    if (!process.env[key]) process.env[key] = rest.join('=').trim().replace(/^(['"])(.*)\1$/, '$2')
  }
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const token = process.env.SANITY_API_READ_TOKEN
if (!projectId || !dataset || !token) throw new Error('Validation requires the Sanity project, dataset, and Viewer token environment variables')

const client = createClient({projectId, dataset, token, apiVersion: '2026-08-17', useCdn: false, perspective: 'published'})

type DocumentRecord = {_id: string; _type: string; [key: string]: unknown}

function collectReferences(value: unknown, refs: Set<string>) {
  if (Array.isArray(value)) {
    for (const item of value) collectReferences(item, refs)
    return
  }
  if (!value || typeof value !== 'object') return
  const record = value as Record<string, unknown>
  if (record._type === 'reference' && typeof record._ref === 'string') refs.add(record._ref)
  for (const child of Object.values(record)) collectReferences(child, refs)
}

function duplicates(values: string[]) {
  const seen = new Set<string>()
  return [...new Set(values.filter((value) => seen.has(value) || !seen.add(value)))]
}

async function main() {
  const documents = await client.fetch<DocumentRecord[]>('*[_type in ["siteSettings", "dietaryMarker", "menu", "event"]]')
  const ids = new Set((await client.fetch<{_id: string}[]>('*[]{_id}')).map((document) => document._id.replace(/^drafts\./, '')))
  const refs = new Set<string>()
  for (const document of documents) collectReferences(document, refs)

  const markers = documents.filter((document) => document._type === 'dietaryMarker')
  const menus = documents.filter((document) => document._type === 'menu')
  const events = documents.filter((document) => document._type === 'event')
  const settings = documents.filter((document) => document._type === 'siteSettings')
  const missingImages = documents.flatMap((document) => {
    const serialized = JSON.stringify(document)
    const imageCount = (serialized.match(/"_type":"image"/g) ?? []).length
    const altCount = (serialized.match(/"alt":"[^"]+"/g) ?? []).length
    return imageCount > altCount ? [document._id] : []
  })
  const issues = {
    settingsCount: settings.length === 1 ? [] : [`Expected one siteSettings document; found ${settings.length}`],
    duplicateMarkerCodes: duplicates(markers.flatMap((document) => typeof document.code === 'string' ? [document.code] : [])),
    duplicateMenuSlugs: duplicates(menus.flatMap((document) => typeof (document.slug as {current?: unknown} | undefined)?.current === 'string' ? [(document.slug as {current: string}).current] : [])),
    duplicateEventSlugs: duplicates(events.flatMap((document) => typeof (document.slug as {current?: unknown} | undefined)?.current === 'string' ? [(document.slug as {current: string}).current] : [])),
    unresolvedReferences: [...refs].filter((id) => !ids.has(id.replace(/^drafts\./, ''))),
    imagesMissingAlt: missingImages,
    invalidDetailEvents: events.filter((document) => document.heroImage && !(Array.isArray(document.facts) && Array.isArray(document.courses) && Array.isArray(document.expectations))).map((document) => document._id),
  }
  const report = {
    counts: {settings: settings.length, dietaryMarkers: markers.length, menus: menus.length, events: events.length},
    detailEventSlugs: events.flatMap((document) => document.heroImage && typeof (document.slug as {current?: unknown} | undefined)?.current === 'string' ? [(document.slug as {current: string}).current] : []),
    issues,
  }
  mkdirSync(join(root, 'migration/reports'), {recursive: true})
  writeFileSync(join(root, 'migration/reports/validation.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  if (Object.values(issues).some((values) => values.length)) process.exitCode = 1
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Validation failed')
  process.exitCode = 1
})
