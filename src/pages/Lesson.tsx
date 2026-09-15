import {
  BASIC_CONSONANTS,
  BASIC_VOWELS,
  SAMPLE_SYLLABLES,
  SAMPLE_WORDS,
  WEEK_1_LESSON,
} from '../data/content'

export default function Lesson() {
  return (
    <div className="stack">
      <header>
        <p className="kicker">
          {WEEK_1_LESSON.weekLabel} · {WEEK_1_LESSON.weekLabelKo}
        </p>
        <h2 className="page-title">
          {WEEK_1_LESSON.title} · {WEEK_1_LESSON.titleKo}
        </h2>
        <p className="lede">{WEEK_1_LESSON.summary}</p>
      </header>

      <section className="card">
        <h2>What is Hangul? · 한글이란?</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Hangul is the Korean alphabet, created in the 1440s under{' '}
          <strong>King Sejong the Great (세종대왕)</strong>. Letters are grouped into square{' '}
          <strong>syllable blocks</strong> — not written in a single line like English.
        </p>
        <div className="callout">
          A block is usually <strong>consonant + vowel</strong>, and sometimes a final consonant. Empty vowel spots
          use silent <strong>ㅇ</strong>, so 아 is just the sound “a”.
        </div>
      </section>

      <section className="card">
        <h2>Basic vowels · 기본 모음</h2>
        <p className="tiny">Vertical vowels (ㅏ ㅓ ㅣ) sit to the right. Horizontal vowels (ㅗ ㅜ ㅡ) sit below.</p>
        <div className="jamo-grid" style={{ marginTop: '0.7rem' }}>
          {BASIC_VOWELS.map((jamo) => (
            <div className="jamo" key={jamo.char}>
              <span className="glyph">{jamo.char}</span>
              <span className="roman">{jamo.roman}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Basic consonants · 기본 자음</h2>
        <p className="tiny">Fourteen plain consonants. Aspirated letters (ㅋ ㅌ ㅍ ㅊ) add an extra stroke of air.</p>
        <div className="jamo-grid" style={{ marginTop: '0.7rem' }}>
          {BASIC_CONSONANTS.map((jamo) => (
            <div className="jamo" key={jamo.char}>
              <span className="glyph">{jamo.char}</span>
              <span className="roman">{jamo.roman}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Simple syllables · 쉬운 음절</h2>
        <p className="tiny">Read the block as one beat: consonant, then vowel.</p>
        <div className="syllable-row" style={{ marginTop: '0.7rem' }}>
          {SAMPLE_SYLLABLES.map((item) => (
            <div className="syllable" key={item.char}>
              <div className="glyph">{item.char}</div>
              <div className="tiny">{item.roman}</div>
              <div className="tiny">{item.note}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Words to try · 단어</h2>
        <div className="word-list">
          {SAMPLE_WORDS.map((word) => (
            <div className="word" key={word.hangul}>
              <div className="hangul">{word.hangul}</div>
              <div>
                <div>
                  <strong>{word.roman}</strong>
                </div>
                <div className="tiny">{word.meaning}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
