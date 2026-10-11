import { useEffect, useState } from 'react'
import JamoAudioBar from '../components/JamoAudioBar'
import {
  FREE_LESSONS,
  GRAMMAR_CARDS,
  GRAMMAR_LOCK,
  type GrammarLesson,
  type GrammarSentence,
} from '../data/grammar.ts'
import { useEnrollment } from '../lib/enrollment.tsx'

function sentenceClip(sentence: GrammarSentence) {
  return {
    char: sentence.words.map((word) => word.hangul).join(' '),
    roman: sentence.words.map((word) => word.roman).join(' '),
    audioId: sentence.audioId,
  }
}

function LessonBody({ lesson }: { lesson: GrammarLesson }) {
  return (
    <>
      <p className="grammar-explain">{lesson.explanation}</p>
      <div className="jamo-list">
        {lesson.sentences.map((sentence) => (
          <div key={sentence.audioId} className="grammar-sentence">
            <p className="word-line">
              {sentence.words.map((word, index) => (
                <span key={`${sentence.audioId}-${word.hangul}`}>
                  {index > 0 ? ' ' : null}
                  {word.hangul} <span className="word-roman">({word.roman})</span>
                </span>
              ))}
            </p>
            <p className="tiny clip-detail">{sentence.english}</p>
            <JamoAudioBar jamo={sentenceClip(sentence)} soonText="Recording coming soon" />
          </div>
        ))}
      </div>
    </>
  )
}

function LockMark() {
  return (
    <svg className="grammar-lock-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8 10V8a4 4 0 1 1 8 0v2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect x="5.5" y="10" width="13" height="9.5" rx="2" fill="currentColor" />
    </svg>
  )
}

export default function Grammar() {
  const { enrollment, clear } = useEnrollment()
  const [lockedLessons, setLockedLessons] = useState<GrammarLesson[] | null>(null)

  useEffect(() => {
    if (!enrollment.enrolled || !enrollment.code) {
      setLockedLessons(null)
      return
    }
    const code = enrollment.code
    let cancelled = false
    void (async () => {
      try {
        const response = await fetch('/api/class/homework?grammar=1', {
          headers: { 'X-Access-Code': code },
        })
        if (cancelled) return
        if (response.status === 401) {
          clear()
          setLockedLessons(null)
          return
        }
        if (!response.ok) {
          setLockedLessons(null)
          return
        }
        const payload = (await response.json()) as { lessons?: GrammarLesson[] }
        const lessons = Array.isArray(payload.lessons) ? payload.lessons : []
        if (lessons.some((lesson) => lesson.id < 3 || !lesson.sentences?.length)) {
          setLockedLessons(null)
          return
        }
        setLockedLessons(lessons)
      } catch {
        if (!cancelled) setLockedLessons(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [enrollment.enrolled, enrollment.code, clear])

  const openById = new Map<number, GrammarLesson>(FREE_LESSONS.map((lesson) => [lesson.id, lesson]))
  for (const lesson of lockedLessons ?? []) openById.set(lesson.id, lesson)

  return (
    <div className="stack">
      <header>
        <p className="kicker">Basic Grammar · Taste of Grammar</p>
        <h2 className="page-title">Taste of Grammar</h2>
        <p className="lede">Two lessons are free. The rest open with the 8-week course.</p>
      </header>

      {GRAMMAR_CARDS.map((card) => {
        const lesson = openById.get(card.id)
        const open = Boolean(lesson)
        return (
          <article key={card.id} className="card grammar-card" id={`grammar-${card.id}`}>
            <h2>
              <span className="grammar-index">{card.id}</span>
              {card.title}
            </h2>
            {open && lesson ? (
              <LessonBody lesson={lesson} />
            ) : (
              <p className="grammar-lock">
                <LockMark />
                <span>{GRAMMAR_LOCK}</span>
              </p>
            )}
          </article>
        )
      })}
    </div>
  )
}
