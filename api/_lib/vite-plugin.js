import { handleAdminCodes, handleAdminLogin, handleRedeem } from './handlers.js'
import { toContext, sendResult } from './vercel-handler.js'

const HANDLERS = {
  '/api/admin/login': handleAdminLogin,
  '/api/admin/codes': handleAdminCodes,
  '/api/access/redeem': handleRedeem,
}

export function talkApiPlugin() {
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

function apiPath(pathname) {
  const clean = pathname.replace(/\.js$/, '')
  return HANDLERS[clean] ? clean : ''
}

function attach(middlewares) {
  middlewares.use((req, res, next) => {
    const url = new URL(req.url || '/', 'http://localhost')
    const path = apiPath(url.pathname)
    if (!path) {
      next()
      return
    }
    const handler = HANDLERS[path]
    void (async () => {
      try {
        const ctx = await toContext(req, res)
        const result = await handler(ctx)
        sendResult(req, res, result)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'API error'
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: message }))
      }
    })()
  })
}
