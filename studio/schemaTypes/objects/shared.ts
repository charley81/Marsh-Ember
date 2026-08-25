import {defineArrayMember, defineField, defineType} from 'sanity'

export const address = defineType({
  name: 'address',
  title: 'Address',
  type: 'object',
  fields: [
    defineField({name: 'street', title: 'Street', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'city', title: 'City', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'region', title: 'State / region', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'postalCode', title: 'Postal code', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'country', title: 'Country', type: 'string', initialValue: 'US', validation: (rule) => rule.required()}),
  ],
})

export const serviceHours = defineType({
  name: 'serviceHours',
  title: 'Service hours',
  type: 'object',
  fields: [
    defineField({name: 'days', title: 'Days', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'time', title: 'Time', type: 'string', validation: (rule) => rule.required()}),
  ],
  preview: {select: {title: 'days', subtitle: 'time'}},
})

export const editorialImage = defineType({
  name: 'editorialImage',
  title: 'Editorial image',
  type: 'image',
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative text',
      description: 'Describe the image purpose and subject. Do not start with “Image of”.',
      type: 'string',
      validation: (rule) => rule.required().min(3).max(200),
    }),
    defineField({name: 'caption', title: 'Caption', type: 'string'}),
  ],
})

export const eventFact = defineType({
  name: 'eventFact',
  title: 'Event fact',
  type: 'object',
  fields: [
    defineField({name: 'label', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'value', type: 'string', validation: (rule) => rule.required()}),
  ],
  preview: {select: {title: 'label', subtitle: 'value'}},
})

export const eventExpectation = defineType({
  name: 'eventExpectation',
  title: 'Event expectation',
  type: 'object',
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'copy', title: 'Description', type: 'text', rows: 3, validation: (rule) => rule.required()}),
  ],
  preview: {select: {title: 'title', subtitle: 'copy'}},
})

export const eventCourse = defineType({
  name: 'eventCourse',
  title: 'Event course',
  type: 'object',
  fields: [
    defineField({name: 'name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'description', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'dietaryMarkers',
      title: 'Dietary markers',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'dietaryMarker'}]})],
      validation: (rule) => rule.unique(),
    }),
  ],
  preview: {select: {title: 'name', subtitle: 'description'}},
})

export const menuItem = defineType({
  name: 'menuItem',
  title: 'Menu item',
  type: 'object',
  fields: [
    defineField({name: 'name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'price', title: 'Display price', description: 'Examples: $18 or MP.', type: 'string', validation: (rule) => rule.max(20)}),
    defineField({name: 'description', type: 'text', rows: 2, validation: (rule) => rule.required()}),
    defineField({
      name: 'dietaryMarkers',
      title: 'Dietary markers',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'dietaryMarker'}]})],
      validation: (rule) => rule.unique(),
    }),
    defineField({name: 'editorialTag', title: 'Editorial tag', description: 'Optional non-dietary label such as Hearth-Baked.', type: 'string'}),
    defineField({name: 'featuredOnLanding', title: 'Feature on menus landing page', type: 'boolean', initialValue: false}),
  ],
  preview: {select: {title: 'name', subtitle: 'price'}},
})

export const menuSection = defineType({
  name: 'menuSection',
  title: 'Menu section',
  type: 'object',
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'anchor',
      title: 'Section anchor',
      description: 'Stable lowercase URL fragment, for example “to-begin”.',
      type: 'string',
      validation: (rule) => rule.required().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {name: 'kebab-case anchor'}),
    }),
    defineField({name: 'image', title: 'Optional section image', type: 'editorialImage'}),
    defineField({
      name: 'items',
      type: 'array',
      of: [defineArrayMember({type: 'menuItem'})],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {select: {title: 'title', items: 'items'}, prepare: ({title, items}) => ({title, subtitle: `${items?.length ?? 0} items`})},
})
