import 'server-only'
import {createClient} from 'next-sanity'
import {getSanityPublicEnv, SANITY_API_VERSION} from './env'

export const client = createClient({
  ...getSanityPublicEnv(),
  apiVersion: SANITY_API_VERSION,
  useCdn: true,
  perspective: 'published',
})
