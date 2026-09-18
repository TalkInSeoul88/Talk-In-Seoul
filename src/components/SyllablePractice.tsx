import { useEffect, useMemo, useState } from 'react'
import {
  BASIC_CONSONANTS,
  BASIC_VOWELS,
  isFreeCvSyllable,
  syllablesForInitial,
  syllablesForVowel,
  type CvSyllable,
} from '../data/content'
import { useEnrollment } from '../lib/enrollment.tsx'
import JamoListenRow from './JamoListenRow'
import UnlockControl from './UnlockControl'

type BrowseBy = 'consonant' | 'vowel'

export default function SyllablePractice() {
  const { enrollment } = useEnrollment()
  const enrolled = enrollment.enrolled
  const [browseBy, setBrowseBy] = useState<BrowseBy>('vowel')
  const [initial, setInitial] = useState(BASIC_CONSONANTS[0]?.char ?? 'ㄱ')
  const [vowel, setVowel] = useState('ㅏ')
  const [focusId, setFocusId] = useState<string | null>(null)

  const items = useMemo(
    () => (browseBy === 'consonant' ? syllablesForInitial(initial) : syllablesForVowel(vowel)),
    [browseBy, initial, vowel],
  )

  const lockedVisible = !enrolled && items.some((item) => !isFreeCvSyllable(item))
  const showingFreeA = browseBy === 'vowel' && vowel === 'ㅏ'

  useEffect(() => {
    if (!focusId) return
    const node = document.getElementById(`clip-${focusId}`)
    node?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [focusId, items])

  function selectCell(syllable: CvSyllable) {
    setInitial(syllable.initial)
    setVowel(syllable.vowel)
    setFocusId(syllable.audioId)
    if (!enrolled && isFreeCvSyllable(syllable)) {
      setBrowseBy('vowel')
      return
    }
    if (!enrolled) setBrowseBy('consonant')
  }

  const axisLabel = browseBy === 'consonant' ? `Row ${initial}` : `Column ${vowel}`

  return (
    <section className="card syllable-card">
      <h2>음절(syllables)</h2>
      <p className="tiny">
        {enrolled
          ? 'Browse a 자음(consonants) row or a 모음(vowels) column. Play Jung’s voice, then Record.'
          : 'Start with 가–하. Play and Record those 14. The rest of the chart stays visible — Unlock with a class code to practice them.'}
      </p>

      <div className="seg" role="tablist" aria-label="Browse syllables by row or column">
        <button
          type="button"
          role="tab"
          className={browseBy === 'consonant' ? 'seg-btn on' : 'seg-btn'}
          aria-selected={browseBy === 'consonant'}
          onClick={() => setBrowseBy('consonant')}
        >
          By 자음(consonants)
        </button>
        <button
          type="button"
          role="tab"
          className={browseBy === 'vowel' ? 'seg-btn on' : 'seg-btn'}
          aria-selected={browseBy === 'vowel'}
          onClick={() => setBrowseBy('vowel')}
        >
          By 모음(vowels)
        </button>
      </div>

      <div
        className="letter-chips"
        role="group"
        aria-label={browseBy === 'consonant' ? 'Consonant rows' : 'Vowel columns'}
      >
        {browseBy === 'consonant'
          ? BASIC_CONSONANTS.map((jamo) => (
              <button
                key={jamo.char}
                type="button"
                className={initial === jamo.char ? 'letter-chip on' : 'letter-chip'}
                aria-pressed={initial === jamo.char}
                onClick={() => {
                  setInitial(jamo.char)
                  setFocusId(null)
                }}
              >
                {jamo.char}
              </button>
            ))
          : BASIC_VOWELS.map((jamo) => (
              <button
                key={jamo.char}
                type="button"
                className={vowel === jamo.char ? 'letter-chip on' : 'letter-chip'}
                aria-pressed={vowel === jamo.char}
                onClick={() => {
                  setVowel(jamo.char)
                  setFocusId(null)
                }}
              >
                {jamo.char}
              </button>
            ))}
      </div>

      <div className="cv-chart-wrap">
        <table className="cv-chart">
          <caption className="sr-only">
            Basic CV syllable chart. {axisLabel} is selected. Tap a cell to open that row or
            column.
          </caption>
          <thead>
            <tr>
              <th scope="col" className="cv-axis">
                <span className="sr-only">자음(consonants)</span>
              </th>
              {BASIC_VOWELS.map((jamo) => (
                <th
                  key={jamo.char}
                  scope="col"
                  className={
                    browseBy === 'vowel' && vowel === jamo.char ? 'cv-axis on' : 'cv-axis'
                  }
                >
                  {jamo.char}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BASIC_CONSONANTS.map((cons) => (
              <tr key={cons.char}>
                <th
                  scope="row"
                  className={
                    browseBy === 'consonant' && initial === cons.char ? 'cv-axis on' : 'cv-axis'
                  }
                >
                  {cons.char}
                </th>
                {syllablesForInitial(cons.char).map((syllable) => {
                  const inLine =
                    browseBy === 'consonant'
                      ? syllable.initial === initial
                      : syllable.vowel === vowel
                  const free = isFreeCvSyllable(syllable)
                  const locked = !enrolled && !free
                  return (
                    <td key={syllable.char}>
                      <button
                        type="button"
                        className={`cv-cell${inLine ? ' in-line' : ''}${
                          focusId === syllable.audioId ? ' on' : ''
                        }${enrolled ? '' : free ? ' free' : ' locked'}`}
                        aria-current={focusId === syllable.audioId ? 'true' : undefined}
                        aria-label={`${syllable.char} ${syllable.roman}, ${syllable.note}${
                          locked ? ', access code needed' : ''
                        }`}
                        onClick={() => selectCell(syllable)}
                      >
                        {syllable.char}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="tiny cv-chart-hint">
        {enrolled
          ? 'Chart: 가 → 히. Missing clips show “Audio coming soon”.'
          : '가–하 (the ㅏ column) are free. Other cells stay visible until you Unlock.'}
      </p>

      <h3 className="syllable-slice-title">
        {showingFreeA ? (
          enrolled ? (
            <>ㅏ column · 가–하</>
          ) : (
            <>가–하 · free 음절(syllables)</>
          )
        ) : browseBy === 'consonant' ? (
          <>
            {initial} row · {items.length} 음절(syllables)
          </>
        ) : (
          <>
            {vowel} column · {items.length} 음절(syllables)
          </>
        )}
      </h3>

      {lockedVisible && (
        <div className="unlock-bar">
          <p className="tiny">Access code needed</p>
          <UnlockControl />
        </div>
      )}

      <div className="jamo-list">
        {items.map((syllable) => {
          const locked = !enrolled && !isFreeCvSyllable(syllable)
          if (locked) {
            return (
              <article key={syllable.audioId} className="jamo-row locked-row" id={`clip-${syllable.audioId}`}>
                <div className="jamo-row-head">
                  <div className="jamo-row-glyph" aria-hidden="true">
                    {syllable.char}
                  </div>
                  <div className="jamo-row-copy">
                    <div className="jamo-row-title">
                      <strong>{syllable.roman}</strong>
                      <span className="tiny"> · {syllable.note}</span>
                    </div>
                  </div>
                </div>
              </article>
            )
          }
          return (
            <JamoListenRow
              key={syllable.audioId}
              jamo={{
                char: syllable.char,
                roman: syllable.roman,
                audioId: syllable.audioId,
                nameKo: syllable.note,
                cue: 'Play Jung, then Record and compare.',
              }}
            />
          )
        })}
      </div>
    </section>
  )
}
