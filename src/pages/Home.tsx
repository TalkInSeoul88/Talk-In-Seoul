import { Link } from 'react-router-dom'
import AccessCodeCard from '../components/AccessCodeCard'
import { WEEK_1_LESSON } from '../data/content'
import { HOME_LINKS } from '../data/nav'

export default function Home() {
  return (
    <div className="stack">
      <header>
        <p className="kicker">
          {WEEK_1_LESSON.weekLabel} · {WEEK_1_LESSON.weekLabelKo}
        </p>
        <h2 className="page-title">Hangul basics this week</h2>
        <p className="lede">
          Listen to Jung’s vowels, flip the free 모음, 자음, and Easy 20 단어 cards, then check This Week
          for anything from class.
        </p>
      </header>

      <AccessCodeCard />

      <nav className="home-links" aria-label="This week">
        {HOME_LINKS.map((link) => (
          <Link key={link.to} className="home-link" to={link.to}>
            <span>
              <strong>
                {link.label} · {link.ko}
              </strong>
              <span className="tiny">{link.detail}</span>
            </span>
            <Chevron />
          </Link>
        ))}
      </nav>
    </div>
  )
}

function Chevron() {
  return (
    <svg className="home-link-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
