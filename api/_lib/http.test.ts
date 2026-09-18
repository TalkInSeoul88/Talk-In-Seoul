import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import { handleAdminCodes, handleAdminLogin, handleRedeem } from './http.ts'
import { resetMemoryStore } from './store.ts'

async function jsonRequest(url: string, init: RequestInit): Promise<{ status: number; body: Record<string, unknown> }> {
  const response = await (url.includes('/login')
    ? handleAdminLogin(new Request(url, init))
    : url.includes('/codes')
      ? handleAdminCodes(new Request(url, init))
      : handleRedeem(new Request(url, init)))
  return { status: response.status, body: (await response.json()) as Record<string, unknown> }
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

  it('unlocks, issues, redeems, and stops a code', async () => {
    const bad = await jsonRequest('http://local/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'nope' }),
    })
    assert.equal(bad.status, 401)

    const login = await jsonRequest('http://local/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'store-owner-secret' }),
    })
    assert.equal(login.status, 200)
    const token = String(login.body.token)
    assert.ok(token)

    const created = await jsonRequest('http://local/api/admin/codes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'SAT-CLASS', expiresAt: '2099-12-31' }),
    })
    assert.equal(created.status, 201)
    assert.equal((created.body.code as { code: string }).code, 'SAT-CLASS')

    const redeemed = await jsonRequest('http://local/api/access/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'sat-class' }),
    })
    assert.equal(redeemed.status, 200)
    assert.equal(redeemed.body.enrolled, true)

    const stopped = await jsonRequest('http://local/api/admin/codes', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'SAT-CLASS', active: false }),
    })
    assert.equal(stopped.status, 200)

    const blocked = await jsonRequest('http://local/api/access/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'SAT-CLASS' }),
    })
    assert.equal(blocked.status, 400)
    assert.match(String(blocked.body.error), /stopped/)
  })
})
