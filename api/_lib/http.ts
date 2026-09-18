import { issueAdminToken, readBearer, verifyAdminToken, verifyPassword } from './auth.ts'
import {
  generateCode,
  normalizeCode,
  redeemProblem,
  sortCodes,
  statusLabel,
  validateCodeFormat,
  validateExpiry,
  type AccessCode,
} from './codes.ts'
import { loadCodes, saveCodes, storeMode } from './store.ts'

function json(status: number, body: unknown): Response {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}

function adminUnauthorized(): Response {
  return json(401, { error: 'Unlock admin first.' })
}

async function requireAdmin(request: Request): Promise<Response | null> {
  const token = readBearer(request.headers.get('authorization'))
  if (!token || !verifyAdminToken(token)) return adminUnauthorized()
  return null
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = (await request.json()) as unknown
    if (body && typeof body === 'object' && !Array.isArray(body)) {
      return body as Record<string, unknown>
    }
    return {}
  } catch {
    return {}
  }
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null
}

function publicCode(entry: AccessCode) {
  return {
    code: entry.code,
    expiresAt: entry.expiresAt,
    active: entry.active,
    createdAt: entry.createdAt,
    status: statusLabel(entry),
  }
}

export async function handleAdminLogin(request: Request): Promise<Response> {
  if (request.method !== 'POST') return json(405, { error: 'Use POST.' })
  const body = await readBody(request)
  const result = verifyPassword(asString(body.password))
  if (!result.ok) return json(result.status, { error: result.error })
  return json(200, { token: issueAdminToken(), store: storeMode() })
}

export async function handleAdminCodes(request: Request): Promise<Response> {
  const denied = await requireAdmin(request)
  if (denied) return denied

  try {
    if (request.method === 'GET') {
      const store = await loadCodes()
      return json(200, { codes: sortCodes(store.codes).map(publicCode), store: storeMode() })
    }

    if (request.method === 'POST') {
      const body = await readBody(request)
      const expiresAt = asString(body.expiresAt)
      const expiryError = validateExpiry(expiresAt)
      if (expiryError) return json(400, { error: expiryError })

      const store = await loadCodes()
      const existing = new Set(store.codes.map((item) => item.code))
      const typed = normalizeCode(asString(body.code))
      const code = typed ? typed : generateCode(existing)
      const formatError = validateCodeFormat(code)
      if (formatError) return json(400, { error: formatError })
      if (existing.has(code)) return json(409, { error: 'That code already exists.' })

      const entry: AccessCode = {
        code,
        expiresAt,
        active: true,
        createdAt: new Date().toISOString(),
      }
      store.codes.push(entry)
      await saveCodes(store)
      return json(201, { code: publicCode(entry) })
    }

    if (request.method === 'PATCH') {
      const body = await readBody(request)
      const code = normalizeCode(asString(body.code))
      const active = asBoolean(body.active)
      if (!code) return json(400, { error: 'Missing code.' })
      if (active === null) return json(400, { error: 'Set active on or off.' })

      const store = await loadCodes()
      const entry = store.codes.find((item) => item.code === code)
      if (!entry) return json(404, { error: 'That code was not found.' })
      entry.active = active
      await saveCodes(store)
      return json(200, { code: publicCode(entry) })
    }

    return json(405, { error: 'Use GET, POST, or PATCH.' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save access codes.'
    return json(500, { error: message })
  }
}

export async function handleRedeem(request: Request): Promise<Response> {
  if (request.method !== 'POST') return json(405, { error: 'Use POST.' })
  const body = await readBody(request)
  const code = normalizeCode(asString(body.code))
  if (!code) return json(400, { error: 'Enter your class access code.' })
  const formatError = validateCodeFormat(code)
  if (formatError) return json(400, { error: formatError })

  try {
    const store = await loadCodes()
    const entry = store.codes.find((item) => item.code === code)
    const problem = redeemProblem(entry)
    if (problem || !entry) return json(400, { error: problem ?? 'That access code was not found.' })
    return json(200, {
      enrolled: true,
      code: entry.code,
      expiresAt: entry.expiresAt,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not check that code right now.'
    return json(500, { error: message })
  }
}
