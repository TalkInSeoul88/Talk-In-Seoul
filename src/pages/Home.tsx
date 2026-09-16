import { useState } from 'react'
import { Link } from 'react-router-dom'
import { WEEK_1_LESSON } from '../data/content'
import { useProgress } from '../lib/progress'

export default function Home() {
  const { quiz, homeworkDone, homeworkTotal, nextClass, updateNextClass } = useProgress()
  const [editing, setEditing] = useState(false)

  return (
    <div className="stack">
      <section className="card welcome">
        <p className="kicker">안녕 · Welcome</p>
        <h2>Practice between classes.</h2>
        <p className="lede" style={{ marginBottom: 0 }}>
          Warm up your Hangul at home, then come back to{' '}
          <strong>Pop In Seoul</strong> in Springfield, IL for the next in-person session.
        </p>
      </section>

      <section className="card">
        <p className="kicker">This week’s lesson · 이번 주 수업</p>
        <h2>
          {WEEK_1_LESSON.weekLabel} · {WEEK_1_LESSON.title}
        </h2>
        <p className="muted" style={{ marginTop: 0 }}>
          {WEEK_1_LESSON.titleKo}. {WEEK_1_LESSON.summary} Tap Play on the lesson to hear Jung, then say it back.
        </p>
        <Link className="btn" to="/lesson">
          Review the lesson · 복습하기
        </Link>
      </section>

      <div className="quick-grid">
        <Link className="quick-link accent" to="/practice">
          <span>자모 연습</span>
          <strong>Practice</strong>
        </Link>
        <Link className="quick-link sky" to="/quiz">
          <span>퀴즈</span>
          <strong>Quiz</strong>
        </Link>
        <Link className="quick-link peach" to="/homework">
          <span>숙제</span>
          <strong>Homework</strong>
        </Link>
        <Link className="quick-link" to="/lesson">
          <span>수업</span>
          <strong>Lesson</strong>
        </Link>
      </div>

      <section className="card next-class">
        <div className="edit-row">
          <p className="kicker" style={{ margin: 0 }}>
            Next class · 다음 수업
          </p>
          <button className="text-btn" type="button" onClick={() => setEditing((value) => !value)}>
            {editing ? 'Done' : 'Edit'}
          </button>
        </div>
        {editing ? (
          <textarea
            aria-label="Next class date and place"
            value={nextClass}
            onChange={(event) => updateNextClass(event.target.value)}
            rows={3}
          />
        ) : (
          <p style={{ whiteSpace: 'pre-wrap', margin: '0.55rem 0 0', fontWeight: 600 }}>{nextClass}</p>
        )}
      </section>

      <section className="card">
        <h2>Your progress · 학습 현황</h2>
        <p className="tiny">Saved on this phone only — no account needed.</p>
        <div className="progress-row">
          <div className="stat">
            <span className="tiny">Last quiz</span>
            <b>{quiz ? `${quiz.score}/${quiz.total}` : '—'}</b>
          </div>
          <div className="stat">
            <span className="tiny">Homework</span>
            <b>
              {homeworkDone}/{homeworkTotal}
            </b>
          </div>
        </div>
      </section>
    </div>
  )
}
