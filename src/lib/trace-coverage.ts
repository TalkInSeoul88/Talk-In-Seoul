/**
 * Finger-trace scoring for the Writing practice.
 *
 * The guide glyph is rendered offscreen at the same font, size, and position
 * as the letter on screen, then thresholded into a binary mask. That mask is
 * dilated by a tolerance radius so a finger can sit a little off the stroke.
 *
 * Coverage is the fraction of original glyph pixels that have ink inside that
 * tolerance (the ink is dilated, then intersected with the undilated glyph).
 * Dividing by the glyph — not the expanded halo — keeps a careful trace near
 * 100%. Ink outside the letter does not raise the score, so filling the whole
 * box cannot do better than covering the letter itself.
 */

/** Pass mark. Checked during and after each stroke. */
export const COVERAGE_THRESHOLD = 0.7

/**
 * How far ink may sit from the glyph and still count, as a fraction of the
 * measured stroke width. Applied as a Chebyshev (square) dilation radius,
 * with a floor of 2 device pixels.
 */
export const TOLERANCE_STROKE_FRACTION = 0.35

export function toleranceRadius(strokeWidth: number): number {
  const scaled = Math.round(strokeWidth * TOLERANCE_STROKE_FRACTION)
  return Math.max(2, scaled)
}

export function meetsCoverage(ratio: number): boolean {
  return ratio >= COVERAGE_THRESHOLD
}

/** Fraction of mask pixels that are also set in `ink`. Empty mask → 0. */
export function coverageRatio(mask: Uint8Array, ink: Uint8Array): number {
  const n = Math.min(mask.length, ink.length)
  let total = 0
  let hit = 0
  for (let i = 0; i < n; i++) {
    if (mask[i]) {
      total++
      if (ink[i]) hit++
    }
  }
  if (total === 0) return 0
  return hit / total
}

/**
 * Share of `glyph` pixels that have an ink pixel within `radius`.
 * Ink farther away is ignored.
 */
export function glyphCoverage(
  glyph: Uint8Array,
  ink: Uint8Array,
  width: number,
  height: number,
  radius: number,
): number {
  const nearInk = radius > 0 ? dilateMask(ink, width, height, radius) : ink
  return coverageRatio(glyph, nearInk)
}

/**
 * Chebyshev dilation. Fast enough to run while a finger is down, and a little
 * more forgiving on the diagonals than a strict circle.
 */
export function dilateMask(
  src: Uint8Array,
  width: number,
  height: number,
  radius: number,
): Uint8Array {
  if (radius <= 0 || width <= 0 || height <= 0) return src.slice()
  const tmp = new Uint8Array(src.length)
  const dst = new Uint8Array(src.length)
  const reach = radius + 1

  for (let y = 0; y < height; y++) {
    const row = y * width
    let run = 0
    for (let x = 0; x < width; x++) {
      if (src[row + x]) run = reach
      tmp[row + x] = run > 0 ? 1 : 0
      if (run > 0) run--
    }
    run = 0
    for (let x = width - 1; x >= 0; x--) {
      if (src[row + x]) run = reach
      if (run > 0) tmp[row + x] = 1
      if (run > 0) run--
    }
  }

  for (let x = 0; x < width; x++) {
    let run = 0
    for (let y = 0; y < height; y++) {
      const i = y * width + x
      if (tmp[i]) run = reach
      dst[i] = run > 0 ? 1 : 0
      if (run > 0) run--
    }
    run = 0
    for (let y = height - 1; y >= 0; y--) {
      const i = y * width + x
      if (tmp[i]) run = reach
      if (run > 0) dst[i] = 1
      if (run > 0) run--
    }
  }

  return dst
}

/**
 * Typical stem thickness: the median of horizontal and vertical run lengths.
 * Long strokes contribute many short runs equal to their thickness, so the
 * median lands on the stem rather than the stroke's length.
 */
export function estimateStrokeWidth(mask: Uint8Array, width: number, height: number): number {
  const runs: number[] = []

  for (let y = 0; y < height; y++) {
    let run = 0
    const row = y * width
    for (let x = 0; x < width; x++) {
      if (mask[row + x]) {
        run++
      } else if (run) {
        runs.push(run)
        run = 0
      }
    }
    if (run) runs.push(run)
  }

  for (let x = 0; x < width; x++) {
    let run = 0
    for (let y = 0; y < height; y++) {
      if (mask[y * width + x]) {
        run++
      } else if (run) {
        runs.push(run)
        run = 0
      }
    }
    if (run) runs.push(run)
  }

  if (runs.length === 0) return 1
  // Drop 1–2px runs. Those are the antialiased edge, not the stem.
  const solid = runs.filter((run) => run >= 3)
  const sample = solid.length > 0 ? solid : runs
  sample.sort((a, b) => a - b)
  return sample[Math.floor((sample.length - 1) / 2)] ?? 1
}
