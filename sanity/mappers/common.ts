import {stegaClean} from 'next-sanity'
import type {ContentImage} from '@/lib/content-types'
import {imageUrl} from '../image'

export type UnknownRecord = Record<string, unknown>

export function record(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : null
}

export function text(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed || null
}

export function cleanText(value: unknown): string | null {
  const raw = text(value)
  if (!raw) return null
  const cleaned = stegaClean(raw).trim()
  return cleaned || null
}

export function numberValue(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export function booleanValue(value: unknown): boolean {
  return value === true
}

export function records(value: unknown): UnknownRecord[] {
  return Array.isArray(value) ? value.map(record).filter((item): item is UnknownRecord => item !== null) : []
}

export function image(value: unknown, dimensions?: {width: number; height: number}): ContentImage | null {
  const source = record(value)
  const alt = text(source?.alt)
  if (!source?.asset || !alt) return null
  return {
    src: imageUrl(source, dimensions?.width, dimensions?.height),
    alt,
  }
}
