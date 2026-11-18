import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { LEVELS, beginnerDenied, levelsFor, lockMessage, parseLevels } from './levels.js'

describe('levels', () => {
  it('keeps the five class levels in order', () => {
    assert.deepEqual(
      LEVELS.map((level) => level.label),
      ['Beginner', 'Intermediate 1', 'Intermediate 2', 'Advanced 1', 'Advanced 2'],
    )
  })

  it('treats a missing list as Beginner only and keeps an explicit empty list', () => {
    assert.deepEqual(levelsFor({ code: 'OLD' }), ['beginner'])
    assert.deepEqual(levelsFor({ levels: [] }), [])
    assert.deepEqual(levelsFor({ levels: ['advanced-1', 'beginner'] }), ['beginner', 'advanced-1'])
    assert.equal(parseLevels(['nope']), null)
    assert.equal(parseLevels('beginner'), null)
  })

  it('asks Jung to unlock a missing level', () => {
    assert.equal(lockMessage('Intermediate 1'), 'Ask Jung to unlock Intermediate 1')
    assert.equal(beginnerDenied({ levels: ['beginner'] }), null)
    assert.equal(beginnerDenied({ levels: ['intermediate-1'] }), 'Ask Jung to unlock Beginner')
  })
})
