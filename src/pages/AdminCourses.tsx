import { useEffect, useState, type FormEvent } from 'react'
import AdminGate from '../components/AdminGate'
import { readError } from '../lib/http.ts'

type Course = { id: string; name: string; weeks: number }
type CodeRow = { code: string; status: string; expiresAt: string }

export default function AdminCourses() {
  return <AdminGate>{(token) => <CoursesEditor token={token} />}</AdminGate>
}

function CoursesEditor({ token }: { token: string }) {
  const [courses, setCourses] = useState<Course[]>([])
  const [codeCourses, setCodeCourses] = useState<Record<string, string>>({})
  const [codes, setCodes] = useState<CodeRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [weeks, setWeeks] = useState('8')
  const [creating, setCreating] = useState(false)

  async function load() {
    setError(null)
    const [courseRes, codeRes] = await Promise.all([
      fetch('/api/admin/courses', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/admin/codes', { headers: { Authorization: `Bearer ${token}` } }),
    ])
    if (courseRes.status === 401 || codeRes.status === 401) {
      setError('Unlock admin again.')
      return
    }
    if (!courseRes.ok) throw new Error(await readError(courseRes))
    if (!codeRes.ok) throw new Error(await readError(codeRes))
    const coursePayload = (await courseRes.json()) as { courses: Course[]; codeCourses: Record<string, string> }
    const codePayload = (await codeRes.json()) as { codes: CodeRow[] }
    setCourses(coursePayload.courses)
    setCodeCourses(coursePayload.codeCourses || {})
    setCodes(codePayload.codes)
  }

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        await load()
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load courses.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // token is stable for this unlock session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function createCourse(event: FormEvent) {
    event.preventDefault()
    setCreating(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, weeks: Number(weeks) }),
      })
      if (!response.ok) {
        setError(await readError(response))
        return
      }
      setName('')
      setWeeks('8')
      await load()
    } catch {
      setError('Could not save that course.')
    } finally {
      setCreating(false)
    }
  }

  async function saveCourse(course: Course, nextName: string, nextWeeks: string) {
    setError(null)
    const response = await fetch('/api/admin/courses', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: course.id, name: nextName, weeks: Number(nextWeeks) }),
    })
    if (!response.ok) {
      setError(await readError(response))
      return
    }
    await load()
  }

  async function removeCourse(course: Course) {
    if (!window.confirm(`Delete ${course.name}? Its homework and notices go away too.`)) return
    setError(null)
    const response = await fetch('/api/admin/courses', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: course.id }),
    })
    if (!response.ok) {
      setError(await readError(response))
      return
    }
    await load()
  }

  async function assign(code: string, courseId: string) {
    setError(null)
    const response = await fetch('/api/admin/courses', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, courseId: courseId || null }),
    })
    if (!response.ok) {
      setError(await readError(response))
      return
    }
    setCodeCourses((current) => {
      const next = { ...current }
      if (courseId) next[code] = courseId
      else delete next[code]
      return next
    })
  }

  return (
    <>
      <header>
        <p className="kicker">Courses</p>
        <h2 className="page-title">Classes</h2>
        <p className="lede">
          Beginner is ready with 8 weeks. Add Intermediate later, or change how many weeks a class has.
        </p>
      </header>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {loading ? <p className="tiny">Loading…</p> : null}

      <form className="card" onSubmit={(event) => void createCourse(event)}>
        <h2>New course</h2>
        <label className="field">
          <span>Name</span>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Intermediate" />
        </label>
        <label className="field">
          <span>Number of weeks</span>
          <input
            inputMode="numeric"
            value={weeks}
            onChange={(event) => setWeeks(event.target.value)}
            placeholder="8"
          />
        </label>
        <button className="btn" type="submit" disabled={creating || !name.trim()}>
          {creating ? 'Saving…' : 'Create course'}
        </button>
      </form>

      {courses.map((course) => (
        <CourseCard
          key={`${course.id}:${course.name}:${course.weeks}`}
          course={course}
          canDelete={courses.length > 1}
          onSave={saveCourse}
          onDelete={removeCourse}
        />
      ))}

      <section className="card">
        <h2>Which class is this code for?</h2>
        <p className="tiny">
          A code with no class sees Beginner. This does not change the code’s expiry.
        </p>
        {codes.length === 0 ? (
          <p className="tiny">No codes yet. Make one under Codes.</p>
        ) : (
          <div className="code-list">
            {codes.map((item) => (
              <label key={item.code} className="field">
                <span>
                  {item.code}{' '}
                  <span className="tiny">
                    {item.status === 'active' ? 'Active' : item.status === 'expired' ? 'Expired' : 'Stopped'}
                  </span>
                </span>
                <select
                  value={codeCourses[item.code] || ''}
                  onChange={(event) => void assign(item.code, event.target.value)}
                >
                  <option value="">Default · Beginner</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

function CourseCard({
  course,
  canDelete,
  onSave,
  onDelete,
}: {
  course: Course
  canDelete: boolean
  onSave: (course: Course, name: string, weeks: string) => Promise<void>
  onDelete: (course: Course) => Promise<void>
}) {
  const [name, setName] = useState(course.name)
  const [weeks, setWeeks] = useState(String(course.weeks))
  const [busy, setBusy] = useState(false)

  return (
    <form
      className="card"
      onSubmit={(event) => {
        event.preventDefault()
        setBusy(true)
        void onSave(course, name, weeks).finally(() => setBusy(false))
      }}
    >
      <h2>{course.name}</h2>
      <label className="field">
        <span>Name</span>
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label className="field">
        <span>Weeks</span>
        <input inputMode="numeric" value={weeks} onChange={(event) => setWeeks(event.target.value)} />
      </label>
      <div className="action-row">
        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save'}
        </button>
        <button className="btn secondary" type="button" disabled={!canDelete || busy} onClick={() => void onDelete(course)}>
          Delete
        </button>
      </div>
    </form>
  )
}
