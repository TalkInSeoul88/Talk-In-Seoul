export const LEVELS = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate-1', label: 'Intermediate 1' },
  { id: 'intermediate-2', label: 'Intermediate 2' },
  { id: 'advanced-1', label: 'Advanced 1' },
  { id: 'advanced-2', label: 'Advanced 2' },
]

const ORDER = LEVELS.map((level) => level.id)
const IDS = new Set(ORDER)

export function parseLevels(raw) {
  if (!Array.isArray(raw)) return null
  const picked = []
  for (const item of raw) {
    if (typeof item !== 'string' || !IDS.has(item)) return null
    if (!picked.includes(item)) picked.push(item)
  }
  return ORDER.filter((id) => picked.includes(id))
}

/** Missing field means Beginner only. An explicit list, including none, is kept. */
export function levelsFor(entry) {
  if (!entry || !Object.prototype.hasOwnProperty.call(entry, 'levels')) return ['beginner']
  const parsed = parseLevels(entry.levels)
  return parsed ?? ['beginner']
}

export function levelLabel(id) {
  return LEVELS.find((level) => level.id === id)?.label ?? 'this level'
}

export function lockMessage(label) {
  return `Ask Jung to unlock ${label}`
}

export function hasLevel(entry, id) {
  return levelsFor(entry).includes(id)
}

export function beginnerDenied(student) {
  if (student?.levels?.includes('beginner')) return null
  return lockMessage('Beginner')
}
