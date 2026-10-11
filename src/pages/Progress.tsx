import { useEffect, useState } from 'react'
import ClassLocked from '../components/ClassLocked'
import { useEnrollment } from '../lib/enrollment.tsx'
import { readError } from '../lib/http.ts'

type Step = {
  id: string
  title: string
  learn: string
  covered: boolean
  reviewed: boolean
  count: string
}

type ProgressPayload = {
  course: { id: string; name: string } | null
  classTitle: string | null
  steps: Step[]
  reviewedCount: number
  total: number
}

export default function Progress() {
  const { enrollment, clear } = useEnrollment()
  const [payload, setPayload] = useState<ProgressPayload | null>(null)
  const [loading, setLoading] = useState(enrollment.enrolled)
  const [error, setError] = useState<string | null>(null)
  const [gateError, setGateError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    if (!enrollment.enrolled || !enrollment.code) return
    const code = enrollment.code
    let cancelled = false
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/class/notices?progress=1', { headers: { 'X-Access-Code': code } })
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
        setPayload((await response.json()) as ProgressPayload)
        setGateError(null)
      } catch {
        if (!cancelled) setError('Could not load progress. Check wifi, then try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [enrollment.enrolled, enrollment.code, clear])

  async function toggle(step: Step) {
    if (!enrollment.code || busyId) return
    const code = enrollment.code
    setBusyId(step.id)
    setError(null)
    try {
      const response = await fetch('/api/class/notices?progress=1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Access-Code': code },
        body: JSON.stringify({ stepId: step.id, done: !step.reviewed }),
      })
      if (response.status === 401) {
        setGateError(await readError(response))
        clear()
        return
      }
      if (!response.ok) {
        setError(await readError(response))
        return
      }
      setPayload((await response.json()) as ProgressPayload)
    } catch {
      setError('Could not save that check. Try again.')
    } finally {
      setBusyId(null)
    }
  }

  const total = payload?.total ?? 0
  const reviewedCount = payload?.reviewedCount ?? 0
  const complete = total > 0 && reviewedCount === total

  return (
    <div className="stack">
      <header>
        <p className="kicker">My Progress · 진도</p>
        <h2 className="page-title">{payload?.course?.name || 'My Progress'}</h2>
        <p className="lede">Class progress is what Jung covered. My review is what you practiced.</p>
      </header>

      {!enrollment.enrolled ? (
        <ClassLocked
          kicker="My Progress"
          title="Code required"
          detail="Any class code works, including a taste-class code."
          inputId="progress-access-code"
          error={gateError}
        />
      ) : loading ? (
        <p className="tiny">Loading…</p>
      ) : error && !payload ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : (
        <>
          <section className="card">
            <p className="kicker">Class progress</p>
            <h2>{payload?.classTitle ? `Class is at ${payload.classTitle}` : 'Not marked yet'}</h2>
            <p className="tiny" style={{ marginBottom: 0 }}>
              A filled dot means Covered in class. You cannot change this.
            </p>
          </section>

          <section className="card">
            <p className="kicker">My review</p>
            <p className="progress-total">
              {reviewedCount} of {total} done
            </p>
            <div
              className="progress-bar"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={reviewedCount}
              aria-label={`${reviewedCount} of ${total} done`}
            >
              <span style={{ width: total ? `${(reviewedCount / total) * 100}%` : '0%' }} />
            </div>
            {complete ? (
              <p className="progress-celebrate" role="status">
                All {total} done. Nice work.
              </p>
            ) : null}
          </section>

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          {total === 0 ? (
            <section className="card">
              <h2>Not ready yet</h2>
              <p className="tiny" style={{ marginBottom: 0 }}>
                This class does not have a progress list yet.
              </p>
            </section>
          ) : (
            <ol className="review-list">
              {(payload?.steps ?? []).map((step) => (
                <li key={step.id} className={step.covered ? 'review-step is-covered' : 'review-step'}>
                  <span className="class-dot" title={step.covered ? 'Covered in class' : 'Not covered yet'} />
                  <div className="review-copy">
                    <h2>{step.title}</h2>
                    <p className="review-learn">{step.learn}</p>
                    <p className="review-count">{step.count}</p>
                    <p className="class-badge">{step.covered ? 'Covered in class' : 'Not covered yet'}</p>
                  </div>
                  <button
                    type="button"
                    className={step.reviewed ? 'review-check is-on' : 'review-check'}
                    aria-pressed={step.reviewed}
                    aria-label={`My review, ${step.title}`}
                    disabled={busyId === step.id}
                    onClick={() => void toggle(step)}
                  >
                    {step.reviewed ? <CheckIcon /> : null}
                    <span className="review-check-label">My review</span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </div>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
      <path d="M5 12.5l4.2 4.2L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
