import assert from 'node:assert/strict'
import test from 'node:test'
import {
  BASIC_CONSONANTS,
  BASIC_CV_SYLLABLES,
  BASIC_VOWELS,
  DOUBLE_CONSONANTS,
  syllablesForVowel,
} from './content.ts'
import { TRACE_LINES, lineIsLocked, nextTraceLine } from './trace-lines.ts'

test('trace lines follow consonants, doubles, vowels, then one line per vowel', () => {
  const ids = TRACE_LINES.map((line) => line.id)
  assert.deepEqual(ids, [
    'consonants',
    'doubles',
    'vowels',
    ...BASIC_VOWELS.map((vowel) => `syllable-${vowel.roman}`),
  ])
  assert.equal(TRACE_LINES.length, 13)
})

test('only the 14 basic consonants are free', () => {
  const free = TRACE_LINES.filter((line) => line.free).map((line) => line.id)
  assert.deepEqual(free, ['consonants'])
  assert.equal(lineIsLocked(TRACE_LINES[0], false), false)
  for (const line of TRACE_LINES.slice(1)) {
    assert.equal(lineIsLocked(line, false), true, line.id)
    assert.equal(lineIsLocked(line, true), false, line.id)
  }
})

test('letter lines reuse jamo audio ids', () => {
  const consonants = TRACE_LINES[0]
  const doubles = TRACE_LINES[1]
  const vowels = TRACE_LINES[2]
  assert.equal(consonants.items.length, 14)
  assert.deepEqual(
    consonants.items.map((item) => item.char),
    BASIC_CONSONANTS.map((item) => item.char),
  )
  assert.deepEqual(
    consonants.items.map((item) => item.audioId),
    BASIC_CONSONANTS.map((item) => item.audioId),
  )
  assert.equal(consonants.label, 'Consonants')
  assert.equal(consonants.range, 'ㄱ ~ ㅎ')

  assert.deepEqual(
    doubles.items.map((item) => item.char),
    [...'ㄲㄸㅃㅆㅉ'],
  )
  assert.deepEqual(
    doubles.items.map((item) => item.audioId),
    DOUBLE_CONSONANTS.map((item) => item.audioId),
  )

  assert.deepEqual(
    vowels.items.map((item) => item.audioId),
    BASIC_VOWELS.map((item) => item.audioId),
  )
  assert.equal(vowels.items.length, BASIC_VOWELS.length)
})

test('syllable lines walk each vowel across the 14 consonants', () => {
  const syllableLines = TRACE_LINES.slice(3)
  assert.equal(syllableLines.length, 10)
  let count = 0
  for (const vowel of BASIC_VOWELS) {
    const line = syllableLines.find((item) => item.id === `syllable-${vowel.roman}`)
    const expected = syllablesForVowel(vowel.char)
    assert.ok(line, vowel.char)
    assert.deepEqual(
      line.items.map((item) => item.char),
      expected.map((item) => item.char),
    )
    assert.deepEqual(
      line.items.map((item) => item.audioId),
      expected.map((item) => item.audioId),
    )
    const span = `${expected[0].char} ~ ${expected[expected.length - 1].char}`
    assert.equal(line.label, `${vowel.char} line: ${span}`)
    count += line.items.length
  }
  assert.equal(count, 140)
  assert.equal(count, BASIC_CV_SYLLABLES.length)

  const a = syllableLines[0]
  assert.equal(a.items[0].char, '가')
  assert.equal(a.items[0].audioId, 'syllable-ga')
  assert.equal(a.items[a.items.length - 1].char, '하')
  assert.equal(a.label, 'ㅏ line: 가 ~ 하')

  const i = syllableLines[syllableLines.length - 1]
  assert.equal(i.id, 'syllable-i')
  assert.equal(i.items[0].char, '기')
  assert.equal(i.items[i.items.length - 1].char, '히')
  assert.equal(i.label, 'ㅣ line: 기 ~ 히')
})

test('next line stays in picker order and stops after ㅣ', () => {
  assert.equal(nextTraceLine('consonants')?.id, 'doubles')
  assert.equal(nextTraceLine('doubles')?.id, 'vowels')
  assert.equal(nextTraceLine('vowels')?.id, 'syllable-a')
  assert.equal(nextTraceLine('syllable-a')?.id, 'syllable-ya')
  assert.equal(nextTraceLine('syllable-i'), null)
  assert.equal(nextTraceLine('missing'), null)
})
