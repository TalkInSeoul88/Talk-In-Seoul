import ClipRow from '../components/ClipRow'
import { NATIVE_NUMBERS, NUMBER_PATTERN, SINO_NUMBERS } from '../data/practice-sections.ts'

export default function Numbers() {
  return (
    <div className="stack">
      <header>
        <p className="kicker">Numbers · 숫자</p>
        <h2 className="page-title">숫자 (numbers)</h2>
        <p className="lede">Two sets. No class code needed.</p>
      </header>

      <section className="card">
        <h2>Two ways to count</h2>
        <p className="tiny" style={{ marginBottom: 0 }}>
          Korean has two number sets — native 하나 (hah-nah), 둘 (dool), 셋 (seht)… for counting things and
          age; and 일 (eel), 이 (ee), 삼 (sahm)… for prices, dates, phone numbers, minutes.
        </p>
      </section>

      <section className="card">
        <h2>Native · 1–10</h2>
        <p className="tiny">Counting things and age.</p>
        <div className="jamo-list">
          {NATIVE_NUMBERS.map((item) => (
            <ClipRow key={item.audioId} item={item} />
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Sino-Korean · 1–10</h2>
        <p className="tiny">Prices, dates, phone numbers, minutes.</p>
        <div className="jamo-list">
          {SINO_NUMBERS.map((item) => (
            <ClipRow key={item.audioId} item={item} />
          ))}
        </div>
      </section>

      <section className="card">
        <h2>The pattern</h2>
        <p className="callout">Tens digit + 십 (sheep) + ones digit.</p>
        <div className="jamo-list">
          {NUMBER_PATTERN.map((item) => (
            <ClipRow key={item.audioId} item={item} />
          ))}
        </div>
      </section>
    </div>
  )
}
