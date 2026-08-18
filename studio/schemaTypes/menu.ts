import {defineArrayMember, defineField, defineType} from 'sanity'

export const menu = defineType({
  name: 'menu',
  title: 'Menu',
  type: 'document',
  groups: [
    {name: 'overview', title: 'Overview', default: true},
    {name: 'content', title: 'Menu content'},
    {name: 'media', title: 'Media'},
  ],
  fields: [
    defineField({name: 'title', type: 'string', group: 'overview', validation: (rule) => rule.required()}),
    defineField({name: 'slug', type: 'slug', group: 'overview', options: {source: 'title', maxLength: 96}, validation: (rule) => rule.required()}),
    defineField({name: 'category', type: 'string', group: 'overview', options: {list: [
      {title: 'Dinner', value: 'dinner'},
      {title: 'Brunch', value: 'brunch'},
      {title: 'Cocktails & spirits', value: 'spirits'},
      {title: 'Wine', value: 'wine'},
    ]}, validation: (rule) => rule.required()}),
    defineField({name: 'summary', type: 'text', rows: 3, group: 'overview', validation: (rule) => rule.required()}),
    defineField({name: 'service', title: 'Service / availability', type: 'string', group: 'overview'}),
    defineField({name: 'displayOrder', title: 'Display order', type: 'number', group: 'overview', initialValue: 100, validation: (rule) => rule.required().integer().min(0)}),
    defineField({name: 'hasDetailPage', title: 'Has approved detail page', type: 'boolean', group: 'overview', initialValue: false}),
    defineField({name: 'updatedAt', title: 'Editorial update date', type: 'date', group: 'overview'}),
    defineField({name: 'listingImage', title: 'Listing image', type: 'editorialImage', group: 'media'}),
    defineField({name: 'detailImage', title: 'Detail hero image', type: 'editorialImage', group: 'media'}),
    defineField({
      name: 'sections',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'menuSection'})],
      validation: (rule) => rule.custom((value, context) => {
        const hasDetail = (context.document as {hasDetailPage?: boolean} | undefined)?.hasDetailPage
        return !hasDetail || (value?.length ?? 0) > 0 ? true : 'At least one section is required for a detail page'
      }),
    }),
    defineField({name: 'sourceKey', title: 'Migration source key', type: 'string', hidden: true, readOnly: true}),
  ],
  orderings: [{title: 'Display order', name: 'displayOrderAsc', by: [{field: 'displayOrder', direction: 'asc'}]}],
  preview: {select: {title: 'title', subtitle: 'service', media: 'listingImage'}},
})
