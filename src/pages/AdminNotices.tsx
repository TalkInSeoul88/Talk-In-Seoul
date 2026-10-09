import { useEffect, useState, type FormEvent } from 'react'
import AdminGate from '../components/AdminGate'
import { formatExpiry } from '../lib/enrollment.ts'
import { chicagoToday, readError } from '../lib/http.ts'

type Course = { id: string; name: string; weeks: number }
type Notice = {
  id: string
  title: string
  body: string
  date: string
  pinned: boolean
  courseId: string | null
}

const EMPTY = { title: '', body: '', date: chicagoToday(), pinned: false, courseId: '' }

export default function AdminNotices() {
  return <AdminGate>{(token) => <NoticesEditor token={token} />}</AdminGate>
}

function NoticesEditor({ token }: { token: string }) {
  const [courses, setCourses] = useState<Course[]>([])
  const [notices, setNotices] = useState<Notice[]>([])
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  async function load() {
    const response = await fetch('/api/admin/notices', { headers: { Authorization: `Bearer ${token}` } })
    if (response.status === 401) {
      setError('Unlock admin again.')
      return
    }
    if (!response.ok) throw new Error(await readError(response))
    const payload = (await response.json()) as { notices: Notice[]; courses: Course[] }
    setNotices(payload.notices)
    setCourses(payload.courses)
  }

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        await load()
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load notices.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // load uses the unlock token from this session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/notices', {
        method: editing ? 'PATCH' : 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editing,
          title: form.title,
          body: form.body,
          date: form.date,
          pinned: form.pinned,
          courseId: form.courseId || null,
        }),
      })
      if (!response.ok) {
        setError(await readError(response))
        return
      }
      setForm({ ...EMPTY, date: chicagoToday() })
      setEditing(null)
      await load()
    } catch {
      setError('Could not save that notice.')
    } finally {
      setBusy(false)
    }
  }

  function startEdit(notice: Notice) {
    setEditing(notice.id)
    setForm({
      title: notice.title,
      body: notice.body,
      date: notice.date,
      pinned: notice.pinned,
      courseId: notice.courseId || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function remove(notice: Notice) {
    if (!window.confirm('Delete this notice?')) return
    setError(null)
    const response = await fetch('/api/admin/notices', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: notice.id }),
    })
    if (!response.ok) {
      setError(await readError(response))
      return
    }
    if (editing === notice.id) {
      setEditing(null)
      setForm({ ...EMPTY, date: chicagoToday() })
    }
    await load()
  }

  const courseName = (id: string | null) => courses.find((item) => item.id === id)?.name || 'All students'

  return (
    <>
      <header>
        <p className="kicker">Notices</p>
        <h2 className="page-title">{editing ? 'Edit notice' : 'Post a notice'}</h2>
        <p className="lede">A short reminder for everyone, or for one class. Students see the newest first.</p>
      </header>
      <form className="card" onSubmit={(event) => void onSubmit(event)}>
        <label className="field">
          <span>Title</span>
          <input value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="Bring a pencil" />
        </label>
        <label className="field">
          <span>Message</span>
          <textarea
            value={form.body}
            onChange={(event) => update('body', event.target.value)}
            placeholder="Class is at 10. Please be on time."
          />
        </label>
        <label className="field">
          <span>Date</span>
          <input type="date" value={form.date} onChange={(event) => update('date', event.target.value)} required />
        </label>
        <label className="field">
          <span>Who sees it</span>
          <select value={form.courseId} onChange={(event) => update('courseId', event.target.value)}>
            <option value="">All students</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </label>
        <label className="check-row">
          <input type="checkbox" checked={form.pinned} onChange={(event) => update('pinned', event.target.checked)} />
          Pin to the top
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="btn" type="submit" disabled={busy || !form.title.trim() || !form.body.trim()}>
          {busy ? 'Saving…' : editing ? 'Save changes' : 'Post notice'}
        </button>
        {editing ? (
          <button
            className="btn secondary"
            type="button"
            onClick={() => {
              setEditing(null)
              setForm({ ...EMPTY, date: chicagoToday() })
            }}
          >
            Cancel
          </button>
        ) : null}
      </form>

      <section className="card">
        <h2>Posted</h2>
        {loading ? <p className="tiny">Loading…</p> : null}
        {!loading && notices.length === 0 ? <p className="tiny">No notices yet.</p> : null}
        <div className="code-list">
          {notices.map((notice) => (
            <article key={notice.id} className="code-card">
              <p className="tiny notice-meta">
                {notice.pinned ? <span className="pin-pill">Pinned</span> : null}
                <span>{formatExpiry(notice.date)}</span>
                <span>{courseName(notice.courseId)}</span>
              </p>
              <h2>{notice.title}</h2>
              <p className="notice-body">{notice.body}</p>
              <div className="action-row">
                <button className="btn secondary" type="button" onClick={() => startEdit(notice)}>
                  Edit
                </button>
                <button className="btn secondary" type="button" onClick={() => void remove(notice)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
