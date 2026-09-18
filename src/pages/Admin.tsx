import { useEffect, useMemo, useState, type FormEvent } from 'react'

type CodeRow = {
  code: string
  expiresAt: string
  active: boolean
  createdAt: string
  status: 'active' | 'stopped' | 'expired'
}

const TOKEN_KEY = 'talk-in-seoul:admin-token'

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
  try {
    const payload = (await response.json()) as { error?: string }
    return payload.error || `Something went wrong (${response.status}).`
  } catch {
    return `Something went wrong (${response.status}).`
  }
}

export default function Admin() {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(TOKEN_KEY))
  const [password, setPassword] = useState('')
  const [unlockError, setUnlockError] = useState<string | null>(null)
  const [unlocking, setUnlocking] = useState(false)

  const [codes, setCodes] = useState<CodeRow[]>([])
  const [listError, setListError] = useState<string | null>(null)
  const [loadingList, setLoadingList] = useState(() => Boolean(sessionStorage.getItem(TOKEN_KEY)))

  const [newCode, setNewCode] = useState('')
  const [expiresAt, setExpiresAt] = useState(() => todayPlus(90))
  const [createError, setCreateError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [busyCode, setBusyCode] = useState<string | null>(null)

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
        sessionStorage.removeItem(TOKEN_KEY)
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
          sessionStorage.removeItem(TOKEN_KEY)
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
  }, [token])

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
      sessionStorage.setItem(TOKEN_KEY, payload.token)
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
        sessionStorage.removeItem(TOKEN_KEY)
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
        sessionStorage.removeItem(TOKEN_KEY)
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

  function lock() {
    sessionStorage.removeItem(TOKEN_KEY)
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
              <header>
                <p className="kicker">Access codes</p>
                <h2 className="page-title">Issue a class code</h2>
                <p className="lede">Three fields only: the code, the expiry, then On or Off.</p>
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
                    {codes.map((item) => (
                      <article key={item.code} className="code-card">
                        <p className="code-value">{item.code}</p>
                        <p className="tiny">
                          Through {formatDay(item.expiresAt)} ·{' '}
                          {item.status === 'active'
                            ? 'Active'
                            : item.status === 'expired'
                              ? 'Expired'
                              : 'Stopped'}
                        </p>
                        <div className="switch-row">
                          <button
                            type="button"
                            className={item.active && item.status !== 'expired' ? 'btn' : 'btn secondary'}
                            disabled={busyCode === item.code}
                            onClick={() => void setActive(item.code, true)}
                          >
                            On
                          </button>
                          <button
                            type="button"
                            className={!item.active ? 'btn' : 'btn secondary'}
                            disabled={busyCode === item.code}
                            onClick={() => void setActive(item.code, false)}
                          >
                            Off
                          </button>
                        </div>
                      </article>
                    ))}
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
