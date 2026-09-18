import JamoListenRow from '../components/JamoListenRow'
import { BASIC_CONSONANTS, BASIC_VOWELS } from '../data/content'

export default function Pronunciation() {
  return (
    <div className="stack">
      <header>
        <p className="kicker">Pronunciation · 발음</p>
        <h2 className="page-title">Hear it, then say it back</h2>
        <p className="lede">
          Tap Play for Jung’s voice, then Record yourself. Clips stay on this phone — nothing is uploaded.
        </p>
      </header>

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
        <p className="tiny">Teacher audio for these is next — you’ll see “Audio coming soon” until the files are added.</p>
        <div className="jamo-list">
          {BASIC_CONSONANTS.map((jamo) => (
            <JamoListenRow key={jamo.char} jamo={jamo} />
          ))}
        </div>
      </section>
    </div>
  )
}
