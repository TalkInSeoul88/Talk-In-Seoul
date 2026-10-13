import assert from 'node:assert/strict'
import { after, before, beforeEach, describe, it } from 'node:test'
import { handleStudentHomework } from './classroom-handlers.js'
import { resetClassroomMemory } from './classroom-store.js'
import { handleAdminCodes, handleAdminLogin } from './handlers.js'
import { LOCKED_TALKS, REAL_TALK_LOCKED } from './real-talk.js'
import { resetMemoryStore } from './store.js'

const LOCKED_HANGUL = ['과자예요', '여기요', '김밥 주세요', '이거 매워요', '오 달러예요', '네, 매워요']

function ctx(method, body = {}, header = () => '', extra = {}) {
  return { method, body, header, query: {}, rawBody: null, contentType: '', ...extra }
}

describe('real talk weeks', () => {
  let auth = () => ''

  before(() => {
    process.env.ADMIN_PASSWORD = 'store-owner-secret'
    process.env.ACCESS_CODES_STORE = 'memory'
    delete process.env.BLOB_READ_WRITE_TOKEN
    delete process.env.BLOB_STORE_ID
    delete process.env.VERCEL
    delete process.env.VERCEL_ENV
  })

  beforeEach(async () => {
    resetMemoryStore()
    resetClassroomMemory()
    const login = await handleAdminLogin(ctx('POST', { password: 'store-owner-secret' }))
    auth = () => `Bearer ${login.body.token}`
    await handleAdminCodes(ctx('POST', { code: 'POP-WEEK', expiresAt: '2099-12-31' }, auth))
    await handleAdminCodes(ctx('POST', { code: 'POP-NEXT', expiresAt: '2099-12-31', homeworkAccess: false }, auth))
  })

  after(() => {
    delete process.env.ADMIN_PASSWORD
    delete process.env.ACCESS_CODES_STORE
    resetMemoryStore()
    resetClassroomMemory()
  })

  it('asks for a code before it returns any lines', async () => {
    const closed = await handleStudentHomework(ctx('GET', {}, () => '', { query: { realtalk: '1' } }))
    assert.equal(closed.status, 401)
    const text = JSON.stringify(closed.body)
    for (const secret of LOCKED_HANGUL) assert.equal(text.includes(secret), false)
    assert.equal(closed.body.weeks, undefined)
  })

  it('keeps weeks 5–7 closed when full course access is off', async () => {
    const denied = await handleStudentHomework(
      ctx('GET', {}, (name) => (name === 'x-access-code' ? 'POP-NEXT' : ''), { query: { realtalk: '1' } }),
    )
    assert.equal(denied.status, 403)
    assert.equal(denied.body.error, REAL_TALK_LOCKED)
    const text = JSON.stringify(denied.body)
    for (const secret of LOCKED_HANGUL) assert.equal(text.includes(secret), false)
    assert.equal(denied.body.weeks, undefined)
  })

  it('returns weeks 5–7 when full course access is on', async () => {
    const open = await handleStudentHomework(
      ctx('GET', {}, (name) => (name === 'x-access-code' ? 'POP-WEEK' : ''), { query: { realtalk: '1' } }),
    )
    assert.equal(open.status, 200)
    assert.deepEqual(
      open.body.weeks.map((week) => week.week),
      [5, 6, 7],
    )
    assert.equal(open.body.weeks[0].lines.some((line) => line.hangul === '과자 주세요'), true)
    const week6 = open.body.weeks[1].lines
    assert.equal(week6.find((line) => line.hangul === '네')?.audioId, 'realtalk-neh')
    assert.equal(week6.find((line) => line.hangul === '맛있어요?')?.audioId, 'realtalk-mah-shee-ssuh-yoh-question')
    assert.equal(week6.find((line) => line.hangul === '네, 맛있어요!')?.audioId, 'realtalk-neh-mah-shee-ssuh-yoh')
    assert.equal(open.body.weeks[2].lines.find((line) => line.hangul === '네, 매워요')?.audioId, 'realtalk-neh-meh-wuh-yoh')
    assert.equal(open.body.weeks[2].lines.some((line) => line.hangul === '김밥 하나 주세요'), true)
    assert.equal(LOCKED_TALKS.length, 3)
  })

  it('leaves the homework list alone when realtalk is not requested', async () => {
    const homework = await handleStudentHomework(
      ctx('GET', {}, (name) => (name === 'x-access-code' ? 'POP-NEXT' : '')),
    )
    assert.equal(homework.status, 403)
    assert.equal(homework.body.weeks, undefined)
    const text = JSON.stringify(homework.body)
    for (const secret of LOCKED_HANGUL) assert.equal(text.includes(secret), false)
  })
})
