import { handleStudentGrammar } from '../_lib/grammar.js'
import { asVercelHandler } from '../_lib/vercel-handler.js'

export const config = { runtime: 'nodejs' }

export default asVercelHandler(handleStudentGrammar)
