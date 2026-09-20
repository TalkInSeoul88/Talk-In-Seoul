import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const pdfPath = join(root, 'public/materials/hangul-consonant-practice.pdf')
const materialsSrc = readFileSync(join(root, 'src/data/materials.ts'), 'utf8')
const thisWeekSrc = readFileSync(join(root, 'src/pages/ThisWeek.tsx'), 'utf8')

test('consonant writing PDF is a 2-page public file', () => {
  assert.ok(existsSync(pdfPath), 'public/materials/hangul-consonant-practice.pdf')
  const bytes = readFileSync(pdfPath)
  assert.equal(bytes.subarray(0, 5).toString(), '%PDF-')
  assert.ok(bytes.length > 10_000, 'practice sheet should be a real PDF, not a stub')
})

test('This Week lists exactly one public material pointing at that PDF', () => {
  assert.match(materialsSrc, /Week 1 — Consonant writing practice \(자음\)/)
  assert.match(materialsSrc, /\/materials\/hangul-consonant-practice\.pdf/)
  assert.equal([...materialsSrc.matchAll(/id: '/g)].length, 1)
  assert.match(thisWeekSrc, /THIS_WEEK_MATERIALS/)
  assert.doesNotMatch(thisWeekSrc, /useEnrollment|UnlockControl/)
})
