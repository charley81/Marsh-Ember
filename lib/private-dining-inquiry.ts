export const EVENT_TYPES = [
  'Celebration',
  'Business dinner',
  'Reception',
  'Other gathering',
] as const

export const PREFERRED_TIMES = ['Afternoon', 'Evening', 'Flexible'] as const

export const SPACE_PREFERENCES = [
  'Private Dining Room',
  'Full Restaurant Gathering',
  'Open to recommendation',
] as const

export const BUDGET_OPTIONS = ['Prefer to discuss with the events team'] as const

export type PrivateDiningInquiryValues = {
  firstName: string
  lastName: string
  email: string
  phone: string
  eventType: string
  preferredDate: string
  preferredTime: string
  guestCount: string
  alternateDate: string
  space: string
  budget: string
  additionalInformation: string
  acknowledgment: boolean
}

export type PrivateDiningInquiryField = keyof PrivateDiningInquiryValues
export type PrivateDiningInquiryErrors = Partial<Record<PrivateDiningInquiryField, string>>
type NormalizedPrivateDiningInquiry = PrivateDiningInquiryValues
export type DemoInquiryScenario = 'success' | 'error'
export type DemoInquiryResult = {demoReference: `PREVIEW-PD-${string}`}

export interface DemoPrivateDiningAdapter {
  complete(
    inquiry: NormalizedPrivateDiningInquiry,
    signal: AbortSignal,
    scenario?: DemoInquiryScenario,
  ): Promise<DemoInquiryResult>
}

export const EMPTY_PRIVATE_DINING_INQUIRY: PrivateDiningInquiryValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  eventType: '',
  preferredDate: '',
  preferredTime: '',
  guestCount: '',
  alternateDate: '',
  space: '',
  budget: '',
  additionalInformation: '',
  acknowledgment: false,
}

export const PRIVATE_DINING_FIELD_ORDER: readonly PrivateDiningInquiryField[] = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'eventType',
  'preferredDate',
  'preferredTime',
  'guestCount',
  'acknowledgment',
]

export function normalizePrivateDiningInquiry(
  values: PrivateDiningInquiryValues,
): NormalizedPrivateDiningInquiry {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    eventType: values.eventType.trim(),
    preferredDate: values.preferredDate.trim(),
    preferredTime: values.preferredTime.trim(),
    guestCount: values.guestCount.trim(),
    alternateDate: values.alternateDate.trim(),
    space: values.space.trim(),
    budget: values.budget.trim(),
    additionalInformation: values.additionalInformation.trim(),
    acknowledgment: values.acknowledgment,
  }
}

function toLocalIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

function isOption(value: string, options: readonly string[]) {
  return options.includes(value)
}

export function validatePrivateDiningInquiry(
  values: PrivateDiningInquiryValues,
  now = new Date(),
): PrivateDiningInquiryErrors {
  const inquiry = normalizePrivateDiningInquiry(values)
  const errors: PrivateDiningInquiryErrors = {}

  if (!inquiry.firstName) errors.firstName = 'First name is required.'
  if (!inquiry.lastName) errors.lastName = 'Last name is required.'
  if (!inquiry.email) errors.email = 'Email address is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email)) {
    errors.email = 'Enter a valid email address.'
  }
  if (!inquiry.phone) errors.phone = 'Phone number is required.'
  if (!isOption(inquiry.eventType, EVENT_TYPES)) errors.eventType = 'Select an event type.'
  if (!isIsoDate(inquiry.preferredDate)) errors.preferredDate = 'Enter a valid preferred date.'
  else if (inquiry.preferredDate < toLocalIsoDate(now)) {
    errors.preferredDate = 'Preferred date cannot be in the past.'
  }
  if (!isOption(inquiry.preferredTime, PREFERRED_TIMES)) {
    errors.preferredTime = 'Select a preferred time of day.'
  }
  if (!/^\d+$/.test(inquiry.guestCount) || Number(inquiry.guestCount) < 1) {
    errors.guestCount = 'Enter an estimated guest count of at least 1.'
  }
  if (!inquiry.acknowledgment) {
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

export function createDemoPrivateDiningAdapter({delay = 650}: {delay?: number} = {}): DemoPrivateDiningAdapter {
  return {
    async complete(inquiry, signal, scenario = 'success') {
      void inquiry
      await wait(delay, signal)
      if (scenario === 'error') throw new Error('Simulated inquiry failure')
      return {demoReference: 'PREVIEW-PD-LOCAL-0001'}
    },
  }
}
