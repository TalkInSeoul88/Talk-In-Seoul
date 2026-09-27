import type { TeacherClip } from '../data/content.ts'
import { holdActiveAudio, teacherAudioSrc } from './audio.ts'

const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='

/** Beat after Jung’s clip ends before the next letter appears. */
const AFTER_CLIP_MS = 300
/** If `ended` never fires, give up and move on. Not a delay when the clip finishes. */
const CLIP_FALLBACK_MS = 6000

let shared: HTMLAudioElement | null = null
let generation = 0
let unlockDone: Promise<void> = Promise.resolve()
let finishPlayback: (() => void) | null = null

function element(): HTMLAudioElement {
  if (!shared) {
    shared = new Audio()
    shared.preload = 'auto'
    shared.setAttribute('playsinline', 'true')
  }
  return shared
}

function isSilent(src: string): boolean {
  return src.startsWith('data:audio/wav')
}

/**
 * Unlock HTML audio during a tap so the letter can play after the chime.
 * The unlock always uses a silent clip. Replaying the syllable here is what
 * made iPhone Safari speak the letter twice (the in-flight unlock adopted
 * the mp3 URL, then the success path called play() again).
 */
export function primeLetterAudio() {
  const audio = element()
  const gen = generation
  if (!isSilent(audio.src)) {
    audio.pause()
    audio.src = SILENT_WAV
  } else if (!audio.src) {
    audio.src = SILENT_WAV
  }
  let pending: Promise<void> | undefined
  try {
    pending = audio.play()
  } catch {
    pending = undefined
  }
  unlockDone = new Promise((resolve) => {
    const settle = () => {
      if (gen === generation) audio.pause()
      resolve()
    }
    if (pending) void pending.then(settle, settle)
    else settle()
  })
}

/** Stop an in-flight clip and drop any wait for it to end. */
export function cancelLetterAudio() {
  generation += 1
  const finish = finishPlayback
  finishPlayback = null
  finish?.()
  // A clip that already ended is paused. Touching it again makes Safari replay.
  if (shared && !shared.paused) shared.pause()
}

function playClip(clip: TeacherClip, token: number, afterEndedMs: number): Promise<void> {
  const audio = element()
  holdActiveAudio(audio)
  if (!audio.paused) audio.pause()
  audio.src = teacherAudioSrc(clip)
  if (token !== generation) return Promise.resolve()

  return new Promise((resolve) => {
    let settled = false
    let afterTimer = 0
    const finish = () => {
      if (settled) return
      settled = true
      window.clearTimeout(cap)
      window.clearTimeout(afterTimer)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      if (finishPlayback === finish) finishPlayback = null
      resolve()
    }
    finishPlayback = finish
    const arm = (delay: number) => {
      window.clearTimeout(cap)
      window.clearTimeout(afterTimer)
      afterTimer = window.setTimeout(finish, delay)
    }
    const onEnded = () => {
      if (token !== generation || settled) return
      arm(afterEndedMs)
    }
    const onError = () => {
      if (token !== generation || settled) return
      arm(afterEndedMs)
    }
    const cap = window.setTimeout(() => {
      if (token !== generation) {
        finish()
        return
      }
      audio.pause()
      finish()
    }, CLIP_FALLBACK_MS)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    let pending: Promise<void> | undefined
    try {
      pending = audio.play()
    } catch {
      onError()
      return
    }
    void pending.catch(() => {
      onError()
    })
  })
}

/**
 * Jung’s clip for this letter, exactly once. Resolves about 300ms after
 * `ended`, or after a short fallback if the file never ends.
 */
export async function playLetterVoice(clip: TeacherClip): Promise<void> {
  await unlockDone
  const previous = finishPlayback
  const token = ++generation
  previous?.()
  await playClip(clip, token, AFTER_CLIP_MS)
}

/** Hear it. One play, no auto-advance. */
export async function playLetterNow(clip: TeacherClip): Promise<void> {
  await unlockDone
  const previous = finishPlayback
  const token = ++generation
  previous?.()
  const audio = element()
  holdActiveAudio(audio)
  if (!audio.paused) audio.pause()
  audio.src = teacherAudioSrc(clip)
  if (token !== generation) return
  try {
    await audio.play()
  } catch {
    /* Hear it stays quiet when the clip is missing. */
  }
}
