function jsonResult(status, body) {
  return { status, body }
}

function asString(value) {
  return typeof value === 'string' ? value : ''
}

function asBoolean(value) {
  return typeof value === 'boolean' ? value : null
}

export async function handleAdminLogin(ctx) {
  try {
    if (ctx.method !== 'POST') return jsonResult(405, { error: 'Use POST.' })
    const { verifyPassword, issueAdminToken } = await import('./auth.js')
    const result = verifyPassword(asString(ctx.body?.password))
    if (!result.ok) return jsonResult(result.status, { error: result.error })
    return jsonResult(200, { token: issueAdminToken() })
  } catch {
    return jsonResult(500, { error: 'Login failed.' })
  }
}

export async function handleAdminCodes(ctx) {
  try {
    const { readBearer, verifyAdminToken } = await import('./auth.js')
    const token = readBearer(ctx.header('authorization'))
    if (!token || !verifyAdminToken(token)) {
      return jsonResult(401, { error: 'Unlock admin first.' })
    }

    const {
      generateCode,
      normalizeCode,
      sortCodes,
      statusLabel,
      validateCodeFormat,
      validateExpiry,
    } = await import('./codes.js')
    const { loadCodes, saveCodes, storeMode } = await import('./store.js')

    function publicCode(entry) {
      return {
        code: entry.code,
        expiresAt: entry.expiresAt,
        active: entry.active,
        createdAt: entry.createdAt,
        status: statusLabel(entry),
      }
    }

    if (ctx.method === 'GET') {
      const store = await loadCodes()
      return jsonResult(200, { codes: sortCodes(store.codes).map(publicCode), store: storeMode() })
    }

    if (ctx.method === 'POST') {
      const expiresAt = asString(ctx.body?.expiresAt)
      const expiryError = validateExpiry(expiresAt)
      if (expiryError) return jsonResult(400, { error: expiryError })

      const store = await loadCodes()
      const existing = new Set(store.codes.map((item) => item.code))
      const typed = normalizeCode(asString(ctx.body?.code))
      const code = typed ? typed : generateCode(existing)
      const formatError = validateCodeFormat(code)
      if (formatError) return jsonResult(400, { error: formatError })
      if (existing.has(code)) return jsonResult(409, { error: 'That code already exists.' })

      const entry = {
        code,
        expiresAt,
        active: true,
        createdAt: new Date().toISOString(),
      }
      store.codes.push(entry)
      await saveCodes(store)
      return jsonResult(201, { code: publicCode(entry) })
    }

    if (ctx.method === 'PATCH') {
      const code = normalizeCode(asString(ctx.body?.code))
      const active = asBoolean(ctx.body?.active)
      if (!code) return jsonResult(400, { error: 'Missing code.' })
      if (active === null) return jsonResult(400, { error: 'Set active on or off.' })

      const store = await loadCodes()
      const entry = store.codes.find((item) => item.code === code)
      if (!entry) return jsonResult(404, { error: 'That code was not found.' })
      entry.active = active
      await saveCodes(store)
      return jsonResult(200, { code: publicCode(entry) })
    }

    return jsonResult(405, { error: 'Use GET, POST, or PATCH.' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save access codes.'
    return jsonResult(500, { error: message })
  }
}

export async function handleRedeem(ctx) {
  try {
    if (ctx.method !== 'POST') return jsonResult(405, { error: 'Use POST.' })
    const { normalizeCode, redeemProblem, validateCodeFormat } = await import('./codes.js')
    const code = normalizeCode(asString(ctx.body?.code))
    if (!code) return jsonResult(400, { error: 'Enter your class access code.' })
    const formatError = validateCodeFormat(code)
    if (formatError) return jsonResult(400, { error: formatError })

    const { loadCodes } = await import('./store.js')
    const store = await loadCodes()
    const entry = store.codes.find((item) => item.code === code)
    const problem = redeemProblem(entry)
    if (problem || !entry) return jsonResult(400, { error: problem ?? 'That access code was not found.' })
    return jsonResult(200, {
      enrolled: true,
      code: entry.code,
      expiresAt: entry.expiresAt,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not check that code right now.'
    return jsonResult(500, { error: message })
  }
}
