import { useEffect, useRef, useState } from 'react'
import CourseLocked from '../components/CourseLocked'
import TracePad from '../components/TracePad'
import UnlockControl from '../components/UnlockControl'
import {
  TRACE_LINES,
  findTraceLine,
  lineIsLocked,
  nextTraceLine,
  type TraceLine,
} from '../data/trace-lines'
import { useCourseGate } from '../lib/course-access.ts'
import { useEnrollment } from '../lib/enrollment.tsx'
import { stopActiveAudio } from '../lib/audio'
import { loadTraceProgress, rememberedIndex, saveTraceProgress } from '../lib/trace-progress'
import { playTraceSuccessNow, stopTraceChime, unlockTraceAudio } from '../lib/trace-success'
import { cancelLetterAudio, playLetterNow, playLetterVoice, preloadLetter } from '../lib/trace-voice'

type Phase = 'practice' | 'success' | 'complete'

function clampIndex(line: TraceLine, index: number): number {
  if (line.items.length === 0) return 0
  return Math.min(Math.max(0, index), line.items.length - 1)
}

function initialPlace(): { view: 'picker' | 'line'; lineId: string; index: number } {
  const saved = loadTraceProgress()
  const line = findTraceLine(saved?.lineId ?? '') ?? TRACE_LINES[0]
  if (!saved) return { view: 'picker', lineId: line.id, index: 0 }
  return { view: 'line', lineId: line.id, index: clampIndex(line, saved.index) }
}

