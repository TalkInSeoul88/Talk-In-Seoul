import assert from 'node:assert/strict'
import { after, before, beforeEach, describe, it } from 'node:test'
import { handleStudentHomework } from './classroom-handlers.js'
import { INTERMEDIATE_1_TOPICS, handleStudentGrammar } from './grammar.js'
import { handleAdminCodes, handleAdminLogin, handleRedeem } from './handlers.js'
import { resetMemoryStore, saveCodes, loadCodes } from './store.js'

function ctx(method, body = {}, header = () => '', extra = {}) {
  return { method, body, header, query: {}, rawBody: null, contentType: '', ...extra }
}

function spoken(text) {
  const re = /[가-힣]+/g
  let match
  while ((match = re.exec(text))) {
    const after = text.slice(match.index + match[0].length)
    assert.match(after, /\([a-z][a-z\s,./-]*\)/, `${match[0]} in ${text}`)
  }
}

describe('level grammar access', () => {
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
  })

  after(() => {
    delete process.env.ADMIN_PASSWORD
    delete process.env.ACCESS_CODES_STORE
    resetMemoryStore()
  })

  it('defaults old codes to Beginner and saves checkbox changes without a redeploy', async () => {
    await saveCodes({
      version: 1,
      codes: [{ code: 'OLD-CODE', expiresAt: '2099-06-01', active: true, createdAt: '2020-01-01T00:00:00.000Z' }],
    })
    const listed = await handleAdminCodes(ctx('GET', {}, auth))
    const oldRow = listed.body.codes.find((item) => item.code === 'OLD-CODE')
    assert.deepEqual(oldRow.levels, ['beginner'])
    assert.equal(Object.prototype.hasOwnProperty.call((await loadCodes()).codes[0], 'levels'), false)

    const redeemed = await handleRedeem(ctx('POST', { code: 'OLD-CODE' }))
    assert.deepEqual(redeemed.body.levels, ['beginner'])

    const dated = await handleAdminCodes(ctx('PATCH', { code: 'OLD-CODE', expiresAt: '2099-07-01' }, auth))
    assert.equal(dated.status, 200)
    assert.equal(Object.prototype.hasOwnProperty.call((await loadCodes()).codes[0], 'levels'), false)

    const opened = await handleAdminCodes(
      ctx('PATCH', { code: 'OLD-CODE', levels: ['intermediate-1', 'beginner'] }, auth),
    )
    assert.equal(opened.status, 200)
    assert.deepEqual(opened.body.code.levels, ['beginner', 'intermediate-1'])
    assert.deepEqual((await loadCodes()).codes[0].levels, ['beginner', 'intermediate-1'])

    const created = await handleAdminCodes(ctx('POST', { code: 'NEW-ONE', expiresAt: '2099-12-31' }, auth))
    assert.deepEqual(created.body.code.levels, ['beginner'])
    const bad = await handleAdminCodes(
      ctx('POST', { code: 'BAD-LVL', expiresAt: '2099-12-31', levels: ['vip'] }, auth),
    )
    assert.equal(bad.status, 400)
  })

  it('sends Intermediate 1 lessons only when that level is checked', async () => {
    assert.deepEqual(
      INTERMEDIATE_1_TOPICS.map((topic) => topic.id),
      ['ida', 'have', 'polite'],
    )
    for (const topic of INTERMEDIATE_1_TOPICS) {
      spoken(topic.title)
      spoken(topic.explanation)
      assert.equal(topic.sentences.length, 3)
      topic.sentences.forEach((sentence, index) => {
        assert.equal(sentence.audioId, `grammar-i1-${topic.id}-${index + 1}`)
        for (const word of sentence.words) {
          spoken(`${word.hangul} (${word.roman})`)
          assert.match(word.roman, /^[a-z]+(?:-[a-z]+)*$/)
        }
      })
    }

    await handleAdminCodes(ctx('POST', { code: 'BEG-ONLY', expiresAt: '2099-12-31' }, auth))
    await handleAdminCodes(
      ctx('POST', { code: 'MID-ONE', expiresAt: '2099-12-31', levels: ['intermediate-1'] }, auth),
    )
    await handleAdminCodes(
      ctx(
        'POST',
        { code: 'MID-TWO', expiresAt: '2099-12-31', levels: ['beginner', 'intermediate-2', 'advanced-1'] },
        auth,
      ),
    )

    const grammar = (code) =>
      handleStudentGrammar(ctx('GET', {}, (name) => (name === 'x-access-code' ? code : '')))

    const missing = await grammar('')
    assert.equal(missing.status, 401)
    assert.equal(JSON.stringify(missing.body).includes('커피예요'), false)

    const beginner = await grammar('BEG-ONLY')
    assert.equal(beginner.status, 200)
    assert.equal(beginner.body.sections.find((item) => item.id === 'intermediate-1').open, false)
    assert.equal(beginner.body.sections.find((item) => item.id === 'intermediate-1').message, 'Ask Jung to unlock Intermediate 1')
    assert.equal(JSON.stringify(beginner.body).includes('커피예요'), false)
    assert.equal(JSON.stringify(beginner.body).includes('grammar-i1-'), false)

    const open = await grammar('MID-ONE')
    const topic = open.body.sections.find((item) => item.id === 'intermediate-1')
    assert.equal(topic.open, true)
    assert.equal(topic.topics[0].sentences[2].words[0].hangul, '커피예요')
    assert.equal(open.body.sections.find((item) => item.id === 'intermediate-2').message, 'Ask Jung to unlock Intermediate 2')

    const soon = await grammar('MID-TWO')
    assert.equal(soon.body.sections.find((item) => item.id === 'intermediate-1').open, false)
    assert.equal(soon.body.sections.find((item) => item.id === 'intermediate-2').message, 'Coming soon')
    assert.equal(soon.body.sections.find((item) => item.id === 'advanced-1').message, 'Coming soon')
    assert.equal(soon.body.sections.find((item) => item.id === 'advanced-2').message, 'Ask Jung to unlock Advanced 2')
    assert.equal(JSON.stringify(soon.body).includes('커피예요'), false)

    const homework = await handleStudentHomework(ctx('GET', {}, (name) => (name === 'x-access-code' ? 'MID-ONE' : '')))
    assert.equal(homework.status, 403)
    assert.equal(homework.body.error, 'Ask Jung to unlock Beginner')
    assert.equal(homework.body.weeks, undefined)

    const sheets = await handleStudentHomework(ctx('GET', {}, (name) => (name === 'x-access-code' ? 'BEG-ONLY' : '')))
    assert.notEqual(sheets.status, 403)
  })
})
