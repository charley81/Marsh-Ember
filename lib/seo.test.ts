import {describe, expect, it} from 'vitest'
import {absoluteUrl, createPageMetadata, SITE_URL} from './seo'

describe('SEO metadata', () => {
  it('uses the deployed origin for canonical and social URLs', () => {
    const metadata = createPageMetadata({
      title: 'Menus',
      description: 'Seasonal menus.',
      path: '/menus',
      image: '/images/menus-hero-image.jpg',
    })

    expect(SITE_URL).toBe('https://marshandember.netlify.app')
    expect(absoluteUrl('/menus')).toBe('https://marshandember.netlify.app/menus')
    expect(metadata.alternates).toEqual({canonical: '/menus'})
    expect(metadata.openGraph).toMatchObject({url: '/menus', title: 'Menus | Marsh & Ember'})
    expect(metadata.twitter).toMatchObject({card: 'summary_large_image', title: 'Menus | Marsh & Ember'})
  })

  it('allows indexing and large search previews', () => {
    const metadata = createPageMetadata({title: 'Visit', description: 'Visit us.', path: '/visit'})

    expect(metadata.robots).toMatchObject({
      index: true,
      follow: true,
      googleBot: {'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1},
    })
  })
})
