import { traceSuccessSrc } from './audio.ts'

const DING_HZ = 1567.98
const DONG_HZ = 1174.66
const CHIME_MS = 620
const FILE_CAP_MS = 2500

let chime: HTMLAudioElement | null = null
let chimePlaying = false
let chimePrimed = false
let audioCtx: AudioContext | null = null

function chimeElement(): HTMLAudioElement {
  if (!chime) {
    chime = new Audio(traceSuccessSrc())
    chime.preload = 'auto'
    chime.setAttribute('playsinline', 'true')
  }
  return chime
}

/**
 * Load the doorbell file and start it inside a pointer gesture, then pause
 * unless a real play has already begun. Safari will then allow the chime.
 */
export function primeTraceSuccess() {
  const audio = chimeElement()
  if (chimePrimed) return
  chimePrimed = true
  const pending = audio.play()
  if (!pending) return
  void pending
    .then(() => {
      if (chimePlaying) return
      audio.pause()
      audio.currentTime = 0
    })
    .catch(() => {
      if (!chimePlaying) chimePrimed = false
    })
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

/** Call from a pointer or click so Safari can play the file, or the fallback. */
export function unlockTraceAudio() {
  primeTraceSuccess()
  try {
    context()
  } catch {
    /* The file path does not need Web Audio. */
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
 * Bright two-note doorbell (띠동). Used only when the mp3 cannot play.
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

/** Pause the doorbell without touching Jung’s clip. */
export function stopTraceChime() {
  chimePlaying = false
  if (!chime || chime.paused) return
  chime.pause()
}

/**
 * Play the doorbell on its own element. Call from the Done click.
 * Does not pause Jung’s clip, so the two can overlap.
 * Falls back to the synthesized chime only if the file fails.
 */
export function playTraceSuccessNow(): Promise<void> {
  const audio = chimeElement()
  chimePlaying = true
  try {
    if (audio.currentTime > 0) audio.currentTime = 0
  } catch {
    /* The play() below still starts the file. */
  }

  return new Promise((resolve) => {
    let settled = false
    const done = () => {
      if (settled) return
      settled = true
      chimePlaying = false
      resolve()
    }
    const cap = window.setTimeout(done, FILE_CAP_MS)
    const onEnded = () => {
      window.clearTimeout(cap)
      audio.removeEventListener('error', onFail)
      done()
    }
    const onFail = () => {
      if (settled) return
      settled = true
      window.clearTimeout(cap)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onFail)
      void playDingDong().then(
        () => {
          chimePlaying = false
          resolve()
        },
        () => {
          chimePlaying = false
          resolve()
        },
      )
    }
    audio.addEventListener('ended', onEnded, { once: true })
    audio.addEventListener('error', onFail, { once: true })
    // play() is invoked before this function returns to the click handler.
    let pending: Promise<void> | undefined
    try {
      pending = audio.play()
    } catch {
      onFail()
      return
    }
    void pending.catch(onFail)
  })
}
