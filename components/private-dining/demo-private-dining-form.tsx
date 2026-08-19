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
  BUDGET_OPTIONS,
  createDemoPrivateDiningAdapter,
  EMPTY_PRIVATE_DINING_INQUIRY,
  EVENT_TYPES,
  normalizePrivateDiningInquiry,
  PREFERRED_TIMES,
  PRIVATE_DINING_FIELD_ORDER,
  SPACE_PREFERENCES,
  validatePrivateDiningInquiry,
  type DemoInquiryScenario,
  type DemoPrivateDiningAdapter,
  type PrivateDiningInquiryErrors,
  type PrivateDiningInquiryField,
  type PrivateDiningInquiryValues,
} from '@/lib/private-dining-inquiry'
import {readPreviewScenario} from '@/lib/preview-scenario'

type WorkflowState =
  | {phase: 'editing' | 'validation-error' | 'pending' | 'submission-error'; errors: PrivateDiningInquiryErrors}
  | {phase: 'complete'; demoReference: string}

const fieldLabels: Record<PrivateDiningInquiryField, string> = {
  firstName: 'First name',
  lastName: 'Last name',
  email: 'Email address',
  phone: 'Phone number',
  eventType: 'Event type',
  preferredDate: 'Preferred date',
  preferredTime: 'Preferred time of day',
  guestCount: 'Estimated guest count',
  alternateDate: 'Alternate date',
  space: 'Space preference',
  budget: 'Estimated food and beverage budget',
  additionalInformation: 'Additional information',
  acknowledgment: 'Acknowledgment',
}

function todayIso() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function describedBy(name: PrivateDiningInquiryField, help?: boolean, error?: string) {
  return [help ? `${name}-help` : null, error ? `${name}-error` : null]
    .filter(Boolean)
    .join(' ') || undefined
}

function DemoSelect({
  field,
  label,
  placeholder,
  options,
  value,
  error,
  required,
  onChange,
}: {
  field: PrivateDiningInquiryField
  label: string
  placeholder: string
  options: readonly string[]
  value: string
  error?: string
  required?: boolean
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void
}) {
  return (
    <FormFieldShell label={label} name={field} error={error} required={required}>
      <select
        id={field}
        name={field}
        value={value}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(field, false, error)}
        onChange={onChange}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </FormFieldShell>
  )
}

