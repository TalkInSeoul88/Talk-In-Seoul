import assert from 'node:assert/strict'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  BATCHIM_WORDS,
  CONVERSATION_PHRASES,
  EVERYDAY_PHRASES,
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
    ['gahn-jahng', 'nah-bahng', 'dah-rahm-jwee', 'mah-neul', 'bahng', 'sah-seum', 'ah-deul', 'jah-dohng-chah', 'chehk', 'kohng', 'tahp', 'pahl', 'hah-neul', 'bahp', 'mool', 'jeep', 'geem-bahp', 'rah-myuhn', 'sah-rahng', 'gohng'],
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
    ['하나 hah-nah', '둘 dool', '셋 seht', '넷 neht', '다섯 dah-suht', '여섯 yuh-suht', '일곱 eel-gohp', '여덟 yuh-duhl', '아홉 ah-hohp', '열 yuhl'],
  )
  assert.deepEqual(
    SINO_NUMBERS.map((item) => `${item.hangul} ${item.roman}`),
    ['일 eel', '이 ee', '삼 sahm', '사 sah', '오 oh', '육 yook', '칠 cheel', '팔 pahl', '구 goo', '십 sheep'],
  )
  assert.deepEqual(
    NUMBER_PATTERN.map((item) => `${item.hangul} ${item.english} ${item.roman}`),
    [
      '십일 11 shee-beel',
      '이십이 22 ee-shee-bee',
      '삼십삼 33 sahm-sheep-sahm',
      '사십사 44 sah-sheep-sah',
      '오십오 55 oh-sheep-oh',
      '육십육 66 yook-sheep-yook',
      '칠십칠 77 cheel-sheep-cheel',
      '팔십팔 88 pahl-sheep-pahl',
      '구십구 99 goo-sheep-goo',
    ],
  )
  assert.deepEqual(
    CONVERSATION_PHRASES.map((item) => `${item.hangul}|${item.roman}|${item.english}`),
    [
      '안녕하세요|ahn-nyuhng-hah-seh-yoh|Hello',
      '이거 얼마예요?|ee-guh uhl-mah-yeh-yoh|How much is this?',
      '이거 주세요|ee-guh joo-seh-yoh|This one, please',
      '감사합니다|gahm-sah-hahm-nee-dah|Thank you',
      '네|neh|Yes',
      '아니요|ah-nee-yoh|No',
      "맛있어요|mah-shee-ssuh-yoh|It's delicious",
      '화장실 어디예요?|hwah-jahng-sheel uh-dee-yeh-yoh|Where is the restroom?',
      '다시 말해 주세요|dah-shee mahl-heh joo-seh-yoh|Please say it again',
      '안녕히 계세요|ahn-nyuhng-hee gyeh-seh-yoh|Goodbye',
      '다음에 뵈요|dah-eu-meh bweh-yoh|See you next time',
      '몇 시예요?|myuht-shee-yeh-yoh|What time is it?',
      "아니에요|ah-nee-eh-yoh|It's nothing / you're welcome",
      '여기요|yuh-gee-yoh|Excuse me / over here',
      '진짜요?|jin-jjah-yoh|Really?',
    ],
  )
  assert.equal(CONVERSATION_PHRASES.length, 15)
  assert.deepEqual(EVERYDAY_PHRASES, [])
  assert.equal(
    CONVERSATION_PHRASES.some((item) => item.hangul === '아니요' && item.audioId === 'phrase-a-ni-yo'),
    true,
  )
  assert.equal(
    CONVERSATION_PHRASES.some((item) => item.hangul === '아니에요' && item.audioId === 'phrase-ah-nee-eh-yoh'),
    true,
  )
  const numbers = readFileSync(join(root, 'src/pages/Numbers.tsx'), 'utf8')
  assert.match(numbers, /하나 \(hah-nah\), 둘 \(dool\), 셋 \(seht\)/)
  assert.match(numbers, /일 \(eel\), 이 \(ee\), 삼 \(sahm\)/)
  assert.match(numbers, /십 \(sheep\)/)
})

test('every new clip has a unique public audio filename and lowercase pronunciation', () => {
  const files = PRACTICE_RECORDINGS.map(recordingFile)
  assert.equal(new Set(files).size, files.length)
  assert.equal(files.length, 64)
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
  const conversation = readFileSync(join(root, 'src/pages/Conversation.tsx'), 'utf8')
  assert.match(conversation, /Fifteen phrases you can use right away/)
  assert.match(conversation, /id="essential"/)
  assert.match(conversation, /id="everyday"/)
  assert.match(conversation, /일상 대화/)
  assert.match(conversation, /Phrases coming/)
  assert.match(conversation, /EVERYDAY_PHRASES/)
  const audioDir = join(root, 'public/audio')
  for (const item of CONVERSATION_PHRASES.slice(-5)) {
    const file = join(audioDir, `${item.audioId}.mp3`)
    assert.equal(existsSync(file), true, item.audioId)
    assert.ok(statSync(file).size > 4000, item.audioId)
    assert.equal(readFileSync(file).subarray(0, 3).toString('latin1'), 'ID3', item.audioId)
  }
})
