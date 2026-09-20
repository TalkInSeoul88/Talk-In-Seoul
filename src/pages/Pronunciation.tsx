import { useEffect, useState } from 'react'
import JamoListenRow from '../components/JamoListenRow'
import SyllablePractice from '../components/SyllablePractice'
import { BASIC_CONSONANTS, BASIC_VOWELS, DOUBLE_CONSONANTS, type Jamo } from '../data/content'
import { probeTeacherAudio, teacherAudioSrc } from '../lib/audio'

type Section = 'vowels' | 'consonants' | 'ssang' | 'syllables'
type ClipMode = 'checking' | 'ready' | 'soon'

const TABS: { id: Section; label: string; sub: string }[] = [
  { id: 'vowels', label: '모음', sub: '(vowels)' },
  { id: 'consonants', label: '자음', sub: '(consonants)' },
  { id: 'ssang', label: '쌍자음', sub: '(double consonants)' },
  { id: 'syllables', label: '음절', sub: '(syllables)' },
]

function useClipMode(items: Jamo[]): ClipMode {
  const [mode, setMode] = useState<ClipMode>('checking')

  useEffect(() => {
    let cancelled = false
    void Promise.all(items.map((jamo) => probeTeacherAudio(teacherAudioSrc(jamo)))).then((results) => {
      if (!cancelled) setMode(results.some(Boolean) ? 'ready' : 'soon')
    })
    return () => {
      cancelled = true
    }
  }, [items])

  return mode
}

function JamoPracticeSection({
  title,
  hint,
  items,
  mode,
}: {
  title: string
  hint: string
  items: Jamo[]
  mode: ClipMode
}) {
  if (mode === 'ready') {
    return (
      <section className="card">
        <h2>{title}</h2>
        <p className="tiny">{hint}</p>
        <div className="jamo-list">
          {items.map((jamo) => (
            <JamoListenRow key={jamo.char} jamo={jamo} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="card empty-card">
      <p className="kicker">{title}</p>
      <h2>Teacher audio coming soon</h2>
      <p className="muted">
        This section is ready for recording later. When Jung adds the MP3s, Play and Record will
        appear here — 모음(vowels) stay as they are.
      </p>
      <div className="jamo-grid" aria-label={title}>
        {items.map((jamo) => (
          <div key={jamo.char} className="jamo">
            <span className="glyph">{jamo.char}</span>
            <span className="roman">{jamo.roman}</span>
          </div>
        ))}
      </div>
      {mode === 'checking' && <p className="tiny">Checking for audio files…</p>}
    </section>
  )
}

export default function Pronunciation() {
  const [section, setSection] = useState<Section>('vowels')
  const consonantMode = useClipMode(BASIC_CONSONANTS)
  const ssangMode = useClipMode(DOUBLE_CONSONANTS)

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

      <div className="seg quad" role="tablist" aria-label="Pronunciation sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            className={section === tab.id ? 'seg-btn on' : 'seg-btn'}
            aria-selected={section === tab.id}
            onClick={() => setSection(tab.id)}
          >
            {tab.label}
            <span className="seg-sub">{tab.sub}</span>
          </button>
        ))}
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
      ) : section === 'consonants' ? (
        <JamoPracticeSection
          title="자음(consonants)"
          hint="Same Play / Record tools as 모음(vowels)."
          items={BASIC_CONSONANTS}
          mode={consonantMode}
        />
      ) : section === 'ssang' ? (
        <JamoPracticeSection
          title="쌍자음(double consonants)"
          hint="Same Play / Record tools as 자음(consonants). Free — no access code."
          items={DOUBLE_CONSONANTS}
          mode={ssangMode}
        />
      ) : (
        <SyllablePractice />
      )}
    </div>
  )
}
