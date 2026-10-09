import { useCallback, useEffect, useState } from 'react'

export const ADMIN_TOKEN_KEY = 'talk-in-seoul:admin-token'
const LOCK_EVENT = 'talk-admin-lock'

export function lockAdmin() {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY)
  window.dispatchEvent(new Event(LOCK_EVENT))
  if (window.location.pathname !== '/admin') {
    window.location.assign('/admin')
  }
}

export function useAdminToken() {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(ADMIN_TOKEN_KEY))

  useEffect(() => {
    function onLock() {
      setToken(null)
    }
    window.addEventListener(LOCK_EVENT, onLock)
    return () => window.removeEventListener(LOCK_EVENT, onLock)
  }, [])

  const save = useCallback((next: string | null) => {
    if (next) sessionStorage.setItem(ADMIN_TOKEN_KEY, next)
    else sessionStorage.removeItem(ADMIN_TOKEN_KEY)
    setToken(next)
  }, [])

  return [token, save] as const
}
