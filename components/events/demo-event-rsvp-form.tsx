'use client'

import Link from 'next/link'
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import {FormFieldShell, FormStatus} from '@/components/forms'
import {
  createDemoEventRsvpAdapter,
  EMPTY_EVENT_RSVP,
  EVENT_RSVP_FIELD_ORDER,
  EVENT_RSVP_GUEST_OPTIONS,
  normalizeEventRsvp,
  validateEventRsvp,
  type DemoEventRsvpAdapter,
  type DemoEventRsvpScenario,
  type EventRsvpContext,
  type EventRsvpErrors,
  type EventRsvpField,
  type EventRsvpValues,
} from '@/lib/event-rsvp'
import {readPreviewScenario} from '@/lib/preview-scenario'

type WorkflowState =
  | {phase: 'editing' | 'validation-error' | 'pending' | 'submission-error'; errors: EventRsvpErrors}
  | {phase: 'complete'; previewReference: string; partySize: string}

const fieldLabels: Record<EventRsvpField, string> = {
  firstName: 'First name',
  lastName: 'Last name',
  email: 'Email address',
  phone: 'Phone number',
  guestCount: 'Number of guests',
  details: 'Dietary or accessibility information',
  acknowledgment: 'Acknowledgment',
}

function describedBy(field: EventRsvpField, help?: boolean, error?: string) {
  return [help ? `${field}-help` : null, error ? `${field}-error` : null]
    .filter(Boolean)
    .join(' ') || undefined
}

