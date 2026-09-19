import type { TeacherClip } from '../data/content'

const AUDIO_REV = 'jung-syllables-ya-row-v1'

export function teacherAudioSrc(clip: TeacherClip): string {
  return `/audio/${clip.audioId}.mp3?v=${AUDIO_REV}`
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

export function stopActiveAudio() {
  if (!active) return
  active.pause()
  active.currentTime = 0
  active = null
}

export async function playExclusive(audio: HTMLAudioElement): Promise<void> {
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
