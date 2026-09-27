/**
 * Stem width for the tracing brush.
 *
 * The guide glyph is rendered offscreen and thresholded. The typical stem
 * is the median of horizontal and vertical run lengths (long strokes
 * contribute many short runs equal to their thickness). The finger ink is
 * half that stem so the gray guide stays visible beside the stroke.
 */

/** Finger ink width as a fraction of the measured glyph stem. */
export const BRUSH_OF_STEM = 0.5

/** Half the stem, and at least one device pixel so a stroke still appears. */
export function brushWidthForStroke(stemWidth: number): number {
  return Math.max(1, stemWidth * BRUSH_OF_STEM)
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
