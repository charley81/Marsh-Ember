import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {restaurant} from '@/lib/site-data'
import {createDemoReservationAdapter, type ReservationProviderAdapter} from './demo-reservation-adapter'
import {ReservationProvider} from './reservation-provider'
import {ReservationTrigger} from './reservation-trigger'

function renderReservationTriggers(adapter?: ReservationProviderAdapter) {
  return render(
    <ReservationProvider settings={restaurant} adapter={adapter}>
      <ReservationTrigger>Reserve from header</ReservationTrigger>
      <ReservationTrigger variant="secondary">Reserve from page</ReservationTrigger>
    </ReservationProvider>,
  )
}

describe('reservation preview dialog', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({matches: true}))
  })

  it('discloses the fictional preview and restores focus to the exact trigger', async () => {
    const user = userEvent.setup()
    renderReservationTriggers()
    const trigger = screen.getByRole('button', {name: 'Reserve from page'})

    await user.click(trigger)

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Marsh & Ember is a fictional restaurant. This portfolio preview does not contact a booking provider or create a reservation.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', {name: 'Preview Error State'})).not.toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByRole('button', {name: 'Check Availability'})).toHaveFocus(),
    )

    await user.keyboard('{Escape}')

    await waitFor(() => expect(trigger).toHaveFocus())
    expect(screen.queryByRole('dialog', {hidden: true})).not.toBeInTheDocument()
  })

  it('completes a truthful in-memory reservation preview', async () => {
    const user = userEvent.setup()
    renderReservationTriggers()

    await user.click(screen.getByRole('button', {name: 'Reserve from header'}))
    await user.click(await screen.findByRole('button', {name: 'Check Availability'}))

    await waitFor(() =>
      expect(screen.getByRole('heading', {name: 'Choose your table'})).toBeInTheDocument(),
    )
    await user.selectOptions(screen.getByLabelText('Party size'), '4')
    const date = screen.getByLabelText('Date')
    await user.selectOptions(date, (date.querySelectorAll('option')[1] as HTMLOptionElement).value)
    await user.selectOptions(screen.getByLabelText('Time'), '6:45 PM')
    await user.click(screen.getByRole('button', {name: 'Finish Preview'}))

    await waitFor(() =>
      expect(
        screen.getByRole('heading', {name: 'Reservation preview complete'}),
      ).toBeInTheDocument(),
    )
    expect(
      screen.getByText(
        'No table was held, no information was submitted, and no confirmation email was sent.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText(/^PREVIEW-/)).toBeInTheDocument()
    expect(screen.queryByLabelText(/email|name|phone/i)).not.toBeInTheDocument()
  })

  it('identifies missing fictional booking choices without losing the form', async () => {
    const user = userEvent.setup()
    renderReservationTriggers()

    await user.click(screen.getByRole('button', {name: 'Reserve from header'}))
    await user.click(await screen.findByRole('button', {name: 'Check Availability'}))
    await waitFor(() =>
      expect(screen.getByRole('heading', {name: 'Choose your table'})).toBeInTheDocument(),
    )
    await user.click(screen.getByRole('button', {name: 'Finish Preview'}))

    expect(screen.getByRole('alert')).toHaveTextContent('party size, date, time')
    expect(screen.getByLabelText('Party size')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('heading', {name: 'Choose your table'})).toBeInTheDocument()
  })

  it('handles provider failure and recovers without exposing test controls', async () => {
    const successAdapter = createDemoReservationAdapter({delay: 0})
    let attempts = 0
    const adapter: ReservationProviderAdapter = {
      loadAvailability(signal) {
        if (attempts++ === 0) return Promise.reject(new Error('Controlled provider failure'))
        return successAdapter.loadAvailability(signal)
      },
      complete: successAdapter.complete,
    }
    const user = userEvent.setup()
    renderReservationTriggers(adapter)

    await user.click(screen.getByRole('button', {name: 'Reserve from header'}))
    expect(screen.queryByRole('button', {name: 'Preview Error State'})).not.toBeInTheDocument()
    await user.click(await screen.findByRole('button', {name: 'Check Availability'}))

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Your table has not been reserved.'),
    )
    await user.click(screen.getByRole('button', {name: 'Try Again'}))

    await waitFor(() =>
      expect(screen.getByRole('heading', {name: 'Choose your table'})).toBeInTheDocument(),
    )
  })
})
