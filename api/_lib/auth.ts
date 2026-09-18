import { createHmac, timingSafeEqual } from 'node:crypto'

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? ''
}

function sessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || `talk-in-seoul:${adminPassword()}`
}

function hmac(value: string): string {
  return createHmac('sha256', sessionSecret()).update(value).digest('hex')
}

function match(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) {
    timingSafeEqual(left, left)
    return false
  }
  return timingSafeEqual(left, right)
}

export function verifyPassword(password: string): { ok: true } | { ok: false; error: string; status: number } {
  const expected = adminPassword()
  if (!expected) {
    return {
      ok: false,
      status: 503,
      error: 'Admin password is not set. Add ADMIN_PASSWORD in Vercel → Settings → Environment Variables.',
    }
  }
  if (!password) {
    return { ok: false, status: 401, error: 'Enter the admin password.' }
  }
  if (!match(password, expected)) {
    return { ok: false, status: 401, error: 'That password did not match.' }
  }
  return { ok: true }
}

export function issueAdminToken(now = Date.now()): string {
  const exp = String(now + TOKEN_TTL_MS)
  const payload = `${exp}.${now}`
  return `${payload}.${hmac(payload)}`
}

export function readBearer(header: string | null): string {
  if (!header) return ''
  const [scheme, token] = header.split(' ')
  if (!scheme || !token) return header.trim()
  if (scheme.toLowerCase() !== 'bearer') return ''
  return token.trim()
}

export function verifyAdminToken(token: string, now = Date.now()): boolean {
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [exp, issued, signature] = parts
  if (!exp || !issued || !signature) return false
  const payload = `${exp}.${issued}`
  if (!match(signature, hmac(payload))) return false
  const expMs = Number(exp)
  if (!Number.isFinite(expMs) || expMs < now) return false
  return true
}
