import { useState } from 'react'
import JamoAudioBar from '../components/JamoAudioBar'
import { buildPracticeRound } from '../data/activities'

export default function Practice() {
  const [round, setRound] = useState(() => buildPracticeRound(10))
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const done = index >= round.length
  const current = round[index]

  function choose(option: string) {
    if (!current || picked) return
    setPicked(option)
    if (option === current.answer) setCorrectCount((value) => value + 1)
  }

  function next() {
    setPicked(null)
    setIndex((value) => value + 1)
  }

  function restart() {
    setRound(buildPracticeRound(10))
    setIndex(0)
    setPicked(null)
    setCorrectCount(0)
  }

  if (done) {
    return (
      <section className="card score-hero">
        <p className="kicker">Practice · 자모 연습</p>
        <p className="tiny">Round complete</p>
        <p className="big">
          {correctCount}/{round.length}
        </p>
        <p className="muted">Nice work. Run it again — the letters shuffle each time.</p>
        <button className="btn" type="button" onClick={restart}>
          Practice again · 다시 연습
        </button>
      </section>
    )
  }

  if (!current) return null

  const isCorrect = picked === current.answer

  return (
    <div>
      <p className="kicker">Practice · 자모 연습</p>
      <h2 className="page-title">Tap the matching letter</h2>
      <p className="tiny">
        {index + 1} / {round.length}
      </p>
      <div className="progress-bar" aria-hidden="true">
        <span style={{ width: `${(index / round.length) * 100}%` }} />
      </div>

      <section className="card prompt-card">
        <p className="tiny">{current.promptKo}</p>
        <p style={{ margin: '0.2rem 0 0', fontWeight: 700 }}>{current.prompt}</p>
        <p className="big-hint">{current.hint}</p>
        <div className="prompt-audio">
          <p className="tiny" style={{ marginBottom: '0.45rem' }}>
            Listen first · 먼저 듣기
          </p>
          <JamoAudioBar key={current.target.audioId} jamo={current.target} revealLabel={Boolean(picked)} />
        </div>
      </section>

      <div className="options">
        {current.options.map((option) => {
          let state = ''
          if (picked) {
            if (option === current.answer) state = 'correct'
            else if (option === picked) state = 'wrong'
          }
          return (
            <button
              key={option}
              type="button"
              className={`choice ${state}`}
              onClick={() => choose(option)}
              disabled={Boolean(picked)}
            >
              {option}
            </button>
          )
        })}
      </div>

      {picked && (
        <>
          <p className={`feedback ${isCorrect ? 'ok' : 'bad'}`}>
            {isCorrect ? 'Jeongdap! 정답이에요.' : `Almost — the answer is ${current.answer}.`}
          </p>
          <button className="btn" type="button" onClick={next}>
            {index + 1 === round.length ? 'See score' : 'Next · 다음'}
          </button>
        </>
      )}
    </div>
  )
}
