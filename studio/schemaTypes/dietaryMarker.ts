import {defineField, defineType} from 'sanity'

export const dietaryMarker = defineType({
  name: 'dietaryMarker',
  title: 'Dietary marker',
  type: 'document',
  fields: [
    defineField({
      name: 'code',
      title: 'Code',
      description: 'Short public label, for example VG.',
      type: 'string',
      validation: (rule) => rule.required().uppercase().min(1).max(12).custom(async (code, context) => {
        if (!code || !context.document?._id) return true
        const publishedId = context.document._id.replace(/^drafts\./, '')
        const draftId = `drafts.${publishedId}`
        const unique = await context.getClient({apiVersion: '2026-08-17'}).fetch<boolean>(
          '!defined(*[_type == "dietaryMarker" && code == $code && !(_id in [$publishedId, $draftId])][0]._id)',
          {code, publishedId, draftId},
        )
        return unique || 'Dietary marker codes must be unique'
      }),
    }),
    defineField({name: 'label', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'detail', title: 'Guest guidance', type: 'text', rows: 3, validation: (rule) => rule.required()}),
    defineField({name: 'sourceKey', title: 'Migration source key', type: 'string', hidden: true, readOnly: true}),
  ],
  orderings: [{title: 'Code', name: 'codeAsc', by: [{field: 'code', direction: 'asc'}]}],
  preview: {select: {title: 'code', subtitle: 'label'}},
})
