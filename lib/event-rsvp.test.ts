import {describe, expect, it} from 'vitest'
import {
  createDemoEventRsvpAdapter,
  EMPTY_EVENT_RSVP,
  EVENT_RSVP_GUEST_OPTIONS,
  normalizeEventRsvp,
  validateEventRsvp,
  type EventRsvpValues,
} from './event-rsvp'

const validRequest: EventRsvpValues = {
  firstName: 'Avery',
  lastName: 'Example',
  email: 'avery@example.com',
  phone: '(843) 555-0100',
  guestCount: '2',
  details: 'A fictional accessibility note.',
  acknowledgment: true,
}

describe('event RSVP validation', () => {
  it('normalizes strings without mutating the original values', () => {
    const values = {...validRequest, firstName: '  Avery  ', details: ' Note  '}

    expect(normalizeEventRsvp(values)).toMatchObject({firstName: 'Avery', details: 'Note'})
    expect(values.firstName).toBe('  Avery  ')
  })

  it('identifies every missing required field in form order', () => {
    expect(validateEventRsvp(EMPTY_EVENT_RSVP)).toEqual({
      firstName: 'First name is required.',
      lastName: 'Last name is required.',
      email: 'Email address is required.',
      phone: 'Phone number is required.',
      guestCount: 'Select a number of guests.',
      acknowledgment: 'Confirm the acknowledgment to continue.',
    })
  })

  it.each([
    ['malformed email', {email: 'avery@example'}, 'email'],
    ['blank phone', {phone: '   '}, 'phone'],
    ['empty guest count', {guestCount: ''}, 'guestCount'],
    ['unknown guest count', {guestCount: '7'}, 'guestCount'],
    ['missing acknowledgment', {acknowledgment: false}, 'acknowledgment'],
  ] as const)('rejects %s', (_name, patch, field) => {
    expect(validateEventRsvp({...validRequest, ...patch})).toHaveProperty(field)
  })

  it.each(EVENT_RSVP_GUEST_OPTIONS)('accepts guest option %s and empty optional details', (guestCount) => {
    expect(validateEventRsvp({...validRequest, guestCount, details: ''})).toEqual({})
  })
})

describe('demo event RSVP adapter', () => {
  it('completes locally with a reference that contains no submitted value', async () => {
    const adapter = createDemoEventRsvpAdapter({delay: 0})

    const result = await adapter.complete(validRequest, new AbortController().signal)

    expect(result).toEqual({previewReference: 'PREVIEW-ER-LOCAL-0001'})
    expect(JSON.stringify(result)).not.toMatch(/Avery|example\.com|555|accessibility|guestCount/i)
  })

  it('fails only the intentional error scenario and recovers', async () => {
    const adapter = createDemoEventRsvpAdapter({delay: 0})

    await expect(
      adapter.complete(validRequest, new AbortController().signal, 'error'),
    ).rejects.toThrow('Simulated RSVP preview failure')
    await expect(
      adapter.complete(validRequest, new AbortController().signal),
    ).resolves.toMatchObject({previewReference: expect.stringMatching(/^PREVIEW-ER-/)})
  })

  it('aborts pending work', async () => {
    const adapter = createDemoEventRsvpAdapter({delay: 100})
    const controller = new AbortController()
    const request = adapter.complete(validRequest, controller.signal)

    controller.abort()

    await expect(request).rejects.toMatchObject({name: 'AbortError'})
  })
})
