'use client'

import {type FormEvent, type KeyboardEvent, useEffect, useRef, useState} from 'react'
import type {RestaurantSettings} from '@/lib/content-types'
import {
  createDemoReservationAdapter,
  type AvailabilityScenario,
  type DemoAvailability,
  type DemoCompletion,
  type DemoSelection,
  type ReservationProviderAdapter,
} from './demo-reservation-adapter'

type Phase = 'introduction' | 'loading' | 'availability' | 'completing' | 'error' | 'complete'

const emptySelection = {date: '', time: '', partySize: 0}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError'
}

export function ReservationDialog({
  onRequestClose,
  settings,
}: {
  onRequestClose: () => void
  settings: Pick<RestaurantSettings, 'mapUrl' | 'phone' | 'phoneHref'>
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const startRef = useRef<HTMLButtonElement>(null)
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const adapterRef = useRef<ReservationProviderAdapter | null>(null)
  const [phase, setPhase] = useState<Phase>('introduction')
  const [availability, setAvailability] = useState<DemoAvailability | null>(null)
  const [selection, setSelection] = useState<DemoSelection>(emptySelection)
  const [completion, setCompletion] = useState<DemoCompletion | null>(null)
  const [showValidation, setShowValidation] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (typeof dialog.showModal === 'function') dialog.showModal()
    else dialog.setAttribute('open', '')

    const focusFrame = window.requestAnimationFrame(() => startRef.current?.focus())
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      abortRef.current?.abort()
      window.cancelAnimationFrame(focusFrame)
      document.body.style.overflow = previousOverflow
    }
  }, [])

  const getAdapter = () => {
    if (!adapterRef.current) {
      const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
      adapterRef.current = createDemoReservationAdapter({delay: reducedMotion ? 0 : 650})
    }
    return adapterRef.current
  }

  const loadAvailability = async (scenario: AvailabilityScenario) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setPhase('loading')

    try {
      const result = await getAdapter().loadAvailability(controller.signal, scenario)
      setAvailability(result)
      setPhase('availability')
    } catch (error) {
      if (!isAbortError(error)) setPhase('error')
    }
  }

  const submitDemo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selection.date || !selection.time || !selection.partySize) {
      setShowValidation(true)
      window.requestAnimationFrame(() => errorSummaryRef.current?.focus())
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setPhase('completing')

    try {
      const result = await getAdapter().complete(selection, controller.signal)
      setCompletion(result)
      setPhase('complete')
    } catch (error) {
      if (!isAbortError(error)) setPhase('error')
    }
  }

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onRequestClose()
      return
    }
    if (event.key !== 'Tab') return
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], select:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    if (!focusable?.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const selectedDate = availability?.dates.find((date) => date.value === selection.date)
  const missing = [
    !selection.partySize ? 'party size' : null,
    !selection.date ? 'date' : null,
    !selection.time ? 'time' : null,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <dialog
      ref={dialogRef}
      className="reservation-dialog"
      aria-labelledby="reservation-title"
      aria-describedby="reservation-description"
      onCancel={(event) => {
        event.preventDefault()
        onRequestClose()
      }}
      onKeyDown={handleDialogKeyDown}
    >
      <div className="reservation-dialog__panel">
        <header className="reservation-dialog__header">
          <div className="reservation-dialog__header-row">
            <p className="reservation-dialog__eyebrow">Reservations</p>
            <button
              className="reservation-dialog__close"
              type="button"
              aria-label="Close reservation demo"
              onClick={onRequestClose}
            >
              ×
            </button>
          </div>
          <DialogHeading phase={phase} />
        </header>

        {phase === 'introduction' ? (
          <div className="reservation-dialog__body reservation-intro">
            <p className="demo-badge">Portfolio demonstration</p>
            <p id="reservation-description">
              Marsh &amp; Ember is a fictional restaurant. Explore the booking experience, but no
              reservation will be created.
            </p>
            <div className="reservation-demo-notice">
              <strong>No personal information is collected.</strong>
              <span>No table will be held and nothing will be submitted or emailed.</span>
            </div>
            <div className="reservation-dialog__actions">
              <button
                ref={startRef}
                className="button button--primary"
                type="button"
                onClick={() => void loadAvailability('normal')}
              >
                Start Demo
              </button>
              <button
                className="button button--secondary"
                type="button"
                onClick={() => void loadAvailability('error')}
              >
                Preview Error State
              </button>
            </div>
          </div>
        ) : null}

        {phase === 'loading' || phase === 'completing' ? (
          <div
            className="reservation-loading"
            id="reservation-description"
            role="status"
            aria-live="polite"
          >
            <div className="reservation-skeleton" aria-hidden="true">
              <span className="reservation-skeleton__heading" />
              <div className="reservation-skeleton__row">
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="reservation-skeleton__progress">
                <i />
              </div>
            </div>
            <p>
              {phase === 'loading'
                ? 'Loading fictional dates and times…'
                : 'Completing the demonstration…'}
            </p>
          </div>
        ) : null}

        {phase === 'availability' && availability ? (
          <form
            className="reservation-dialog__body reservation-booking"
            onSubmit={(event) => void submitDemo(event)}
            noValidate
          >
            <p id="reservation-description">
              Choose fictional reservation details. They remain only in this browser tab and are
              cleared when the demo resets.
            </p>
            {showValidation ? (
              <div
                ref={errorSummaryRef}
                className="reservation-validation"
                role="alert"
                tabIndex={-1}
              >
                <strong>Choose a {missing} to continue.</strong>
              </div>
            ) : null}
            <div className="reservation-fields">
              <label>
                <span>Party size</span>
                <select
                  value={selection.partySize || ''}
                  required
                  aria-invalid={showValidation && !selection.partySize}
                  onChange={(event) => {
                    setSelection((current) => ({...current, partySize: Number(event.target.value)}))
                    setShowValidation(false)
                  }}
                >
                  <option value="">Select guests</option>
                  {availability.partySizes.map((size) => (
                    <option value={size} key={size}>
                      {size} {size === 1 ? 'guest' : 'guests'}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Date</span>
                <select
                  value={selection.date}
                  required
                  aria-invalid={showValidation && !selection.date}
                  onChange={(event) => {
                    setSelection((current) => ({...current, date: event.target.value, time: ''}))
                    setShowValidation(false)
                  }}
                >
                  <option value="">Select a date</option>
                  {availability.dates.map((date) => (
                    <option value={date.value} key={date.value}>
                      {date.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Time</span>
                <select
                  value={selection.time}
                  required
                  disabled={!selectedDate}
                  aria-invalid={showValidation && !selection.time}
                  onChange={(event) => {
                    setSelection((current) => ({...current, time: event.target.value}))
                    setShowValidation(false)
                  }}
                >
                  <option value="">Select a time</option>
                  {selectedDate?.times.map((time) => (
                    <option value={time} key={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="reservation-privacy">Demo selections are not persisted or transmitted.</p>
            <div className="reservation-dialog__actions">
              <button className="button button--primary" type="submit">
                Complete Demo
              </button>
              <button
                className="button button--secondary"
                type="button"
                onClick={() => setPhase('introduction')}
              >
                Back
              </button>
            </div>
          </form>
        ) : null}

        {phase === 'error' ? (
          <div className="reservation-dialog__body reservation-error">
            <p id="reservation-description">
              The simulated online reservation provider is unavailable. This preview demonstrates a
              safe recovery path.
            </p>
            <div className="reservation-status reservation-status--error" role="alert">
              <span aria-hidden="true">!</span>
              <div>
                <strong>Your table has not been reserved.</strong>
                <p>
                  No data was processed. Try again or contact the fictional restaurant using the
                  options below.
                </p>
              </div>
            </div>
            <div className="reservation-dialog__actions">
              <button
                className="button button--primary"
                type="button"
                onClick={() => void loadAvailability('normal')}
              >
                Try Again
              </button>
              <a className="button button--secondary" href={settings.phoneHref}>
                Call {settings.phone}
              </a>
              <button className="button button--secondary" type="button" onClick={onRequestClose}>
                Close Demo
              </button>
            </div>
          </div>
        ) : null}

        {phase === 'complete' && completion ? (
          <div
            className="reservation-dialog__body reservation-complete"
            role="status"
            aria-live="polite"
          >
            <p id="reservation-description">
              You completed the fictional booking journey. No reservation was created and no email
              was sent.
            </p>
            <dl className="reservation-details">
              <div>
                <dt>Date</dt>
                <dd>{availability?.dates.find((date) => date.value === completion.date)?.label}</dd>
              </div>
              <div>
                <dt>Time</dt>
                <dd>{completion.time}</dd>
              </div>
              <div>
                <dt>Party size</dt>
                <dd>
                  {completion.partySize} {completion.partySize === 1 ? 'guest' : 'guests'}
                </dd>
              </div>
              <div>
                <dt>Demo reference</dt>
                <dd>{completion.demoReference}</dd>
              </div>
            </dl>
            <div className="reservation-demo-notice">
              <strong>Demonstration complete</strong>
              <span>
                No table was held, no information was submitted, and no confirmation email was sent.
              </span>
            </div>
            <div className="reservation-dialog__actions">
              <button className="button button--primary" type="button" onClick={onRequestClose}>
                Done
              </button>
              <a
                className="button button--secondary"
                href={settings.mapUrl}
                target="_blank"
                rel="noreferrer"
              >
                Get Directions <span aria-hidden="true">↗</span>
              </a>
              <button
                className="button button--secondary"
                type="button"
                onClick={() => setPhase('introduction')}
              >
                Restart Demo
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </dialog>
  )
}

function DialogHeading({phase}: {phase: Phase}) {
  const content = {
    introduction: [
      'Reservation experience demo',
      'Review how a standard table reservation would work.',
    ],
    loading: ['Loading reservations', "We're preparing fictional dates and times."],
    availability: ['Choose your table', 'Select details to continue through the demonstration.'],
    completing: ['Completing the demo', "We're preparing your fictional reservation details."],
    error: ["We couldn't load reservations", 'The simulated provider is temporarily unavailable.'],
    complete: [
      'Demo reservation complete',
      'This preview does not represent a real restaurant booking.',
    ],
  }[phase]

  return (
    <>
      <h2 id="reservation-title">{content[0]}</h2>
      <p>{content[1]}</p>
    </>
  )
}
