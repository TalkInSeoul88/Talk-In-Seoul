import type { TeacherClip } from '../data/content'

const AUDIO_REV = 'jung-syllable-do-v1'

export function teacherAudioSrc(clip: TeacherClip): string {
  return `/audio/${clip.audioId}.mp3?v=${AUDIO_REV}`
}

/** Doorbell chime for a finished trace. Same cache-bust as Jung’s clips. */
export function traceSuccessSrc(): string {
  return `/audio/trace-success.mp3?v=${AUDIO_REV}`
}

const availability = new Map<string, boolean>()
const inflight = new Map<string, Promise<boolean>>()

export async function probeTeacherAudio(src: string): Promise<boolean> {
  const cached = availability.get(src)
  if (cached !== undefined) return cached
  const pending = inflight.get(src)
  if (pending) return pending

  const request = (async () => {
    try {
      const response = await fetch(src, { method: 'GET', cache: 'no-cache' })
      const type = response.headers.get('content-type') ?? ''
      const ok = response.ok && !type.includes('text/html')
      availability.set(src, ok)
      return ok
    } catch {
      availability.set(src, false)
      return false
    } finally {
      inflight.delete(src)
    }
  })()

  inflight.set(src, request)
  return request
}

let active: HTMLAudioElement | null = null

/**
 * A fresh element per clip. Reusing one element on iPhone speaks the previous
 * line — 안녕하세요 under 이거 뭐예요?.
 */
let teacher: HTMLAudioElement | null = null
let teacherSrc = ''

export type TeacherPlayback = { src: string; kind: 'playing' | 'pause' | 'ended' }

const teacherListeners = new Set<(event: TeacherPlayback) => void>()

function emitTeacher(kind: TeacherPlayback['kind']) {
  const event = { src: teacherSrc, kind }
  for (const listener of teacherListeners) listener(event)
}

function retireTeacher() {
  const previous = teacher
  teacher = null
  if (!previous) return
  previous.pause()
  previous.removeAttribute('src')
  try {
    previous.load()
  } catch {
    /* The new element is what plays. */
  }
}

function startTeacher(src: string): HTMLAudioElement {
  const audio = new Audio(src)
  audio.preload = 'auto'
  audio.setAttribute('playsinline', 'true')
  const isCurrent = () => teacher === audio
  audio.addEventListener('playing', () => {
    if (isCurrent()) emitTeacher('playing')
  })
  audio.addEventListener('pause', () => {
    if (isCurrent()) emitTeacher('pause')
  })
  audio.addEventListener('ended', () => {
    if (isCurrent()) emitTeacher('ended')
  })
  teacher = audio
  teacherSrc = src
  return audio
}

export function subscribeTeacherPlayback(listener: (event: TeacherPlayback) => void) {
  teacherListeners.add(listener)
  return () => {
    teacherListeners.delete(listener)
  }
}

/** Pause Jung only when this row's file is the one playing. */
export function stopTeacherClipIfSrc(src: string) {
  if (!teacher || teacherSrc !== src || teacher.paused) return
  teacher.pause()
}

export function playTeacherClip(src: string): Promise<void> {
  if (teacher && teacherSrc === src && !teacher.paused && !teacher.ended) {
    teacher.pause()
    return Promise.resolve()
  }
  if (active && active !== teacher) {
    active.pause()
    active.currentTime = 0
  }
  // A reused element keeps the previous clip on iPhone (안녕하세요 under 이거 뭐예요?).
  // A new element is born with this src, so play() cannot speak the line above.
  if (!teacher || teacherSrc !== src) retireTeacher()
  const audio = teacher && teacherSrc === src ? teacher : startTeacher(src)
  // play() restarts an ended clip. Seeking as well makes Safari speak it twice.
  if (!audio.ended && audio.currentTime > 0.05) {
    try {
      audio.currentTime = 0
    } catch {
      /* Not seekable yet. play() still starts this clip. */
    }
  }
  active = audio
  return audio.play()
}

export function stopActiveAudio() {
  if (teacher && !teacher.paused) teacher.pause()
  if (active && active !== teacher) active.pause()
  active = null
}

export async function playExclusive(audio: HTMLAudioElement): Promise<void> {
  if (teacher && teacher !== audio && !teacher.paused) teacher.pause()
  if (active && active !== audio) {
    active.pause()
    active.currentTime = 0
  }
  active = audio
  audio.currentTime = 0
  await audio.play()
}

export function recorderSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof MediaRecorder !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia
  )
}

export function pickRecorderMime(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  const types = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus']
  return types.find((type) => MediaRecorder.isTypeSupported(type))
}
