import { useEffect, useRef, useState } from 'react'
import type { TeacherClip } from '../data/content'
import { playExclusive, probeTeacherAudio, teacherAudioSrc } from '../lib/audio'

export default function FlashcardPlay({ clip }: { clip: TeacherClip }) {
  const src = teacherAudioSrc(clip)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [status, setStatus] = useState<'checking' | 'ready' | 'missing'>('checking')
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    let cancelled = false
    probeTeacherAudio(src).then((ok) => {
      if (!cancelled) setStatus(ok ? 'ready' : 'missing')
    })
    return () => {
      cancelled = true
    }
  }, [src])

  async function togglePlay() {
    const audio = audioRef.current
    if (!audio || status !== 'ready') return
    if (!audio.paused) {
      audio.pause()
      audio.currentTime = 0
      return
    }
    try {
      await playExclusive(audio)
    } catch {
      setStatus('missing')
      setPlaying(false)
    }
  }

  if (status === 'missing') {
    return <p className="flashcard-audio-soon">Audio coming soon</p>
  }

  return (
    <div className="flashcard-play">
      {status === 'ready' && (
        <audio
          ref={audioRef}
          src={src}
          preload="auto"
          playsInline
          onPlaying={() => setPlaying(true)}
          onEnded={() => setPlaying(false)}
          onPause={() => setPlaying(false)}
        />
      )}
      <button
        type="button"
        className={`audio-chip teacher flashcard-play-btn ${playing ? 'on' : ''}`}
        onClick={() => void togglePlay()}
        disabled={status !== 'ready'}
        aria-label={playing ? `Pause ${clip.char}` : `Play ${clip.char}`}
      >
        {status === 'checking' ? (
          <span className="audio-chip-copy">
            <strong>…</strong>
          </span>
        ) : (
          <>
            {playing ? <PauseGlyph /> : <PlayGlyph />}
            <span className="audio-chip-copy">
              <strong>{playing ? 'Pause' : 'Play'}</strong>
              <span>선생님</span>
            </span>
          </>
        )}
      </button>
    </div>
  )
}

function PlayGlyph() {
  return (
    <svg className="audio-glyph" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5.25v13.5L19.5 12 8 5.25Z" fill="currentColor" />
    </svg>
  )
}

function PauseGlyph() {
  return (
    <svg className="audio-glyph" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="6.5" y="5.5" width="4" height="13" rx="1" fill="currentColor" />
      <rect x="13.5" y="5.5" width="4" height="13" rx="1" fill="currentColor" />
    </svg>
  )
}
