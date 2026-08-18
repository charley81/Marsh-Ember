import {getContentSource} from '@/lib/content-source'

export async function ContentLive() {
  if (getContentSource() !== 'sanity') return null
  const {SanityLive} = await import('@/sanity/live')
  return <SanityLive />
}
