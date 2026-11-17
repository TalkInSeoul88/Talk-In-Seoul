import { Link } from 'react-router-dom'
import { SECTIONS, type SectionId } from '../data/nav'

export default function SectionPage({ id }: { id: SectionId }) {
  const section = SECTIONS[id]
  return (
    <div className="stack">
      <header>
        <p className="kicker">
          {section.label} · {section.ko} <span className="spoken">({section.roman})</span>
        </p>
        <h2 className="page-title">{section.label}</h2>
        <p className="lede">{section.lede}</p>
      </header>
      <nav className="home-links" aria-label={section.label}>
        {section.links.map((link) => (
          <Link key={link.to} className="home-link" to={link.to}>
            <span>
              <strong>
                {link.label} · {link.ko} ({link.roman})
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
