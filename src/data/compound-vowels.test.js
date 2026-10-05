import assert from 'node:assert/strict'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  BASIC_CV_SYLLABLES,
  BASIC_VOWELS,
  COMPOUND_VOWELS,
  QUIZ_FLASHCARDS,
} from './content.ts'
import { TRACE_LINES } from './trace-lines.ts'

const EXPECTED = [
  ['ㅐ', 'EH', 'vowel-ae', '개', 'GEH', 'dog'],
  ['ㅔ', 'EH', 'vowel-e', '게', 'GEH', 'crab'],
  ['ㅒ', 'YEH', 'vowel-yae', '얘', 'YEH', 'this kid'],
  ['ㅖ', 'YEH', 'vowel-ye', '예', 'YEH', 'yes'],
  ['ㅘ', 'WAH', 'vowel-wa', '와', 'WAH', 'wow'],
  ['ㅙ', 'WEH', 'vowel-wae', '왜', 'WEH', 'why'],
  ['ㅚ', 'WEH', 'vowel-oe', '외', 'WEH', 'outside'],
  ['ㅝ', 'WUH', 'vowel-wo', '뭐', 'MWUH', 'what'],
  ['ㅞ', 'WEH', 'vowel-we', '웨', 'WEH', ''],
  ['ㅟ', 'WEE', 'vowel-wi', '귀', 'GWEE', 'ear'],
  ['ㅢ', 'EUH-EE', 'vowel-ui', '의사', 'EUH-EE-SAH', 'doctor'],
]

test('이중모음 are 11 free letters with American-read hints and one example each', () => {
  assert.equal(COMPOUND_VOWELS.length, 11)
  assert.deepEqual(
    COMPOUND_VOWELS.map((item) => [
      item.char,
      item.roman,
      item.audioId,
      item.example?.hangul,
      item.example?.sound,
      item.example?.meaning ?? '',
    ]),
    EXPECTED,
  )
  assert.equal(
    COMPOUND_VOWELS.every((item) => item.kind === 'vowel' && item.family === 'compound'),
    true,
  )
  assert.equal(new Set(COMPOUND_VOWELS.map((item) => item.audioId)).size, 11)
})

test('student-facing compound spellings stay American-read caps', () => {
  const school = /\b(ae|yae|wae|oe|ui|eo|eu|wa|wo|we|wi|ye)\b/i
  for (const item of COMPOUND_VOWELS) {
    const facing = [item.roman, item.cue, item.example?.sound, item.example?.meaning]
      .filter(Boolean)
      .join(' ')
    assert.equal(school.test(facing), false, facing)
    assert.match(item.roman, /^[A-Z]+(?:-[A-Z]+)*$/)
    assert.match(item.example.sound, /^[A-Z]+(?:-[A-Z]+)*$/)
  }
})

test('compound vowels stay off the basic 모음 chart, quiz, and trace', () => {
  const chars = new Set(COMPOUND_VOWELS.map((item) => item.char))
  const audioIds = new Set(COMPOUND_VOWELS.map((item) => item.audioId))
  for (const item of BASIC_VOWELS) {
    assert.equal(chars.has(item.char), false)
    assert.equal(audioIds.has(item.audioId), false)
  }
  for (const item of [...QUIZ_FLASHCARDS, ...BASIC_CV_SYLLABLES]) {
    assert.equal(chars.has(item.char), false, item.char)
    assert.equal(audioIds.has(item.audioId), false, item.audioId)
  }
  for (const line of TRACE_LINES) {
    for (const item of line.items) {
      assert.equal(chars.has(item.char), false, `${line.id} ${item.char}`)
      assert.equal(audioIds.has(item.audioId), false, item.audioId)
    }
  }
})

test('each 이중모음 has Jung’s MP3 in public/audio', () => {
  const audioDir = join(dirname(fileURLToPath(import.meta.url)), '../../public/audio')
  for (const item of COMPOUND_VOWELS) {
    const file = join(audioDir, `${item.audioId}.mp3`)
    assert.equal(existsSync(file), true, item.audioId)
    const bytes = readFileSync(file)
    assert.ok(statSync(file).size > 4000, item.audioId)
    assert.equal(bytes.subarray(0, 3).toString('latin1'), 'ID3', item.audioId)
  }
})

test('pronunciation lists 이중모음 as a free tab with the beginner note', () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
  const page = readFileSync(join(root, 'src/pages/Pronunciation.tsx'), 'utf8')
  assert.match(page, /COMPOUND_VOWELS/)
  assert.match(page, /이중모음 \(compound vowels\)/)
  assert.match(page, /ㅐ\/ㅔ sound the same \(EH\) today/)
  assert.match(page, /ㅙ\/ㅚ\/ㅞ all sound like WEH/)
  assert.match(page, /Free — no access code/)
  assert.doesNotMatch(page, /compound' && !enrollment/)
  assert.doesNotMatch(page, /UnlockControl/)
})
