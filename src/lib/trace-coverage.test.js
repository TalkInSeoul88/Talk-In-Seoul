import assert from 'node:assert/strict'
import test from 'node:test'
import {
  COVERAGE_THRESHOLD,
  TOLERANCE_STROKE_FRACTION,
  coverageRatio,
  dilateMask,
  estimateStrokeWidth,
  glyphCoverage,
  meetsCoverage,
  toleranceRadius,
} from './trace-coverage.ts'

function fillRect(buf, width, x0, y0, x1, y1) {
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) buf[y * width + x] = 1
  }
}

test('threshold is 70%', () => {
  assert.equal(COVERAGE_THRESHOLD, 0.7)
  assert.equal(meetsCoverage(0.7), true)
  assert.equal(meetsCoverage(0.699), false)
  assert.equal(meetsCoverage(1), true)
  assert.equal(meetsCoverage(0), false)
})

test('tolerance radius is 35% of stroke width, at least 2px', () => {
  assert.equal(TOLERANCE_STROKE_FRACTION, 0.35)
  assert.equal(toleranceRadius(40), 14)
  assert.equal(toleranceRadius(4), 2)
  assert.equal(toleranceRadius(1), 2)
})

test('coverage is the fraction of mask pixels the ink hits', () => {
  const mask = Uint8Array.of(1, 1, 1, 1, 0, 0)
  const ink = Uint8Array.of(1, 1, 0, 0, 1, 1)
  assert.equal(coverageRatio(mask, ink), 0.5)
})

test('ink outside the mask does not raise coverage', () => {
  const mask = Uint8Array.of(1, 1, 0, 0, 0)
  const onLetter = Uint8Array.of(1, 1, 0, 0, 0)
  const wholeBox = Uint8Array.of(1, 1, 1, 1, 1)
  assert.equal(coverageRatio(mask, onLetter), 1)
  assert.equal(coverageRatio(mask, wholeBox), 1)
  assert.equal(coverageRatio(mask, Uint8Array.of(0, 0, 1, 1, 1)), 0)
})

test('empty mask scores 0', () => {
  assert.equal(coverageRatio(new Uint8Array(8), new Uint8Array(8).fill(1)), 0)
})

test('dilation spreads by the radius and no farther', () => {
  const width = 7
  const height = 7
  const src = new Uint8Array(width * height)
  src[3 * width + 3] = 1
  const out = dilateMask(src, width, height, 1)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const on = Math.max(Math.abs(x - 3), Math.abs(y - 3)) <= 1
      assert.equal(out[y * width + x], on ? 1 : 0, `${x},${y}`)
    }
  }
  assert.equal(dilateMask(src, width, height, 0).join(','), src.join(','))
})

test('ink within the tolerance covers the glyph; far ink does not', () => {
  const width = 12
  const height = 5
  const glyph = new Uint8Array(width * height)
  fillRect(glyph, width, 4, 2, 8, 3)
  const beside = new Uint8Array(width * height)
  fillRect(beside, width, 4, 0, 8, 1)
  assert.equal(glyphCoverage(glyph, beside, width, height, 0), 0)
  assert.equal(glyphCoverage(glyph, beside, width, height, 2), 1)

  const corner = new Uint8Array(width * height)
  corner[0] = 1
  assert.equal(glyphCoverage(glyph, corner, width, height, 2), 0)
})

test('a brush the width of the stroke clears 70% even a little off the center', () => {
  const width = 48
  const height = 24
  const thickness = 10
  const glyph = new Uint8Array(width * height)
  fillRect(glyph, width, 4, 7, 44, 7 + thickness)
  const stroke = estimateStrokeWidth(glyph, width, height)
  assert.equal(stroke, thickness)
  const radius = toleranceRadius(stroke)

  const centered = new Uint8Array(width * height)
  fillRect(centered, width, 4, 7, 44, 7 + thickness)
  assert.ok(glyphCoverage(glyph, centered, width, height, radius) >= 0.7)

  const shifted = new Uint8Array(width * height)
  const offset = 4
  fillRect(shifted, width, 4, 7 + offset, 44, 7 + offset + thickness)
  const ratio = glyphCoverage(glyph, shifted, width, height, radius)
  assert.ok(ratio >= 0.7, `shifted trace scored ${ratio}`)
})

test('stroke width is the median stem, not the stroke length', () => {
  const width = 40
  const height = 16
  const mask = new Uint8Array(width * height)
  fillRect(mask, width, 2, 4, 38, 9)
  assert.equal(estimateStrokeWidth(mask, width, height), 5)
})

test('a 1px fringe does not pull the stroke width down', () => {
  const width = 40
  const height = 24
  const mask = new Uint8Array(width * height)
  fillRect(mask, width, 16, 4, 24, 20)
  for (let y = 4; y < 20; y++) mask[y * width + 10] = 1
  assert.equal(estimateStrokeWidth(mask, width, height), 8)
})
