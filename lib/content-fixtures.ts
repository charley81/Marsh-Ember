import type {MenuRecord, RestaurantSettings, SiteContent} from './content-types'
import {dietaryMarkers, dinnerSections, events, restaurant} from './site-data'

export const fixtureSettings: RestaurantSettings = restaurant

export const fixtureMenus: readonly MenuRecord[] = [
  {
    slug: 'dinner',
    title: 'Dinner',
    category: 'dinner',
    summary: 'Seasonal hearth and coastal cooking. Heavy influence from locally harvested oysters, day-boat fish, and Lowcountry fields.',
    service: 'Tuesday–Sunday · 5–10 PM',
    displayOrder: 10,
    hasDetailPage: true,
    updatedAt: '2026-08-01',
    listingImage: {src: '/images/menus-plating-shot.jpg', alt: 'Dinner being plated'},
    detailImage: {src: '/images/dinner-hero-dinner-image.jpg', alt: 'Dinner dishes served at Marsh and Ember'},
    sections: dinnerSections,
  },
  {
    slug: 'brunch',
    title: 'Weekend Brunch',
    category: 'brunch',
    summary: 'Late-morning plates, hearth dishes, and vibrant sparkling cocktails crafted for slower weekend celebrations.',
    service: 'Saturday and Sunday · 10 AM–2 PM',
    displayOrder: 20,
    hasDetailPage: false,
    listingImage: {src: '/images/menus-brunch-shot.jpg', alt: 'Weekend brunch dishes'},
    sections: [{
      id: 'brunch',
      title: 'Weekend Brunch',
      items: [
        {name: 'Skillet Cornbread', price: '$10', description: 'Marsh hen mill cornmeal, whipped sea salt honey butter.', tags: ['V', 'Hearth-Baked'], featuredOnLanding: true},
        {name: 'Crab Rice', price: '$22', description: 'Local blue crab, gold rice, scallions, soft egg yolk.', featuredOnLanding: true},
        {name: 'Brioche French Toast', price: '$17', description: 'Thick-cut wood-toast, seasonal preserves, cultured cream, organic sorghum.', tags: ['V'], featuredOnLanding: true},
      ],
    }],
  },
  {
    slug: 'spirits',
    title: 'Cocktails & Spirits',
    category: 'spirits',
    summary: 'Seasonal cocktails, thoughtful classics, and an expansive selection of amari, rums, and Southern whiskeys.',
    displayOrder: 30,
    hasDetailPage: false,
    sections: [{
      id: 'spirits',
      title: 'Cocktails & Spirits',
      items: [{name: 'Salt Marsh', price: '$15', description: 'Tequila, lime, sea bean cordial, smoked sea salt rim.', featuredOnLanding: true}],
    }],
  },
  {
    slug: 'wine',
    title: 'Wine List',
    category: 'wine',
    summary: 'Bottles and pours carefully curated to match Lowcountry salinity, smoke, and rich Southern textures.',
    displayOrder: 40,
    hasDetailPage: false,
    sections: [],
  },
]

export const fixtureContent: SiteContent = {
  settings: fixtureSettings,
  menus: fixtureMenus,
  events,
  dietaryMarkers,
}
