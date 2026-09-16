import JamoListenRow from '../components/JamoListenRow'
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
      <header className="page-header">
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
        <p className="muted mt-0">
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
        <h2>Listen along · 따라 하기</h2>
        <p className="tiny">
          Tap <strong>Play</strong> to hear the teacher, say it out loud, then optionally{' '}
          <strong>Record</strong> yourself. Clips stay on this phone only.
        </p>
        <p className="tiny">
          Vowel clips are Jung’s voice. Consonant audio is next — those rows show “Audio coming soon” until files are
          added in <code>public/audio/</code>.
        </p>
      </section>

      <section className="card">
        <h2>Basic vowels · 기본 모음</h2>
        <p className="tiny">Vertical vowels (ㅏ ㅓ ㅣ) sit to the right. Horizontal vowels (ㅗ ㅜ ㅡ) sit below.</p>
        <div className="jamo-list">
          {BASIC_VOWELS.map((jamo) => (
            <JamoListenRow key={jamo.char} jamo={jamo} />
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Basic consonants · 기본 자음</h2>
        <p className="tiny">
          Fourteen plain consonants. Teacher audio for these is next — you’ll see “Audio coming soon” until the files
          are added.
        </p>
        <div className="jamo-list">
          {BASIC_CONSONANTS.map((jamo) => (
            <JamoListenRow key={jamo.char} jamo={jamo} />
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Simple syllables · 쉬운 음절</h2>
        <p className="tiny">Read the block as one beat: consonant, then vowel.</p>
        <div className="syllable-row">
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
