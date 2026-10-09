import { useState, type FormEvent, type ReactNode } from 'react'
import AdminNav from './AdminNav'
import { useAdminToken } from '../lib/admin-session.ts'

export default function AdminGate({ children }: { children: (token: string) => ReactNode }) {
  const [token, setToken] = useAdminToken()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function unlock(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const payload = (await response.json()) as { token?: string; error?: string }
      if (!response.ok || !payload.token) {
        setError(payload.error || 'Could not unlock admin.')
        return
      }
      setToken(payload.token)
      setPassword('')
    } catch {
      setError('Could not reach the server.')
    } finally {
      setBusy(false)
    }
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
        {!token ? (
          <form className="card" onSubmit={(event) => void unlock(event)}>
            <p className="kicker">Jung only</p>
            <h2 className="page-title">Unlock admin</h2>
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
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="btn" type="submit" disabled={busy || !password}>
              {busy ? 'Unlocking…' : 'Unlock'}
            </button>
          </form>
        ) : (
          <div className="stack">
            <AdminNav />
            {children(token)}
          </div>
        )}
      </main>
    </div>
  )
}
