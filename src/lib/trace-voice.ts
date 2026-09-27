import type { TeacherClip } from '../data/content.ts'
import { playExclusive, teacherAudioSrc } from './audio.ts'

const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='

let shared: HTMLAudioElement | null = null

function element(): HTMLAudioElement {
  if (!shared) {
    shared = new Audio()
    shared.preload = 'auto'
    shared.setAttribute('playsinline', 'true')
  }
  return shared
}

/** Unlock HTML audio during a tap so the letter can play after the chime. */
export function primeLetterAudio() {
  const audio = element()
  if (!audio.src) audio.src = SILENT_WAV
  const pending = audio.play()
  if (!pending) return
  void pending
    .then(() => {
      audio.pause()
      audio.currentTime = 0
    })
    .catch(() => {
      /* The next real play() still has the click as a fallback. */
    })
}

function waitForClip(audio: HTMLAudioElement, failed: boolean): Promise<void> {
  return new Promise((resolve) => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      resolve()
    }
    if (failed) {
      window.setTimeout(finish, 1500)
      return
    }
    const cap = window.setTimeout(finish, 8000)
    audio.addEventListener(
      'ended',
      () => {
        window.clearTimeout(cap)
        finish()
      },
      { once: true },
    )
    audio.addEventListener(
      'error',
      () => {
        window.clearTimeout(cap)
        window.setTimeout(finish, 1500)
      },
      { once: true },
    )
  })
}

/** Jung’s clip for this letter. Resolves on end, or after ~1.5s if it cannot play. */
export async function playLetterVoice(clip: TeacherClip): Promise<void> {
  const audio = element()
  audio.src = teacherAudioSrc(clip)
  try {
    await playExclusive(audio)
    await waitForClip(audio, false)
  } catch {
    await waitForClip(audio, true)
  }
}

export async function playLetterNow(clip: TeacherClip): Promise<void> {
  const audio = element()
  audio.src = teacherAudioSrc(clip)
  try {
    await playExclusive(audio)
  } catch {
    /* Hear it stays quiet when the clip is missing. */
  }
}
