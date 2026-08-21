type PreviewScenario =
  | 'reservation-error'
  | 'private-dining-error'
  | 'event-rsvp-error'

const previewScenarios: readonly PreviewScenario[] = [
  'reservation-error',
  'private-dining-error',
  'event-rsvp-error',
]

export function readPreviewScenario(search: string): PreviewScenario | null {
  const scenario = new URLSearchParams(search).get('previewScenario')
  return previewScenarios.includes(scenario as PreviewScenario)
    ? (scenario as PreviewScenario)
    : null
}