export function DemoPrivateDiningForm({
  privateDiningEmail,
  privateDiningPhone,
  privateDiningPhoneHref,
  adapter,
}: {
  privateDiningEmail: string
  privateDiningPhone: string
  privateDiningPhoneHref: string
  adapter?: DemoPrivateDiningAdapter
}) {
  const [values, setValues] = useState<PrivateDiningInquiryValues>({...EMPTY_PRIVATE_DINING_INQUIRY})
  const [workflow, setWorkflow] = useState<WorkflowState>({phase: 'editing', errors: {}})
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const submissionErrorRef = useRef<HTMLDivElement>(null)
  const completionHeadingRef = useRef<HTMLHeadingElement>(null)
  const firstNameRef = useRef<HTMLInputElement>(null)
  const controllerRef = useRef<AbortController | null>(null)
  const focusBlankFormRef = useRef(false)
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
    if (phase === 'editing' && focusBlankFormRef.current) {
      focusBlankFormRef.current = false
      focusAndReveal(firstNameRef.current)
    }
  }, [phase])

  function updateField<K extends PrivateDiningInquiryField>(field: K, value: PrivateDiningInquiryValues[K]) {
    setValues((current) => ({...current, [field]: value}))
    if (!errors[field]) return

    const nextErrors = {...errors}
    delete nextErrors[field]
    setWorkflow({
      phase: Object.keys(nextErrors).length ? 'validation-error' : 'editing',
      errors: nextErrors,
    })
  }

  async function startSubmission(requestedScenario?: DemoInquiryScenario) {
    if (pending) return

    const nextErrors = validatePrivateDiningInquiry(values)
    if (Object.keys(nextErrors).length) {
      setWorkflow({phase: 'validation-error', errors: nextErrors})
      return
    }

    let scenario = requestedScenario ?? 'success'
    if (
      requestedScenario === undefined &&
      !errorScenarioConsumedRef.current &&
      readPreviewScenario(window.location.search) === 'private-dining-error'
    ) {
      errorScenarioConsumedRef.current = true
      scenario = 'error'
    }

    const normalized = normalizePrivateDiningInquiry(values)
    const controller = new AbortController()
    controllerRef.current?.abort()
    controllerRef.current = controller
    setWorkflow({phase: 'pending', errors: {}})

    try {
      const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
      const activeAdapter = adapter ?? createDemoPrivateDiningAdapter({delay: reducedMotion ? 0 : 650})
      const result = await activeAdapter.complete(normalized, controller.signal, scenario)
      if (controller.signal.aborted) return

      setValues({...EMPTY_PRIVATE_DINING_INQUIRY})
      setWorkflow({phase: 'complete', demoReference: result.demoReference})
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      if (controller.signal.aborted) return
      setWorkflow({phase: 'submission-error', errors: {}})
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void startSubmission()
  }

  function restart() {
    controllerRef.current?.abort()
    setValues({...EMPTY_PRIVATE_DINING_INQUIRY})
    focusBlankFormRef.current = true
    setWorkflow({phase: 'editing', errors: {}})
  }

  if (workflow.phase === 'complete') {
    return (
      <section className="form-card private-inquiry private-inquiry--complete" aria-labelledby="private-inquiry-complete-title">
        <div className="private-inquiry__success-card">
          <FormStatus
            title="Inquiry preview complete"
            message="No inquiry was created, no team will contact you, and no date is held or event confirmed."
            type="success"
            role="status"
          />
          <div className="private-inquiry__reference">
            <p>Preview reference</p>
            <strong>{workflow.demoReference}</strong>
          </div>
          <p className="private-inquiry__disclaimer">This reference belongs only to this browser preview. It is not an operational receipt.</p>
        </div>
        <h2 id="private-inquiry-complete-title" className="sr-only" tabIndex={-1} ref={completionHeadingRef}>Private Dining preview result</h2>
        <div className="private-inquiry__actions">
          <button className="button button--primary" type="button" onClick={restart}>Start Over</button>
          <Link className="button button--secondary" href="/menus">View Menus</Link>
          <Link className="button button--secondary" href="/visit">Plan Your Visit</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="form-card private-inquiry" aria-labelledby="private-inquiry-title">
      <p className="form-card__kicker">Inquiry Form</p>
      <h2 id="private-inquiry-title">Private Dining Inquiry</h2>
      <p className="lede">Explore the inquiry process without contacting a restaurant.</p>

      <aside className="private-inquiry__demo-notice" aria-labelledby="private-inquiry-demo-title">
        <h3 id="private-inquiry-demo-title">Use fictional information only</h3>
        <p>Marsh &amp; Ember is fictional. This portfolio preview is not sent, stored, emailed, or reviewed, and no date is reserved or held.</p>
      </aside>

      <form noValidate autoComplete="off" onSubmit={handleSubmit}>
        {phase === 'validation-error' ? (
          <div className="private-inquiry__error-summary" role="alert" tabIndex={-1} ref={errorSummaryRef}>
            <h3>We need a few more details</h3>
            <p>Review the highlighted fields before continuing.</p>
            <ul>
              {PRIVATE_DINING_FIELD_ORDER.filter((field) => errors[field]).map((field) => (
                <li key={field}><a href={`#${field}`}>{fieldLabels[field]}: {errors[field]}</a></li>
              ))}
            </ul>
          </div>
        ) : null}

        {phase === 'pending' ? (
          <FormStatus
            title="Completing the inquiry preview…"
            message="No information is being transmitted. Please wait while the local preview finishes."
            type="loading"
            role="status"
          />
        ) : null}

        {phase === 'submission-error' ? (
          <div ref={submissionErrorRef} tabIndex={-1}>
            <FormStatus
              title="We couldn’t complete the inquiry preview"
              message="Something interrupted this local preview. No information was submitted and no date was held."
              type="error"
              role="alert"
            />
            <p className="private-inquiry__important"><strong>Your entries are safe:</strong> They remain in this form so you can retry.</p>
            <div className="private-inquiry__actions">
              <button className="button button--primary" type="button" onClick={() => void startSubmission('success')}>Try Again</button>
              <a className="button button--secondary" href={`mailto:${privateDiningEmail}`}>Email Private Dining</a>
              <a className="button button--secondary" href={privateDiningPhoneHref}>Call {privateDiningPhone}</a>
            </div>
          </div>
        ) : null}

        <fieldset className="private-inquiry__fieldset" disabled={pending}>
          <legend className="sr-only">Fictional gathering details</legend>
          <div className="form-grid">
            <FormFieldShell label="First name" name="firstName" error={errors.firstName} required>
              <input ref={firstNameRef} id="firstName" name="firstName" value={values.firstName} required autoComplete="off" aria-invalid={errors.firstName ? true : undefined} aria-describedby={describedBy('firstName', false, errors.firstName)} onChange={(event) => updateField('firstName', event.target.value)} />
            </FormFieldShell>
            <FormFieldShell label="Last name" name="lastName" error={errors.lastName} required>
              <input id="lastName" name="lastName" value={values.lastName} required autoComplete="off" aria-invalid={errors.lastName ? true : undefined} aria-describedby={describedBy('lastName', false, errors.lastName)} onChange={(event) => updateField('lastName', event.target.value)} />
            </FormFieldShell>
            <FormFieldShell label="Email address" name="email" help="Use a reserved example.com address." error={errors.email} required>
              <input id="email" name="email" type="email" placeholder="avery@example.com" value={values.email} required autoComplete="off" inputMode="email" aria-invalid={errors.email ? true : undefined} aria-describedby={describedBy('email', true, errors.email)} onChange={(event) => updateField('email', event.target.value)} />
            </FormFieldShell>
            <FormFieldShell label="Phone number" name="phone" error={errors.phone} required>
              <input id="phone" name="phone" type="tel" placeholder="(843) 555-0100" value={values.phone} required autoComplete="off" aria-invalid={errors.phone ? true : undefined} aria-describedby={describedBy('phone', false, errors.phone)} onChange={(event) => updateField('phone', event.target.value)} />
            </FormFieldShell>
            <DemoSelect field="eventType" label="Event type" placeholder="Select an event type" options={EVENT_TYPES} value={values.eventType} error={errors.eventType} required onChange={(event) => updateField('eventType', event.target.value)} />
            <FormFieldShell label="Preferred date" name="preferredDate" error={errors.preferredDate} required>
              <input id="preferredDate" name="preferredDate" type="date" min={todayIso()} value={values.preferredDate} required aria-invalid={errors.preferredDate ? true : undefined} aria-describedby={describedBy('preferredDate', false, errors.preferredDate)} onChange={(event) => updateField('preferredDate', event.target.value)} />
            </FormFieldShell>
            <DemoSelect field="preferredTime" label="Preferred time of day" placeholder="Select a time" options={PREFERRED_TIMES} value={values.preferredTime} error={errors.preferredTime} required onChange={(event) => updateField('preferredTime', event.target.value)} />
            <FormFieldShell label="Estimated guest count" name="guestCount" help="A fictional estimate is fine." error={errors.guestCount} required>
              <input id="guestCount" name="guestCount" type="number" min="1" step="1" placeholder="Number of guests" value={values.guestCount} required inputMode="numeric" aria-invalid={errors.guestCount ? true : undefined} aria-describedby={describedBy('guestCount', true, errors.guestCount)} onChange={(event) => updateField('guestCount', event.target.value)} />
            </FormFieldShell>
            <FormFieldShell label="Alternate date" name="alternateDate" full>
              <input id="alternateDate" name="alternateDate" type="date" min={todayIso()} value={values.alternateDate} onChange={(event) => updateField('alternateDate', event.target.value)} />
            </FormFieldShell>
            <DemoSelect field="space" label="Space preference" placeholder="Select a preference" options={SPACE_PREFERENCES} value={values.space} onChange={(event) => updateField('space', event.target.value)} />
            <DemoSelect field="budget" label="Estimated food and beverage budget" placeholder="Select a range" options={BUDGET_OPTIONS} value={values.budget} onChange={(event) => updateField('budget', event.target.value)} />
            <FormFieldShell label="Additional information" name="additionalInformation" full>
              <textarea id="additionalInformation" name="additionalInformation" rows={6} placeholder="Share fictional details about the occasion or desired atmosphere." value={values.additionalInformation} autoComplete="off" onChange={(event) => updateField('additionalInformation', event.target.value)} />
            </FormFieldShell>
          </div>

          <div className={errors.acknowledgment ? 'check-field check-field--error' : 'check-field'}>
            <input id="acknowledgment" name="acknowledgment" type="checkbox" checked={values.acknowledgment} required aria-invalid={errors.acknowledgment ? true : undefined} aria-describedby={errors.acknowledgment ? 'acknowledgment-error' : undefined} onChange={(event) => updateField('acknowledgment', event.target.checked)} />
            <div><label htmlFor="acknowledgment">I understand that completing this preview does not reserve a date or confirm an event. <span className="sr-only">(required)</span></label>{errors.acknowledgment ? <p id="acknowledgment-error" className="field__error"><span aria-hidden="true">! </span>{errors.acknowledgment}</p> : null}</div>
          </div>

          <div className="private-inquiry__actions">
            <button className="button button--primary" type="submit">{pending ? 'Completing Preview…' : 'Complete Inquiry Preview'}</button>
          </div>
        </fieldset>
        <p className="form-privacy">Fictional values remain only in this open form and are cleared after completion. Nothing is transmitted or saved.</p>
      </form>
    </section>
  )
}
