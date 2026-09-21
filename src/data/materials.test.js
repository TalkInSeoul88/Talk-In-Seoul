import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const materialsSrc = readFileSync(join(root, 'src/data/materials.ts'), 'utf8')
const thisWeekSrc = readFileSync(join(root, 'src/pages/ThisWeek.tsx'), 'utf8')

function assertPdf(relPath) {
  const pdfPath = join(root, relPath)
  assert.ok(existsSync(pdfPath), relPath)
  const bytes = readFileSync(pdfPath)
  assert.equal(bytes.subarray(0, 5).toString(), '%PDF-')
  assert.ok(bytes.length > 10_000, `${relPath} should be a real PDF, not a stub`)
}

test('public writing PDFs are in public/materials', () => {
  assertPdf('public/materials/hangul-consonant-practice.pdf')
  assertPdf('public/materials/hangul-vowel-practice.pdf')
  assertPdf('public/materials/hangul-word-practice.pdf')
  assert.equal(existsSync(join(root, 'public/materials/hangul-word-practice-week1.pdf')), false)
})

test('consonant writing PDF has both pages (ㄱ–ㅅ and ㅇ–ㅎ)', () => {
  const bytes = readFileSync(join(root, 'public/materials/hangul-consonant-practice.pdf'))
  assert.match(bytes.toString('latin1'), /\/Count 2/)
})

test('This Week lists three free sheets and no code-gated word sheet', () => {
  assert.match(materialsSrc, /export const PUBLIC_MATERIALS/)
  assert.match(materialsSrc, /Week 1 — Consonant writing practice \(자음\)/)
  assert.match(materialsSrc, /Week 1 — Vowel writing practice \(모음\)/)
  assert.match(materialsSrc, /Word writing practice \(단어\) — animals/)
  assert.match(materialsSrc, /개 호랑이 토끼 다람쥐 새 개구리 나비 곰/)
  assert.match(materialsSrc, /\/materials\/hangul-consonant-practice\.pdf/)
  assert.match(materialsSrc, /\/materials\/hangul-vowel-practice\.pdf/)
  assert.match(materialsSrc, /\/materials\/hangul-word-practice\.pdf/)
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

  assert.match(thisWeekSrc, /PUBLIC_MATERIALS/)
  assert.match(thisWeekSrc, /CLASS_MATERIALS\.length > 0/)
  assert.doesNotMatch(thisWeekSrc, /Word writing practice unlocks with a class access code/)
})
