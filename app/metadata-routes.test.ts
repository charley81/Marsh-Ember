import {describe, expect, it} from 'vitest'
import robots from './robots'
import sitemap from './sitemap'

describe('metadata routes', () => {
  it('publishes every indexable fixture route in the sitemap', async () => {
    const entries = await sitemap()
    const urls = entries.map((entry) => entry.url)

    expect(urls).toEqual([
      'https://marshandember.netlify.app/',
      'https://marshandember.netlify.app/menus',
      'https://marshandember.netlify.app/menus/dinner',
      'https://marshandember.netlify.app/visit',
      'https://marshandember.netlify.app/our-story',
      'https://marshandember.netlify.app/private-dining',
      'https://marshandember.netlify.app/events',
      'https://marshandember.netlify.app/privacy',
      'https://marshandember.netlify.app/accessibility',
      'https://marshandember.netlify.app/events/harvest-at-the-hearth',
    ])
  })

  it('allows public crawling while excluding API routes', () => {
    expect(robots()).toEqual({
      rules: {userAgent: '*', allow: '/', disallow: '/api/'},
      sitemap: 'https://marshandember.netlify.app/sitemap.xml',
      host: 'https://marshandember.netlify.app',
    })
  })
})
