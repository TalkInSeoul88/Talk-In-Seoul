export type AccessCode = {
  code: string
  expiresAt: string
  active: boolean
  createdAt: string
}

export type CodeStore = {
  version: 1
  codes: AccessCode[]
}

export const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export const CODE_PATTERN = /^[A-Z0-9][A-Z0-9-]{2,23}$/

export function emptyStore(): CodeStore {
  return { version: 1, codes: [] }
}

export function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '').replace(/—/g, '-').replace(/–/g, '-')
}

export function generateCode(existing: Set<string>): string {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    let suffix = ''
    for (let i = 0; i < 4; i += 1) {
      suffix += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
    }
    const code = `POP-${suffix}`
    if (!existing.has(code)) return code
  }
  throw new Error('Could not generate a unique code. Try typing one instead.')
}

export function validateCodeFormat(code: string): string | null {
  if (!CODE_PATTERN.test(code)) {
    return 'Use 3–24 letters, numbers, or hyphens (example: POP-4K9P).'
  }
  return null
}

export function validateExpiry(expiresAt: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expiresAt)) {
    return 'Pick an expiry date.'
  }
  const [year, month, day] = expiresAt.split('-').map(Number)
  const utc = new Date(Date.UTC(year, month - 1, day))
  if (utc.getUTCFullYear() !== year || utc.getUTCMonth() !== month - 1 || utc.getUTCDate() !== day) {
    return 'That expiry date is not valid.'
  }
  return null
}

export function chicagoToday(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

export function isExpired(expiresAt: string, now = new Date()): boolean {
  return expiresAt < chicagoToday(now)
}

export function redeemProblem(entry: AccessCode | undefined, now = new Date()): string | null {
  if (!entry) return 'That access code was not found.'
  if (!entry.active) return 'That access code has been stopped.'
  if (isExpired(entry.expiresAt, now)) return 'That access code has expired.'
  return null
}

export function statusLabel(entry: AccessCode, now = new Date()): 'active' | 'stopped' | 'expired' {
  if (isExpired(entry.expiresAt, now)) return 'expired'
  return entry.active ? 'active' : 'stopped'
}

export function sortCodes(codes: AccessCode[], now = new Date()): AccessCode[] {
  return [...codes].sort((a, b) => {
    const aStatus = statusLabel(a, now)
    const bStatus = statusLabel(b, now)
    const rank = { active: 0, expired: 1, stopped: 2 }
    if (rank[aStatus] !== rank[bStatus]) return rank[aStatus] - rank[bStatus]
    return b.createdAt.localeCompare(a.createdAt)
  })
}
