import { useEffect, useRef, useState } from 'react'
import type { Jamo } from '../data/content'
import {
  pickRecorderMime,
  playExclusive,
  probeTeacherAudio,
  recorderSupported,
  stopActiveAudio,
  teacherAudioSrc,
} from '../lib/audio'

const MAX_RECORD_MS = 6000
const studentUrls = new Map<string, string>()

function clipUrl(id: string): string | null {
  return studentUrls.get(id) ?? null
}

function storeClip(id: string, blob: Blob): string {
  const previous = studentUrls.get(id)
  if (previous) URL.revokeObjectURL(previous)
  const url = URL.createObjectURL(blob)
  studentUrls.set(id, url)
  return url
}

type Props = {
  jamo: Jamo
  revealLabel?: boolean
}

export default function JamoAudioBar({ jamo, revealLabel = true }: Props) {
  const src = teacherAudioSrc(jamo)
  const teacherRef = useRef<HTMLAudioElement>(null)
  const mineRef = useRef<HTMLAudioElement>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const stopTimerRef = useRef<number | null>(null)

  const [teacherStatus, setTeacherStatus] = useState<'checking' | 'ready' | 'missing'>('checking')
  const [teacherPlaying, setTeacherPlaying] = useState(false)
  const [recording, setRecording] = useState(false)
  const [mineUrl, setMineUrl] = useState<string | null>(() => clipUrl(jamo.audioId))
  const [minePlaying, setMinePlaying] = useState(false)
  const [recordError, setRecordError] = useState<string | null>(null)
  const canRecord = recorderSupported()

  useEffect(() => {
    let cancelled = false
    probeTeacherAudio(src).then((ok) => {
      if (!cancelled) setTeacherStatus(ok ? 'ready' : 'missing')
    })
    return () => {
      cancelled = true
    }
  }, [src])

  useEffect(() => {
    return () => {
      if (stopTimerRef.current) window.clearTimeout(stopTimerRef.current)
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop()
      }
      streamRef.current?.getTracks().forEach((track) => track.stop())
      teacherRef.current?.pause()
      mineRef.current?.pause()
    }
  }, [])

  function haltRecorder() {
    if (stopTimerRef.current) {
      window.clearTimeout(stopTimerRef.current)
      stopTimerRef.current = null
    }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    recorderRef.current = null
    setRecording(false)
  }

  async function toggleTeacher() {
    const audio = teacherRef.current
    if (!audio || teacherStatus !== 'ready') return
    if (teacherPlaying && !audio.paused) {
      audio.pause()
      audio.currentTime = 0
      setTeacherPlaying(false)
      return
    }
    mineRef.current?.pause()
    setMinePlaying(false)
    try {
      await playExclusive(audio)
      setTeacherPlaying(true)
    } catch {
      setTeacherStatus('missing')
    }
  }

  async function toggleRecord() {
    if (!canRecord) return
    if (recording) {
      haltRecorder()
      return
    }
    const clipId = jamo.audioId
    setRecordError(null)
    stopActiveAudio()
    teacherRef.current?.pause()
    setTeacherPlaying(false)
    mineRef.current?.pause()
    setMinePlaying(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      const mime = pickRecorderMime()
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream)
      recorderRef.current = recorder
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        if (blob.size > 0) setMineUrl(storeClip(clipId, blob))
        setRecording(false)
      }
      recorder.start()
      setRecording(true)
      stopTimerRef.current = window.setTimeout(() => haltRecorder(), MAX_RECORD_MS)
    } catch (error) {
      const name = error instanceof DOMException ? error.name : ''
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setRecordError('Microphone permission is needed to record.')
      } else {
        setRecordError('Recording isn’t available in this browser.')
      }
      setRecording(false)
    }
  }

  async function toggleMine() {
    const audio = mineRef.current
    if (!audio || !mineUrl) return
    if (minePlaying && !audio.paused) {
      audio.pause()
      audio.currentTime = 0
      setMinePlaying(false)
      return
    }
    teacherRef.current?.pause()
    setTeacherPlaying(false)
    try {
      await playExclusive(audio)
      setMinePlaying(true)
    } catch {
      setRecordError('Could not play your recording.')
    }
  }

  return (
    <div className="audio-bar">
      {teacherStatus === 'ready' && (
        <audio
          ref={teacherRef}
          src={src}
          preload="auto"
          playsInline
          onEnded={() => setTeacherPlaying(false)}
          onPause={() => setTeacherPlaying(false)}
        />
      )}
      {mineUrl && (
        <audio
          ref={mineRef}
          src={mineUrl}
          preload="metadata"
          playsInline
          onEnded={() => setMinePlaying(false)}
          onPause={() => setMinePlaying(false)}
        />
      )}

      {teacherStatus === 'missing' ? (
        <p className="audio-soon">Audio coming soon</p>
      ) : (
        <button
          type="button"
          className={`audio-chip ${teacherPlaying ? 'on' : ''}`}
          onClick={() => void toggleTeacher()}
          disabled={teacherStatus !== 'ready'}
          aria-label={revealLabel ? `Play teacher audio for ${jamo.char}` : 'Play teacher audio'}
        >
          {teacherStatus === 'checking' ? '…' : teacherPlaying ? 'Pause' : 'Play'}
          <span>선생님</span>
        </button>
      )}

      {canRecord ? (
        <button
          type="button"
          className={`audio-chip ${recording ? 'rec' : ''}`}
          onClick={() => void toggleRecord()}
          aria-pressed={recording}
          aria-label={recording ? `Stop recording ${jamo.char}` : `Record yourself saying ${jamo.char}`}
        >
          {recording ? 'Stop' : 'Record'}
          <span>{recording ? '녹음 중' : '녹음'}</span>
        </button>
      ) : (
        <p className="audio-soon">Recording isn’t supported here. Try Safari or Chrome.</p>
      )}

      {mineUrl && (
        <button
          type="button"
          className={`audio-chip ${minePlaying ? 'on' : ''}`}
          onClick={() => void toggleMine()}
          aria-label="Play my recording"
        >
          {minePlaying ? 'Pause' : 'Play me'}
          <span>내 목소리</span>
        </button>
      )}

      {recordError && <p className="audio-soon">{recordError}</p>}
    </div>
  )
}
