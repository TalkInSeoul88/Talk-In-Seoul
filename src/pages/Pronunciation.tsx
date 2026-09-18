import { useEffect, useState } from 'react'
import JamoListenRow from '../components/JamoListenRow'
import SyllablePractice from '../components/SyllablePractice'
import { BASIC_CONSONANTS, BASIC_VOWELS } from '../data/content'
import { probeTeacherAudio, teacherAudioSrc } from '../lib/audio'

type Section = 'vowels' | 'consonants' | 'syllables'
type ConsonantMode = 'checking' | 'ready' | 'soon'

export default function Pronunciation() {
  const [section, setSection] = useState<Section>('vowels')
  const [consonantMode, setConsonantMode] = useState<ConsonantMode>('checking')

  useEffect(() => {
    let cancelled = false
    void Promise.all(BASIC_CONSONANTS.map((jamo) => probeTeacherAudio(teacherAudioSrc(jamo)))).then(
      (results) => {
        if (!cancelled) setConsonantMode(results.some(Boolean) ? 'ready' : 'soon')
      },
    )
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="stack">
      <header>
        <p className="kicker">Pronunciation · 발음</p>
        <h2 className="page-title">Hear it, then say it back</h2>
        <p className="lede">
          Tap Play for Jung’s voice, then Record yourself. Clips stay on this phone — nothing is
          uploaded.
        </p>
      </header>

      <div className="seg triple" role="tablist" aria-label="Pronunciation sections">
        <button
          type="button"
          role="tab"
          className={section === 'vowels' ? 'seg-btn on' : 'seg-btn'}
          aria-selected={section === 'vowels'}
          onClick={() => setSection('vowels')}
        >
          모음
          <span className="seg-sub">(vowels)</span>
        </button>
        <button
          type="button"
          role="tab"
          className={section === 'consonants' ? 'seg-btn on' : 'seg-btn'}
          aria-selected={section === 'consonants'}
          onClick={() => setSection('consonants')}
        >
          자음
          <span className="seg-sub">(consonants)</span>
        </button>
        <button
          type="button"
          role="tab"
          className={section === 'syllables' ? 'seg-btn on' : 'seg-btn'}
          aria-selected={section === 'syllables'}
          onClick={() => setSection('syllables')}
        >
          음절
          <span className="seg-sub">(syllables)</span>
        </button>
      </div>

      {section === 'vowels' ? (
        <section className="card">
          <h2>모음(vowels)</h2>
          <p className="tiny">
            Vertical vowels (ㅏ ㅓ ㅣ) sit to the right. Horizontal vowels (ㅗ ㅜ ㅡ) sit below.
          </p>
          <div className="jamo-list">
            {BASIC_VOWELS.map((jamo) => (
              <JamoListenRow key={jamo.char} jamo={jamo} />
            ))}
          </div>
        </section>
      ) : section === 'syllables' ? (
        <SyllablePractice />
      ) : consonantMode === 'ready' ? (
        <section className="card">
          <h2>자음(consonants)</h2>
          <p className="tiny">Same Play / Record tools as 모음(vowels).</p>
          <div className="jamo-list">
            {BASIC_CONSONANTS.map((jamo) => (
              <JamoListenRow key={jamo.char} jamo={jamo} />
            ))}
          </div>
        </section>
      ) : (
        <section className="card empty-card">
          <p className="kicker">자음(consonants)</p>
          <h2>Teacher audio coming soon</h2>
          <p className="muted">
            This section is ready for recording later. When Jung adds the MP3s, Play and Record
            will appear here — 모음(vowels) stay as they are.
          </p>
          <div className="jamo-grid" aria-label="Basic consonants">
            {BASIC_CONSONANTS.map((jamo) => (
              <div key={jamo.char} className="jamo">
                <span className="glyph">{jamo.char}</span>
                <span className="roman">{jamo.roman}</span>
              </div>
            ))}
          </div>
          {consonantMode === 'checking' && <p className="tiny">Checking for audio files…</p>}
        </section>
      )}
    </div>
  )
}
