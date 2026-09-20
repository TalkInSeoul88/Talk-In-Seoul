import { useState } from 'react'
import FlashcardPlay from '../components/FlashcardPlay'
import { QUIZ_CONSONANTS, QUIZ_VOWELS, type Jamo } from '../data/content'

type Deck = 'vowels' | 'consonants'

const DECKS: Record<Deck, Jamo[]> = {
  vowels: QUIZ_VOWELS,
  consonants: QUIZ_CONSONANTS,
}

export default function Quiz() {
  const [deck, setDeck] = useState<Deck>('vowels')
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const cards = DECKS[deck]
  const card = cards[index]
  const last = index + 1 === cards.length

  function selectDeck(next: Deck) {
    setDeck(next)
    setIndex(0)
    setFlipped(false)
  }

  function go(nextIndex: number) {
    setIndex(nextIndex)
    setFlipped(false)
  }

  if (!card) return null

  const kindLabel = card.kind === 'vowel' ? '모음 · vowel' : card.family === 'ssang' ? '자음 · 쌍자음' : '자음 · consonant'

  return (
    <div className="stack">
      <header>
        <p className="kicker">Quiz · 퀴즈</p>
        <h2 className="page-title">Free Hangul cards</h2>
        <p className="lede">
          10 모음(vowels) and 19 자음(consonants), including 쌍자음. Tap a card to flip. No access
          code — 음절(syllables) stay on Pronunciation.
        </p>
      </header>

      <div className="seg" role="tablist" aria-label="Quiz decks">
        <button
          type="button"
          role="tab"
          className={deck === 'vowels' ? 'seg-btn on' : 'seg-btn'}
          aria-selected={deck === 'vowels'}
          onClick={() => selectDeck('vowels')}
        >
          모음
          <span className="seg-sub">(vowels)</span>
        </button>
        <button
          type="button"
          role="tab"
          className={deck === 'consonants' ? 'seg-btn on' : 'seg-btn'}
          aria-selected={deck === 'consonants'}
          onClick={() => selectDeck('consonants')}
        >
          자음
          <span className="seg-sub">(consonants)</span>
        </button>
      </div>

      <p className="tiny quiz-count">
        {index + 1} / {cards.length}
        <span className="quiz-free-note"> · Free · 무료</span>
      </p>
      <div className="progress-bar" aria-hidden="true">
        <span style={{ width: `${((index + 1) / cards.length) * 100}%` }} />
      </div>

      <div className={`flashcard ${flipped ? 'flipped' : ''}`}>
        <button
          type="button"
          className="flashcard-flip"
          onClick={() => setFlipped((value) => !value)}
          aria-label={flipped ? 'Show Hangul side' : 'Show reading side'}
        >
          {flipped ? (
            <>
              <span className="flashcard-kicker">Reading · {kindLabel}</span>
              <span className="flashcard-back">
                {card.roman} · {card.nameKo}
              </span>
              <span className="flashcard-detail">{card.cue}</span>
            </>
          ) : (
            <>
              <span className="flashcard-kicker">Hangul · {kindLabel}</span>
              <span className="flashcard-front">{card.char}</span>
            </>
          )}
          <span className="tiny">{flipped ? 'Tap to see the letter' : 'Tap to flip'}</span>
        </button>
        {flipped && <FlashcardPlay key={card.audioId} clip={card} />}
      </div>

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
