import { handleAdminHomework } from '../_lib/classroom-handlers.js'
import { asVercelHandler } from '../_lib/vercel-handler.js'

export const config = { runtime: 'nodejs' }

export default asVercelHandler(handleAdminHomework)
