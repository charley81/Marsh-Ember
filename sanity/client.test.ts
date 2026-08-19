import {describe, expect, it} from 'vitest'
import {client} from './client'
import {SANITY_STUDIO_URL} from './env'

describe('Sanity client', () => {
  it('configures the approved Studio URL required for visual editing stega', () => {
    expect(SANITY_STUDIO_URL).toBe('https://marshandember.sanity.studio')
    expect(client.config().stega.studioUrl).toBe(SANITY_STUDIO_URL)
  })
})
