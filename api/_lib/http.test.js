import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import { handleAdminCodes, handleAdminLogin, handleRedeem } from './handlers.js'
import { resetMemoryStore } from './store.js'

function ctx(method, body = {}, header = () => '') {
  return { method, body, header }
}

describe('admin codes API', () => {
  const previous = {
    password: process.env.ADMIN_PASSWORD,
    store: process.env.ACCESS_CODES_STORE,
    blob: process.env.BLOB_READ_WRITE_TOKEN,
    storeId: process.env.BLOB_STORE_ID,
    vercel: process.env.VERCEL,
  }

  before(() => {
    process.env.ADMIN_PASSWORD = 'store-owner-secret'
    process.env.ACCESS_CODES_STORE = 'memory'
    delete process.env.BLOB_READ_WRITE_TOKEN
    delete process.env.BLOB_STORE_ID
    delete process.env.VERCEL
    resetMemoryStore()
  })

  after(() => {
    if (previous.password === undefined) delete process.env.ADMIN_PASSWORD
    else process.env.ADMIN_PASSWORD = previous.password
    if (previous.store === undefined) delete process.env.ACCESS_CODES_STORE
    else process.env.ACCESS_CODES_STORE = previous.store
    if (previous.blob === undefined) delete process.env.BLOB_READ_WRITE_TOKEN
    else process.env.BLOB_READ_WRITE_TOKEN = previous.blob
    if (previous.storeId === undefined) delete process.env.BLOB_STORE_ID
    else process.env.BLOB_STORE_ID = previous.storeId
    if (previous.vercel === undefined) delete process.env.VERCEL
    else process.env.VERCEL = previous.vercel
    resetMemoryStore()
  })

  it('returns 401 JSON for a wrong password and never throws', async () => {
    const bad = await handleAdminLogin(ctx('POST', { password: 'nope' }))
    assert.equal(bad.status, 401)
    assert.equal(bad.body.error, 'That password did not match.')
  })

  it('returns 503 JSON when ADMIN_PASSWORD is missing', async () => {
    const saved = process.env.ADMIN_PASSWORD
    delete process.env.ADMIN_PASSWORD
    const missing = await handleAdminLogin(ctx('POST', { password: 'anything' }))
    process.env.ADMIN_PASSWORD = saved
    assert.equal(missing.status, 503)
    assert.match(String(missing.body.error), /ADMIN_PASSWORD/)
  })

  it('unlocks, issues, redeems, and stops a code', async () => {
    const login = await handleAdminLogin(ctx('POST', { password: 'store-owner-secret' }))
    assert.equal(login.status, 200)
    const token = String(login.body.token)
    assert.ok(token)
    const auth = () => `Bearer ${token}`

    const created = await handleAdminCodes(ctx('POST', { code: 'SAT-CLASS', expiresAt: '2099-12-31' }, auth))
    assert.equal(created.status, 201)
    assert.equal(created.body.code.code, 'SAT-CLASS')

    const redeemed = await handleRedeem(ctx('POST', { code: 'sat-class' }))
    assert.equal(redeemed.status, 200)
    assert.equal(redeemed.body.enrolled, true)

    const stopped = await handleAdminCodes(ctx('PATCH', { code: 'SAT-CLASS', active: false }, auth))
    assert.equal(stopped.status, 200)

    const blocked = await handleRedeem(ctx('POST', { code: 'SAT-CLASS' }))
    assert.equal(blocked.status, 400)
    assert.match(String(blocked.body.error), /stopped/)
  })
})
