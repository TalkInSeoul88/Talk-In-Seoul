import { orderLevels } from '../data/levels.ts'

const STORAGE_KEY = 'talk-in-seoul:access'

export type Enrollment = {
  enrolled: boolean
  code: string | null
  expiresAt: string | null
  levels: string[]
}

export const FREE_ENROLLMENT: Enrollment = {
  enrolled: false,
  code: null,
  expiresAt: null,
  levels: [],
}

function levelsFrom(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback
  return orderLevels(value.filter((item): item is string => typeof item === 'string'))
}

export function loadEnrollment(): Enrollment {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return FREE_ENROLLMENT
    const parsed = JSON.parse(raw) as Partial<Enrollment>
    if (!parsed || parsed.enrolled !== true || typeof parsed.code !== 'string') {
      return FREE_ENROLLMENT
    }
    return {
      enrolled: true,
      code: parsed.code,
      expiresAt: typeof parsed.expiresAt === 'string' ? parsed.expiresAt : null,
      levels: levelsFrom(parsed.levels, ['beginner']),
    }
  } catch {
    return FREE_ENROLLMENT
  }
}

export function saveEnrollment(value: Enrollment) {
  if (!value.enrolled || !value.code) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      enrolled: true,
      code: value.code,
      expiresAt: value.expiresAt,
      levels: value.levels,
    }),
  )
}

export function formatExpiry(expiresAt: string | null): string {
  if (!expiresAt) return ''
  const [year, month, day] = expiresAt.split('-').map(Number)
  if (!year || !month || !day) return expiresAt
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function levelsFromRedeem(value: unknown): string[] {
  return levelsFrom(value, ['beginner'])
}
