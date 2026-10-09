import { NavLink } from 'react-router-dom'
import { lockAdmin } from '../lib/admin-session.ts'

const LINKS = [
  { to: '/admin', label: 'Codes', end: true },
  { to: '/admin/courses', label: 'Courses', end: false },
  { to: '/admin/notices', label: 'Notices', end: false },
  { to: '/admin/homework', label: 'Homework', end: false },
] as const

export default function AdminNav() {
  return (
    <nav className="admin-nav" aria-label="Admin">
      {LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) => (isActive ? 'active' : undefined)}
        >
          {link.label}
        </NavLink>
      ))}
      <button type="button" onClick={lockAdmin}>
        Lock
      </button>
    </nav>
  )
}
