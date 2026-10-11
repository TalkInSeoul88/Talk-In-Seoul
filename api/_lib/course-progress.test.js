import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { COURSE_PROGRESS, coveredThrough, stepsForCourse } from './course-progress.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')

const LEARN = [
  'First meet + hello. 저는 ___예요. (jeo-neun ___ ye-yo)',
  'Hello + vowels. 안녕하세요. (an-nyeong-ha-se-yo)',
  'First consonants. 감사합니다. (gam-sa-ham-ni-da)',
  'More consonants. 이거 주세요. (i-geo ju-se-yo)',
  'Tight sounds + halfway check. 얼마예요? (eol-ma-ye-yo)',
  'Glued vowels. 커피 주세요. (keo-pi ju-se-yo)',
  'Bottom sounds + store labels. 맛있어요! (ma-si-sseo-yo)',
  'Numbers + spicy? 김밥 하나 주세요. (gim-bap ha-na ju-se-yo)',
  'Your first conversation. 안녕히 계세요. (an-nyeong-hi gye-se-yo)',
]

test('Beginner progress is a course-keyed list with spoken lines', () => {
  const steps = COURSE_PROGRESS.beginner
  assert.deepEqual(
    steps.map((step) => step.title),
    ['Taste Korean Day', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
  )
  assert.deepEqual(
    steps.map((step) => step.learn),
    LEARN,
  )
  for (const step of steps) {
    const spoken = step.learn.match(/\(([^)]+)\)/)
    assert.ok(spoken, step.id)
    assert.equal(spoken[1], spoken[1].toLowerCase())
  }
  assert.deepEqual(
    coveredThrough(steps, 'week-4').map((step) => step.id),
    ['taste-day', 'week-1', 'week-2', 'week-3', 'week-4'],
  )
  assert.deepEqual(coveredThrough(steps, ''), [])
  assert.equal(stepsForCourse({ id: 'beginner', name: 'Beginner' }).length, 9)
  assert.deepEqual(stepsForCourse({ id: 'future-id', name: 'Intermediate 1' }), [])
})

test('My Progress is in the menu and is not behind full course access', () => {
  const nav = readFileSync(join(root, 'src/data/nav.ts'), 'utf8')
  const page = readFileSync(join(root, 'src/pages/Progress.tsx'), 'utf8')
  const app = readFileSync(join(root, 'src/App.tsx'), 'utf8')
  assert.match(nav, /to: '\/progress', label: 'My Progress'/)
  assert.match(app, /path="\/progress"/)
  assert.match(page, /Class progress/)
  assert.match(page, /My review/)
  assert.match(page, /Covered in class/)
  assert.match(page, /of \{total\} done/)
  assert.doesNotMatch(page, /useCourseGate/)
  assert.doesNotMatch(page, /CourseLocked/)
})
