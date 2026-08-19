import {describe, expect, it} from 'vitest'
import {
  createDemoPrivateDiningAdapter,
  EMPTY_PRIVATE_DINING_INQUIRY,
  normalizePrivateDiningInquiry,
  validatePrivateDiningInquiry,
  type PrivateDiningInquiryValues,
} from './private-dining-inquiry'

const validInquiry: PrivateDiningInquiryValues = {
  firstName: 'Avery',
  lastName: 'Example',
  email: 'avery@example.com',
  phone: '(843) 555-0100',
  eventType: 'Celebration',
  preferredDate: '2026-11-15',
  preferredTime: 'Evening',
  guestCount: '24',
  alternateDate: '',
  space: '',
  budget: '',
  additionalInformation: 'A fictional anniversary dinner.',
  acknowledgment: true,
}

const now = new Date('2026-10-20T18:00:00Z')

describe('private dining inquiry validation', () => {
  it('normalizes text without mutating the original values', () => {
    const values = {...validInquiry, firstName: '  Avery  ', additionalInformation: ' Note  '}

    expect(normalizePrivateDiningInquiry(values)).toMatchObject({
      firstName: 'Avery',
      additionalInformation: 'Note',
    })
    expect(values.firstName).toBe('  Avery  ')
  })

  it('identifies every missing required field', () => {
    expect(validatePrivateDiningInquiry(EMPTY_PRIVATE_DINING_INQUIRY, now)).toEqual({
      firstName: 'First name is required.',
      lastName: 'Last name is required.',
      email: 'Email address is required.',
      phone: 'Phone number is required.',
      eventType: 'Select an event type.',
      preferredDate: 'Enter a valid preferred date.',
      preferredTime: 'Select a preferred time of day.',
      guestCount: 'Enter an estimated guest count of at least 1.',
      acknowledgment: 'Confirm the acknowledgment to continue.',
    })
  })

  it.each([
    ['malformed email', {email: 'avery@example'}, 'email'],
    ['blank phone', {phone: '   '}, 'phone'],
    ['unknown event type', {eventType: 'Wedding'}, 'eventType'],
    ['malformed date', {preferredDate: '2026-02-31'}, 'preferredDate'],
    ['past date', {preferredDate: '2026-10-19'}, 'preferredDate'],
    ['unknown time', {preferredTime: 'Morning'}, 'preferredTime'],
    ['decimal guests', {guestCount: '2.5'}, 'guestCount'],
    ['zero guests', {guestCount: '0'}, 'guestCount'],
    ['negative guests', {guestCount: '-2'}, 'guestCount'],
    ['missing acknowledgment', {acknowledgment: false}, 'acknowledgment'],
  ] as const)('rejects %s', (_name, patch, field) => {
    expect(validatePrivateDiningInquiry({...validInquiry, ...patch}, now)).toHaveProperty(field)
  })

  it('accepts today and empty optional fields', () => {
    expect(
      validatePrivateDiningInquiry({...validInquiry, preferredDate: '2026-10-20'}, now),
    ).toEqual({})
  })
})

describe('demo private dining adapter', () => {
  it('completes locally with a reference that contains no personal values', async () => {
    const adapter = createDemoPrivateDiningAdapter({delay: 0})

    const result = await adapter.complete(validInquiry, new AbortController().signal)

    expect(result).toEqual({demoReference: 'DEMO-PD-LOCAL-0001'})
    expect(JSON.stringify(result)).not.toMatch(/Avery|example\.com|555|anniversary/i)
  })

  it('fails only the intentional error scenario and recovers', async () => {
    const adapter = createDemoPrivateDiningAdapter({delay: 0})

    await expect(
      adapter.complete(validInquiry, new AbortController().signal, 'error'),
    ).rejects.toThrow('Simulated inquiry failure')
    await expect(
      adapter.complete(validInquiry, new AbortController().signal),
    ).resolves.toMatchObject({demoReference: expect.stringMatching(/^DEMO-PD-/)})
  })

  it('aborts pending work', async () => {
    const adapter = createDemoPrivateDiningAdapter({delay: 100})
    const controller = new AbortController()
    const request = adapter.complete(validInquiry, controller.signal)

    controller.abort()

    await expect(request).rejects.toMatchObject({name: 'AbortError'})
  })
})
