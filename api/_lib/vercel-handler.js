function isNodeResponse(res) {
  return Boolean(res && typeof res.end === 'function' && typeof res.setHeader === 'function')
}

function readStream(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

async function readBody(req, res) {
  if (!isNodeResponse(res) && req && typeof req.json === 'function') {
    try {
      const body = await req.json()
      return body && typeof body === 'object' && !Array.isArray(body) ? body : {}
    } catch {
      return {}
    }
  }

  try {
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body) && !Array.isArray(req.body)) {
      return req.body
    }
    if (typeof req.body === 'string' && req.body.trim()) {
      const parsed = JSON.parse(req.body)
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
    }
  } catch {
    return {}
  }

  try {
    const raw = await readStream(req)
    if (!raw.length) return {}
    const parsed = JSON.parse(raw.toString('utf8'))
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function headerFrom(req, res, name) {
  if (!isNodeResponse(res) && req?.headers?.get) {
    return req.headers.get(name)
  }
  const value = req.headers?.[name.toLowerCase()]
  if (Array.isArray(value)) return value.join(', ')
  return value
}

function readQuery(req) {
  try {
    const url = new URL(req.url || '/', 'http://localhost')
    return Object.fromEntries(url.searchParams)
  } catch {
    return {}
  }
}

export async function toContext(req, res) {
  const contentType = headerFrom(req, res, 'content-type') || ''
  const multipart = contentType.toLowerCase().includes('multipart/form-data')
  let rawBody = null
  let body = {}
  if (multipart) {
    rawBody = await readRaw(req, res)
  } else {
    body = await readBody(req, res)
  }
  return {
    method: String(req.method || 'GET').toUpperCase(),
    body,
    rawBody,
    contentType,
    query: readQuery(req),
    request: req,
    header: (name) => headerFrom(req, res, name),
  }
}

async function readRaw(req, res) {
  if (Buffer.isBuffer(req.body)) return req.body
  if (!isNodeResponse(res) && req && typeof req.arrayBuffer === 'function') {
    try {
      return Buffer.from(await req.arrayBuffer())
    } catch {
      return Buffer.alloc(0)
    }
  }
  try {
    return await readStream(req)
  } catch {
    return Buffer.alloc(0)
  }
}

export function sendResult(req, res, result) {
  if (result && result.bytes) {
    const status = result.status || 200
    const headers = result.headers || {}
    if (isNodeResponse(res)) {
      res.statusCode = status
      for (const [key, value] of Object.entries(headers)) res.setHeader(key, value)
      res.end(result.bytes)
      return undefined
    }
    const bytes = result.bytes
    const copy = new Uint8Array(bytes.byteLength)
    copy.set(bytes)
    return new Response(copy, { status, headers })
  }
  const status = result.status || 500
  const body = result.body || { error: 'Server error' }
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

export function asVercelHandler(fn) {
  async function handler(req, res) {
    try {
      const ctx = await toContext(req, res)
      const result = await fn(ctx)
      return sendResult(req, res, result)
    } catch {
      return sendResult(req, res, { status: 500, body: { error: 'Server error' } })
    }
  }
  handler.fetch = (request) => handler(request)
  return handler
}
