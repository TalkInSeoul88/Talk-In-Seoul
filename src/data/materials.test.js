import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const materialsSrc = readFileSync(join(root, 'src/data/materials.ts'), 'utf8')
const thisWeekSrc = readFileSync(join(root, 'src/pages/ThisWeek.tsx'), 'utf8')
const traceSrc = readFileSync(join(root, 'src/pages/Trace.tsx'), 'utf8')

function assertPdf(relPath) {
  const pdfPath = join(root, relPath)
  assert.ok(existsSync(pdfPath), relPath)
  const bytes = readFileSync(pdfPath)
  assert.equal(bytes.subarray(0, 5).toString(), '%PDF-')
  assert.ok(bytes.length > 10_000, `${relPath} should be a real PDF, not a stub`)
}

test('writing PDFs are kept out of the public folder', () => {
  assertPdf('content/materials/hangul-consonant-practice.pdf')
  assertPdf('content/materials/hangul-vowel-practice.pdf')
  assertPdf('content/materials/hangul-word-practice.pdf')
  assert.equal(existsSync(join(root, 'public/materials/hangul-consonant-practice.pdf')), false)
  assert.equal(existsSync(join(root, 'public/materials/hangul-vowel-practice.pdf')), false)
  assert.equal(existsSync(join(root, 'public/materials/hangul-word-practice.pdf')), false)
})

test('consonant writing PDF has both pages (ㄱ–ㅅ and ㅇ–ㅎ)', () => {
  const bytes = readFileSync(join(root, 'content/materials/hangul-consonant-practice.pdf'))
  assert.match(bytes.toString('latin1'), /\/Count 2/)
})

test('This Week sheets are course-only and not linked as public files', () => {
  assert.match(materialsSrc, /export const PUBLIC_MATERIALS/)
  assert.match(materialsSrc, /Week 1 — Consonant writing practice \(자음\)/)
  assert.match(materialsSrc, /Week 1 — Vowel writing practice \(모음\)/)
  assert.match(materialsSrc, /Word writing practice \(단어\) — animals/)
  assert.match(materialsSrc, /개 호랑이 토끼 다람쥐 새 개구리 나비 곰/)
  assert.match(materialsSrc, /\/api\/class\/material/)
  assert.doesNotMatch(materialsSrc, /\/materials\/hangul-/)
  assert.doesNotMatch(materialsSrc, /hangul-word-practice-week1/)

  const publicBlock = materialsSrc.slice(
    materialsSrc.indexOf('export const PUBLIC_MATERIALS'),
    materialsSrc.indexOf('export const CLASS_MATERIALS'),
  )
  const classBlock = materialsSrc.slice(materialsSrc.indexOf('export const CLASS_MATERIALS'))
  assert.match(publicBlock, /id: 'week-1-word-writing'/)
  assert.doesNotMatch(classBlock, /week-1-word-writing/)
  assert.match(classBlock, /export const CLASS_MATERIALS: WeekMaterial\[\] = \[\]/)
  assert.equal([...materialsSrc.matchAll(/id: '/g)].length, 3)

  assert.match(thisWeekSrc, /useCourseGate/)
  assert.match(thisWeekSrc, /CourseLocked/)
  assert.match(thisWeekSrc, /weekSheetHref/)
  assert.doesNotMatch(thisWeekSrc, /No access code needed/)
  assert.match(traceSrc, /useCourseGate/)
  assert.match(traceSrc, /CourseLocked/)
  assert.match(traceSrc, /course\.state !== 'open'/)
})
