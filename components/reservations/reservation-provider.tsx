'use client'

import {createContext, type ReactNode, useContext, useRef, useState} from 'react'
import type {RestaurantSettings} from '@/lib/content-types'
import {ReservationDialog} from './reservation-dialog'

type ReservationContextValue = {
  openReservation(trigger: HTMLButtonElement): void
}

const ReservationContext = createContext<ReservationContextValue | null>(null)

export function ReservationProvider({
  children,
  settings,
}: {
  children: ReactNode
  settings: Pick<RestaurantSettings, 'mapUrl' | 'phone' | 'phoneHref'>
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  const openReservation = (trigger: HTMLButtonElement) => {
    triggerRef.current = trigger
    setOpen(true)
  }

  const closeReservation = () => {
    setOpen(false)
    window.requestAnimationFrame(() => triggerRef.current?.focus())
  }

  return (
    <ReservationContext.Provider value={{openReservation}}>
      {children}
      {open ? <ReservationDialog onRequestClose={closeReservation} settings={settings} /> : null}
    </ReservationContext.Provider>
  )
}

export function useReservation() {
  const context = useContext(ReservationContext)
  if (!context) throw new Error('Reservation triggers must be rendered inside ReservationProvider')
  return context
}
