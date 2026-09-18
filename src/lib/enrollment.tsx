import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  FREE_ENROLLMENT,
  loadEnrollment,
  saveEnrollment,
  type Enrollment,
} from './enrollment.ts'

type RedeemOk = { enrolled: true; code: string; expiresAt: string }
type RedeemFail = { ok: false; error: string; drop: boolean }

type EnrollmentContextValue = {
  enrollment: Enrollment
  error: string | null
  redeem: (code: string) => Promise<boolean>
  clear: () => void
}

const EnrollmentContext = createContext<EnrollmentContextValue | null>(null)

async function redeemRequest(code: string): Promise<RedeemOk | RedeemFail> {
  const response = await fetch('/api/access/redeem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  let payload: { enrolled?: boolean; code?: string; expiresAt?: string; error?: string } = {}
  try {
    payload = (await response.json()) as typeof payload
  } catch {
    payload = {}
  }
  if (response.ok && payload.enrolled && payload.code) {
    return { enrolled: true, code: payload.code, expiresAt: payload.expiresAt || '' }
  }
  return {
    ok: false,
    error: payload.error || 'Could not check that code.',
    drop: response.status >= 400 && response.status < 500,
  }
}

export function EnrollmentProvider({ children }: { children: ReactNode }) {
  const [enrollment, setEnrollment] = useState<Enrollment>(loadEnrollment)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const saved = loadEnrollment()
    if (!saved.enrolled || !saved.code) return
    const code = saved.code
    let cancelled = false
    void redeemRequest(code)
      .then((result) => {
        if (cancelled) return
        if ('enrolled' in result) {
          const next = { enrolled: true, code: result.code, expiresAt: result.expiresAt }
          saveEnrollment(next)
          setEnrollment(next)
          return
        }
        if (result.drop) {
          saveEnrollment(FREE_ENROLLMENT)
          setEnrollment(FREE_ENROLLMENT)
        }
      })
      .catch(() => {
        /* Keep the last local enrollment if the class list is unreachable. */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo<EnrollmentContextValue>(
    () => ({
      enrollment,
      error,
      async redeem(code: string) {
        setError(null)
        try {
          const result = await redeemRequest(code)
          if ('enrolled' in result) {
            const next = { enrolled: true, code: result.code, expiresAt: result.expiresAt }
            saveEnrollment(next)
            setEnrollment(next)
            return true
          }
          setError(result.error)
          return false
        } catch {
          setError('Could not reach the class list. Try again on wifi.')
          return false
        }
      },
      clear() {
        saveEnrollment(FREE_ENROLLMENT)
        setEnrollment(FREE_ENROLLMENT)
        setError(null)
      },
    }),
    [enrollment, error],
  )

  return <EnrollmentContext.Provider value={value}>{children}</EnrollmentContext.Provider>
}

export function useEnrollment(): EnrollmentContextValue {
  const value = useContext(EnrollmentContext)
  if (!value) throw new Error('useEnrollment must be used inside EnrollmentProvider')
  return value
}
