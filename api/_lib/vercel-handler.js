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

export async function toContext(req, res) {
  return {
    method: String(req.method || 'GET').toUpperCase(),
    body: await readBody(req, res),
    header: (name) => headerFrom(req, res, name),
  }
}

export function sendResult(req, res, result) {
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
