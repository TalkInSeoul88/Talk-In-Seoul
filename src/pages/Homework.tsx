import { HOMEWORK } from '../data/content'
import { useProgress } from '../lib/progress'

export default function Homework() {
  const { homework, homeworkDone, homeworkTotal, toggleHomework, resetHomework } = useProgress()

  return (
    <div className="stack">
      <header className="page-header">
        <p className="kicker">Homework · 숙제</p>
        <h2 className="page-title">Before next class</h2>
        <p className="lede">
          Five small tasks. Check them off here — your list stays on this phone even after you refresh.
        </p>
      </header>

      <section className="card">
        <div className="edit-row">
          <strong>
            {homeworkDone} / {homeworkTotal} done
          </strong>
          <button className="text-btn" type="button" onClick={resetHomework}>
            Reset
          </button>
        </div>
        <div className="progress-bar" aria-hidden="true">
          <span style={{ width: `${(homeworkDone / homeworkTotal) * 100}%` }} />
        </div>
      </section>

      <div className="checklist">
        {HOMEWORK.map((item) => {
          const done = Boolean(homework[item.id])
          return (
            <button
              key={item.id}
              type="button"
              className={`check-item ${done ? 'done' : ''}`}
              onClick={() => toggleHomework(item.id)}
              aria-pressed={done}
            >
              <span className="box" aria-hidden="true">
                {done ? '✓' : ''}
              </span>
              <span>
                <strong>{item.title}</strong>
                <div className="tiny">{item.titleKo}</div>
                <div className="muted check-detail">{item.detail}</div>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
