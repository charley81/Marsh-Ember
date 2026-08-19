import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {createDemoPrivateDiningAdapter, type DemoInquiryResult, type DemoPrivateDiningAdapter} from '@/lib/private-dining-inquiry'
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

describe('demo private dining form', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({matches: true}))
  })

  it('discloses the local demo and focuses an associated validation summary', async () => {
    const user = userEvent.setup()
    renderForm()

    expect(screen.getByText('Portfolio demo only')).toBeInTheDocument()
    expect(screen.getByText(/No inquiry will be sent, stored, emailed, or reviewed/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', {name: 'Complete Demo Inquiry'}))

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
    let resolveCompletion: ((value: {demoReference: `DEMO-PD-${string}`}) => void) | undefined
    const adapter: DemoPrivateDiningAdapter = {
      complete: vi.fn(() => new Promise<DemoInquiryResult>((resolve) => { resolveCompletion = resolve })),
    }
    const user = userEvent.setup()
    renderForm(adapter)
    await fillValidInquiry(user)
    await user.type(screen.getByLabelText('Additional information'), 'Secret fictional note')

    await user.click(screen.getByRole('button', {name: 'Complete Demo Inquiry'}))

    expect(screen.getByRole('status')).toHaveTextContent('No information is being transmitted')
    expect(screen.getByRole('button', {name: 'Completing Demo…'})).toBeDisabled()
    expect(screen.getByLabelText(/^First name/)).toBeDisabled()

    resolveCompletion?.({demoReference: 'DEMO-PD-TEST-0001'})

    await waitFor(() => expect(screen.getByRole('heading', {name: 'Demo inquiry complete'})).toBeInTheDocument())
    expect(screen.getByText('DEMO-PD-TEST-0001')).toBeInTheDocument()
    expect(screen.getByText(/no team will contact you/i)).toBeInTheDocument()
    expect(screen.queryByDisplayValue('Avery')).not.toBeInTheDocument()
    expect(screen.queryByText('Secret fictional note')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', {name: 'Restart Demo'}))
    expect(screen.getByLabelText(/^First name/)).toHaveValue('')
    expect(screen.getByLabelText(/^First name/)).toHaveFocus()
  })

  it('validates the error preview, preserves values, and retries successfully', async () => {
    const complete = vi.fn(async (_inquiry, _signal, scenario) => {
      if (scenario === 'error') throw new Error('Intentional test failure')
      return {demoReference: 'DEMO-PD-RETRY-0001' as const}
    })
    const user = userEvent.setup()
    renderForm({complete})

    await user.click(screen.getByRole('button', {name: 'Preview Error State'}))
    expect(screen.getByRole('alert')).toHaveTextContent('First name is required')
    expect(complete).not.toHaveBeenCalled()

    await fillValidInquiry(user)
    await user.click(screen.getByRole('button', {name: 'Preview Error State'}))

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Simulated submission error'))
    expect(screen.getByLabelText(/^First name/)).toHaveValue('Avery')
    expect(screen.getByText(/No information was submitted and no date was held/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', {name: 'Try Again'}))

    await waitFor(() => expect(screen.getByRole('heading', {name: 'Demo inquiry complete'})).toBeInTheDocument())
    expect(complete).toHaveBeenLastCalledWith(expect.objectContaining({firstName: 'Avery'}), expect.any(AbortSignal), 'success')
  })
})
