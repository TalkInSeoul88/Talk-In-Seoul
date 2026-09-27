import assert from 'node:assert/strict'
import test from 'node:test'
import { BRUSH_OF_STEM, brushWidthForStroke, estimateStrokeWidth } from './trace-coverage.ts'

function fillRect(buf, width, x0, y0, x1, y1) {
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) buf[y * width + x] = 1
  }
}

test('finger brush is half the glyph stem', () => {
  assert.equal(BRUSH_OF_STEM, 0.5)
  assert.equal(brushWidthForStroke(20), 10)
  assert.equal(brushWidthForStroke(7), 3.5)
  assert.equal(brushWidthForStroke(1), 1)
  assert.equal(brushWidthForStroke(0), 1)
})

test('stroke width is the median stem, not the stroke length', () => {
  const width = 40
  const height = 16
  const mask = new Uint8Array(width * height)
  fillRect(mask, width, 2, 4, 38, 9)
  assert.equal(estimateStrokeWidth(mask, width, height), 5)
  assert.equal(brushWidthForStroke(estimateStrokeWidth(mask, width, height)), 2.5)
})

test('a 1px fringe does not pull the stroke width down', () => {
  const width = 40
  const height = 24
  const mask = new Uint8Array(width * height)
  fillRect(mask, width, 16, 4, 24, 20)
  for (let y = 4; y < 20; y++) mask[y * width + 10] = 1
  assert.equal(estimateStrokeWidth(mask, width, height), 8)
})
