import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {presentationTool} from 'sanity/presentation'
import {structureTool} from 'sanity/structure'
import {resolve} from './presentation/resolve'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET
const previewOrigin = process.env.SANITY_STUDIO_PREVIEW_ORIGIN || 'http://localhost:3000'

if (!projectId || !dataset) {
  throw new Error('Missing SANITY_STUDIO_PROJECT_ID or SANITY_STUDIO_DATASET')
}

export default defineConfig({
  name: 'default',
  title: 'Marsh & Ember',
  projectId,
  dataset,
  plugins: [
    structureTool({structure}),
    presentationTool({
      resolve,
      previewUrl: {
        origin: previewOrigin,
        previewMode: {enable: '/api/draft-mode/enable'},
      },
    }),
    visionTool(),
  ],
  schema: {types: schemaTypes},
  document: {
    actions: (previous, context) =>
      context.schemaType === 'siteSettings'
        ? previous.filter(({action}) => action !== 'delete' && action !== 'duplicate')
        : previous,
    newDocumentOptions: (previous) => previous.filter(({templateId}) => templateId !== 'siteSettings'),
  },
})
