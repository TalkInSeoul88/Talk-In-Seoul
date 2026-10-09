import { useEffect, useState } from 'react'
import ClassLocked from '../components/ClassLocked'
import { formatExpiry } from '../lib/enrollment.ts'
import { useEnrollment } from '../lib/enrollment.tsx'
import { formatSize, readError } from '../lib/http.ts'

type HomeworkFile = {
  id: string
  name: string
  kind: string
  size: number
  href: string
}

type HomeworkItem = {
  id: string
  title: string
  instructions: string
  dueDate: string | null
  files: HomeworkFile[]
}

type Week = { week: number; items: HomeworkItem[] }

export default function Homework() {
  const { enrollment, clear } = useEnrollment()
  const [courseName, setCourseName] = useState('')
  const [weeks, setWeeks] = useState<Week[]>([])
  const [loading, setLoading] = useState(enrollment.enrolled)
  const [error, setError] = useState<string | null>(null)
  const [gateError, setGateError] = useState<string | null>(null)
  const [blocked, setBlocked] = useState<string | null>(null)

  useEffect(() => {
    if (!enrollment.enrolled || !enrollment.code) return
    const code = enrollment.code
    let cancelled = false
    void (async () => {
      setLoading(true)
      setError(null)
      setBlocked(null)
      try {
        const response = await fetch('/api/class/homework', { headers: { 'X-Access-Code': code } })
        if (cancelled) return
        if (response.status === 403) {
          setBlocked(await readError(response))
          return
        }
        if (response.status === 401) {
          setGateError(await readError(response))
          clear()
          return
        }
        if (!response.ok) {
          setError(await readError(response))
          return
        }
        const payload = (await response.json()) as { course: { name: string } | null; weeks: Week[] }
        setCourseName(payload.course?.name || 'Homework')
        setWeeks(payload.weeks)
        setGateError(null)
      } catch {
        if (!cancelled) setError('Could not load homework. Check wifi, then try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [enrollment.enrolled, enrollment.code, clear])

  return (
    <div className="stack">
      <header>
        <p className="kicker">Homework · 숙제</p>
        <h2 className="page-title">{enrollment.enrolled && courseName ? courseName : 'Homework'}</h2>
        <p className="lede">
          {blocked ? 'Practice stays open. Homework files stay closed.' : 'Open a file to read it or save it on your phone.'}
        </p>
      </header>

      {!enrollment.enrolled ? (
        <ClassLocked
          kicker="Homework"
          title="Code required"
          detail="Homework unlocks with a class access code."
          inputId="homework-access-code"
          error={gateError}
        />
      ) : blocked ? (
        <section className="card">
          <p className="kicker">8-week course</p>
          <h2>Homework</h2>
          <p className="lede homework-closed">{blocked}</p>
        </section>
      ) : loading ? (
        <p className="tiny">Loading…</p>
      ) : error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : (
        weeks.map((week) => (
          <section key={week.week} className="week-block" aria-label={`Week ${week.week}`}>
            <h2 className="section-title">Week {week.week}</h2>
            {week.items.length === 0 ? (
              <p className="tiny week-empty">Nothing yet.</p>
            ) : (
              week.items.map((item) => (
                <article key={item.id} className="card homework-card">
                  <h2>{item.title}</h2>
                  {item.dueDate ? <p className="tiny">Due {formatExpiry(item.dueDate)}</p> : null}
                  <p className="notice-body">{item.instructions}</p>
                  {item.files.length > 0 ? (
                    <div className="file-list">
                      {item.files.map((file) => (
                        <a key={file.id} className="file-link" href={file.href} target="_blank" rel="noreferrer">
                          <span>
                            <strong>{file.name}</strong>
                            <span className="tiny">
                              {file.kind} · {formatSize(file.size)} · Open
                            </span>
                          </span>
                          <span className="material-kind">{file.kind}</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="tiny">No file on this one yet.</p>
                  )}
                </article>
              ))
            )}
          </section>
        ))
      )}
    </div>
  )
}
