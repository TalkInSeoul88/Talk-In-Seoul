import { useEffect, useMemo, useState } from 'react'
import {
  BASIC_CONSONANTS,
  BASIC_VOWELS,
  syllablesForInitial,
  syllablesForVowel,
  type CvSyllable,
} from '../data/content'
import JamoListenRow from './JamoListenRow'

type BrowseBy = 'consonant' | 'vowel'

export default function SyllablePractice() {
  const [browseBy, setBrowseBy] = useState<BrowseBy>('consonant')
  const [initial, setInitial] = useState(BASIC_CONSONANTS[0]?.char ?? 'ㄱ')
  const [vowel, setVowel] = useState(BASIC_VOWELS[0]?.char ?? 'ㅏ')
  const [focusId, setFocusId] = useState<string | null>(null)

  const items = useMemo(
    () => (browseBy === 'consonant' ? syllablesForInitial(initial) : syllablesForVowel(vowel)),
    [browseBy, initial, vowel],
  )

  useEffect(() => {
    if (!focusId) return
    const node = document.getElementById(`clip-${focusId}`)
    node?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [focusId, items])

  function selectCell(syllable: CvSyllable) {
    setInitial(syllable.initial)
    setVowel(syllable.vowel)
    setFocusId(syllable.audioId)
  }

  const axisLabel = browseBy === 'consonant' ? `Row ${initial}` : `Column ${vowel}`

  return (
    <section className="card">
      <h2>음절(syllables)</h2>
      <p className="tiny">
        14 자음(consonants) × 10 모음(vowels) = 140 blocks. Browse a consonant row or a vowel
        column, then Play Jung’s voice and Record yourself — same tools as 모음(vowels).
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
                  return (
                    <td key={syllable.char}>
                      <button
                        type="button"
                        className={`cv-cell${inLine ? ' in-line' : ''}${
                          focusId === syllable.audioId ? ' on' : ''
                        }`}
                        aria-current={focusId === syllable.audioId ? 'true' : undefined}
                        aria-label={`${syllable.char} ${syllable.roman}, ${syllable.note}`}
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
        Chart: 가 → 히. Audio files are added later — missing clips show “Audio coming soon”.
      </p>

      <h3 className="syllable-slice-title">
        {browseBy === 'consonant' ? (
          <>
            {initial} row · {items.length} 음절(syllables)
          </>
        ) : (
          <>
            {vowel} column · {items.length} 음절(syllables)
          </>
        )}
      </h3>
      <div className="jamo-list">
        {items.map((syllable) => (
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
        ))}
      </div>
    </section>
  )
}
