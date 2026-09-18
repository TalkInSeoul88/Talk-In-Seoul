import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import handler from '../admin/login.js'

function mockRes() {
  return {
    statusCode: 0,
    headers: {},
    body: '',
    setHeader(key, value) {
      this.headers[key.toLowerCase()] = value
    },
    end(value) {
      this.body = String(value || '')
    },
  }
}

describe('production login function', () => {
  const previous = process.env.ADMIN_PASSWORD

  before(() => {
    process.env.ADMIN_PASSWORD = 'jung-secret'
  })

  after(() => {
    if (previous === undefined) delete process.env.ADMIN_PASSWORD
    else process.env.ADMIN_PASSWORD = previous
  })

  it('returns 401 JSON for a wrong password', async () => {
    const res = mockRes()
    await handler({ method: 'POST', body: { password: 'nope' }, headers: {}, on() {} }, res)
    assert.equal(res.statusCode, 401)
    assert.equal(JSON.parse(res.body).error, 'That password did not match.')
  })

  it('returns 503 JSON when ADMIN_PASSWORD is unset', async () => {
    const saved = process.env.ADMIN_PASSWORD
    delete process.env.ADMIN_PASSWORD
    const res = mockRes()
    await handler({ method: 'POST', body: { password: 'jung-secret' }, headers: {}, on() {} }, res)
    process.env.ADMIN_PASSWORD = saved
    assert.equal(res.statusCode, 503)
    assert.match(JSON.parse(res.body).error, /ADMIN_PASSWORD/)
  })

  it('returns a token for the correct password', async () => {
    const res = mockRes()
    await handler({ method: 'POST', body: { password: 'jung-secret' }, headers: {}, on() {} }, res)
    assert.equal(res.statusCode, 200)
    assert.ok(JSON.parse(res.body).token)
  })

  it('returns 405 JSON for GET instead of crashing', async () => {
    const res = mockRes()
    await handler({ method: 'GET', headers: {}, on() {} }, res)
    assert.equal(res.statusCode, 405)
    assert.equal(JSON.parse(res.body).error, 'Use POST.')
  })
})