export function DemoEventRsvpForm({
  event,
  adapter,
}: {
  event: EventRsvpContext
  adapter?: DemoEventRsvpAdapter
}) {
  const [values, setValues] = useState<EventRsvpValues>({...EMPTY_EVENT_RSVP})
  const [workflow, setWorkflow] = useState<WorkflowState>({phase: 'editing', errors: {}})
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const submissionErrorRef = useRef<HTMLDivElement>(null)
  const completionHeadingRef = useRef<HTMLHeadingElement>(null)
  const controllerRef = useRef<AbortController | null>(null)
  const submissionActiveRef = useRef(false)
  const errorScenarioConsumedRef = useRef(false)

  const phase = workflow.phase
  const errors = phase === 'complete' ? {} : workflow.errors
  const pending = phase === 'pending'

  useEffect(() => () => controllerRef.current?.abort(), [])

  useEffect(() => {
    const focusAndReveal = (element: HTMLElement | null) => {
      element?.focus()
      window.requestAnimationFrame(() =>
        element?.scrollIntoView?.({block: 'center', behavior: 'instant' as ScrollBehavior}),
      )
    }

    if (phase === 'validation-error') focusAndReveal(errorSummaryRef.current)
    if (phase === 'submission-error') focusAndReveal(submissionErrorRef.current)
    if (phase === 'complete') focusAndReveal(completionHeadingRef.current)
  }, [phase])

  function updateField<K extends EventRsvpField>(field: K, value: EventRsvpValues[K]) {
    setValues((current) => ({...current, [field]: value}))
    if (!errors[field]) return

    const nextErrors = {...errors}
    delete nextErrors[field]
    setWorkflow({
      phase: Object.keys(nextErrors).length ? 'validation-error' : 'editing',
      errors: nextErrors,
    })
  }

  async function startSubmission(requestedScenario?: DemoEventRsvpScenario) {
    if (pending || submissionActiveRef.current) return

    const nextErrors = validateEventRsvp(values)
    if (Object.keys(nextErrors).length) {
      setWorkflow({phase: 'validation-error', errors: nextErrors})
      return
    }

    let scenario = requestedScenario ?? 'success'
    if (
      requestedScenario === undefined &&
      !errorScenarioConsumedRef.current &&
      readPreviewScenario(window.location.search) === 'event-rsvp-error'
    ) {
      errorScenarioConsumedRef.current = true
      scenario = 'error'
    }

    const normalized = normalizeEventRsvp(values)
    const controller = new AbortController()
    submissionActiveRef.current = true
    controllerRef.current?.abort()
    controllerRef.current = controller
    setWorkflow({phase: 'pending', errors: {}})

    try {
      const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
      const activeAdapter = adapter ?? createDemoEventRsvpAdapter({delay: reducedMotion ? 0 : 650})
      const result = await activeAdapter.complete(normalized, controller.signal, scenario)
      if (controller.signal.aborted) return

      setValues({...EMPTY_EVENT_RSVP})
      setWorkflow({
        phase: 'complete',
        previewReference: result.previewReference,
        partySize: normalized.guestCount,
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      if (controller.signal.aborted) return
      setWorkflow({phase: 'submission-error', errors: {}})
    } finally {
      if (controllerRef.current === controller) submissionActiveRef.current = false
    }
  }

  function handleSubmit(eventObject: FormEvent<HTMLFormElement>) {
    eventObject.preventDefault()
    void startSubmission()
  }

  if (workflow.phase === 'complete') {
    return (
      <div className="form-card event-rsvp event-rsvp--complete" aria-labelledby="event-rsvp-complete-title">
        <div className="event-rsvp__success-card">
          <FormStatus
            title="RSVP preview complete"
            message="No RSVP request was created, no information was submitted, no email was sent, and attendance is not confirmed."
            type="success"
            role="status"
            titleId="event-rsvp-complete-title"
            titleRef={completionHeadingRef}
            titleTabIndex={-1}
          />
          <dl className="event-rsvp__summary">
            <div><dt>Event</dt><dd>{event.title}</dd></div>
            <div><dt>Date</dt><dd>{event.date}</dd></div>
            <div><dt>Time</dt><dd>{event.time}</dd></div>
            <div><dt>Party size</dt><dd>Party of {workflow.partySize}</dd></div>
          </dl>
          <div className="event-rsvp__reference">
            <p>Preview reference</p>
            <strong>{workflow.previewReference}</strong>
          </div>
          <p className="event-rsvp__disclaimer">This non-operational reference belongs only to the portfolio preview. It is not an RSVP receipt or evidence of attendance.</p>
        </div>
        <div className="event-rsvp__actions">
          <Link className="button button--primary" href="/events">Explore All Events</Link>
          <Link className="button button--secondary" href="/visit">Plan Your Visit</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="form-card event-rsvp" aria-labelledby="event-rsvp-title">
      <p className="form-card__kicker">Request an RSVP</p>
      <h2 id="event-rsvp-title">Request an RSVP</h2>
      <p className="lede">Explore the event RSVP process without contacting a restaurant.</p>

      <aside className="event-rsvp__demo-notice" aria-labelledby="event-rsvp-demo-title">
        <h3 id="event-rsvp-demo-title">Use fictional information only</h3>
        <p>Marsh &amp; Ember is fictional. No RSVP request or form value is sent, stored, emailed, or reviewed. Completing this preview does not confirm attendance or reserve event space.</p>
      </aside>

      <form noValidate autoComplete="off" onSubmit={handleSubmit}>
        {phase === 'validation-error' ? (
          <div className="event-rsvp__error-summary" role="alert" tabIndex={-1} ref={errorSummaryRef}>
            <h3>We need a few more details</h3>
            <p>Review the highlighted fields before continuing.</p>
            <ul>
              {EVENT_RSVP_FIELD_ORDER.filter((field) => errors[field]).map((field) => (
                <li key={field}><a href={`#${field}`}>{fieldLabels[field]}: {errors[field]}</a></li>
              ))}
            </ul>
          </div>
        ) : null}

        {phase === 'pending' ? (
          <FormStatus
            title="Completing the RSVP preview…"
            message="No information is being transmitted. Please wait while the local preview finishes."
            type="loading"
            role="status"
          />
        ) : null}

        {phase === 'submission-error' ? (
          <div ref={submissionErrorRef} tabIndex={-1} role="alert">
            <FormStatus
              title="We couldn’t complete the RSVP preview"
              message="Something interrupted this local preview. No request was submitted, no email was sent, and attendance is not confirmed."
              type="error"
            />
            <p className="event-rsvp__important"><strong>Your entries remain in this form</strong> so you can retry or make changes.</p>
            <div className="event-rsvp__actions">
              <button className="button button--primary" type="button" onClick={() => void startSubmission('success')}>Try Again</button>
              <Link className="button button--secondary" href="/events">Explore All Events</Link>
            </div>
          </div>
        ) : null}

        <fieldset className="event-rsvp__fieldset" disabled={pending}>
          <legend className="sr-only">Fictional RSVP details for {event.title}</legend>
          <div className="form-grid">
            <FormFieldShell label="First name" name="firstName" error={errors.firstName} required>
              <input id="firstName" name="firstName" value={values.firstName} required autoComplete="off" aria-invalid={errors.firstName ? true : undefined} aria-describedby={describedBy('firstName', false, errors.firstName)} onChange={(changeEvent) => updateField('firstName', changeEvent.target.value)} />
            </FormFieldShell>
            <FormFieldShell label="Last name" name="lastName" error={errors.lastName} required>
              <input id="lastName" name="lastName" value={values.lastName} required autoComplete="off" aria-invalid={errors.lastName ? true : undefined} aria-describedby={describedBy('lastName', false, errors.lastName)} onChange={(changeEvent) => updateField('lastName', changeEvent.target.value)} />
            </FormFieldShell>
            <FormFieldShell label="Email address" name="email" help="Use a reserved example.com address." error={errors.email} required>
              <input id="email" name="email" type="email" placeholder="avery@example.com" value={values.email} required autoComplete="off" inputMode="email" aria-invalid={errors.email ? true : undefined} aria-describedby={describedBy('email', true, errors.email)} onChange={(changeEvent) => updateField('email', changeEvent.target.value)} />
            </FormFieldShell>
            <FormFieldShell label="Phone number" name="phone" error={errors.phone} required>
              <input id="phone" name="phone" type="tel" placeholder="(843) 555-0100" value={values.phone} required autoComplete="off" aria-invalid={errors.phone ? true : undefined} aria-describedby={describedBy('phone', false, errors.phone)} onChange={(changeEvent) => updateField('phone', changeEvent.target.value)} />
            </FormFieldShell>
            <FormFieldShell label="Number of guests" name="guestCount" error={errors.guestCount} required full>
              <select id="guestCount" name="guestCount" value={values.guestCount} required aria-invalid={errors.guestCount ? true : undefined} aria-describedby={describedBy('guestCount', false, errors.guestCount)} onChange={(changeEvent: ChangeEvent<HTMLSelectElement>) => updateField('guestCount', changeEvent.target.value)}>
                <option value="" disabled>Select party size</option>
                {EVENT_RSVP_GUEST_OPTIONS.map((option) => <option key={option}>{option}</option>)}
              </select>
            </FormFieldShell>
            <FormFieldShell label="Dietary or accessibility information" name="details" help="Please do not include medical diagnoses or unrelated sensitive information." full>
              <textarea id="details" name="details" rows={6} placeholder="Share fictional dietary needs, allergies, mobility considerations, or other information that may help with this preview." value={values.details} autoComplete="off" aria-describedby={describedBy('details', true)} onChange={(changeEvent) => updateField('details', changeEvent.target.value)} />
            </FormFieldShell>
          </div>

          <div className={errors.acknowledgment ? 'check-field check-field--error' : 'check-field'}>
            <input id="acknowledgment" name="acknowledgment" type="checkbox" checked={values.acknowledgment} required aria-invalid={errors.acknowledgment ? true : undefined} aria-describedby={errors.acknowledgment ? 'acknowledgment-error' : undefined} onChange={(changeEvent) => updateField('acknowledgment', changeEvent.target.checked)} />
            <div><label htmlFor="acknowledgment">I understand that completing this preview does not confirm attendance and is separate from a standard dining reservation. <span className="sr-only">(required)</span></label>{errors.acknowledgment ? <p id="acknowledgment-error" className="field__error"><span aria-hidden="true">! </span>{errors.acknowledgment}</p> : null}</div>
          </div>

          <div className="event-rsvp__actions">
            <button className="button button--primary" type="submit">{pending ? 'Completing Preview…' : 'Complete RSVP Preview'}</button>
          </div>
        </fieldset>
        <p className="form-privacy">Fictional values remain only in this open form and are cleared after completion. Nothing is transmitted or saved.</p>
      </form>
    </div>
  )
}
