import {defineCliConfig} from 'sanity/cli'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET

if (!projectId || !dataset) {
  throw new Error('Missing SANITY_STUDIO_PROJECT_ID or SANITY_STUDIO_DATASET')
}

export default defineCliConfig({
  api: {projectId, dataset},
  deployment: {autoUpdates: false},
  typegen: {
    enabled: true,
    path: '../sanity/**/*.{ts,tsx}',
    schema: 'schema.json',
    generates: '../sanity/types.generated.ts',
    overloadClientMethods: true,
  },
})
