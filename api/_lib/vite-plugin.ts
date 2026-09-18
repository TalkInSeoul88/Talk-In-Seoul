import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { handleAdminCodes, handleAdminLogin, handleRedeem } from './http.ts'

type FetchHandler = (request: Request) => Promise<Response>

const ROUTES: Array<{ method: string; path: string; handler: FetchHandler }> = [
  { method: 'POST', path: '/api/admin/login', handler: handleAdminLogin },
  { method: 'GET', path: '/api/admin/codes', handler: handleAdminCodes },
  { method: 'POST', path: '/api/admin/codes', handler: handleAdminCodes },
  { method: 'PATCH', path: '/api/admin/codes', handler: handleAdminCodes },
  { method: 'POST', path: '/api/access/redeem', handler: handleRedeem },
]

function readRawBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

async function toWebRequest(req: IncomingMessage): Promise<Request> {
  const host = req.headers.host || 'localhost'
  const url = new URL(req.url || '/', `http://${host}`)
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (!value) continue
    headers.set(key, Array.isArray(value) ? value.join(', ') : value)
  }
  const method = (req.method || 'GET').toUpperCase()
  const init: RequestInit = { method, headers }
  if (method !== 'GET' && method !== 'HEAD') {
    init.body = new Uint8Array(await readRawBody(req))
  }
  return new Request(url, init)
}

async function writeWebResponse(res: ServerResponse, response: Response): Promise<void> {
  res.statusCode = response.status
  response.headers.forEach((value, key) => {
    res.setHeader(key, value)
  })
  const buffer = Buffer.from(await response.arrayBuffer())
  res.end(buffer)
}

function attach(middlewares: { use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void }) {
  middlewares.use((req, res, next) => {
    const url = new URL(req.url || '/', 'http://localhost')
    const method = (req.method || 'GET').toUpperCase()
    const route = ROUTES.find((item) => item.method === method && item.path === url.pathname)
    if (!route) {
      next()
      return
    }
    void (async () => {
      try {
        const request = await toWebRequest(req)
        const response = await route.handler(request)
        await writeWebResponse(res, response)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'API error'
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: message }))
      }
    })()
  })
}

export function talkApiPlugin(): Plugin {
  return {
    name: 'talk-in-seoul-api',
    configureServer(server) {
      attach(server.middlewares)
    },
    configurePreviewServer(server) {
      attach(server.middlewares)
    },
  }
}
