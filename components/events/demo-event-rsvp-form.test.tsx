import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {
  createDemoEventRsvpAdapter,
  type DemoEventRsvpAdapter,
  type DemoEventRsvpResult,
} from '@/lib/event-rsvp'
import {DemoEventRsvpForm} from './demo-event-rsvp-form'

const event = {
  slug: 'harvest-at-the-hearth',
  title: 'Harvest at the Hearth',
  date: 'September 24, 2026',
  time: '6:30 PM',
}

function renderForm(adapter: DemoEventRsvpAdapter = createDemoEventRsvpAdapter({delay: 0})) {
  return render(<DemoEventRsvpForm event={event} adapter={adapter} />)
}

async function fillValidRsvp(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^First name/), 'Avery')
  await user.type(screen.getByLabelText(/^Last name/), 'Example')
  await user.type(screen.getByLabelText(/^Email address/), 'avery@example.com')
  await user.type(screen.getByLabelText(/^Phone number/), '(843) 555-0100')
  await user.selectOptions(screen.getByLabelText(/^Number of guests/), '2')
  await user.click(screen.getByLabelText(/^I understand/))
}

describe('event RSVP preview', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({matches: true}))
  })

  it('discloses the no-I/O preview and focuses an associated validation summary', async () => {
    const complete = vi.fn()
    const user = userEvent.setup()
    renderForm({complete})

    expect(screen.getByRole('heading', {name: 'Use fictional information only'})).toBeInTheDocument()
    expect(screen.getByText(/No RSVP request or form value is sent, stored, emailed, or reviewed/)).toBeInTheDocument()
    expect(screen.queryByRole('button', {name: /preview error|simulate failure/i})).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', {name: 'Complete RSVP Preview'}))

    const summary = screen.getByRole('alert')
    expect(summary).toHaveFocus()
    expect(summary).toHaveTextContent('First name is required')
    expect(screen.getByLabelText(/^First name/)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText(/^First name/)).toHaveAttribute('aria-describedby', 'firstName-error')
    expect(complete).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText(/^First name/), 'Avery')

    expect(screen.queryByText('First name is required.')).not.toBeInTheDocument()
    expect(summary).toHaveTextContent('Last name is required')
  })

  it('disables the full form while pending and clears personal values on completion', async () => {
    let resolveCompletion: ((value: DemoEventRsvpResult) => void) | undefined
    const complete = vi.fn(() => new Promise<DemoEventRsvpResult>((resolve) => {
      resolveCompletion = resolve
    }))
    const user = userEvent.setup()
    renderForm({complete})
    await fillValidRsvp(user)
    await user.type(screen.getByLabelText('Dietary or accessibility information'), 'Secret fictional note')

    await user.click(screen.getByRole('button', {name: 'Complete RSVP Preview'}))

    expect(screen.getByRole('status')).toHaveTextContent('No information is being transmitted')
    expect(screen.getByRole('button', {name: 'Completing Preview…'})).toBeDisabled()
    expect(screen.getByLabelText(/^First name/)).toBeDisabled()
    await user.click(screen.getByRole('button', {name: 'Completing Preview…'}))
    expect(complete).toHaveBeenCalledTimes(1)

    resolveCompletion?.({previewReference: 'PREVIEW-ER-TEST-0001'})

    const completionHeading = await screen.findByRole('heading', {name: 'RSVP preview complete'})
    await waitFor(() => expect(completionHeading).toHaveFocus())
    expect(screen.getByText('PREVIEW-ER-TEST-0001')).toBeInTheDocument()
    expect(screen.getByText(/no RSVP request was created/i)).toBeInTheDocument()
    expect(screen.getByText('Party of 2')).toBeInTheDocument()
    expect(screen.queryByDisplayValue('Avery')).not.toBeInTheDocument()
    expect(screen.queryByText('avery@example.com')).not.toBeInTheDocument()
    expect(screen.queryByText('Secret fictional note')).not.toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'Explore All Events'})).toHaveAttribute('href', '/events')
    expect(screen.getByRole('link', {name: 'Plan Your Visit'})).toHaveAttribute('href', '/visit')
  })

  it('preserves values through a controlled failure and retries successfully', async () => {
    let attempts = 0
    const complete: DemoEventRsvpAdapter['complete'] = vi.fn(async () => {
      if (attempts++ === 0) throw new Error('Controlled preview failure')
      return {previewReference: 'PREVIEW-ER-RETRY-0001' as const}
    })
    const user = userEvent.setup()
    renderForm({complete})
    await fillValidRsvp(user)

    await user.click(screen.getByRole('button', {name: 'Complete RSVP Preview'}))

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('We couldn’t complete the RSVP preview'),
    )
    expect(screen.getByRole('alert')).toHaveFocus()
    expect(screen.getByLabelText(/^First name/)).toHaveValue('Avery')
    expect(screen.getByText(/No request was submitted, no email was sent/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', {name: 'Try Again'}))

    await screen.findByRole('heading', {name: 'RSVP preview complete'})
    expect(complete).toHaveBeenLastCalledWith(
      expect.objectContaining({firstName: 'Avery', guestCount: '2'}),
      expect.any(AbortSignal),
      'success',
    )
  })

  it('aborts active local work when unmounted', async () => {
    let activeSignal: AbortSignal | undefined
    const complete: DemoEventRsvpAdapter['complete'] = vi.fn((_request, signal) => {
      activeSignal = signal
      return new Promise<DemoEventRsvpResult>(() => undefined)
    })
    const user = userEvent.setup()
    const view = renderForm({complete})
    await fillValidRsvp(user)

    await user.click(screen.getByRole('button', {name: 'Complete RSVP Preview'}))
    expect(activeSignal?.aborted).toBe(false)

    view.unmount()

    expect(activeSignal?.aborted).toBe(true)
  })
})
