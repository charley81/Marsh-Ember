'use client'

import type {ReactNode, RefObject} from 'react'
import {useReservation} from './reservation-provider'

export function ReservationTrigger({
  children = 'Reserve a Table',
  variant = 'primary',
  className = '',
  onBeforeOpen,
  tabIndex,
  returnFocusRef,
}: {
  children?: ReactNode
  variant?: 'primary' | 'secondary' | 'light'
  className?: string
  onBeforeOpen?: () => void
  tabIndex?: number
  returnFocusRef?: RefObject<HTMLButtonElement | null>
}) {
  const {openReservation} = useReservation()

  return (
    <button
      className={`button button--${variant}${className ? ` ${className}` : ''}`}
      type="button"
      tabIndex={tabIndex}
      onClick={(event) => {
        onBeforeOpen?.()
        openReservation(returnFocusRef?.current ?? event.currentTarget)
      }}
    >
      {children}
    </button>
  )
}
