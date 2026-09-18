import { WEEK_1_LESSON } from '../data/content'

export default function ThisWeek() {
  return (
    <div className="stack">
      <header>
        <p className="kicker">This Week · 이번 주</p>
        <h2 className="page-title">
          {WEEK_1_LESSON.weekLabel} · {WEEK_1_LESSON.title}
        </h2>
        <p className="lede">{WEEK_1_LESSON.summary}</p>
      </header>

      <section className="card empty-card">
        <p className="kicker">Materials</p>
        <h2>Coming from class</h2>
        <p className="muted" style={{ marginBottom: 0 }}>
          PDFs, class links, and video links will land here after class. Nothing to download yet.
        </p>
      </section>
    </div>
  )
}
