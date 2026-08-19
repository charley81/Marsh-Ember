import {describe, expect, it} from 'vitest'
import {readPreviewScenario} from './preview-scenario'

describe('preview scenario', () => {
  it.each([
    ['?previewScenario=reservation-error', 'reservation-error'],
    ['?previewScenario=private-dining-error', 'private-dining-error'],
  ] as const)('reads the supported scenario from %s', (search, scenario) => {
    expect(readPreviewScenario(search)).toBe(scenario)
  })

  it.each(['', '?previewScenario=unknown', '?other=reservation-error'])(
    'ignores unsupported search input %s',
    (search) => {
      expect(readPreviewScenario(search)).toBeNull()
    },
  )
})
