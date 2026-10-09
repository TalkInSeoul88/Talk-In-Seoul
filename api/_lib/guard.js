import { readBearer, verifyAdminToken } from './auth.js'

export function requireAdmin(ctx) {
  const token = readBearer(ctx.header?.('authorization') || '')
  if (!token || !verifyAdminToken(token)) {
    return { ok: false, status: 401, error: 'Unlock admin first.' }
  }
  return { ok: true }
}

export async function requireStudent(ctx) {
  const { allowsHomework, normalizeCode, redeemProblem, validateCodeFormat } = await import('./codes.js')
  const { loadCodes } = await import('./store.js')
  const raw = ctx.header?.('x-access-code') || ctx.query?.code || ''
  const code = normalizeCode(raw)
  if (!code) return { ok: false, status: 401, error: 'Access code needed.' }
  const formatError = validateCodeFormat(code)
  if (formatError) return { ok: false, status: 401, error: formatError }
  const store = await loadCodes()
  const entry = store.codes.find((item) => item.code === code)
  const problem = redeemProblem(entry)
  if (problem || !entry) {
    return { ok: false, status: 401, error: problem ?? 'That access code was not found.' }
  }
  return { ok: true, code: entry.code, homeworkAccess: allowsHomework(entry) }
}
