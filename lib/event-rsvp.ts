export const EVENT_RSVP_GUEST_OPTIONS = ['1', '2', '3', '4', '5', '6'] as const

export type EventRsvpValues = {
  firstName: string
  lastName: string
  email: string
  phone: string
  guestCount: string
  details: string
  acknowledgment: boolean
}

export type EventRsvpField = keyof EventRsvpValues
export type EventRsvpErrors = Partial<Record<EventRsvpField, string>>
type NormalizedEventRsvp = EventRsvpValues
export type DemoEventRsvpScenario = 'success' | 'error'
export type DemoEventRsvpResult = {previewReference: `PREVIEW-ER-${string}`}

export type EventRsvpContext = {
  slug: string
  title: string
  date: string
  time: string
}

export interface DemoEventRsvpAdapter {
  complete(
    request: NormalizedEventRsvp,
    signal: AbortSignal,
    scenario?: DemoEventRsvpScenario,
  ): Promise<DemoEventRsvpResult>
}

export const EMPTY_EVENT_RSVP: EventRsvpValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  guestCount: '',
  details: '',
  acknowledgment: false,
}

export const EVENT_RSVP_FIELD_ORDER: readonly EventRsvpField[] = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'guestCount',
  'acknowledgment',
]

export function normalizeEventRsvp(values: EventRsvpValues): NormalizedEventRsvp {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    guestCount: values.guestCount.trim(),
    details: values.details.trim(),
    acknowledgment: values.acknowledgment,
  }
}

export function validateEventRsvp(values: EventRsvpValues): EventRsvpErrors {
  const request = normalizeEventRsvp(values)
  const errors: EventRsvpErrors = {}

  if (!request.firstName) errors.firstName = 'First name is required.'
  if (!request.lastName) errors.lastName = 'Last name is required.'
  if (!request.email) errors.email = 'Email address is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email)) {
    errors.email = 'Enter a valid email address.'
  }
  if (!request.phone) errors.phone = 'Phone number is required.'
  if (!EVENT_RSVP_GUEST_OPTIONS.includes(request.guestCount as typeof EVENT_RSVP_GUEST_OPTIONS[number])) {
    errors.guestCount = 'Select a number of guests.'
  }
  if (!request.acknowledgment) {
    errors.acknowledgment = 'Confirm the acknowledgment to continue.'
  }

  return errors
}

function wait(delay: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Operation aborted', 'AbortError'))
      return
    }

    const timer = globalThis.setTimeout(resolve, delay)
    signal.addEventListener(
      'abort',
      () => {
        globalThis.clearTimeout(timer)
        reject(new DOMException('Operation aborted', 'AbortError'))
      },
      {once: true},
    )
  })
}

export function createDemoEventRsvpAdapter({delay = 650}: {delay?: number} = {}): DemoEventRsvpAdapter {
  return {
    async complete(request, signal, scenario = 'success') {
      void request
      await wait(delay, signal)
      if (scenario === 'error') throw new Error('Simulated RSVP preview failure')
      return {previewReference: 'PREVIEW-ER-LOCAL-0001'}
    },
  }
}
