import { useEffect, useRef, useState } from 'react'
import type { SoundClip } from '../data/sound-workout.ts'
import { probeTeacherAudio, stopActiveAudio, teacherAudioSrc } from '../lib/audio.ts'

export default function ListenPick({ choices }: { choices: SoundClip[] }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [target, setTarget] = useState(0)
  const [ready, setReady] = useState<'checking' | 'ready' | 'missing'>('checking')
  const [heard, setHeard] = useState(false)
  const [picked, setPicked] = useState<number | null>(null)
  const clip = choices[target]
  const teacher = { char: clip.hangul, roman: clip.roman, audioId: clip.audioId }

  useEffect(() => {
    let cancelled = false
    const src = teacherAudioSrc({ char: clip.hangul, roman: clip.roman, audioId: clip.audioId })
    setReady('checking')
    setHeard(false)
    setPicked(null)
    void probeTeacherAudio(src).then((ok) => {
      if (!cancelled) setReady(ok ? 'ready' : 'missing')
    })
    return () => {
      cancelled = true
    }
  }, [clip.audioId, clip.hangul, clip.roman])

  async function hear() {
    const audio = audioRef.current
    if (!audio || ready !== 'ready') return
    setPicked(null)
    setHeard(true)
    stopActiveAudio()
    audio.currentTime = 0
    try {
      await audio.play()
    } catch {
      setReady('missing')
      setHeard(false)
    }
  }

  function another() {
    setTarget((index) => (index + 1) % choices.length)
  }

  const answer = picked === null ? null : choices[picked]
  const correct = picked === target

  return (
    <div className="listen-pick">
      {ready === 'ready' ? (
        <audio ref={audioRef} src={teacherAudioSrc(teacher)} preload="auto" playsInline />
      ) : null}
      {ready === 'missing' ? (
        <p className="audio-soon">Recording coming soon</p>
      ) : (
        <button type="button" className="btn" onClick={() => void hear()} disabled={ready !== 'ready'}>
          {ready === 'checking' ? '…' : 'Hear it'}
        </button>
      )}
      <div className="pick-row" role="group" aria-label="Which one did you hear?">
        {choices.map((choice, index) => {
          const state = picked === null ? '' : index === target ? ' is-right' : index === picked ? ' is-wrong' : ''
          return (
            <button
              key={choice.audioId}
              type="button"
              className={`pick-choice${state}`}
              onClick={() => heard && setPicked(index)}
              disabled={!heard || picked !== null}
            >
              {choice.hangul} <span>({choice.roman})</span>
            </button>
          )
        })}
      </div>
      {picked !== null && answer ? (
        <p className="tiny pick-result">
          {correct ? 'Yes.' : 'Not that one.'} {clip.hangul} ({clip.roman}) · {clip.english}
        </p>
      ) : (
        <p className="tiny">Hear it, then tap the word.</p>
      )}
      <button type="button" className="btn secondary pick-next" onClick={another}>
        Another
      </button>
    </div>
  )
}
