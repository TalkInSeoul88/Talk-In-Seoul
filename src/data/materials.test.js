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
})

test('class word PDF is present for enrolled students', () => {
  assertPdf('public/materials/hangul-word-practice-week1.pdf')
})

test('This Week lists two free sheets and one code-gated word sheet', () => {
  assert.match(materialsSrc, /export const PUBLIC_MATERIALS/)
  assert.match(materialsSrc, /Week 1 — Consonant writing practice \(자음\)/)
  assert.match(materialsSrc, /Week 1 — Vowel writing practice \(모음\)/)
  assert.match(materialsSrc, /\/materials\/hangul-consonant-practice\.pdf/)
  assert.match(materialsSrc, /\/materials\/hangul-vowel-practice\.pdf/)
  assert.match(materialsSrc, /export const CLASS_MATERIALS/)
  assert.match(materialsSrc, /Word writing practice \(단어\)/)
  assert.match(materialsSrc, /\/materials\/hangul-word-practice-week1\.pdf/)
  assert.equal([...materialsSrc.matchAll(/id: '/g)].length, 3)

  assert.match(thisWeekSrc, /PUBLIC_MATERIALS/)
  assert.match(thisWeekSrc, /CLASS_MATERIALS/)
  assert.match(thisWeekSrc, /useEnrollment/)
  assert.match(thisWeekSrc, /UnlockControl/)
  assert.match(thisWeekSrc, /Code required/)
})
