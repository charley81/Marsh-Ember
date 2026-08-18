import {defineLocations, type PresentationPluginOptions} from 'sanity/presentation'

export const resolve: PresentationPluginOptions['resolve'] = {
  locations: {
    siteSettings: defineLocations({
      select: {title: 'name'},
      resolve: (document) => ({locations: [{title: document?.title || 'Home', href: '/'}]}),
    }),
    menu: defineLocations({
      select: {title: 'title', slug: 'slug.current', hasDetailPage: 'hasDetailPage'},
      resolve: (document) => ({
        locations: [
          {title: 'Menus', href: '/menus'},
          ...(document?.hasDetailPage && document?.slug
            ? [{title: document.title || 'Menu detail', href: `/menus/${document.slug}`}]
            : []),
        ],
      }),
    }),
    event: defineLocations({
      select: {title: 'title', slug: 'slug.current', heroImage: 'heroImage'},
      resolve: (document) => ({
        locations: [
          {title: 'Events', href: '/events'},
          ...(document?.heroImage && document?.slug
            ? [{title: document.title || 'Event detail', href: `/events/${document.slug}`}]
            : []),
        ],
      }),
    }),
  },
}
