import UnlockControl from '../components/UnlockControl'
import { WEEK_1_LESSON } from '../data/content'
import { CLASS_MATERIALS, PUBLIC_MATERIALS, type WeekMaterial } from '../data/materials'
import { useEnrollment } from '../lib/enrollment.tsx'

export default function ThisWeek() {
  const { enrollment } = useEnrollment()
  const enrolled = enrollment.enrolled

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
        <h2 className="section-title">This Week</h2>
        <p className="tiny material-note">Open to view or print. No access code needed.</p>
        <nav className="home-links" aria-label="Free this week materials">
          {PUBLIC_MATERIALS.map((item) => (
            <MaterialLink key={item.id} item={item} />
          ))}
        </nav>
      </section>

      {CLASS_MATERIALS.length > 0 ? (
        <section className="card">
          <p className="kicker">Class materials</p>
          <h2>{enrolled ? 'Unlocked' : 'Code required'}</h2>
          {enrolled ? (
            <nav className="home-links class-material-links" aria-label="Class materials">
              {CLASS_MATERIALS.map((item) => (
                <MaterialLink key={item.id} item={item} />
              ))}
            </nav>
          ) : (
            <>
              <p className="tiny material-note">These sheets unlock with a class access code.</p>
              <nav className="home-links class-material-links" aria-label="Locked class materials">
                {CLASS_MATERIALS.map((item) => (
                  <div key={item.id} className="home-link material-locked">
                    <span>
                      <strong>{item.title}</strong>
                      <span className="tiny">Unlock with a class access code.</span>
                    </span>
                    <span className="material-kind">Locked</span>
                  </div>
                ))}
              </nav>
              <div className="unlock-bar">
                <p className="tiny">Access code needed</p>
                <UnlockControl inputId="this-week-access-code" />
              </div>
            </>
          )}
        </section>
      ) : null}
    </div>
  )
}

function MaterialLink({ item }: { item: WeekMaterial }) {
  return (
    <a className="home-link" href={item.href} target="_blank" rel="noreferrer">
      <span>
        <strong>{item.title}</strong>
        <span className="tiny">{item.detail}</span>
      </span>
      <span className="material-kind">PDF</span>
    </a>
  )
}
