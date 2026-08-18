'use client'

import {useEffect} from 'react'
import {ButtonLink} from '@/components/ui'

export default function EventsError({error, reset}: {error: Error & {digest?: string}; reset: () => void}) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <section className="events-empty" aria-labelledby="events-unavailable-title">
      <div className="events-empty__inner">
        <div className="events-empty__copy">
          <p className="events-empty__eyebrow">Events</p>
          <h1 id="events-unavailable-title">Events are temporarily unavailable</h1>
          <p>We could not load current event details. Please try again or contact the restaurant before making plans.</p>
        </div>
        <div className="actions actions--centered">
          <button className="button button--primary" type="button" onClick={reset}>Try Again</button>
          <ButtonLink href="/visit" variant="secondary">Contact the Restaurant</ButtonLink>
        </div>
      </div>
    </section>
  )
}
