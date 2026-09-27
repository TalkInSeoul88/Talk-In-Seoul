import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { brushWidthForStroke, estimateStrokeWidth } from '../lib/trace-coverage'

const FONT_FAMILY = '"Noto Sans KR", "Apple SD Gothic Neo", sans-serif'
const PINK = '#f7d2d8'
const GUIDE = '#d5d5d5'
const GLYPH = '#1a1a1a'
const SUCCESS = '#1f9d4c'
const INK = 'rgba(48, 48, 48, 0.92)'
const DASH = '#c6c6c6'

type Props = {
  char: string
  success: boolean
  failToken: number
  clearToken: number
  onInk: (hasInk: boolean) => void
  onInteract: () => void
}

function fontPxFor(ctx: CanvasRenderingContext2D, char: string, width: number, height: number): number {
  const size = Math.min(width, height) * 0.92
  ctx.font = `900 ${size}px ${FONT_FAMILY}`
  const measured = ctx.measureText(char)
  const textW = measured.width || size
  const ascent = measured.actualBoundingBoxAscent || size * 0.72
  const descent = measured.actualBoundingBoxDescent || size * 0.08
  const textH = Math.max(ascent + descent, 1)
  const scale = Math.min((width * 0.88) / textW, (height * 0.88) / textH, 1)
  return size * scale
}

function drawGlyph(
  ctx: CanvasRenderingContext2D,
  char: string,
  color: string,
  width: number,
  height: number,
  fontPx: number,
) {
  ctx.font = `900 ${fontPx}px ${FONT_FAMILY}`
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  const measured = ctx.measureText(char)
  const ascent = measured.actualBoundingBoxAscent || fontPx * 0.72
  const descent = measured.actualBoundingBoxDescent || fontPx * 0.08
  const y = (height + ascent - descent) / 2
  ctx.fillText(char, width / 2, y)
}

function paintExample(canvas: HTMLCanvasElement, glyph: string, color: string) {
  const ctx = canvas.getContext('2d')
  if (!ctx || canvas.width < 2 || canvas.height < 2) return
  const width = canvas.width
  const height = canvas.height
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = PINK
  ctx.fillRect(0, 0, width, height)
  drawGlyph(ctx, glyph, color, width, height, fontPxFor(ctx, glyph, width, height))
}

function paintGuide(canvas: HTMLCanvasElement, glyph: string, color: string) {
  const ctx = canvas.getContext('2d')
  if (!ctx || canvas.width < 2 || canvas.height < 2) return
  const width = canvas.width
  const height = canvas.height
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  const fontPx = fontPxFor(ctx, glyph, width, height)
  drawGlyph(ctx, glyph, color, width, height, fontPx)
  drawDashes(ctx, width, height, fontPx)
}

function drawDashes(ctx: CanvasRenderingContext2D, width: number, height: number, fontPx: number) {
  ctx.save()
  ctx.strokeStyle = DASH
  ctx.lineWidth = Math.max(1, Math.round(fontPx * 0.012))
  const dash = Math.max(6, Math.round(fontPx * 0.055))
  const gap = Math.max(4, Math.round(fontPx * 0.042))
  ctx.setLineDash([dash, gap])
  ctx.beginPath()
  ctx.moveTo(width / 2, 0)
  ctx.lineTo(width / 2, height)
  ctx.moveTo(0, height / 2)
  ctx.lineTo(width, height / 2)
  ctx.stroke()
  ctx.restore()
}

