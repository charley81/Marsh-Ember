import type {Metadata} from 'next'

export const SITE_NAME = 'Marsh & Ember'
export const SITE_URL = 'https://marshandember.netlify.app'
export const DEFAULT_TITLE = 'Marsh & Ember | Charleston Restaurant'
export const DEFAULT_DESCRIPTION = 'Discover wood-fired Lowcountry cooking, seasonal menus, and warm Southern hospitality at Marsh & Ember, a Charleston restaurant.'
const DEFAULT_OG_IMAGE = '/images/home-hero-image.jpg'

type PageMetadataInput = {
  title: string
  description: string
  path: `/${string}` | '/'
  image?: string
  imageAlt?: string
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString()
}

export function createPageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  imageAlt = 'A wood-fired Lowcountry dish at Marsh and Ember',
}: PageMetadataInput): Metadata {
  const socialTitle = title === DEFAULT_TITLE ? title : `${title} | ${SITE_NAME}`

  return {
    title,
    description,
    alternates: {canonical: path},
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: path,
      siteName: SITE_NAME,
      title: socialTitle,
      description,
      images: [{url: image, alt: imageAlt}],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1},
    },
  }
}
