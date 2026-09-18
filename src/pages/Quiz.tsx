import { useState } from 'react'
import { BASIC_VOWELS, SAMPLE_WORDS } from '../data/content'

type Card = {
  id: string
  front: string
  back: string
  detail: string
}

const CARDS: Card[] = [
  ...BASIC_VOWELS.map((jamo) => ({
    id: jamo.audioId,
    front: jamo.char,
    back: `${jamo.roman} · ${jamo.nameKo}`,
    detail: jamo.cue,
  })),
  ...SAMPLE_WORDS.slice(0, 4).map((word) => ({
    id: word.hangul,
    front: word.hangul,
    back: word.roman,
    detail: word.meaning,
  })),
]

export default function Quiz() {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const card = CARDS[index]
  const last = index + 1 === CARDS.length

  function go(nextIndex: number) {
    setIndex(nextIndex)
    setFlipped(false)
  }

  if (!card) return null

  return (
    <div className="stack">
      <header>
        <p className="kicker">Quiz · 퀴즈</p>
        <h2 className="page-title">Week 1 cards</h2>
        <p className="lede">Tap a card to flip. One side is Hangul; the other is how to read it.</p>
      </header>

      <p className="tiny quiz-count">
        {index + 1} / {CARDS.length}
      </p>
      <div className="progress-bar" aria-hidden="true">
        <span style={{ width: `${((index + 1) / CARDS.length) * 100}%` }} />
      </div>

      <button
        type="button"
        className={`flashcard ${flipped ? 'flipped' : ''}`}
        onClick={() => setFlipped((value) => !value)}
        aria-label={flipped ? 'Show Hangul side' : 'Show reading side'}
      >
        {flipped ? (
          <>
            <span className="flashcard-kicker">Reading</span>
            <span className="flashcard-back">{card.back}</span>
            <span className="flashcard-detail">{card.detail}</span>
          </>
        ) : (
          <>
            <span className="flashcard-kicker">Hangul</span>
            <span className="flashcard-front">{card.front}</span>
          </>
        )}
        <span className="tiny">{flipped ? 'Tap to see the letter' : 'Tap to flip'}</span>
      </button>

      <div className="flashcard-nav">
        <button type="button" className="btn secondary" onClick={() => go(index - 1)} disabled={index === 0}>
          Back
        </button>
        {last ? (
          <button type="button" className="btn" onClick={() => go(0)}>
            Start over
          </button>
        ) : (
          <button type="button" className="btn" onClick={() => go(index + 1)}>
            Next
          </button>
        )}
      </div>
    </div>
  )
}
