import { useState } from 'react'
import AccessCodeCard from '../components/AccessCodeCard'
import LevelLock from '../components/LevelLock'
import { Link } from 'react-router-dom'
import { WEEK_1_LESSON } from '../data/content'
import { hasLevel } from '../data/levels.ts'
import { PROGRESS_LINK } from '../data/nav'
import { useEnrollment } from '../lib/enrollment.tsx'
import Homework from './Homework'
import Notices from './Notices'
import ThisWeek from './ThisWeek'

const PARTS = [
  { id: 'week', label: 'This week' },
  { id: 'notices', label: 'Notices' },
  { id: 'homework', label: 'Homework' },
] as const

type Part = (typeof PARTS)[number]['id']

export default function Home() {
  const { enrollment } = useEnrollment()
  const [part, setPart] = useState<Part>('week')
  const beginnerOpen = !enrollment.enrolled || hasLevel(enrollment.levels, 'beginner')

  return (
    <div className="stack">
      <header>
        <p className="kicker">
          {WEEK_1_LESSON.weekLabel} · {WEEK_1_LESSON.weekLabelKo} <span className="spoken">(joo-chah)</span>
        </p>
        <h2 className="page-title">Hangul basics this week</h2>
        <p className="lede">This week’s sheets, notices, and homework. Your checklist is here too.</p>
      </header>

      <AccessCodeCard />

      {beginnerOpen ? (
        <>
          <Link className="home-link" to={PROGRESS_LINK.to}>
            <span>
              <strong>
                {PROGRESS_LINK.label} · {PROGRESS_LINK.ko} ({PROGRESS_LINK.roman})
              </strong>
              <span className="tiny">{PROGRESS_LINK.detail}</span>
            </span>
            <Chevron />
          </Link>
          <div className="segment" role="tablist" aria-label="Home">
            {PARTS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`home-tab-${item.id}`}
                aria-selected={part === item.id}
                aria-controls={`home-panel-${item.id}`}
                className={part === item.id ? 'segment-btn is-on' : 'segment-btn'}
                onClick={() => setPart(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div role="tabpanel" id={`home-panel-${part}`} aria-labelledby={`home-tab-${part}`}>
            {part === 'week' ? <ThisWeek embedded /> : null}
            {part === 'notices' ? <Notices embedded /> : null}
            {part === 'homework' ? <Homework embedded /> : null}
          </div>
        </>
      ) : (
        <LevelLock label="Beginner" />
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
