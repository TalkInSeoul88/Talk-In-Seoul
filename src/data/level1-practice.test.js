import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { FREE_TALKS, REAL_TALK_CARDS } from './real-talk.ts'
import { BREATH_SETS, RIEUL_LADDER, breathClips, ladderClips } from './sound-workout.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const roman = /^[a-z]+(?:[ -][a-z]+)*$/

const LOCKED_HANGUL = [
  '과자예요',
  '과자 주세요',
  '여기요',
  '김밥 주세요',
  '네, 맛있어요',
  '이거 매워요',
  '네, 매워요',
  '아니요, 안 매워요',
  '김밥 하나 주세요',
  '김밥 두 개 주세요',
  '오 달러예요',
]

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) {
      if (name === 'node_modules' || name === 'dist') continue
      walk(path, out)
    } else {
      out.push(path)
    }
  }
  return out
}

test('ㄹ ladder follows the Level 1 tap steps', () => {
  assert.deepEqual(
    RIEUL_LADDER.map((rung) => rung.clips.map((clip) => clip.hangul).join(' / ')),
    ['다다다 / 라라라', '나라 / 다리', '물 / 발', '물이', '빨리 빨리'],
  )
  assert.deepEqual(
    ladderClips().map((clip) => clip.audioId),
    [
      'sound-dah-dah-dah',
      'sound-rah-rah-rah',
      'sound-nah-rah',
      'sound-dah-ree',
      'batchim-mul',
      'sound-bahl',
      'sound-moo-ree',
      'sound-ppahl-lee',
    ],
  )
  assert.match(RIEUL_LADDER[0].tip, /butter/)
  assert.match(RIEUL_LADDER[2].tip, /물 \(mool\)/)
  for (const clip of ladderClips()) assert.match(clip.roman, roman)
})

test('breath sets are the listen-and-pick pairs and reuse existing clips', () => {
  assert.deepEqual(
    BREATH_SETS.map((set) => set.choices.map((choice) => choice.hangul).join('/')),
    ['바/파/빠', '불/풀/뿔', '방/팡/빵', '비자/피자', '발/팔'],
  )
  const byHangul = new Map(breathClips().map((clip) => [clip.hangul, clip.audioId]))
  assert.equal(byHangul.get('바'), 'syllable-ba')
  assert.equal(byHangul.get('파'), 'syllable-pa')
  assert.equal(byHangul.get('방'), 'batchim-bang')
  assert.equal(byHangul.get('팔'), 'batchim-pal')
  assert.equal(byHangul.get('발'), 'sound-bahl')
  for (const clip of breathClips()) assert.match(clip.roman, roman)
  const page = readFileSync(join(root, 'src/pages/SoundWorkout.tsx'), 'utf8')
  assert.match(page, /lazy b/)
  assert.match(page, /candle/)
  assert.match(page, /spy/)
  assert.match(page, /Recording coming soon/)
})

test('free Real Talk weeks reuse phrase clips and stay in the client', () => {
  assert.deepEqual(
    REAL_TALK_CARDS.map((card) => `${card.week}:${card.free}`),
    ['3:true', '4:true', '5:false', '6:false', '7:false'],
  )
  assert.deepEqual(FREE_TALKS.map((week) => week.week), [3, 4])
  const ids = FREE_TALKS.flatMap((week) => week.lines.map((line) => line.audioId))
  for (const id of ['phrase-an-nyeong-ha-se-yo', 'phrase-i-geo-ju-se-yo', 'phrase-ne', 'phrase-gam-sa-ham-ni-da', 'phrase-i-geo-eol-ma-ye-yo']) {
    assert.equal(ids.includes(id), true)
  }
  for (const line of FREE_TALKS.flatMap((week) => week.lines)) {
    assert.match(line.roman, roman)
    assert.equal(/[\u4e00-\u9fff]/.test(line.roman), false)
  }
})

test('weeks 5–7 lines are not in the student app or the public audio readme', () => {
  const files = walk(join(root, 'src')).filter((path) => !path.endsWith('.test.js') && !path.endsWith('.test.ts'))
  const client = files.map((path) => readFileSync(path, 'utf8')).join('\n')
  const readme = readFileSync(join(root, 'public/audio/README.md'), 'utf8')
  for (const secret of LOCKED_HANGUL) {
    assert.equal(client.includes(secret), false, secret)
    assert.equal(readme.includes(secret), false, secret)
  }
  assert.equal(client.includes("from '../../api/_lib/real-talk"), false)
  assert.equal(client.includes("from '../api/_lib/real-talk"), false)
})

test('Sound Workout and Real Talk are in the menu, and Compare stays on the phone', () => {
  const app = readFileSync(join(root, 'src/App.tsx'), 'utf8')
  const nav = readFileSync(join(root, 'src/data/nav.ts'), 'utf8')
  const bar = readFileSync(join(root, 'src/components/JamoAudioBar.tsx'), 'utf8')
  const mime = readFileSync(join(root, 'src/lib/audio.ts'), 'utf8')
  assert.match(app, /path="\/sound"/)
  assert.match(app, /path="\/real-talk"/)
  assert.match(nav, /to: '\/sound', label: 'Sound Workout'/)
  assert.match(nav, /to: '\/real-talk', label: 'Real Talk'/)
  assert.match(bar, /Compare/)
  assert.match(bar, /createObjectURL/)
  assert.equal(bar.includes('fetch('), false)
  assert.match(mime, /\['audio\/mp4', 'audio\/webm;codecs=opus', 'audio\/webm', 'audio\/ogg;codecs=opus'\]/)
})
