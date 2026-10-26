import ClipRow from '../components/ClipRow'
import { CONVERSATION_PHRASES, EVERYDAY_PHRASES, type SpokenItem } from '../data/practice-sections.ts'

function PhraseRows({ items }: { items: SpokenItem[] }) {
  if (items.length === 0) return <p className="muted">Phrases coming.</p>
  return (
    <div className="jamo-list">
      {items.map((item) => (
        <ClipRow key={item.audioId} item={item} />
      ))}
    </div>
  )
}

export default function Conversation() {
  return (
    <div className="stack">
      <header>
        <p className="kicker">Simple Free Conversation · 대화</p>
        <h2 className="page-title">꼭 필요한 대화</h2>
        <p className="lede">Fifteen phrases you can use right away. No class code needed.</p>
      </header>

      <nav className="seg" aria-label="Conversation sections">
        <a className="seg-btn" href="#essential">
          꼭 필요한 대화
          <span className="seg-sub">Essential</span>
        </a>
        <a className="seg-btn" href="#everyday">
          일상 대화
          <span className="seg-sub">Everyday</span>
        </a>
      </nav>

      <section className="card" id="essential">
        <h2>Say it</h2>
        <p className="tiny">Play Jung, then Record yourself.</p>
        <PhraseRows items={CONVERSATION_PHRASES} />
      </section>

      <section className="card" id="everyday">
        <h2>일상 대화</h2>
        <p className="tiny">Everyday conversation. Play Jung, then Record yourself.</p>
        <PhraseRows items={EVERYDAY_PHRASES} />
      </section>
    </div>
  )
}
