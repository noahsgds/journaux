import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ChunkMetadata } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// French dates ("28 Avril 2026") are kept as-is; ISO dates are reformatted
export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return ''
  // Already looks like a formatted French date — return directly
  if (/^\d{1,2}\s+\w+\s+\d{4}$/.test(dateStr.trim())) return dateStr.trim()
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

// Safely extract display fields from the three metadata shapes
export function parseChunkMeta(metadata: ChunkMetadata): {
  source: string
  date: string
  chunkIndex: number | null
} {
  if (!metadata) {
    return { source: '', date: '', chunkIndex: null }
  }
  if (typeof metadata === 'string') {
    // Legacy: raw concatenated string — use as source label
    return { source: metadata.trim(), date: '', chunkIndex: null }
  }
  return {
    source: metadata.source ?? '',
    date: metadata.date ?? '',
    chunkIndex: metadata.chunk_index ?? null,
  }
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

export function scoreToPercent(similarity: number): number {
  return Math.round(Math.max(0, Math.min(1, similarity)) * 100)
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11)
}

// Accent colors for profiles
export const PROFILE_COLORS = [
  '#3B82F6', // blue
  '#F59E0B', // amber
  '#10B981', // emerald
  '#EC4899', // pink
  '#8B5CF6', // violet
  '#06B6D4', // cyan
  '#F97316', // orange
  '#84CC16', // lime
]
