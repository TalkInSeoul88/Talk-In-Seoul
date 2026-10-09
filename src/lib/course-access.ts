import { useEffect, useState } from 'react'
import { useEnrollment } from './enrollment.tsx'

export const COURSE_CLOSED = 'This is for 8-week course students. Ask Jung to join!'

export type CourseGate = 'loading' | 'open' | 'closed' | 'signed-out'

export function useCourseGate() {
  const { enrollment, clear } = useEnrollment()
  const [remote, setRemote] = useState<{ code: string; state: 'open' | 'closed' } | null>(null)

  useEffect(() => {
    if (!enrollment.enrolled || !enrollment.code) return
    const code = enrollment.code
    let cancelled = false
    void (async () => {
      try {
        const response = await fetch('/api/class/access', { headers: { 'X-Access-Code': code } })
        if (cancelled) return
        if (response.status === 401) {
          clear()
          return
        }
        if (!response.ok) {
          setRemote({ code, state: 'closed' })
          return
        }
        const payload = (await response.json()) as { courseAccess?: boolean }
        setRemote({ code, state: payload.courseAccess ? 'open' : 'closed' })
      } catch {
        if (!cancelled) setRemote({ code, state: 'closed' })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [enrollment.enrolled, enrollment.code, clear])

  if (!enrollment.enrolled || !enrollment.code) {
    return { state: 'signed-out' as CourseGate, enrolled: enrollment.enrolled, code: enrollment.code }
  }
  const state: CourseGate = remote?.code === enrollment.code ? remote.state : 'loading'
  return { state, enrolled: true, code: enrollment.code }
}
