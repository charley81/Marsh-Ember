import {defineArrayMember, defineField, defineType} from 'sanity'

const statusOptions = [
  {title: 'Accepting RSVP requests', value: 'accepting'},
  {title: 'RSVP closed', value: 'closed'},
  {title: 'Sold out', value: 'soldOut'},
  {title: 'Cancelled', value: 'cancelled'},
  {title: 'Past', value: 'past'},
]

export const event = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  groups: [
    {name: 'overview', title: 'Overview', default: true},
    {name: 'availability', title: 'Schedule & availability'},
    {name: 'detail', title: 'Detail page'},
  ],
  fields: [
    defineField({name: 'title', type: 'string', group: 'overview', validation: (rule) => rule.required()}),
    defineField({name: 'slug', type: 'slug', group: 'overview', options: {source: 'title', maxLength: 96}, validation: (rule) => rule.required()}),
    defineField({name: 'summary', type: 'text', rows: 3, group: 'overview', validation: (rule) => rule.required()}),
    defineField({name: 'format', type: 'string', group: 'overview', validation: (rule) => rule.required()}),
    defineField({name: 'listingImage', title: 'Listing image', type: 'editorialImage', group: 'overview', validation: (rule) => rule.required()}),
    defineField({name: 'startsAt', title: 'Starts at', type: 'datetime', group: 'availability', validation: (rule) => rule.required()}),
    defineField({name: 'endsAt', title: 'Ends at', type: 'datetime', group: 'availability', validation: (rule) => rule.required().min(rule.valueOfField('startsAt'))}),
    defineField({name: 'approximateEnd', title: 'End time is approximate', type: 'boolean', group: 'availability', initialValue: false}),
    defineField({name: 'timeZone', title: 'IANA time zone', description: 'For example America/New_York.', type: 'string', group: 'availability', initialValue: 'America/New_York', validation: (rule) => rule.required().custom((value) => {
      if (!value) return true
      try { new Intl.DateTimeFormat('en-US', {timeZone: value}); return true } catch { return 'Enter a valid IANA time zone' }
    })}),
    defineField({name: 'location', title: 'Location display value', type: 'string', group: 'availability', validation: (rule) => rule.required()}),
    defineField({name: 'status', type: 'string', group: 'availability', options: {list: statusOptions, layout: 'radio'}, validation: (rule) => rule.required()}),
    defineField({name: 'acceptingLabel', title: 'Accepting label', type: 'string', group: 'availability', options: {list: [
      {title: 'RSVP Open', value: 'open'},
      {title: 'Limited Availability', value: 'limited'},
    ]}, hidden: ({document}) => document?.status !== 'accepting', validation: (rule) => rule.custom((value, context) => {
      const status = (context.document as {status?: string} | undefined)?.status
      return status !== 'accepting' || value ? true : 'Select a label for an accepting event'
    })}),
    defineField({name: 'heroImage', title: 'Detail hero image', type: 'editorialImage', group: 'detail'}),
    defineField({name: 'availabilityNote', type: 'string', group: 'detail'}),
    defineField({name: 'facts', type: 'array', group: 'detail', of: [defineArrayMember({type: 'eventFact'})]}),
    defineField({name: 'introTitle', title: 'Introduction title', type: 'string', group: 'detail'}),
    defineField({name: 'introParagraphs', title: 'Introduction paragraphs', type: 'array', group: 'detail', of: [defineArrayMember({type: 'text', rows: 4})]}),
    defineField({name: 'introImages', title: 'Introduction images', type: 'array', group: 'detail', of: [defineArrayMember({type: 'editorialImage'})], validation: (rule) => rule.max(2)}),
    defineField({name: 'expectations', type: 'array', group: 'detail', of: [defineArrayMember({type: 'eventExpectation'})]}),
    defineField({name: 'courses', type: 'array', group: 'detail', of: [defineArrayMember({type: 'eventCourse'})]}),
    defineField({name: 'sourceKey', title: 'Migration source key', type: 'string', hidden: true, readOnly: true}),
  ],
  validation: (rule) => rule.custom((document) => {
    if (!document?.heroImage) return true
    const required = ['facts', 'introTitle', 'introParagraphs', 'introImages', 'expectations', 'courses'] as const
    const missing = required.filter((field) => {
      const value = document[field]
      return Array.isArray(value) ? value.length === 0 : !value
    })
    return missing.length ? `Complete detail content when a hero image is set: ${missing.join(', ')}` : true
  }),
  orderings: [{title: 'Start date', name: 'startsAtAsc', by: [{field: 'startsAt', direction: 'asc'}]}],
  preview: {select: {title: 'title', startsAt: 'startsAt', status: 'status', media: 'listingImage'}, prepare: ({title, startsAt, status, media}) => ({title, subtitle: [startsAt ? new Date(startsAt).toLocaleDateString() : null, status].filter(Boolean).join(' · '), media})},
})
