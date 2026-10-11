import assert from 'node:assert/strict'
import { after, before, beforeEach, describe, it } from 'node:test'
import { handleStudentHomework } from './classroom-handlers.js'
import { GRAMMAR_LOCKED, LOCKED_LESSONS } from './grammar.js'
import { handleAdminCodes, handleAdminLogin } from './handlers.js'
import { resetMemoryStore } from './store.js'

function ctx(method, body = {}, header = () => '', extra = {}) {
  return { method, body, header, query: {}, rawBody: null, contentType: '', ...extra }
}

function spoken(lesson) {
  return lesson.sentences.map((sentence) => sentence.words.map((word) => `${word.hangul} (${word.roman})`).join(' '))
}

describe('taste of grammar access', () => {
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
    const login = await handleAdminLogin(ctx('POST', { password: 'store-owner-secret' }))
    auth = () => `Bearer ${login.body.token}`
    await handleAdminCodes(ctx('POST', { code: 'POP-WEEK', expiresAt: '2099-12-31' }, auth))
    await handleAdminCodes(ctx('POST', { code: 'POP-NEXT', expiresAt: '2099-12-31', homeworkAccess: false }, auth))
  })

  after(() => {
    delete process.env.ADMIN_PASSWORD
    delete process.env.ACCESS_CODES_STORE
    resetMemoryStore()
  })

  it('keeps lessons 3–8 off the response unless full course access is on', async () => {
    assert.deepEqual(
      LOCKED_LESSONS.map((lesson) => lesson.id),
      [3, 4, 5, 6, 7, 8],
    )
    for (const lesson of LOCKED_LESSONS) {
      assert.equal(lesson.sentences.length, 3)
      lesson.sentences.forEach((sentence, index) => {
        assert.equal(sentence.audioId, `grammar-${lesson.id}-${index + 1}`)
        for (const word of sentence.words) {
          assert.match(word.roman, /^[a-z]+(?:-[a-z]+)*$/)
          assert.equal(/[\u4e00-\u9fff]/.test(`${word.hangul}${word.roman}${sentence.english}${lesson.explanation}`), false)
        }
      })
    }
    assert.equal(spoken(LOCKED_LESSONS[0])[2], '커피예요 (kuh-pee-yeh-yoh)')

    const grammar = (code) =>
      handleStudentHomework(
        ctx('GET', {}, (name) => (name === 'x-access-code' ? code : ''), { query: { grammar: '1' } }),
      )

    const missing = await grammar('')
    assert.equal(missing.status, 401)
    assert.equal(JSON.stringify(missing.body).includes('커피예요'), false)
    assert.equal(missing.body.lessons, undefined)

    const taste = await grammar('POP-NEXT')
    assert.equal(taste.status, 403)
    assert.equal(taste.body.error, GRAMMAR_LOCKED)
    assert.equal(JSON.stringify(taste.body).includes('커피예요'), false)
    assert.equal(taste.body.lessons, undefined)

    const open = await grammar('POP-WEEK')
    assert.equal(open.status, 200)
    assert.equal(open.body.lessons.length, 6)
    assert.equal(open.body.lessons[0].sentences[2].words[0].hangul, '커피예요')

    const homework = await handleStudentHomework(ctx('GET', {}, (name) => (name === 'x-access-code' ? 'POP-NEXT' : '')))
    assert.equal(homework.status, 403)
    assert.equal(homework.body.lessons, undefined)
  })
})
