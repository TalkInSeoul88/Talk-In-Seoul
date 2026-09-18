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

export default function SyllablePractice() {
  const { enrollment } = useEnrollment()
  const enrolled = enrollment.enrolled
  const [row, setRow] = useState<string | null>(null)
  const [focusId, setFocusId] = useState<string | null>(null)

  const showingGaHa = !enrolled || !row
  const items = useMemo(
    () => (showingGaHa ? syllablesForVowel('ㅏ') : syllablesForInitial(row ?? 'ㄱ')),
    [showingGaHa, row],
  )

  useEffect(() => {
    if (!focusId) return
    const node = document.getElementById(`clip-${focusId}`)
    node?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [focusId, items])

  function selectCell(syllable: CvSyllable) {
    setFocusId(syllable.audioId)
    if (!enrolled) {
      setRow(null)
      return
    }
    setRow(isFreeCvSyllable(syllable) ? null : syllable.initial)
  }

  return (
    <section className="card syllable-card">
      <h2>음절(syllables)</h2>
      <p className="syllable-focus">
        {showingGaHa ? '가–하' : `${row}`}
        {enrolled && row ? (
          <>
            {' '}
            <button type="button" className="text-btn quiet" onClick={() => setRow(null)}>
              가–하
            </button>
          </>
        ) : null}
      </p>

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

      <div className="syllable-map">
        {!enrolled && (
          <div className="unlock-bar">
            <p className="tiny">Access code needed</p>
            <UnlockControl />
          </div>
        )}
        <div className="cv-chart-wrap">
          <table className="cv-chart">
            <caption className="sr-only">
              Basic CV syllable chart. Tap 가–하 to practice. Other cells need a class code until
              you unlock.
            </caption>
            <thead>
              <tr>
                <th scope="col" className="cv-axis">
                  <span className="sr-only">자음(consonants)</span>
                </th>
                {BASIC_VOWELS.map((jamo) => (
                  <th key={jamo.char} scope="col" className={jamo.char === 'ㅏ' ? 'cv-axis on' : 'cv-axis'}>
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
                    const free = isFreeCvSyllable(syllable)
                    const locked = !enrolled && !free
                    const inLine = showingGaHa ? free : syllable.initial === row
                    return (
                      <td key={syllable.char}>
                        <button
                          type="button"
                          className={`cv-cell${inLine ? ' in-line' : ''}${
                            focusId === syllable.audioId ? ' on' : ''
                          }${enrolled ? '' : free ? ' free' : ' locked'}`}
                          aria-current={focusId === syllable.audioId ? 'true' : undefined}
                          aria-label={`${syllable.char} ${syllable.roman}${
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
      </div>
    </section>
  )
}
