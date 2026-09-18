import { handleAdminCodes } from '../_lib/handlers.js'
import { asVercelHandler } from '../_lib/vercel-handler.js'

export const config = { runtime: 'nodejs' }

export default asVercelHandler(handleAdminCodes)