export default function Trace() {
  const { enrollment } = useEnrollment()
  const course = useCourseGate()
  const [place] = useState(initialPlace)
  const [view, setView] = useState(place.view)
  const [lineId, setLineId] = useState(place.lineId)
  const [index, setIndex] = useState(place.index)
  const [phase, setPhase] = useState<Phase>('practice')
  const [failToken, setFailToken] = useState(0)
  const [clearToken, setClearToken] = useState(0)

  const line = findTraceLine(lineId) ?? TRACE_LINES[0]
  const item = line.items[clampIndex(line, index)] ?? line.items[0]
  const locked = lineIsLocked(line, enrollment.enrolled)
  const upcoming = nextTraceLine(line.id)

  const phaseRef = useRef<Phase>('practice')
  const hasInkRef = useRef(false)
  const runRef = useRef(0)

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    if (course.state !== 'open' || view !== 'line') return
    const prev = loadTraceProgress()
    saveTraceProgress({
      lineId,
      index: clampIndex(line, index),
      byLine: { ...(prev?.byLine ?? {}) },
    })
  }, [course.state, view, lineId, index, line])

  useEffect(() => {
    if (course.state !== 'open' || view !== 'line' || locked || !item) return
    preloadLetter(item)
  }, [course.state, view, locked, item])

  useEffect(() => {
    return () => {
      runRef.current += 1
      cancelLetterAudio()
      stopTraceChime()
      stopActiveAudio()
    }
  }, [])

  function stopTraceAudio() {
    runRef.current += 1
    cancelLetterAudio()
    stopTraceChime()
    stopActiveAudio()
  }

  function armAudio() {
    unlockTraceAudio()
    if (item) preloadLetter(item)
  }

  async function advanceAfter(voice: Promise<void>) {
    const token = ++runRef.current
    const at = index
    const total = line.items.length
    await voice
    if (runRef.current !== token) return
    hasInkRef.current = false
    if (at + 1 < total) {
      phaseRef.current = 'practice'
      setPhase('practice')
      setIndex(at + 1)
      return
    }
    phaseRef.current = 'complete'
    setPhase('complete')
  }

  function openLine(id: string) {
    const next = findTraceLine(id)
    if (!next) return
    stopTraceAudio()
    const stored = loadTraceProgress()
    phaseRef.current = 'practice'
    hasInkRef.current = false
    setPhase('practice')
    setLineId(next.id)
    setIndex(clampIndex(next, rememberedIndex(stored, id)))
    setView('line')
  }

  function backToLines() {
    stopTraceAudio()
    phaseRef.current = 'practice'
    setPhase('practice')
    setView('picker')
  }

  function step(delta: number) {
    if (phaseRef.current !== 'practice') return
    const next = clampIndex(line, index + delta)
    if (next === index) return
    stopTraceAudio()
    hasInkRef.current = false
    setIndex(next)
  }

  function onClear() {
    if (phaseRef.current !== 'practice') return
    hasInkRef.current = false
    setClearToken((value) => value + 1)
  }

  function onDone() {
    if (phaseRef.current !== 'practice') return
    if (!hasInkRef.current) {
      setFailToken((value) => value + 1)
      return
    }
    if (!item) return
    // Both play() calls stay in this click. The clip does not wait for the chime.
    cancelLetterAudio()
    const voice = playLetterVoice(item)
    playTraceSuccessNow()
    phaseRef.current = 'success'
    setPhase('success')
    void advanceAfter(voice)
  }

  function onHear() {
    if (!item || phaseRef.current === 'success') return
    playLetterNow(item)
  }

  function onAgain() {
    stopTraceAudio()
    hasInkRef.current = false
    phaseRef.current = 'practice'
    setPhase('practice')
    setIndex(0)
  }

  function onNextLine() {
    if (!upcoming) return
    stopTraceAudio()
    hasInkRef.current = false
    phaseRef.current = 'practice'
    setPhase('practice')
    setLineId(upcoming.id)
    setIndex(0)
    setView('line')
  }

  const practicing = view === 'line' && !locked && phase !== 'complete' && item

  if (course.state !== 'open') {
    return (
      <div className="trace-app">
        <header>
          <p className="kicker">Trace · 쓰기</p>
          <h2 className="page-title">Trace</h2>
          <p className="lede">Finger tracing for the 8-week course.</p>
        </header>
        {course.state === 'loading' ? (
          <p className="tiny">Loading…</p>
        ) : (
          <CourseLocked title="Trace" inputId="trace-course-code" enrolled={enrollment.enrolled} />
        )}
      </div>
    )
  }

  return (
    <div className={practicing ? 'trace-app is-practice' : 'trace-app'}>
      {view === 'picker' ? (
        <>
          <header>
            <p className="kicker">Trace · 쓰기</p>
            <h2 className="page-title">Pick one line</h2>
            <p className="lede">Trace the gray letter with your finger. Pick a line.</p>
          </header>
          <div className="trace-lines">
            {TRACE_LINES.map((entry) => {
              const entryLocked = lineIsLocked(entry, enrollment.enrolled)
              const showRange = entry.id === 'consonants' || entry.id === 'doubles' || entry.id === 'vowels'
              return (
                <button
                  key={entry.id}
                  type="button"
                  className="trace-line"
                  aria-label={entryLocked ? `${entry.label}, locked` : entry.label}
                  onClick={() => openLine(entry.id)}
                >
                  <span className="trace-line-mark" aria-hidden="true">
                    {entry.items[0]?.char}
                  </span>
                  <span className="trace-line-copy">
                    <strong>{entry.label}</strong>
                    {showRange ? <span className="tiny">{entry.range}</span> : null}
                  </span>
                  {entryLocked ? (
                    <LockIcon />
                  ) : entry.free ? (
                    <span className="trace-free">Free</span>
                  ) : (
                    <Chevron />
                  )}
                </button>
              )
            })}
          </div>
        </>
      ) : locked ? (
        <section className="card">
          <p className="kicker">{line.label}</p>
          <h2>Access code needed</h2>
          <p className="tiny">
            Consonants ㄱ–ㅎ are free. This line unlocks with the same class code as the pronunciation
            syllable chart.
          </p>
          <div className="unlock-bar">
            <p className="tiny">Access code needed</p>
            <UnlockControl inputId="trace-access-code" />
          </div>
          <button type="button" className="text-btn" onClick={backToLines}>
            All lines
          </button>
        </section>
      ) : phase === 'complete' && item ? (
        <section className="card trace-complete">
          <p className="trace-complete-glyph" aria-hidden="true">
            {item.char}
          </p>
          <h2 className="page-title">Line complete!</h2>
          <p className="lede">{line.label}</p>
          <button type="button" className="btn" onClick={onAgain}>
            Practice again
          </button>
          <button type="button" className="btn secondary" onClick={onNextLine} disabled={!upcoming}>
            Next line
          </button>
          <button type="button" className="text-btn" onClick={backToLines}>
            All lines
          </button>
        </section>
      ) : item ? (
        <>
          <div className="trace-top">
            <button type="button" className="text-btn" onClick={backToLines}>
              Lines
            </button>
            <h2 className="trace-line-name">{line.label}</h2>
            <p className="trace-count" aria-label={`Letter ${index + 1} of ${line.items.length}`}>
              {index + 1} / {line.items.length}
            </p>
          </div>
          <p className="trace-roman">
            {item.char} · {item.roman}
          </p>
          <TracePad
            key={item.audioId}
            char={item.char}
            success={phase === 'success'}
            failToken={failToken}
            clearToken={clearToken}
            onInk={(hasInk) => {
              hasInkRef.current = hasInk
            }}
            onInteract={armAudio}
          />
          <div className="trace-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={onHear}
              disabled={phase !== 'practice'}
            >
              Hear it
            </button>
            <button type="button" className="btn secondary" onClick={onClear} disabled={phase !== 'practice'}>
              Clear
            </button>
            <button type="button" className="btn" onClick={onDone} disabled={phase !== 'practice'}>
              Done
            </button>
          </div>
          <div className="trace-stepper">
            <button
              type="button"
              className="trace-arrow"
              aria-label="Previous letter"
              disabled={index === 0 || phase !== 'practice'}
              onClick={() => step(-1)}
            >
              <Arrow direction="left" />
            </button>
            <button
              type="button"
              className="trace-arrow"
              aria-label="Next letter"
              disabled={index >= line.items.length - 1 || phase !== 'practice'}
              onClick={() => step(1)}
            >
              <Arrow direction="right" />
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}

function LockIcon() {
  return (
    <svg className="trace-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
  )
}

function Chevron() {
  return (
    <svg className="trace-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Arrow({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      {direction === 'left' ? (
        <path d="M14 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M10 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  )
}
