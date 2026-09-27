import { probeTeacherAudio } from './audio.ts'

/**
 * Drop a recording at this path to replace the generated chime.
 * No other code change is required.
 */
export const TRACE_SUCCESS_SRC = '/audio/trace-success.mp3'

const DING_HZ = 1567.98
const DONG_HZ = 1174.66
const CHIME_MS = 620

let customProbe: Promise<boolean> | null = null
let audioCtx: AudioContext | null = null

export function primeTraceSuccess() {
  if (!customProbe) customProbe = probeTeacherAudio(TRACE_SUCCESS_SRC)
}

function context(): AudioContext {
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) throw new Error('Web Audio is not available')
    audioCtx = new Ctx()
  }
  if (audioCtx.state === 'suspended') void audioCtx.resume()
  return audioCtx
}

/** Call from a pointer or click so Safari will allow the chime. */
export function unlockTraceAudio() {
  primeTraceSuccess()
  try {
    context()
  } catch {
    /* Chime is skipped if Web Audio is missing. */
  }
}

function tone(
  ctx: AudioContext,
  destination: AudioNode,
  when: number,
  freq: number,
  duration: number,
  type: OscillatorType,
  peak: number,
) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, when)
  gain.gain.setValueAtTime(0.0001, when)
  gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), when + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration)
  osc.connect(gain)
  gain.connect(destination)
  osc.start(when)
  osc.stop(when + duration + 0.02)
}

/**
 * Bright two-note doorbell (띠동): a high ding, then a lower dong.
 * Soft sine fundamentals, a quiet triangle harmonic for sparkle, quick attack,
 * and a short bell-like decay. About 0.6s, kept quiet.
 */
export function playDingDong(): Promise<void> {
  const ctx = context()
  const master = ctx.createGain()
  master.gain.value = 0.9
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 3400
  filter.Q.value = 0.45
  master.connect(filter)
  filter.connect(ctx.destination)

  const t = ctx.currentTime + 0.012
  tone(ctx, master, t, DING_HZ, 0.28, 'sine', 0.1)
  tone(ctx, master, t, DING_HZ * 1.5, 0.14, 'triangle', 0.018)
  tone(ctx, master, t + 0.2, DONG_HZ, 0.4, 'sine', 0.09)
  tone(ctx, master, t + 0.2, DONG_HZ * 2, 0.2, 'triangle', 0.014)

  return new Promise((resolve) => {
    window.setTimeout(resolve, CHIME_MS)
  })
}

function playCustomFile(src: string): Promise<void> {
  const audio = new Audio(src)
  audio.preload = 'auto'
  audio.setAttribute('playsinline', 'true')
  return new Promise((resolve) => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      resolve()
    }
    const cap = window.setTimeout(finish, 4000)
    const fallback = () => {
      if (settled) return
      window.clearTimeout(cap)
      void playDingDong().then(finish)
    }
    audio.addEventListener(
      'ended',
      () => {
        window.clearTimeout(cap)
        finish()
      },
      { once: true },
    )
    audio.addEventListener('error', fallback, { once: true })
    void audio.play().catch(fallback)
  })
}

/** Custom file when it exists, otherwise the generated ding-dong. */
export async function playTraceSuccess(): Promise<void> {
  primeTraceSuccess()
  const custom = customProbe ? await customProbe : false
  if (custom) {
    await playCustomFile(TRACE_SUCCESS_SRC)
    return
  }
  try {
    await playDingDong()
  } catch {
    /* A missing audio context should not block the next letter. */
  }
}
