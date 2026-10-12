import { useEffect, useState } from 'react'
import JamoAudioBar from '../components/JamoAudioBar'
import { FREE_TALKS, REAL_TALK_CARDS, REAL_TALK_LOCK, type TalkLine, type TalkWeek } from '../data/real-talk.ts'
import { useEnrollment } from '../lib/enrollment.tsx'

function TalkLines({ lines }: { lines: TalkLine[] }) {
  return (
    <div className="jamo-list">
      {lines.map((line) => (
        <div key={`${line.who}-${line.audioId}-${line.hangul}`} className="grammar-sentence">
          <p className="who-label">{line.who === 'you' ? 'You' : 'Cashier'}</p>
          <p className="word-line">
            {line.hangul} <span className="word-roman">({line.roman})</span>
          </p>
          <p className="tiny clip-detail">{line.english}</p>
          <JamoAudioBar
            jamo={{ char: line.hangul, roman: line.roman, audioId: line.audioId }}
            soonText="Recording coming soon"
          />
        </div>
      ))}
    </div>
  )
}

export default function RealTalk() {
  const { enrollment, clear } = useEnrollment()
  const [lockedWeeks, setLockedWeeks] = useState<TalkWeek[] | null>(null)

  useEffect(() => {
    if (!enrollment.enrolled || !enrollment.code) {
      setLockedWeeks(null)
      return
    }
    const code = enrollment.code
    let cancelled = false
    void (async () => {
      try {
        const response = await fetch('/api/class/homework?realtalk=1', {
          headers: { 'X-Access-Code': code },
        })
        if (cancelled) return
        if (response.status === 401) {
          clear()
          setLockedWeeks(null)
          return
        }
        if (!response.ok) {
          setLockedWeeks(null)
          return
        }
        const payload = (await response.json()) as { weeks?: TalkWeek[] }
        const weeks = Array.isArray(payload.weeks) ? payload.weeks : []
        if (weeks.some((week) => week.week < 5 || !week.lines?.length)) {
          setLockedWeeks(null)
          return
        }
        setLockedWeeks(weeks)
      } catch {
        if (!cancelled) setLockedWeeks(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [enrollment.enrolled, enrollment.code, clear])

  const openByWeek = new Map<number, TalkWeek>(FREE_TALKS.map((week) => [week.week, week]))
  for (const week of lockedWeeks ?? []) openByWeek.set(week.week, week)

  return (
    <div className="stack">
      <header>
        <p className="kicker">Real Talk · 진짜 대화</p>
        <h2 className="page-title">At the counter</h2>
        <p className="lede">Weeks 3 and 4 are free. Weeks 5–7 open with the 8-week course. Jung is the cashier.</p>
      </header>

      {REAL_TALK_CARDS.map((card) => {
        const week = openByWeek.get(card.week)
        return (
          <article key={card.week} className="card grammar-card" id={`realtalk-${card.week}`}>
            <h2>
              <span className="grammar-index">{card.week}</span>
              {card.title}
            </h2>
            {week ? (
              <TalkLines lines={week.lines} />
            ) : (
              <p className="grammar-lock">
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
                <span>{REAL_TALK_LOCK}</span>
              </p>
            )}
          </article>
        )
      })}
    </div>
  )
}
