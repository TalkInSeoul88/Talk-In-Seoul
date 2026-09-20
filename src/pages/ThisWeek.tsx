import { WEEK_1_LESSON } from '../data/content'
import { THIS_WEEK_MATERIALS } from '../data/materials'

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

      <section>
        <p className="kicker">Materials</p>
        <h2 className="section-title">From class</h2>
        <p className="tiny material-note">Open to view or print. No access code needed.</p>
        <nav className="home-links" aria-label="This week materials">
          {THIS_WEEK_MATERIALS.map((item) => (
            <a key={item.id} className="home-link" href={item.href} target="_blank" rel="noreferrer">
              <span>
                <strong>{item.title}</strong>
                <span className="tiny">{item.detail}</span>
              </span>
              <span className="material-kind">PDF</span>
            </a>
          ))}
        </nav>
      </section>
    </div>
  )
}
