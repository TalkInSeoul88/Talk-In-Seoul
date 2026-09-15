import { useState } from 'react'
import { buildQuiz } from '../data/activities'
import { useProgress } from '../lib/progress'

export default function Quiz() {
  const { recordQuiz, quiz } = useProgress()
  const [questions, setQuestions] = useState(() => buildQuiz())
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const current = questions[index]

  function choose(option: string) {
    if (!current || picked) return
    setPicked(option)
    if (option === current.answer) setScore((value) => value + 1)
  }

  function next() {
    if (!current || !picked) return
    if (index + 1 >= questions.length) {
      const finalScore = score
      recordQuiz(finalScore, questions.length)
      setFinished(true)
      return
    }
    setPicked(null)
    setIndex((value) => value + 1)
  }

  function restart() {
    setQuestions(buildQuiz())
    setIndex(0)
    setPicked(null)
    setScore(0)
    setFinished(false)
  }

  if (finished) {
    return (
      <section className="card score-hero">
        <p className="kicker">Quiz · 퀴즈</p>
        <p className="tiny">You scored</p>
        <p className="big">
          {score}/{questions.length}
        </p>
        <p className="muted">
          {score >= 7
            ? 'Excellent — see you at Pop In Seoul.'
            : score >= 5
              ? 'Solid start. Review Week 1 and try once more.'
              : 'No rush. Open the lesson, then retry when you’re ready.'}
        </p>
        <button className="btn" type="button" onClick={restart}>
          Retry quiz · 다시 풀기
        </button>
      </section>
    )
  }

  if (!current) return null

  const isCorrect = picked === current.answer
  const isTextOption = current.options.some((option) => option.length > 2)

  return (
    <div>
      <p className="kicker">Quiz · 퀴즈</p>
      <h2 className="page-title">Week 1 check-in</h2>
      <p className="tiny">
        {index + 1} / {questions.length}
        {quiz ? ` · last score ${quiz.score}/${quiz.total}` : ''}
      </p>
      <div className="progress-bar" aria-hidden="true">
        <span style={{ width: `${(index / questions.length) * 100}%` }} />
      </div>

      <section className="card prompt-card">
        <p className="tiny">{current.promptKo}</p>
        <p className="big-hint">{current.prompt}</p>
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
              className={`choice ${isTextOption ? 'small' : ''} ${state}`}
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
            {isCorrect ? 'Jeongdap! 정답.' : 'Not quite. 다시 한번 보세요.'}
          </p>
          <p className="tiny" style={{ textAlign: 'center' }}>
            {current.explain}
          </p>
          <button className="btn" type="button" onClick={next}>
            {index + 1 === questions.length ? 'See score · 결과' : 'Next · 다음'}
          </button>
        </>
      )}
    </div>
  )
}