export default function TracePad({
  char,
  success,
  failToken,
  clearToken,
  onInk,
  onInteract,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const exampleRef = useRef<HTMLCanvasElement>(null)
  const guideRef = useRef<HTMLCanvasElement>(null)
  const inkRef = useRef<HTMLCanvasElement>(null)
  const brushRef = useRef(8)
  const inkedRef = useRef(false)
  const drawingRef = useRef(false)
  const pointerRef = useRef<number | null>(null)
  const lastRef = useRef<{ x: number; y: number } | null>(null)
  const failingRef = useRef(false)
  const successRef = useRef(success)
  const onInkRef = useRef(onInk)
  const onInteractRef = useRef(onInteract)
  const seenFailRef = useRef(failToken)
  const seenClearRef = useRef(clearToken)
  const [ready, setReady] = useState(false)
  const [failing, setFailing] = useState(false)

  useEffect(() => {
    successRef.current = success
    onInkRef.current = onInk
    onInteractRef.current = onInteract
  })

  function measureBrush(canvas: HTMLCanvasElement) {
    const width = canvas.width
    const height = canvas.height
    const off = document.createElement('canvas')
    off.width = width
    off.height = height
    const ctx = off.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    ctx.clearRect(0, 0, width, height)
    const fontPx = fontPxFor(ctx, char, width, height)
    drawGlyph(ctx, char, '#000000', width, height, fontPx)
    const pixels = ctx.getImageData(0, 0, width, height).data
    const glyph = new Uint8Array(width * height)
    for (let i = 0; i < glyph.length; i++) glyph[i] = pixels[i * 4 + 3] > 48 ? 1 : 0
    const stem = estimateStrokeWidth(glyph, width, height)
    brushRef.current = brushWidthForStroke(stem)
  }

  function markInk() {
    if (inkedRef.current) return
    inkedRef.current = true
    onInkRef.current(true)
  }

  function clearInk(notify: boolean) {
    const ink = inkRef.current
    if (!ink) return
    const ctx = ink.getContext('2d')
    ctx?.clearRect(0, 0, ink.width, ink.height)
    inkedRef.current = false
    if (notify) onInkRef.current(false)
  }

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    let cancelled = false

    async function layout() {
      try {
        await Promise.race([
          document.fonts.load(`900 80px ${FONT_FAMILY}`).then(() => document.fonts.ready),
          new Promise((resolve) => window.setTimeout(resolve, 1800)),
        ])
      } catch {
        /* Draw with the nearest loaded face. */
      }
      if (cancelled) return
      const example = exampleRef.current
      const guide = guideRef.current
      const ink = inkRef.current
      const exampleBox = example?.parentElement
      const practice = guide?.parentElement
      if (!example || !guide || !ink || !exampleBox || !practice) return
      const exampleRect = exampleBox.getBoundingClientRect()
      const practiceRect = practice.getBoundingClientRect()
      if (practiceRect.width < 2 || practiceRect.height < 2) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const exampleW = Math.max(1, Math.round(exampleRect.width * dpr))
      const exampleH = Math.max(1, Math.round(exampleRect.height * dpr))
      const practiceW = Math.max(1, Math.round(practiceRect.width * dpr))
      const practiceH = Math.max(1, Math.round(practiceRect.height * dpr))
      const exampleChanged = example.width !== exampleW || example.height !== exampleH
      const practiceChanged = guide.width !== practiceW || guide.height !== practiceH
      if (exampleChanged) {
        example.width = exampleW
        example.height = exampleH
      }
      if (practiceChanged) {
        guide.width = practiceW
        guide.height = practiceH
        ink.width = practiceW
        ink.height = practiceH
      }
      const color = successRef.current ? SUCCESS : GLYPH
      const guideColor = successRef.current ? SUCCESS : GUIDE
      paintExample(example, char, color)
      paintGuide(guide, char, guideColor)
      measureBrush(guide)
      if (practiceChanged && !successRef.current) clearInk(true)
      setReady(true)
    }

    const observer = new ResizeObserver(() => {
      void layout()
    })
    observer.observe(root)
    void layout()
    return () => {
      cancelled = true
      observer.disconnect()
    }
    // paint helpers close over `char` and are recreated with this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [char])

  useEffect(() => {
    const example = exampleRef.current
    const guide = guideRef.current
    if (!example || !guide || guide.width < 2) return
    paintExample(example, char, success ? SUCCESS : GLYPH)
    paintGuide(guide, char, success ? SUCCESS : GUIDE)
  }, [success, char])

  useEffect(() => {
    if (clearToken === seenClearRef.current) return
    const previous = seenClearRef.current
    seenClearRef.current = clearToken
    clearInk(true)
    return () => {
      seenClearRef.current = previous
    }
  }, [clearToken])

  useEffect(() => {
    if (failToken === seenFailRef.current) return
    const previous = seenFailRef.current
    seenFailRef.current = failToken
    failingRef.current = true
    setFailing(true)
    clearInk(true)
    const timer = window.setTimeout(() => {
      failingRef.current = false
      setFailing(false)
    }, 1050)
    return () => {
      window.clearTimeout(timer)
      seenFailRef.current = previous
      failingRef.current = false
    }
  }, [failToken])

  function pointOf(event: PointerEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / Math.max(rect.width, 1)) * canvas.width,
      y: ((event.clientY - rect.top) / Math.max(rect.height, 1)) * canvas.height,
    }
  }

  function strokeContext(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = INK
    ctx.fillStyle = INK
    ctx.lineWidth = brushRef.current
    return ctx
  }

  function drawTo(ctx: CanvasRenderingContext2D, from: { x: number; y: number } | null, to: { x: number; y: number }) {
    if (!from) {
      ctx.beginPath()
      ctx.arc(to.x, to.y, brushRef.current / 2, 0, Math.PI * 2)
      ctx.fill()
      return
    }
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.stroke()
  }

  function onPointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!ready || successRef.current || failingRef.current) return
    if (pointerRef.current !== null) return
    event.preventDefault()
    onInteractRef.current()
    const canvas = inkRef.current
    if (!canvas) return
    try {
      canvas.setPointerCapture(event.pointerId)
    } catch {
      /* Capture can fail for a pointer the browser is not tracking yet. */
    }
    pointerRef.current = event.pointerId
    drawingRef.current = true
    const ctx = strokeContext(canvas)
    if (!ctx) return
    const native = event.nativeEvent
    const samples = native.getCoalescedEvents?.() ?? [native]
    let previous: { x: number; y: number } | null = null
    for (const sample of samples) {
      const next = pointOf(sample, canvas)
      drawTo(ctx, previous, next)
      previous = next
    }
    lastRef.current = previous
    if (previous) markInk()
  }

  function onPointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current || pointerRef.current !== event.pointerId) return
    if (successRef.current || failingRef.current) return
    const canvas = inkRef.current
    if (!canvas) return
    const ctx = strokeContext(canvas)
    if (!ctx) return
    const samples = event.nativeEvent.getCoalescedEvents?.() ?? [event.nativeEvent]
    let previous = lastRef.current
    for (const sample of samples) {
      const next = pointOf(sample, canvas)
      drawTo(ctx, previous, next)
      previous = next
    }
    lastRef.current = previous
    if (previous) markInk()
  }

  function endStroke(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (pointerRef.current !== event.pointerId) return
    pointerRef.current = null
    drawingRef.current = false
    lastRef.current = null
  }

  return (
    <div
      ref={rootRef}
      className="trace-cell"
      data-testid="trace-pad"
      data-state={success ? 'success' : failing ? 'fail' : 'draw'}
      data-char={char}
    >
      <div className="trace-example-wrap">
        <canvas ref={exampleRef} className="trace-example" aria-hidden="true" />
      </div>
      <div className="trace-practice">
        <canvas ref={guideRef} className="trace-guide" aria-hidden="true" />
        <canvas
          ref={inkRef}
          className="trace-ink"
          aria-label={`Trace ${char}`}
          style={{ touchAction: 'none' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endStroke}
          onPointerCancel={endStroke}
          onContextMenu={(event) => event.preventDefault()}
        />
        {failing && (
          <div className="trace-fail" role="alert" data-testid="trace-fail">
            <svg className="trace-x" viewBox="0 0 64 64" aria-hidden="true">
              <path d="M16 16 L48 48 M48 16 L16 48" />
            </svg>
            <span className="trace-fail-text">Try again</span>
          </div>
        )}
      </div>
    </div>
  )
}
