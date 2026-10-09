import { useEffect, useMemo, useState, type FormEvent } from 'react'
import AdminNav from '../components/AdminNav'
import { useAdminToken } from '../lib/admin-session.ts'

type CodeRow = {
  code: string
  expiresAt: string
  active: boolean
  createdAt: string
  status: 'active' | 'stopped' | 'expired'
}

function todayPlus(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDay(value: string): string {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return value
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

async function parseError(response: Response): Promise<string> {
  const text = await response.text()
  try {
    const payload = JSON.parse(text) as { error?: string }
    if (payload.error) return payload.error
  } catch {
    /* not JSON */
  }
  if (text.includes('FUNCTION_INVOCATION_FAILED')) {
    return 'The login server crashed. After the API fix is deployed, try again.'
  }
  return `Something went wrong (${response.status}).`
}

export default function Admin() {
  const [token, setToken] = useAdminToken()
  const [password, setPassword] = useState('')
  const [unlockError, setUnlockError] = useState<string | null>(null)
  const [unlocking, setUnlocking] = useState(false)

  const [codes, setCodes] = useState<CodeRow[]>([])
  const [listError, setListError] = useState<string | null>(null)
  const [loadingList, setLoadingList] = useState(() => Boolean(token))

  const [newCode, setNewCode] = useState('')
  const [expiresAt, setExpiresAt] = useState(() => todayPlus(90))
  const [createError, setCreateError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [busyCode, setBusyCode] = useState<string | null>(null)
  const [expiryDrafts, setExpiryDrafts] = useState<Record<string, string>>({})
  const [expiryBusy, setExpiryBusy] = useState<string | null>(null)
  const [expiryErrors, setExpiryErrors] = useState<Record<string, string>>({})
  const [savedExpiry, setSavedExpiry] = useState<string | null>(null)
  const [deletingCode, setDeletingCode] = useState<string | null>(null)

  const headers = useMemo(() => {
    const value: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) value.Authorization = `Bearer ${token}`
    return value
  }, [token])

  async function loadCodes(nextToken = token) {
    if (!nextToken) return
    setLoadingList(true)
    setListError(null)
    try {
      const response = await fetch('/api/admin/codes', {
        headers: { Authorization: `Bearer ${nextToken}` },
      })
      if (response.status === 401) {
        setToken(null)
        return
      }
      if (!response.ok) {
        setListError(await parseError(response))
        return
      }
      const payload = (await response.json()) as { codes: CodeRow[] }
      setCodes(payload.codes)
    } catch {
      setListError('Could not load codes. Check wifi, then try again.')
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    if (!token) return
    const nextToken = token
    let cancelled = false
    void (async () => {
      try {
        const response = await fetch('/api/admin/codes', {
          headers: { Authorization: `Bearer ${nextToken}` },
        })
        if (cancelled) return
        if (response.status === 401) {
          setToken(null)
          return
        }
        if (!response.ok) {
          setListError(await parseError(response))
          return
        }
        const payload = (await response.json()) as { codes: CodeRow[] }
        setCodes(payload.codes)
      } catch {
        if (!cancelled) setListError('Could not load codes. Check wifi, then try again.')
      } finally {
        if (!cancelled) setLoadingList(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token, setToken])

  async function unlock(event: FormEvent) {
    event.preventDefault()
    setUnlocking(true)
    setUnlockError(null)
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const payload = (await response.json()) as { token?: string; error?: string }
      if (!response.ok || !payload.token) {
        setUnlockError(payload.error || 'Could not unlock admin.')
        return
      }
      setLoadingList(true)
      setToken(payload.token)
      setPassword('')
    } catch {
      setUnlockError('Could not reach the server.')
    } finally {
      setUnlocking(false)
    }
  }

  async function createCode(event: FormEvent) {
    event.preventDefault()
    setCreating(true)
    setCreateError(null)
    try {
      const response = await fetch('/api/admin/codes', {
        method: 'POST',
        headers,
        body: JSON.stringify({ code: newCode, expiresAt }),
      })
      if (response.status === 401) {
        setToken(null)
        return
      }
      if (!response.ok) {
        setCreateError(await parseError(response))
        return
      }
      setNewCode('')
      await loadCodes()
    } catch {
      setCreateError('Could not save that code.')
    } finally {
      setCreating(false)
    }
  }

  async function saveExpiry(code: string, expiresAt: string) {
    if (!expiresAt) return
    setExpiryBusy(code)
    setExpiryErrors((current) => {
      if (!current[code]) return current
      const next = { ...current }
      delete next[code]
      return next
    })
    setSavedExpiry((current) => (current === code ? null : current))
    try {
      const response = await fetch('/api/admin/codes', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ code, expiresAt }),
      })
      if (response.status === 401) {
        setToken(null)
        return
      }
      if (!response.ok) {
        const message = await parseError(response)
        setExpiryErrors((current) => ({ ...current, [code]: message }))
        return
      }
      setExpiryDrafts((current) => {
        if (!(code in current)) return current
        const next = { ...current }
        delete next[code]
        return next
      })
      setSavedExpiry(code)
      await loadCodes()
    } catch {
      setExpiryErrors((current) => ({ ...current, [code]: 'Could not save that date.' }))
    } finally {
      setExpiryBusy(null)
    }
  }

  async function setActive(code: string, active: boolean) {
    setBusyCode(code)
    setListError(null)
    try {
      const response = await fetch('/api/admin/codes', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ code, active }),
      })
      if (response.status === 401) {
        setToken(null)
        return
      }
      if (!response.ok) {
        setListError(await parseError(response))
        return
      }
      await loadCodes()
    } catch {
      setListError('Could not update that code.')
    } finally {
      setBusyCode(null)
    }
  }

  async function deleteCode(code: string) {
    const confirmed = window.confirm(`Delete code ${code}? Students using it will lose access.`)
    if (!confirmed) return
    setDeletingCode(code)
    setListError(null)
    try {
      const response = await fetch('/api/admin/codes', {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ code }),
      })
      if (response.status === 401) {
        setToken(null)
        return
      }
      if (!response.ok) {
        setListError(await parseError(response))
        return
      }
      setExpiryDrafts((current) => {
        if (!(code in current)) return current
        const next = { ...current }
        delete next[code]
        return next
      })
      setExpiryErrors((current) => {
        if (!current[code]) return current
        const next = { ...current }
        delete next[code]
        return next
      })
      setSavedExpiry((current) => (current === code ? null : current))
      await loadCodes()
    } catch {
      setListError('Could not delete that code.')
    } finally {
      setDeletingCode(null)
    }
  }

  function lock() {
    setToken(null)
    setCodes([])
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-copy">
          <h1>Talk in Seoul · Admin</h1>
          <p>Hidden store tool · not in the student menu</p>
        </div>
      </header>
      <main className="page">
        <div className="stack">
          {!token ? (
            <>
              <header>
                <p className="kicker">Jung only</p>
                <h2 className="page-title">Unlock admin</h2>
                <p className="lede">
                  Issue class codes, set an expiry, then start or stop them. Students enter a code on
                  Home — no account.
                </p>
              </header>
              <form className="card" onSubmit={(event) => void unlock(event)}>
                <label className="field">
                  <span>Admin password</span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password from Vercel env"
                  />
                </label>
                {unlockError && (
                  <p className="form-error" role="alert">
                    {unlockError}
                  </p>
                )}
                <button className="btn" type="submit" disabled={unlocking || !password}>
                  {unlocking ? 'Unlocking…' : 'Unlock'}
                </button>
              </form>
            </>
          ) : (
            <>
              <AdminNav />
              <header>
                <p className="kicker">Access codes</p>
                <h2 className="page-title">Issue a class code</h2>
                <p className="lede">
                  Three fields only: the code, the expiry, then On or Off. On a code already issued, pick a
                  new date and tap Save date.
                </p>
              </header>

              <form className="card" onSubmit={(event) => void createCode(event)}>
                <label className="field">
                  <span>Code</span>
                  <input
                    value={newCode}
                    onChange={(event) => setNewCode(event.target.value)}
                    autoCapitalize="characters"
                    autoCorrect="off"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="Leave blank to auto-make one"
                  />
                </label>
                <label className="field">
                  <span>Expiry date</span>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(event) => setExpiresAt(event.target.value)}
                    required
                  />
                </label>
                {createError && (
                  <p className="form-error" role="alert">
                    {createError}
                  </p>
                )}
                <button className="btn" type="submit" disabled={creating}>
                  {creating ? 'Saving…' : 'Create code'}
                </button>
              </form>

              <section className="card">
                <div className="edit-row">
                  <h2>Issued codes</h2>
                  <button type="button" className="text-btn" onClick={lock}>
                    Lock
                  </button>
                </div>
                {listError && (
                  <p className="form-error" role="alert">
                    {listError}
                  </p>
                )}
                {loadingList && codes.length === 0 ? (
                  <p className="tiny">Loading…</p>
                ) : codes.length === 0 ? (
                  <p className="tiny" style={{ marginBottom: 0 }}>
                    No codes yet. Create one above and give it to the class.
                  </p>
                ) : (
                  <div className="code-list">
                    {codes.map((item) => {
                      const draft = expiryDrafts[item.code] ?? item.expiresAt
                      const dirty = draft !== item.expiresAt
                      const rowBusy = busyCode === item.code || expiryBusy === item.code || deletingCode === item.code
                      const justSaved = savedExpiry === item.code && !dirty
                      return (
                        <article key={item.code} className="code-card">
                          <div className="code-head">
                            <p className="code-value">{item.code}</p>
                            <button
                              type="button"
                              className="trash-btn"
                              aria-label={`Delete code ${item.code}`}
                              disabled={rowBusy}
                              onClick={() => void deleteCode(item.code)}
                            >
                              <TrashIcon />
                            </button>
                          </div>
                          <p className="tiny">
                            Through {formatDay(item.expiresAt)} ·{' '}
                            {item.status === 'active'
                              ? 'Active'
                              : item.status === 'expired'
                                ? 'Expired'
                                : 'Stopped'}
                          </p>
                          <label className="field code-expiry">
                            <span>Expiry date</span>
                            <input
                              type="date"
                              value={draft}
                              disabled={rowBusy}
                              aria-label={`Expiry date for ${item.code}`}
                              onChange={(event) => {
                                const next = event.target.value
                                setSavedExpiry((current) => (current === item.code ? null : current))
                                setExpiryDrafts((current) => ({ ...current, [item.code]: next }))
                              }}
                            />
                          </label>
                          {expiryErrors[item.code] && (
                            <p className="form-error" role="alert">
                              {expiryErrors[item.code]}
                            </p>
                          )}
                          <button
                            type="button"
                            className={justSaved ? 'btn save-date is-saved' : 'btn save-date'}
                            disabled={rowBusy || !dirty || !draft}
                            onClick={() => void saveExpiry(item.code, draft)}
                          >
                            {expiryBusy === item.code ? 'Saving…' : justSaved ? 'Saved' : 'Save date'}
                          </button>
                          <div className="switch-row">
                            <button
                              type="button"
                              className={item.active && item.status !== 'expired' ? 'btn' : 'btn secondary'}
                              disabled={rowBusy}
                              onClick={() => void setActive(item.code, true)}
                            >
                              On
                            </button>
                            <button
                              type="button"
                              className={!item.active ? 'btn' : 'btn secondary'}
                              disabled={rowBusy}
                              onClick={() => void setActive(item.code, false)}
                            >
                              Off
                            </button>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" d="M4 7h16" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 7.5l.7 12a1.5 1.5 0 0 0 1.5 1.4h6.6a1.5 1.5 0 0 0 1.5-1.4l.7-12" />
      <path strokeLinecap="round" d="M10 11v6M14 11v6" />
    </svg>
  )
}
