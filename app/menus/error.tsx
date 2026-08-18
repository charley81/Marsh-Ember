'use client'

import {useEffect} from 'react'
import {ButtonLink} from '@/components/ui'

export default function MenusError({error, reset}: {error: Error & {digest?: string}; reset: () => void}) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <section className="events-empty" aria-labelledby="menus-unavailable-title">
      <div className="events-empty__inner">
        <div className="events-empty__copy">
          <p className="events-empty__eyebrow">Menus</p>
          <h1 id="menus-unavailable-title">Menus are temporarily unavailable</h1>
          <p>We could not load the latest menu. Please try again or contact the restaurant for current offerings.</p>
        </div>
        <div className="actions actions--centered">
          <button className="button button--primary" type="button" onClick={reset}>Try Again</button>
          <ButtonLink href="/visit" variant="secondary">Contact the Restaurant</ButtonLink>
        </div>
      </div>
    </section>
  )
}
