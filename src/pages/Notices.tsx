import { useEffect, useState } from 'react'
import ClassLocked from '../components/ClassLocked'
import { formatExpiry } from '../lib/enrollment.ts'
import { useEnrollment } from '../lib/enrollment.tsx'
import { readError } from '../lib/http.ts'

type Notice = {
  id: string
  title: string
  body: string
  date: string
  pinned: boolean
  audience: string
}

export default function Notices() {
  const { enrollment, clear } = useEnrollment()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(enrollment.enrolled)
  const [error, setError] = useState<string | null>(null)
  const [gateError, setGateError] = useState<string | null>(null)

  useEffect(() => {
    if (!enrollment.enrolled || !enrollment.code) return
    const code = enrollment.code
    let cancelled = false
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/class/notices', { headers: { 'X-Access-Code': code } })
        if (cancelled) return
        if (response.status === 401) {
          setGateError(await readError(response))
          clear()
          return
        }
        if (!response.ok) {
          setError(await readError(response))
          return
        }
        const payload = (await response.json()) as { notices: Notice[] }
        setNotices(payload.notices)
        setGateError(null)
      } catch {
        if (!cancelled) setError('Could not load notices. Check wifi, then try again.')
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
        <p className="kicker">Notices · 알림</p>
        <h2 className="page-title">Class notices</h2>
        <p className="lede">Reminders from Jung. Newest first. Pinned notes stay on top.</p>
      </header>

      {!enrollment.enrolled ? (
        <ClassLocked
          kicker="Notices"
          title="Code required"
          detail="Notices unlock with a class access code."
          inputId="notices-access-code"
          error={gateError}
        />
      ) : loading ? (
        <p className="tiny">Loading…</p>
      ) : error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : notices.length === 0 ? (
        <section className="card">
          <h2>No notices yet</h2>
          <p className="tiny" style={{ marginBottom: 0 }}>
            When Jung posts a reminder, it will show up here.
          </p>
        </section>
      ) : (
        notices.map((notice) => (
          <article key={notice.id} className="card notice-card">
            <p className="tiny notice-meta">
              {notice.pinned ? <span className="pin-pill">Pinned</span> : null}
              <span>{formatExpiry(notice.date)}</span>
              {notice.audience ? <span>{notice.audience}</span> : null}
            </p>
            <h2>{notice.title}</h2>
            <p className="notice-body">{notice.body}</p>
          </article>
        ))
      )}
    </div>
  )
}
