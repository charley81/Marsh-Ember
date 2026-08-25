import {defineQuery} from 'next-sanity'

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings" && _id == "siteSettings"][0]{
    _id,
    _updatedAt,
    name,
    descriptor,
    tagline,
    address{street, city, region, postalCode, country},
    mapUrl,
    phone,
    phoneHref,
    email,
    eventEmail,
    eventPhone,
    eventPhoneHref,
    privateDiningEmail,
    privateDiningPhone,
    privateDiningPhoneHref,
    instagramUrl,
    facebookUrl,
    hours[]{_key, days, time},
    "featuredEventSlug": featuredEvent->slug.current
  }
`)
