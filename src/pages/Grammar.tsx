import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import AccessCodeCard from '../components/AccessCodeCard'
import JamoAudioBar from '../components/JamoAudioBar'
import LevelLock from '../components/LevelLock'
import { GRAMMAR_LEVELS, hasLevel, type LevelId } from '../data/levels.ts'
import { useEnrollment } from '../lib/enrollment.tsx'

type GrammarWord = { hangul: string; roman: string }

type GrammarSentence = {
  audioId: string
  english: string
  words: GrammarWord[]
}

type GrammarTopic = {
  id: string
  title: string
  explanation: string
  sentences: GrammarSentence[]
}

type GrammarSection = {
  id: string
  label: string
  open: boolean
  message?: string
  topics?: GrammarTopic[]
}

function isLevelId(value: string | undefined): value is LevelId {
  return GRAMMAR_LEVELS.some((level) => level.id === value)
}

function TopicCard({ topic }: { topic: GrammarTopic }) {
  return (
    <article className="card grammar-card" id={`grammar-${topic.id}`}>
      <h2>{topic.title}</h2>
      <p className="grammar-explain">{topic.explanation}</p>
      <div className="jamo-list">
        {topic.sentences.map((sentence) => (
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
            <JamoAudioBar
              jamo={{
                char: sentence.words.map((word) => word.hangul).join(' '),
                roman: sentence.words.map((word) => word.roman).join(' '),
                audioId: sentence.audioId,
              }}
              soonText="Recording coming soon"
            />
          </div>
        ))}
      </div>
    </article>
  )
}

export default function Grammar() {
  const { levelId } = useParams()
  const { enrollment, clear } = useEnrollment()
  const requestKey = `${levelId ?? ''}|${enrollment.enrolled}|${enrollment.code ?? ''}|${enrollment.levels.join(',')}`
  const [packet, setPacket] = useState<{ key: string; section: GrammarSection | null; failed: boolean } | null>(null)
  const loaded = packet?.key === requestKey ? packet : null

  useEffect(() => {
    if (!levelId || !enrollment.enrolled || !enrollment.code || !hasLevel(enrollment.levels, levelId)) return
    const code = enrollment.code
    const requested = levelId
    const key = requestKey
    let cancelled = false
    void (async () => {
      try {
        const response = await fetch('/api/class/homework?grammar=1', { headers: { 'X-Access-Code': code } })
        if (cancelled) return
        if (response.status === 401) {
          clear()
          return
        }
        if (!response.ok) {
          setPacket({ key, section: null, failed: true })
          return
        }
        const payload = (await response.json()) as { sections?: GrammarSection[] }
        const next = Array.isArray(payload.sections) ? payload.sections.find((item) => item.id === requested) : undefined
        if (!next?.open) {
          setPacket({
            key,
            failed: false,
            section: next ? { id: next.id, label: next.label, open: false, message: next.message } : null,
          })
          return
        }
        setPacket({ key, section: next, failed: false })
      } catch {
        if (!cancelled) setPacket({ key, section: null, failed: true })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [requestKey, levelId, enrollment.enrolled, enrollment.code, enrollment.levels, clear])

  if (levelId && !isLevelId(levelId)) return <Navigate to="/grammar" replace />

  const label = GRAMMAR_LEVELS.find((level) => level.id === levelId)?.label ?? 'Grammar'
  const openHere = Boolean(levelId && enrollment.enrolled && hasLevel(enrollment.levels, levelId))
  const section = loaded?.section ?? null
  const failed = loaded?.failed ?? false

  return (
    <div className="stack">
      <header>
        <p className="kicker">
          Grammar · 문법 <span className="spoken">(moon-ppuhp)</span>
        </p>
        <h2 className="page-title">{levelId ? label : 'Grammar'}</h2>
        <p className="lede">
          {levelId ? <Link to="/grammar">All levels</Link> : 'Each level opens from the checkboxes on your class code.'}
        </p>
      </header>

      {!enrollment.enrolled ? <AccessCodeCard /> : null}

      {!levelId ? (
        GRAMMAR_LEVELS.map((level) => {
          const open = enrollment.enrolled && hasLevel(enrollment.levels, level.id)
          if (!open) return <LevelLock key={level.id} label={level.label} />
          const soon = level.id !== 'intermediate-1'
          return (
            <Link key={level.id} className="home-link" to={`/grammar/${level.id}`}>
              <span>
                <strong>{level.label}</strong>
                <span className="tiny">{soon ? 'Coming soon' : 'Open on this code'}</span>
              </span>
              <Chevron />
            </Link>
          )
        })
      ) : !openHere || (section && !section.open) ? (
        <LevelLock label={label} />
      ) : failed && !section?.topics?.length ? (
        <p className="form-error">Could not load this level. Check wifi, then try again.</p>
      ) : section?.topics?.length ? (
        section.topics.map((topic) => <TopicCard key={topic.id} topic={topic} />)
      ) : section?.open ? (
        <article className="card">
          <p className="kicker">{label}</p>
          <h2>Coming soon</h2>
          <p className="lede homework-closed">Jung is still writing this level.</p>
        </article>
      ) : (
        <p className="tiny">Loading…</p>
      )}
    </div>
  )
}

function Chevron() {
  return (
    <svg className="home-link-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
