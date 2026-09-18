import { useEffect, useMemo, useState } from 'react'
import {
  BASIC_CONSONANTS,
  BASIC_VOWELS,
  syllablesForInitial,
  syllablesForVowel,
  type CvSyllable,
} from '../data/content'
import { useEnrollment } from '../lib/enrollment.tsx'
import JamoListenRow from './JamoListenRow'
import UnlockControl from './UnlockControl'

export default function SyllablePractice() {
  const { enrollment } = useEnrollment()
  const enrolled = enrollment.enrolled
  const [row, setRow] = useState<string | null>(null)
  const [focusId, setFocusId] = useState<string | null>(null)

  const showingGaHa = !row
  const items = useMemo(
    () => (showingGaHa ? syllablesForVowel('ㅏ') : syllablesForInitial(row ?? 'ㄱ')),
    [showingGaHa, row],
  )

  useEffect(() => {
    if (!focusId || !enrolled) return
    const node = document.getElementById(`clip-${focusId}`)
    node?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [focusId, items, enrolled])

  function selectCell(syllable: CvSyllable) {
    if (!enrolled) return
    setFocusId(syllable.audioId)
    setRow(syllable.vowel === 'ㅏ' ? null : syllable.initial)
  }

  return (
    <section className="card syllable-card">
      <h2>음절(syllables)</h2>

      {enrolled ? (
        <p className="syllable-focus">
          {showingGaHa ? '가–하' : row}
          {row ? (
            <>
              {' '}
              <button type="button" className="text-btn quiet" onClick={() => setRow(null)}>
                가–하
              </button>
            </>
          ) : null}
        </p>
      ) : (
        <div className="unlock-bar">
          <p className="tiny">Access code needed</p>
          <UnlockControl />
        </div>
      )}

      {enrolled && (
        <div className="jamo-list">
          {items.map((syllable) => (
            <JamoListenRow
              key={syllable.audioId}
              jamo={{
                char: syllable.char,
                roman: syllable.roman,
                audioId: syllable.audioId,
                nameKo: syllable.note,
              }}
            />
          ))}
        </div>
      )}

      <div className={enrolled ? 'syllable-map' : 'syllable-map locked-map'}>
        <div className="cv-chart-wrap">
          <table className="cv-chart">
            <caption className="sr-only">
              Basic CV syllable chart. Play and Record need a class access code.
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
                    className={enrolled && showingGaHa && jamo.char === 'ㅏ' ? 'cv-axis on' : 'cv-axis'}
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
                    className={enrolled && row === cons.char ? 'cv-axis on' : 'cv-axis'}
                  >
                    {cons.char}
                  </th>
                  {syllablesForInitial(cons.char).map((syllable) => {
                    const inLine = enrolled && (showingGaHa ? syllable.vowel === 'ㅏ' : syllable.initial === row)
                    return (
                      <td key={syllable.char}>
                        {enrolled ? (
                          <button
                            type="button"
                            className={`cv-cell${inLine ? ' in-line' : ''}${
                              focusId === syllable.audioId ? ' on' : ''
                            }`}
                            aria-current={focusId === syllable.audioId ? 'true' : undefined}
                            aria-label={`${syllable.char} ${syllable.roman}`}
                            onClick={() => selectCell(syllable)}
                          >
                            {syllable.char}
                          </button>
                        ) : (
                          <span className="cv-cell locked">{syllable.char}</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
