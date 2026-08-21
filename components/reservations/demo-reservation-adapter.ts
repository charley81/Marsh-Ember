type DemoDateOption = {
  value: string
  label: string
  times: readonly string[]
}

export type DemoAvailability = {
  dates: readonly DemoDateOption[]
  partySizes: readonly number[]
}

export type DemoSelection = {
  date: string
  time: string
  partySize: number
}

export type DemoCompletion = DemoSelection & {
  demoReference: string
}

export type AvailabilityScenario = 'normal' | 'error'

export interface ReservationProviderAdapter {
  loadAvailability(signal: AbortSignal, scenario?: AvailabilityScenario): Promise<DemoAvailability>
  complete(selection: DemoSelection, signal: AbortSignal): Promise<DemoCompletion>
}

const dinnerTimes = ['5:30 PM', '6:45 PM', '8:00 PM'] as const

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function getDemoAvailability(now = new Date()): DemoAvailability {
  const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 2))
  const dates: DemoDateOption[] = []

  while (dates.length < 4) {
    const day = cursor.getUTCDay()
    if (day === 4 || day === 5 || day === 6) {
      dates.push({
        value: toIsoDate(cursor),
        label: formatDate(cursor),
        times: dinnerTimes,
      })
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  return {dates, partySizes: [1, 2, 3, 4, 5, 6]}
}

function wait(delay: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Operation aborted', 'AbortError'))
      return
    }

    const timer = window.setTimeout(resolve, delay)
    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timer)
        reject(new DOMException('Operation aborted', 'AbortError'))
      },
      {once: true},
    )
  })
}

export function createDemoReservationAdapter({
  delay = 650,
  now = () => new Date(),
}: {
  delay?: number
  now?: () => Date
} = {}): ReservationProviderAdapter {
  return {
    async loadAvailability(signal, scenario = 'normal') {
      await wait(delay, signal)
      if (scenario === 'error') throw new Error('Simulated provider failure')
      return getDemoAvailability(now())
    },
    async complete(selection, signal) {
      await wait(Math.min(delay, 400), signal)
      return {
        ...selection,
        demoReference: `PREVIEW-${selection.date.replaceAll('-', '')}-P${selection.partySize}`,
      }
    },
  }
}
