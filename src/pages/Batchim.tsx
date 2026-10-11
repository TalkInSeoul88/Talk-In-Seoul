import ClipRow from '../components/ClipRow'
import { BATCHIM_WORDS } from '../data/practice-sections.ts'

export default function Batchim() {
  return (
    <div className="stack">
      <header>
        <p className="kicker">Bottom Sounds · 받침</p>
        <h2 className="page-title">받침 (batchim)</h2>
        <p className="lede">
          A bottom letter at the end of a block changes the ending sound. Coral syllables have that
          letter. No class code needed.
        </p>
      </header>

      <section className="card">
        <h2>20 easy words</h2>
        <p className="tiny">Ordered from 가. Tap Play when Jung’s clip is here, or Record yourself.</p>
        <div className="jamo-list">
          {BATCHIM_WORDS.map((item) => (
            <ClipRow key={item.audioId} item={item} markBatchim />
          ))}
        </div>
      </section>
    </div>
  )
}
