import 'server-only'

type ContentSource = 'fixtures' | 'sanity'

export function getContentSource(): ContentSource {
  const source = process.env.CONTENT_SOURCE ?? (process.env.NODE_ENV === 'production' ? undefined : 'fixtures')
  if (source === 'fixtures' || source === 'sanity') return source
  throw new Error('CONTENT_SOURCE must be set to "fixtures" or "sanity"')
}
