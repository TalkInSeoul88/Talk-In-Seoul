import { useEffect, useId, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { STUDENT_NAV } from '../data/nav'
import { useEnrollment } from '../lib/enrollment.tsx'

export default function Layout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { enrollment } = useEnrollment()
  const menuId = useId()
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const pathRef = useRef(location.pathname)

  useEffect(() => {
    if (pathRef.current === location.pathname) return
    pathRef.current = location.pathname
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  function closeMenu() {
    setOpen(false)
    menuButtonRef.current?.focus()
  }

  return (
    <div className={open ? 'app-shell menu-open' : 'app-shell'}>
      <header className="topbar">
        <button
          ref={menuButtonRef}
          type="button"
          className="menu-btn"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
        <div className="topbar-copy">
          <h1>Talk in Seoul</h1>
          <p>
            Hangul Class @ Pop In Seoul
            {enrollment.enrolled && <span className="enrolled-pill">Enrolled</span>}
          </p>
        </div>
      </header>

      <div
        className={open ? 'drawer-layer open' : 'drawer-layer'}
        inert={!open}
        aria-hidden={!open}
      >
        <button type="button" className="drawer-scrim" tabIndex={-1} onClick={closeMenu} aria-label="Close menu" />
        <nav id={menuId} className="drawer" aria-label="Student menu">
          {STUDENT_NAV.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => (isActive ? 'drawer-link active' : 'drawer-link')}
              onClick={() => setOpen(false)}
            >
              <strong>{link.label}</strong>
              <span>{link.ko}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <main className="page" inert={open}>
        <Outlet />
      </main>
    </div>
  )
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path d="M5 7h14M5 12h14M5 17h14" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  )
}
