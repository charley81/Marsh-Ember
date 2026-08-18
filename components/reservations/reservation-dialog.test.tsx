import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {restaurant} from '@/lib/site-data'
import {ReservationProvider} from './reservation-provider'
import {ReservationTrigger} from './reservation-trigger'

function renderReservationTriggers() {
  return render(
    <ReservationProvider settings={restaurant}>
      <ReservationTrigger>Reserve from header</ReservationTrigger>
      <ReservationTrigger variant="secondary">Reserve from page</ReservationTrigger>
    </ReservationProvider>,
  )
}

describe('demo reservation dialog', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({matches: true}))
  })

  it('discloses the demo and restores focus to the exact trigger', async () => {
    const user = userEvent.setup()
    renderReservationTriggers()
    const trigger = screen.getByRole('button', {name: 'Reserve from page'})

    await user.click(trigger)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Marsh & Ember is a fictional restaurant. Explore the booking experience, but no reservation will be created.',
      ),
    ).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', {name: 'Start Demo'})).toHaveFocus())

    await user.keyboard('{Escape}')

    await waitFor(() => expect(trigger).toHaveFocus())
    expect(screen.queryByRole('dialog', {hidden: true})).not.toBeInTheDocument()
  })

  it('completes a truthful in-memory demo journey', async () => {
    const user = userEvent.setup()
    renderReservationTriggers()

    await user.click(screen.getByRole('button', {name: 'Reserve from header'}))
    await user.click(screen.getByRole('button', {name: 'Start Demo'}))

    await waitFor(() =>
      expect(screen.getByRole('heading', {name: 'Choose your table'})).toBeInTheDocument(),
    )
    await user.selectOptions(screen.getByLabelText('Party size'), '4')
    const date = screen.getByLabelText('Date')
    await user.selectOptions(date, (date.querySelectorAll('option')[1] as HTMLOptionElement).value)
    await user.selectOptions(screen.getByLabelText('Time'), '6:45 PM')
    await user.click(screen.getByRole('button', {name: 'Complete Demo'}))

    await waitFor(() =>
      expect(screen.getByRole('heading', {name: 'Demo reservation complete'})).toBeInTheDocument(),
    )
    expect(
      screen.getByText(
        'No table was held, no information was submitted, and no confirmation email was sent.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText(/^DEMO-/)).toBeInTheDocument()
    expect(screen.queryByLabelText(/email|name|phone/i)).not.toBeInTheDocument()
  })

  it('identifies missing fictional booking choices without losing the form', async () => {
    const user = userEvent.setup()
    renderReservationTriggers()

    await user.click(screen.getByRole('button', {name: 'Reserve from header'}))
    await user.click(screen.getByRole('button', {name: 'Start Demo'}))
    await waitFor(() =>
      expect(screen.getByRole('heading', {name: 'Choose your table'})).toBeInTheDocument(),
    )
    await user.click(screen.getByRole('button', {name: 'Complete Demo'}))

    expect(screen.getByRole('alert')).toHaveTextContent('party size, date, time')
    expect(screen.getByLabelText('Party size')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('heading', {name: 'Choose your table'})).toBeInTheDocument()
  })

  it('previews provider failure and recovers on retry', async () => {
    const user = userEvent.setup()
    renderReservationTriggers()

    await user.click(screen.getByRole('button', {name: 'Reserve from header'}))
    await user.click(screen.getByRole('button', {name: 'Preview Error State'}))

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Your table has not been reserved.'),
    )
    await user.click(screen.getByRole('button', {name: 'Try Again'}))

    await waitFor(() =>
      expect(screen.getByRole('heading', {name: 'Choose your table'})).toBeInTheDocument(),
    )
  })
})
