import { useState, type FormEvent } from 'react'
import { formatExpiry } from '../lib/enrollment.ts'
import { useEnrollment } from '../lib/enrollment.tsx'

export default function AccessCodeCard() {
  const { enrollment, error, redeem, clear } = useEnrollment()
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)

  if (enrollment.enrolled) {
    return (
      <section className="card enrolled-card">
        <p className="kicker">Class access</p>
        <h2>You’re enrolled</h2>
        <p className="muted">
          Code <strong>{enrollment.code}</strong>
          {enrollment.expiresAt ? ` · through ${formatExpiry(enrollment.expiresAt)}` : ''}. This phone
          will remember it.
        </p>
        <button type="button" className="btn secondary" onClick={clear}>
          Use a different code
        </button>
      </section>
    )
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    await redeem(code)
    setBusy(false)
  }

  return (
    <section className="card">
      <p className="kicker">Class access</p>
      <h2>Have a code from class?</h2>
      <p className="tiny">
        Enter it once. No account. Without a code you can still use Home, 모음(vowels), and
        자음(consonants). 음절(syllables) unlock with this code.
      </p>
      <form className="access-form" onSubmit={(event) => void onSubmit(event)}>
        <label className="field">
          <span>Access code</span>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            autoCapitalize="characters"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            placeholder="POP-4K9P"
            inputMode="text"
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="btn" type="submit" disabled={busy || !code.trim()}>
          {busy ? 'Checking…' : 'Unlock class'}
        </button>
      </form>
    </section>
  )
}
