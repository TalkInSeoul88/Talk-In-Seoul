import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  BATCHIM_WORDS,
  CONVERSATION_PHRASES,
  NATIVE_NUMBERS,
  NUMBER_PATTERN,
  PRACTICE_RECORDINGS,
  SINO_NUMBERS,
  batchimLetters,
  recordingFile,
} from './practice-sections.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')

test('batchim words are the 20 easy words, without 우유', () => {
  assert.deepEqual(
    BATCHIM_WORDS.map((item) => item.hangul),
    ['간장', '나방', '다람쥐', '마늘', '방', '사슴', '아들', '자동차', '책', '콩', '탑', '팔', '하늘', '밥', '물', '집', '김밥', '라면', '사랑', '공'],
  )
  assert.deepEqual(
    BATCHIM_WORDS.map((item) => item.roman),
    ['gan-jang', 'na-bang', 'da-ram-jwi', 'ma-neul', 'bang', 'sa-seum', 'a-deul', 'ja-dong-cha', 'chaek', 'kong', 'tap', 'pal', 'ha-neul', 'bap', 'mul', 'jip', 'gim-bap', 'ra-myeon', 'sa-rang', 'gong'],
  )
  assert.equal(BATCHIM_WORDS.some((item) => item.hangul.includes('우유')), false)
  assert.deepEqual(batchimLetters('간장'), ['ㄴ', 'ㅇ'])
  assert.deepEqual(batchimLetters('다람쥐'), ['ㅁ'])
  assert.deepEqual(batchimLetters('김밥'), ['ㅁ', 'ㅂ'])
  assert.deepEqual(batchimLetters('공'), ['ㅇ'])
  assert.deepEqual(batchimLetters('하늘'), ['ㄹ'])
  assert.deepEqual(batchimLetters('책'), ['ㄱ'])
})

test('numbers and phrases match the teaching list', () => {
  assert.deepEqual(
    NATIVE_NUMBERS.map((item) => `${item.hangul} ${item.roman}`),
    ['하나 ha-na', '둘 dul', '셋 set', '넷 net', '다섯 da-seot', '여섯 yeo-seot', '일곱 il-gop', '여덟 yeo-deol', '아홉 a-hop', '열 yeol'],
  )
  assert.deepEqual(
    SINO_NUMBERS.map((item) => `${item.hangul} ${item.roman}`),
    ['일 il', '이 i', '삼 sam', '사 sa', '오 o', '육 yuk', '칠 chil', '팔 pal', '구 gu', '십 sip'],
  )
  assert.deepEqual(
    NUMBER_PATTERN.map((item) => `${item.hangul} ${item.english} ${item.roman}`),
    [
      '십일 11 si-bil',
      '이십이 22 i-si-bi',
      '삼십삼 33 sam-sip-sam',
      '사십사 44 sa-sip-sa',
      '오십오 55 o-sip-o',
      '육십육 66 yuk-sip-yuk',
      '칠십칠 77 chil-sip-chil',
      '팔십팔 88 pal-sip-pal',
      '구십구 99 gu-sip-gu',
    ],
  )
  assert.deepEqual(
    CONVERSATION_PHRASES.map((item) => `${item.hangul}|${item.roman}|${item.english}`),
    [
      '안녕하세요|an-nyeong-ha-se-yo|Hello',
      '이거 얼마예요?|i-geo eol-ma-ye-yo|How much is this?',
      '이거 주세요|i-geo ju-se-yo|This one, please',
      '감사합니다|gam-sa-ham-ni-da|Thank you',
      '네|ne|Yes',
      '아니요|a-ni-yo|No',
      "맛있어요|ma-si-sseo-yo|It's delicious",
      '화장실 어디예요?|hwa-jang-sil eo-di-ye-yo|Where is the restroom?',
      '다시 말해 주세요|da-si mal-hae ju-se-yo|Please say it again',
      '안녕히 계세요|an-nyeong-hi gye-se-yo|Goodbye',
    ],
  )
})

test('every new clip has a unique public audio filename and lowercase pronunciation', () => {
  const files = PRACTICE_RECORDINGS.map(recordingFile)
  assert.equal(new Set(files).size, files.length)
  assert.equal(files.length, 59)
  for (const item of PRACTICE_RECORDINGS) {
    assert.match(item.roman, /^[a-z]+(?:[ -][a-z]+)*$/)
    assert.match(item.audioId, /^[a-z0-9-]+$/)
    assert.equal(recordingFile(item), `${item.audioId}.mp3`)
    assert.equal(/[\u4e00-\u9fff]/.test(`${item.hangul}${item.english}${item.roman}`), false)
  }
  const readme = readFileSync(join(root, 'public/audio/README.md'), 'utf8')
  for (const file of files) assert.match(readme, new RegExp(file.replace(/[.]/g, '\\.')))
})

test('the three sections are in the menu and stay unlocked', () => {
  const nav = readFileSync(join(root, 'src/data/nav.ts'), 'utf8')
  const app = readFileSync(join(root, 'src/App.tsx'), 'utf8')
  const bar = readFileSync(join(root, 'src/components/JamoAudioBar.tsx'), 'utf8')
  const clip = readFileSync(join(root, 'src/components/ClipRow.tsx'), 'utf8')
  assert.match(nav, /Bottom Sounds/)
  assert.match(nav, /label: 'Numbers'/)
  assert.match(nav, /label: 'Conversation'/)
  assert.match(app, /path="\/batchim"/)
  assert.match(app, /path="\/numbers"/)
  assert.match(app, /path="\/conversation"/)
  assert.match(bar, /soonText = 'Audio coming soon'/)
  assert.match(clip, /Recording coming soon/)
  for (const page of ['Batchim.tsx', 'Numbers.tsx', 'Conversation.tsx']) {
    const source = readFileSync(join(root, 'src/pages', page), 'utf8')
    assert.doesNotMatch(source, /useCourseGate|CourseLocked|ClassLocked/)
  }
})
