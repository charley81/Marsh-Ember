import 'server-only'

export const SANITY_API_VERSION = '2026-08-17'

export function getSanityPublicEnv() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

  if (!projectId || !dataset) {
    throw new Error('Sanity content source requires NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET')
  }

  return {projectId, dataset}
}

export function getSanityReadToken() {
  const token = process.env.SANITY_API_READ_TOKEN
  if (!token) throw new Error('Draft preview requires SANITY_API_READ_TOKEN')
  return token
}
