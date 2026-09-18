import { createHmac, timingSafeEqual } from 'node:crypto'

export const config = { runtime: 'nodejs' }

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000

function adminPassword() {
  return process.env.ADMIN_PASSWORD ?? ''
}

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || `talk-in-seoul:${adminPassword()}`
}

function hmac(value) {
  return createHmac('sha256', sessionSecret()).update(value).digest('hex')
}

function match(a, b) {
  const left = Buffer.from(String(a))
  const right = Buffer.from(String(b))
  if (left.length !== right.length) {
    timingSafeEqual(left, left)
    return false
  }
  return timingSafeEqual(left, right)
}

function verifyPassword(password) {
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

function issueAdminToken(now = Date.now()) {
  const exp = String(now + TOKEN_TTL_MS)
  const payload = `${exp}.${now}`
  return `${payload}.${hmac(payload)}`
}

function isNodeResponse(res) {
  return Boolean(res && typeof res.end === 'function' && typeof res.setHeader === 'function')
}

function send(req, res, status, body) {
  if (isNodeResponse(res)) {
    res.statusCode = status
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    res.end(JSON.stringify(body))
    return undefined
  }
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}

async function readPassword(req, res) {
  if (!isNodeResponse(res) && req && typeof req.json === 'function') {
    try {
      const body = await req.json()
      return typeof body?.password === 'string' ? body.password : ''
    } catch {
      return ''
    }
  }

  try {
    if (req.body && typeof req.body === 'object' && typeof req.body.password === 'string') {
      return req.body.password
    }
    if (typeof req.body === 'string' && req.body.trim()) {
      const parsed = JSON.parse(req.body)
      return typeof parsed?.password === 'string' ? parsed.password : ''
    }
    if (Buffer.isBuffer(req.body) && req.body.length) {
      const parsed = JSON.parse(req.body.toString('utf8'))
      return typeof parsed?.password === 'string' ? parsed.password : ''
    }
  } catch {
    return ''
  }

  const raw = await new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  }).catch(() => Buffer.alloc(0))

  if (!raw.length) return ''
  try {
    const parsed = JSON.parse(raw.toString('utf8'))
    return typeof parsed?.password === 'string' ? parsed.password : ''
  } catch {
    return ''
  }
}

async function handler(req, res) {
  try {
    const method = String(req?.method || 'GET').toUpperCase()
    if (method !== 'POST') {
      return send(req, res, 405, { error: 'Use POST.' })
    }
    const password = await readPassword(req, res)
    const result = verifyPassword(password)
    if (!result.ok) {
      return send(req, res, result.status, { error: result.error })
    }
    return send(req, res, 200, { token: issueAdminToken() })
  } catch {
    return send(req, res, 500, { error: 'Login failed.' })
  }
}

handler.fetch = (request) => handler(request)

export default handler
