import type {EventRecord} from './events'

export type ContentImage = {
  src: string
  alt: string
}

export type RestaurantSettings = {
  name: string
  descriptor: string
  tagline: string
  addressLines: readonly [string, string]
  address: string
  mapUrl: string
  phone: string
  phoneHref: string
  email: string
  eventEmail: string
  eventPhone: string
  eventPhoneHref: string
  privateDiningEmail: string
  privateDiningPhone: string
  privateDiningPhoneHref: string
  hours: readonly {days: string; time: string}[]
  instagramUrl: string
  facebookUrl: string
  announcement?: {
    message: string
    linkLabel?: string
    linkPath?: string
    dismissalVersion: string
  }
}

export type DietaryMarker = {
  code: string
  label: string
  detail: string
}

export type MenuItemRecord = {
  name: string
  price?: string
  description: string
  tags?: readonly string[]
  featuredOnLanding?: boolean
}

export type MenuSectionRecord = {
  id: string
  title: string
  image?: ContentImage
  items: readonly MenuItemRecord[]
}

export type MenuRecord = {
  slug: string
  title: string
  category: 'dinner' | 'brunch' | 'spirits' | 'wine'
  summary: string
  service?: string
  displayOrder: number
  hasDetailPage: boolean
  updatedAt?: string
  listingImage?: ContentImage
  detailImage?: ContentImage
  sections: readonly MenuSectionRecord[]
}

export type SiteContent = {
  settings: RestaurantSettings
  menus: readonly MenuRecord[]
  events: readonly EventRecord[]
  dietaryMarkers: readonly DietaryMarker[]
}
