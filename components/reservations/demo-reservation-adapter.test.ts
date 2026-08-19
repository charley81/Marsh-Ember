import {describe, expect, it} from 'vitest'
import {createDemoReservationAdapter, getDemoAvailability} from './demo-reservation-adapter'

describe('demo reservation adapter', () => {
  it('generates deterministic future fictional availability from an injected clock', () => {
    const availability = getDemoAvailability(new Date('2026-10-20T18:00:00Z'))

    expect(availability.dates.map((date) => date.value)).toEqual([
      '2026-10-22',
      '2026-10-23',
      '2026-10-24',
      '2026-10-29',
    ])
    expect(availability.partySizes).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('fails only the intentional error scenario and recovers on retry', async () => {
    const adapter = createDemoReservationAdapter({
      delay: 0,
      now: () => new Date('2026-10-20T18:00:00Z'),
    })

    await expect(adapter.loadAvailability(new AbortController().signal, 'error')).rejects.toThrow(
      'Simulated provider failure',
    )
    await expect(
      adapter.loadAvailability(new AbortController().signal, 'normal'),
    ).resolves.toMatchObject({partySizes: [1, 2, 3, 4, 5, 6]})
  })

  it('creates an explicitly fictional completion without collecting personal data', async () => {
    const adapter = createDemoReservationAdapter({delay: 0})
    const selection = {date: '2026-10-24', time: '6:45 PM', partySize: 4}

    await expect(adapter.complete(selection, new AbortController().signal)).resolves.toEqual({
      ...selection,
      demoReference: 'PREVIEW-20261024-P4',
    })
  })

  it('aborts pending work', async () => {
    const adapter = createDemoReservationAdapter({delay: 100})
    const controller = new AbortController()
    const request = adapter.loadAvailability(controller.signal)

    controller.abort()

    await expect(request).rejects.toMatchObject({name: 'AbortError'})
  })
})
