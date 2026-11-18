export const LEVELS = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate-1', label: 'Intermediate 1' },
  { id: 'intermediate-2', label: 'Intermediate 2' },
  { id: 'advanced-1', label: 'Advanced 1' },
  { id: 'advanced-2', label: 'Advanced 2' },
] as const

export type LevelId = (typeof LEVELS)[number]['id']

export const GRAMMAR_LEVELS = LEVELS.filter((level) => level.id !== 'beginner')

export function hasLevel(levels: readonly string[] | undefined, id: string): boolean {
  return Array.isArray(levels) && levels.includes(id)
}

export function lockMessage(label: string): string {
  return `Ask Jung to unlock ${label}`
}

export function orderLevels(ids: readonly string[]): string[] {
  const picked = new Set(ids)
  return LEVELS.map((level) => level.id).filter((id) => picked.has(id))
}
