import type { TeacherClip } from '../data/content.ts'
import { teacherAudioSrc } from './audio.ts'

/** Beat after Jung’s clip ends before the next letter appears. */
const AFTER_CLIP_MS = 300
/** If `ended` never fires, give up and move on. Not a delay when the clip finishes. */
const CLIP_FALLBACK_MS = 6000

let shared: HTMLAudioElement | null = null
let loadedSrc = ''
let generation = 0
let finishPlayback: (() => void) | null = null

function element(): HTMLAudioElement {
  if (!shared) {
    shared = new Audio()
    shared.preload = 'auto'
    shared.setAttribute('playsinline', 'true')
  }
  return shared
}

/** Start fetching this letter as soon as it is on screen. Does not play it. */
export function preloadLetter(clip: TeacherClip) {
  const src = teacherAudioSrc(clip)
  if (loadedSrc === src && shared) return
  const audio = element()
  if (!audio.paused && !audio.ended) return
  audio.preload = 'auto'
  audio.src = src
  loadedSrc = src
  try {
    audio.load()
  } catch {
    /* play() on Done still requests the file. */
  }
}

function prepare(clip: TeacherClip): HTMLAudioElement {
  const audio = element()
  const src = teacherAudioSrc(clip)
  if (loadedSrc !== src) {
    audio.src = src
    loadedSrc = src
  }
  if (!audio.paused && !audio.ended) audio.pause()
  // play() restarts an ended clip. Seeking as well makes Safari speak it twice.
  if (!audio.ended && audio.currentTime > 0.05) {
    try {
      audio.currentTime = 0
    } catch {
      /* Not seekable yet; play() still starts this clip once. */
    }
  }
  return audio
}

function playClip(clip: TeacherClip, token: number, afterEndedMs: number): Promise<void> {
  const audio = prepare(clip)
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
      if (!audio.paused) audio.pause()
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

/** Stop an in-flight clip and drop any wait for it to end. */
export function cancelLetterAudio() {
  generation += 1
  const finish = finishPlayback
  finishPlayback = null
  finish?.()
  // A clip that already ended is paused. Touching it again makes Safari replay.
  if (shared && !shared.paused) shared.pause()
}

/**
 * Jung’s clip, exactly once. Call from the Done click so `play()` runs in
 * that gesture — do not wait for the doorbell first. Resolves about 300ms
 * after `ended`.
 */
export function playLetterVoice(clip: TeacherClip): Promise<void> {
  const previous = finishPlayback
  const token = ++generation
  previous?.()
  return playClip(clip, token, AFTER_CLIP_MS)
}

/** Hear it. One play, started in the click, no auto-advance. */
export function playLetterNow(clip: TeacherClip): void {
  const previous = finishPlayback
  generation += 1
  previous?.()
  const audio = prepare(clip)
  try {
    void audio.play()
  } catch {
    /* Hear it stays quiet when the clip is missing. */
  }
}
