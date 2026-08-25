import {at, defineMigration, unset} from 'sanity/migrate'

export default defineMigration({
  title: 'Remove site announcement',
  documentTypes: ['siteSettings'],
  filter: 'defined(announcement)',
  migrate: {
    document() {
      return at('announcement', unset())
    },
  },
})
