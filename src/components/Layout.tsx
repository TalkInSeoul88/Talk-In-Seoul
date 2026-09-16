import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home', ko: '홈', icon: HomeIcon },
  { to: '/lesson', label: 'Lesson', ko: '수업', icon: LessonIcon },
  { to: '/practice', label: 'Practice', ko: '연습', icon: PracticeIcon },
  { to: '/quiz', label: 'Quiz', ko: '퀴즈', icon: QuizIcon },
  { to: '/homework', label: 'Homework', ko: '숙제', icon: HomeworkIcon },
] as const

export default function Layout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="mark" aria-hidden="true">
          한
        </div>
        <div className="topbar-copy">
          <h1>Talk in Seoul</h1>
          <p>Hangul Class @ Pop In Seoul</p>
        </div>
      </header>
      <main className="page">
        <Outlet />
      </main>
      <nav className="bottom-nav" aria-label="Primary">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            <link.icon />
            <span className="nav-en">{link.label}</span>
            <span className="nav-ko">{link.ko}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6.5 10.5V20h11V10.5" />
    </svg>
  )
}

function LessonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 5.5h10.5A3.5 3.5 0 0 1 19 9v10.5H8.5A3.5 3.5 0 0 0 5 16V5.5Z" />
      <path d="M8 8h7M8 12h7" />
    </svg>
  )
}

function PracticeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 7.5v5l3 1.8" />
    </svg>
  )
}

function QuizIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8.5 9.2a3.5 3.5 0 1 1 5.4 2.95c-.9.6-1.4 1.2-1.4 2.35" />
      <path d="M12.5 17.8h.01" />
    </svg>
  )
}

function HomeworkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 4.5h8.5A2.5 2.5 0 0 1 19 7v12.5H8A3 3 0 0 1 5 16.5v-9A3 3 0 0 1 8 4.5Z" />
      <path d="M9 10.5h6M9 14h4" />
    </svg>
  )
}
