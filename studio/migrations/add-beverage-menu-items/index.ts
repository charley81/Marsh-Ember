import {at, defineMigration, set} from 'sanity/migrate'

type MenuItem = {
  _key: string
  _type: 'menuItem'
  name: string
  price?: string
  description: string
  featuredOnLanding: boolean
}

type MenuSection = {
  _key: string
  _type: 'menuSection'
  title: string
  anchor: string
  items: MenuItem[]
}

const emberOldFashioned: MenuItem = {
  _key: 'dddce06370b3eeea',
  _type: 'menuItem',
  name: 'Ember Old Fashioned',
  price: '$16',
  description: 'Hickory-smoked bourbon, charred orange peel oil, aromatic bitters.',
  featuredOnLanding: true,
}

const wineItems: MenuItem[] = [
  {
    _key: '2fb4bc82051f388f',
    _type: 'menuItem',
    name: 'Wines by the Glass',
    description: 'Lively sparkling, white, rosé, and red selections.',
    featuredOnLanding: true,
  },
  {
    _key: '2699bdd530f47f70',
    _type: 'menuItem',
    name: 'Half & Full Bottles',
    description: 'Family estates and coastal vineyards selected for sharing.',
    featuredOnLanding: true,
  },
  {
    _key: 'e364dce307f90d0d',
    _type: 'menuItem',
    name: 'Dessert Pours',
    description: 'Sweet wines chosen to close the meal.',
    featuredOnLanding: true,
  },
]

function sectionsFrom(document: Record<string, unknown>): MenuSection[] {
  return Array.isArray(document.sections) ? document.sections as MenuSection[] : []
}

export default defineMigration({
  title: 'Add beverage menu items',
  documentTypes: ['menu'],
  filter: 'category in ["spirits", "wine"]',
  migrate: {
    document(document) {
      const sections = sectionsFrom(document)

      if (document.category === 'spirits') {
        const sectionIndex = sections.findIndex((section) => section.anchor === 'spirits')
        if (sectionIndex < 0) return
        const section = sections[sectionIndex]
        if (section.items?.some((item) => item.name === emberOldFashioned.name)) return

        const nextSections = [...sections]
        nextSections[sectionIndex] = {...section, items: [...(section.items ?? []), emberOldFashioned]}
        return at('sections', set(nextSections))
      }

      if (document.category === 'wine') {
        const sectionIndex = sections.findIndex((section) => section.anchor === 'wine')
        if (sectionIndex < 0) {
          return at('sections', set([{
            _key: '2cad4d7cb672f0d7',
            _type: 'menuSection',
            title: 'Wine List',
            anchor: 'wine',
            items: wineItems,
          }]))
        }

        const section = sections[sectionIndex]
        const existingNames = new Set((section.items ?? []).map((item) => item.name))
        const missingItems = wineItems.filter((item) => !existingNames.has(item.name))
        if (!missingItems.length) return

        const nextSections = [...sections]
        nextSections[sectionIndex] = {...section, items: [...(section.items ?? []), ...missingItems]}
        return at('sections', set(nextSections))
      }
    },
  },
})
