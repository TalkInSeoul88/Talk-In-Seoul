import { useState, type FormEvent } from 'react'
import { useEnrollment } from '../lib/enrollment.tsx'

export default function UnlockControl() {
  const { redeem, error } = useEnrollment()
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    await redeem(code)
    setBusy(false)
  }

  if (!open) {
    return (
      <button type="button" className="text-btn" onClick={() => setOpen(true)}>
        Unlock
      </button>
    )
  }

  return (
    <form className="unlock-form" onSubmit={(event) => void onSubmit(event)}>
      <label className="sr-only" htmlFor="syllable-access-code">
        Access code
      </label>
      <input
        id="syllable-access-code"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        autoCapitalize="characters"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        placeholder="POP-4K9P"
        inputMode="text"
      />
      <button className="btn" type="submit" disabled={busy || !code.trim()}>
        {busy ? 'Checking…' : 'Unlock'}
      </button>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
