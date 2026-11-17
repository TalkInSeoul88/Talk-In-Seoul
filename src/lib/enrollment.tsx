import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import {
  FREE_ENROLLMENT,
  levelsFromRedeem,
  loadEnrollment,
  saveEnrollment,
  type Enrollment,
} from './enrollment.ts'

type RedeemOk = { enrolled: true; code: string; expiresAt: string; levels: string[] }
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
  let payload: { enrolled?: boolean; code?: string; expiresAt?: string; levels?: unknown; error?: string } = {}
  try {
    payload = (await response.json()) as typeof payload
  } catch {
    payload = {}
  }
  if (response.ok && payload.enrolled && payload.code) {
    return {
      enrolled: true,
      code: payload.code,
      expiresAt: payload.expiresAt || '',
      levels: levelsFromRedeem(payload.levels),
    }
  }
  return {
    ok: false,
    error: payload.error || 'Could not check that code.',
    drop: response.status >= 400 && response.status < 500,
  }
}

export function EnrollmentProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [enrollment, setEnrollment] = useState<Enrollment>(loadEnrollment)
  const [error, setError] = useState<string | null>(null)
  const codeRef = useRef(enrollment.code)

  const applyRedeem = useCallback((code: string, result: RedeemOk | RedeemFail) => {
    if (codeRef.current !== code) return
    if ('enrolled' in result) {
      const next = {
        enrolled: true as const,
        code: result.code,
        expiresAt: result.expiresAt,
        levels: result.levels,
      }
      codeRef.current = next.code
      saveEnrollment(next)
      setEnrollment(next)
      return
    }
    if (result.drop) {
      saveEnrollment(FREE_ENROLLMENT)
      setEnrollment(FREE_ENROLLMENT)
    }
  }, [])

  const refreshSaved = useCallback(() => {
    const saved = loadEnrollment()
    if (!saved.enrolled || !saved.code) return
    const code = saved.code
    void redeemRequest(code)
      .then((result) => applyRedeem(code, result))
      .catch(() => {
        /* Keep the last local enrollment if the class list is unreachable. */
      })
  }, [applyRedeem])

  useEffect(() => {
    refreshSaved()
  }, [location.pathname, refreshSaved])

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === 'visible') refreshSaved()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refreshSaved])

  const value = useMemo<EnrollmentContextValue>(
    () => ({
      enrollment,
      error,
      async redeem(code: string) {
        setError(null)
        try {
          const result = await redeemRequest(code)
          if ('enrolled' in result) {
            const next = {
              enrolled: true as const,
              code: result.code,
              expiresAt: result.expiresAt,
              levels: result.levels,
            }
            codeRef.current = next.code
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
        codeRef.current = null
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
