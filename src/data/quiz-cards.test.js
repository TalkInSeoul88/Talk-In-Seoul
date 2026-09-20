import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  BASIC_CONSONANTS,
  BASIC_CV_SYLLABLES,
  BASIC_VOWELS,
  DOUBLE_CONSONANTS,
  QUIZ_CONSONANTS,
  QUIZ_FLASHCARDS,
  QUIZ_VOWELS,
} from './content.ts'

const VOWELS = 'ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ'
const BASIC_CONS = 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ'
const SSANG = 'ㄲㄸㅃㅆㅉ'
const COMPOUND_VOWELS = 'ㅐㅒㅔㅖㅘㅙㅚㅝㅞㅟㅢ'

test('quiz deck is 10 free vowels + 19 free consonants (29)', () => {
  assert.equal(QUIZ_VOWELS.length, 10)
  assert.equal(QUIZ_CONSONANTS.length, 19)
  assert.equal(DOUBLE_CONSONANTS.length, 5)
  assert.equal(QUIZ_FLASHCARDS.length, 29)
  assert.equal(QUIZ_VOWELS.map((item) => item.char).join(''), VOWELS)
  assert.equal(QUIZ_CONSONANTS.map((item) => item.char).join(''), BASIC_CONS + SSANG)
  assert.equal(DOUBLE_CONSONANTS.map((item) => item.char).join(''), SSANG)
  assert.equal(new Set(QUIZ_FLASHCARDS.map((item) => item.char)).size, 29)
  assert.equal(new Set(QUIZ_FLASHCARDS.map((item) => item.audioId)).size, 29)
})

test('quiz cards stay free jamo — no compound vowels and no 음절', () => {
  for (const card of QUIZ_FLASHCARDS) {
    assert.equal(COMPOUND_VOWELS.includes(card.char), false, `compound vowel ${card.char}`)
    assert.equal(card.audioId.startsWith('syllable-'), false, card.audioId)
    assert.ok(card.nameKo)
    assert.ok(card.roman)
    assert.ok(card.audioId.startsWith(card.kind === 'vowel' ? 'vowel-' : 'consonant-'))
  }
  assert.equal(
    QUIZ_VOWELS.every((item) => item.kind === 'vowel' && item.audioId.startsWith('vowel-')),
    true,
  )
  assert.equal(
    QUIZ_CONSONANTS.every((item) => item.kind === 'consonant' && item.audioId.startsWith('consonant-')),
    true,
  )
})

test('쌍자음 stay off the 140 CV chart and use kk/tt/pp/ss/jj clips', () => {
  assert.equal(BASIC_VOWELS.length, 10)
  assert.equal(BASIC_CONSONANTS.length, 14)
  assert.equal(BASIC_CV_SYLLABLES.length, 140)
  assert.equal(
    BASIC_CONSONANTS.some((item) => SSANG.includes(item.char)),
    false,
  )
  assert.equal(
    DOUBLE_CONSONANTS.every((item) => item.family === 'ssang'),
    true,
  )
  assert.deepEqual(
    DOUBLE_CONSONANTS.map((item) => item.audioId),
    ['consonant-kk', 'consonant-tt', 'consonant-pp', 'consonant-ss', 'consonant-jj'],
  )
  assert.deepEqual(
    DOUBLE_CONSONANTS.map((item) => [item.char, item.roman, item.nameKo]),
    [
      ['ㄲ', 'kk', '쌍기역'],
      ['ㄸ', 'tt', '쌍디귿'],
      ['ㅃ', 'pp', '쌍비읍'],
      ['ㅆ', 'ss', '쌍시옷'],
      ['ㅉ', 'jj', '쌍지읒'],
    ],
  )
  const audioDir = join(dirname(fileURLToPath(import.meta.url)), '../../public/audio')
  for (const item of DOUBLE_CONSONANTS) {
    assert.equal(existsSync(join(audioDir, `${item.audioId}.mp3`)), true, item.audioId)
  }
})
