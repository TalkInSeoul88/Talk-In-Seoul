import assert from 'node:assert/strict'
import test from 'node:test'

const CHO = {
  ㄱ: 0,
  ㄴ: 2,
  ㄷ: 3,
  ㄹ: 5,
  ㅁ: 6,
  ㅂ: 7,
  ㅅ: 9,
  ㅇ: 11,
  ㅈ: 12,
  ㅊ: 14,
  ㅋ: 15,
  ㅌ: 16,
  ㅍ: 17,
  ㅎ: 18,
}

const JUNG = {
  ㅏ: 0,
  ㅑ: 2,
  ㅓ: 4,
  ㅕ: 6,
  ㅗ: 8,
  ㅛ: 12,
  ㅜ: 13,
  ㅠ: 17,
  ㅡ: 18,
  ㅣ: 20,
}

const CHO_ROMAN = {
  ㄱ: 'g',
  ㄴ: 'n',
  ㄷ: 'd',
  ㄹ: 'r',
  ㅁ: 'm',
  ㅂ: 'b',
  ㅅ: 's',
  ㅇ: '',
  ㅈ: 'j',
  ㅊ: 'ch',
  ㅋ: 'k',
  ㅌ: 't',
  ㅍ: 'p',
  ㅎ: 'h',
}

const JUNG_ROMAN = {
  ㅏ: 'a',
  ㅑ: 'ya',
  ㅓ: 'eo',
  ㅕ: 'yeo',
  ㅗ: 'o',
  ㅛ: 'yo',
  ㅜ: 'u',
  ㅠ: 'yu',
  ㅡ: 'eu',
  ㅣ: 'i',
}

const INITIALS = Object.keys(CHO)
const VOWELS = Object.keys(JUNG)

function compose(initial, vowel) {
  return String.fromCharCode(0xac00 + (CHO[initial] * 21 + JUNG[vowel]) * 28)
}

function audioId(initial, vowel) {
  return `syllable-${CHO_ROMAN[initial]}${JUNG_ROMAN[vowel]}`
}

test('basic CV chart is 140 unique Hangul syllables with unique audioIds', () => {
  const chars = []
  const ids = []
  for (const initial of INITIALS) {
    for (const vowel of VOWELS) {
      chars.push(compose(initial, vowel))
      ids.push(audioId(initial, vowel))
    }
  }

  assert.equal(INITIALS.length, 14)
  assert.equal(VOWELS.length, 10)
  assert.equal(chars.length, 140)
  assert.equal(new Set(chars).size, 140)
  assert.equal(new Set(ids).size, 140)
  assert.equal(chars[0], '가')
  assert.equal(ids[0], 'syllable-ga')
  assert.equal(chars[9], '기')
  assert.equal(ids[9], 'syllable-gi')
  assert.equal(chars[60], '사')
  assert.equal(ids[60], 'syllable-sa')
  assert.equal(chars[70], '아')
  assert.equal(ids[70], 'syllable-a')
  assert.equal(chars[130], '하')
  assert.equal(ids[130], 'syllable-ha')
  assert.equal(chars[139], '히')
  assert.equal(ids[139], 'syllable-hi')
})

test('recording checklist lists 140 unique syllable mp3 filenames', async () => {
  const { readFile } = await import('node:fs/promises')
  const { fileURLToPath } = await import('node:url')
  const { dirname, join } = await import('node:path')
  const here = dirname(fileURLToPath(import.meta.url))
  const checklist = await readFile(
    join(here, '../../public/audio/SYLLABLE-RECORDING-CHECKLIST.md'),
    'utf8',
  )
  const files = [...checklist.matchAll(/\| \d+ \| \S+ \| \S+ \| `(syllable-[a-z]+\.mp3)` \|/g)].map(
    (match) => match[1],
  )
  assert.equal(files.length, 140)
  assert.equal(new Set(files).size, 140)
  assert.equal(files[0], 'syllable-ga.mp3')
  assert.equal(files[139], 'syllable-hi.mp3')
})

test('ㅏ column is 가나다라마바사아자차카타파하', () => {
  const aColumn = INITIALS.map((initial) => compose(initial, 'ㅏ')).join('')
  assert.equal(aColumn, '가나다라마바사아자차카타파하')
  assert.equal(aColumn.length, 14)
})
