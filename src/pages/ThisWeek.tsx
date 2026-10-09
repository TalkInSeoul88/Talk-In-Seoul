import CourseLocked from '../components/CourseLocked'
import { WEEK_1_LESSON } from '../data/content'
import { CLASS_MATERIALS, PUBLIC_MATERIALS, weekSheetHref, type WeekMaterial } from '../data/materials'
import { useCourseGate } from '../lib/course-access.ts'
import { useEnrollment } from '../lib/enrollment.tsx'

export default function ThisWeek() {
  const { enrollment } = useEnrollment()
  const course = useCourseGate()
  const open = course.state === 'open' && Boolean(course.code)

  return (
    <div className="stack">
      <header>
        <p className="kicker">This Week · 이번 주</p>
        <h2 className="page-title">
          {WEEK_1_LESSON.weekLabel} · {WEEK_1_LESSON.title}
        </h2>
        <p className="lede">{open ? WEEK_1_LESSON.summary : 'Writing sheets for the 8-week course.'}</p>
      </header>

      {course.state === 'loading' ? (
        <p className="tiny">Loading…</p>
      ) : open && course.code ? (
        <section>
          <p className="kicker">Materials</p>
          <h2 className="section-title">This Week</h2>
          <p className="tiny material-note">Open to view or print.</p>
          <nav className="home-links" aria-label="This week materials">
            {PUBLIC_MATERIALS.map((item) => (
              <MaterialLink key={item.id} item={{ ...item, href: weekSheetHref(item.id, course.code as string) }} />
            ))}
          </nav>
          {CLASS_MATERIALS.length > 0 ? (
            <div className="card">
              <p className="kicker">Class materials</p>
              <nav className="home-links class-material-links" aria-label="Class materials">
                {CLASS_MATERIALS.map((item) => (
                  <MaterialLink key={item.id} item={item} />
                ))}
              </nav>
            </div>
          ) : null}
        </section>
      ) : (
        <CourseLocked
          title="This Week"
          inputId="this-week-course-code"
          enrolled={enrollment.enrolled}
        />
      )}
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
