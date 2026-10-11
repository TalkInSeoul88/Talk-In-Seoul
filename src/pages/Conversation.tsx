import ClipRow from '../components/ClipRow'
import { CONVERSATION_PHRASES } from '../data/practice-sections.ts'

export default function Conversation() {
  return (
    <div className="stack">
      <header>
        <p className="kicker">Simple Free Conversation · 대화</p>
        <h2 className="page-title">꼭 필요한 대화</h2>
        <p className="lede">Ten phrases you can use right away. No class code needed.</p>
      </header>

      <section className="card">
        <h2>Say it</h2>
        <p className="tiny">Play Jung, then Record yourself.</p>
        <div className="jamo-list">
          {CONVERSATION_PHRASES.map((item) => (
            <ClipRow key={item.audioId} item={item} />
          ))}
        </div>
      </section>
    </div>
  )
}