import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { TABS, tabForPath } from '../data/nav'
import { useEnrollment } from '../lib/enrollment.tsx'

export default function Layout() {
  const location = useLocation()
  const { enrollment } = useEnrollment()
  const current = tabForPath(location.pathname).id

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-copy">
          <h1>Talk in Seoul</h1>
          <p>
            Hangul Class @ Pop In Seoul
            {enrollment.enrolled && <span className="enrolled-pill">Enrolled</span>}
          </p>
        </div>
      </header>
      <nav className="desktop-nav" aria-label="Sections">
        {TABS.map((tab) => (
          <NavLink key={tab.id} to={tab.to} end={tab.to === '/'} className={current === tab.id ? 'tab active' : 'tab'}>
            <TabIcon id={tab.id} />
            <span>
              {tab.label} <span className="tab-ko">{tab.ko} ({tab.roman})</span>
            </span>
          </NavLink>
        ))}
      </nav>
      <main className="page">
        <Outlet />
      </main>
      <nav className="tabbar" aria-label="Sections">
        {TABS.map((tab) => (
          <NavLink key={tab.id} to={tab.to} end={tab.to === '/'} className={current === tab.id ? 'tab active' : 'tab'}>
            <TabIcon id={tab.id} />
            <span>{tab.label}</span>
            <span className="tab-ko">
              {tab.ko} ({tab.roman})
            </span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

function TabIcon({ id }: { id: string }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  if (id === 'home') {
    return (
      <svg {...common}>
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
      </svg>
    )
  }
  if (id === 'sounds') {
    return (
      <svg {...common}>
        <path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2" />
      </svg>
    )
  }
  if (id === 'talk') {
    return (
      <svg {...common}>
        <path d="M5 16.5V7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v6A2.5 2.5 0 0 1 16.5 16H9l-4 3.5z" />
      </svg>
    )
  }
  if (id === 'grammar') {
    return (
      <svg {...common}>
        <path d="M6 4.5h9.5A2.5 2.5 0 0 1 18 7v12.5H8.5A2.5 2.5 0 0 0 6 22z" />
        <path d="M6 4.5A2.5 2.5 0 0 0 8.5 7H18" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
    </svg>
  )
}
