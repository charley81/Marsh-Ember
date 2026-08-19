import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {
  createDemoPrivateDiningAdapter,
  type DemoInquiryResult,
  type DemoPrivateDiningAdapter,
} from '@/lib/private-dining-inquiry'
import {DemoPrivateDiningForm} from './demo-private-dining-form'

const settings = {
  privateDiningEmail: 'events@marshandember.example',
  privateDiningPhone: '(843) 555-0100',
  privateDiningPhoneHref: 'tel:+18435550100',
}

function renderForm(adapter: DemoPrivateDiningAdapter = createDemoPrivateDiningAdapter({delay: 0})) {
  return render(<DemoPrivateDiningForm {...settings} adapter={adapter} />)
}

async function fillValidInquiry(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^First name/), 'Avery')
  await user.type(screen.getByLabelText(/^Last name/), 'Example')
  await user.type(screen.getByLabelText(/^Email address/), 'avery@example.com')
  await user.type(screen.getByLabelText(/^Phone number/), '(843) 555-0100')
  await user.selectOptions(screen.getByLabelText(/^Event type/), 'Celebration')
  await user.type(screen.getByLabelText(/^Preferred date/), '2099-11-15')
  await user.selectOptions(screen.getByLabelText(/^Preferred time of day/), 'Evening')
  await user.type(screen.getByLabelText(/^Estimated guest count/), '24')
  await user.click(screen.getByLabelText(/^I understand/))
}

describe('private dining inquiry preview', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({matches: true}))
  })

  it('discloses the local preview and focuses an associated validation summary', async () => {
    const user = userEvent.setup()
    renderForm()

    expect(screen.getByRole('heading', {name: 'Use fictional information only'})).toBeInTheDocument()
    expect(screen.getByText(/This portfolio preview is not sent, stored, emailed, or reviewed/)).toBeInTheDocument()
    expect(screen.queryByRole('button', {name: 'Preview Error State'})).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', {name: 'Complete Inquiry Preview'}))

    const summary = screen.getByRole('alert')
    expect(summary).toHaveFocus()
    expect(summary).toHaveTextContent('First name is required')
    expect(screen.getByLabelText(/^First name/)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText(/^First name/)).toHaveAttribute('aria-describedby', 'firstName-error')

    await user.type(screen.getByLabelText(/^First name/), 'Avery')

    expect(screen.queryByText('First name is required.')).not.toBeInTheDocument()
    expect(summary).toHaveTextContent('Last name is required')
  })

  it('shows a disabled truthful pending state, then clears personal values on completion', async () => {
    let resolveCompletion: ((value: DemoInquiryResult) => void) | undefined
    const adapter: DemoPrivateDiningAdapter = {
      complete: vi.fn(() => new Promise<DemoInquiryResult>((resolve) => { resolveCompletion = resolve })),
    }
    const user = userEvent.setup()
    renderForm(adapter)
    await fillValidInquiry(user)
    await user.type(screen.getByLabelText('Additional information'), 'Secret fictional note')

    await user.click(screen.getByRole('button', {name: 'Complete Inquiry Preview'}))

    expect(screen.getByRole('status')).toHaveTextContent('No information is being transmitted')
    expect(screen.getByRole('button', {name: 'Completing Preview…'})).toBeDisabled()
    expect(screen.getByLabelText(/^First name/)).toBeDisabled()

    resolveCompletion?.({demoReference: 'PREVIEW-PD-TEST-0001'})

    await waitFor(() =>
      expect(screen.getByRole('heading', {name: 'Inquiry preview complete'})).toBeInTheDocument(),
    )
    expect(screen.getByText('PREVIEW-PD-TEST-0001')).toBeInTheDocument()
    expect(screen.getByText(/no team will contact you/i)).toBeInTheDocument()
    expect(screen.queryByDisplayValue('Avery')).not.toBeInTheDocument()
    expect(screen.queryByText('Secret fictional note')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', {name: 'Start Over'}))
    expect(screen.getByLabelText(/^First name/)).toHaveValue('')
    expect(screen.getByLabelText(/^First name/)).toHaveFocus()
  })

  it('preserves values through a controlled failure and retries successfully', async () => {
    let attempts = 0
    const complete: DemoPrivateDiningAdapter['complete'] = vi.fn(async () => {
      if (attempts++ === 0) throw new Error('Controlled submission failure')
      return {demoReference: 'PREVIEW-PD-RETRY-0001' as const}
    })
    const user = userEvent.setup()
    renderForm({complete})

    await user.click(screen.getByRole('button', {name: 'Complete Inquiry Preview'}))
    expect(screen.getByRole('alert')).toHaveTextContent('First name is required')
    expect(complete).not.toHaveBeenCalled()

    await fillValidInquiry(user)
    await user.click(screen.getByRole('button', {name: 'Complete Inquiry Preview'}))

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('We couldn’t complete the inquiry preview'),
    )
    expect(screen.getByLabelText(/^First name/)).toHaveValue('Avery')
    expect(screen.getByText(/No information was submitted and no date was held/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', {name: 'Try Again'}))

    await waitFor(() =>
      expect(screen.getByRole('heading', {name: 'Inquiry preview complete'})).toBeInTheDocument(),
    )
    expect(complete).toHaveBeenLastCalledWith(
      expect.objectContaining({firstName: 'Avery'}),
      expect.any(AbortSignal),
      'success',
    )
  })
})
