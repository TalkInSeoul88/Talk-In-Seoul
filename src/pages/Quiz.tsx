import { useState } from 'react'
import FlashcardPlay from '../components/FlashcardPlay'
import UnlockControl from '../components/UnlockControl'
import { QUIZ_CONSONANTS, QUIZ_VOWELS, type Jamo } from '../data/content'
import { QUIZ_WORDS_CLASS, QUIZ_WORDS_EASY, type QuizWord } from '../data/quiz-words'
import { useEnrollment } from '../lib/enrollment.tsx'

type Deck = 'vowels' | 'consonants' | 'words-easy' | 'words-class'

const TABS: { id: Deck; label: string; sub: string; name: string }[] = [
  { id: 'vowels', label: '모음', sub: '(vowels)', name: '모음 (vowels)' },
  { id: 'consonants', label: '자음', sub: '(consonants)', name: '자음 (consonants)' },
  { id: 'words-easy', label: 'Easy 20', sub: '(단어)', name: 'Words (단어) · Easy 20' },
  { id: 'words-class', label: 'Class', sub: '(unlock)', name: 'Words (단어) · Class unlock' },
]

const JAMO_DECKS: Record<'vowels' | 'consonants', Jamo[]> = {
  vowels: QUIZ_VOWELS,
  consonants: QUIZ_CONSONANTS,
}

const WORD_DECKS: Record<'words-easy' | 'words-class', QuizWord[]> = {
  'words-easy': QUIZ_WORDS_EASY,
  'words-class': QUIZ_WORDS_CLASS,
}

function isWordDeck(deck: Deck): deck is 'words-easy' | 'words-class' {
  return deck === 'words-easy' || deck === 'words-class'
}

function jamoKindLabel(card: Jamo) {
  if (card.kind === 'vowel') return '모음 · vowel'
  if (card.family === 'ssang') return '자음 · 쌍자음'
  return '자음 · consonant'
}

export default function Quiz() {
  const { enrollment } = useEnrollment()
  const [deck, setDeck] = useState<Deck>('vowels')
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const classLocked = deck === 'words-class' && !enrollment.enrolled

  function selectDeck(next: Deck) {
    setDeck(next)
    setIndex(0)
    setFlipped(false)
  }

  function go(nextIndex: number) {
    setIndex(nextIndex)
    setFlipped(false)
  }

  return (
    <div className="stack">
      <header>
        <p className="kicker">Quiz · 퀴즈</p>
        <h2 className="page-title">Hangul cards</h2>
        <p className="lede">
          Free 모음, 자음 (including 쌍자음), and Easy 20 단어 — no access code. Class 단어 uses the
          same class code as 음절(syllables). Tap a card to flip.
        </p>
      </header>

      <div className="seg decks" role="tablist" aria-label="Quiz decks">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            className={deck === tab.id ? 'seg-btn on' : 'seg-btn'}
            aria-label={tab.name}
            aria-selected={deck === tab.id}
            onClick={() => selectDeck(tab.id)}
          >
            {tab.label}
            <span className="seg-sub">{tab.sub}</span>
          </button>
        ))}
      </div>

      {classLocked ? (
        <section className="card">
          <p className="kicker">Words (단어) · Class unlock</p>
          <h2>Access code needed</h2>
          <p className="tiny">
            These 20 class words unlock with the same student code as 음절(syllables). Easy 20 단어,
            모음, and 자음 stay free.
          </p>
          <div className="unlock-bar">
            <p className="tiny">Access code needed</p>
            <UnlockControl inputId="quiz-words-access-code" />
          </div>
        </section>
      ) : isWordDeck(deck) ? (
        <WordCards
          cards={WORD_DECKS[deck]}
          index={index}
          flipped={flipped}
          gated={deck === 'words-class'}
          onFlip={() => setFlipped((value) => !value)}
          onGo={go}
        />
      ) : (
        <JamoCards
          cards={JAMO_DECKS[deck]}
          index={index}
          flipped={flipped}
          onFlip={() => setFlipped((value) => !value)}
          onGo={go}
        />
      )}
    </div>
  )
}

function JamoCards({
  cards,
  index,
  flipped,
  onFlip,
  onGo,
}: {
  cards: Jamo[]
  index: number
  flipped: boolean
  onFlip: () => void
  onGo: (nextIndex: number) => void
}) {
  const card = cards[index]
  if (!card) return null
  const last = index + 1 === cards.length
  const kindLabel = jamoKindLabel(card)

  return (
    <>
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
          onClick={onFlip}
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

      <FlashcardNav index={index} last={last} onGo={onGo} />
    </>
  )
}

function WordCards({
  cards,
  index,
  flipped,
  gated,
  onFlip,
  onGo,
}: {
  cards: QuizWord[]
  index: number
  flipped: boolean
  gated: boolean
  onFlip: () => void
  onGo: (nextIndex: number) => void
}) {
  const card = cards[index]
  if (!card) return null
  const last = index + 1 === cards.length
  const kindLabel = gated ? '단어 · class' : '단어 · easy 20'
  const phrase = card.hangul.length > 2

  return (
    <>
      <p className="tiny quiz-count">
        {index + 1} / {cards.length}
        {gated ? (
          <span className="quiz-class-note"> · Class · 수업</span>
        ) : (
          <span className="quiz-free-note"> · Free · 무료</span>
        )}
      </p>
      <div className="progress-bar" aria-hidden="true">
        <span style={{ width: `${((index + 1) / cards.length) * 100}%` }} />
      </div>

      <div className={`flashcard ${flipped ? 'flipped' : ''}`}>
        <button
          type="button"
          className="flashcard-flip"
          onClick={onFlip}
          aria-label={flipped ? 'Show Hangul side' : 'Show reading side'}
        >
          {flipped ? (
            <>
              <span className="flashcard-kicker">Reading · {kindLabel}</span>
              <span className="flashcard-back">
                {card.roman} · {card.meaning}
              </span>
            </>
          ) : (
            <>
              <span className="flashcard-kicker">Hangul · {kindLabel}</span>
              <span className={`flashcard-front${phrase ? ' phrase' : ''}`}>{card.hangul}</span>
            </>
          )}
          <span className="tiny">{flipped ? 'Tap to see the word' : 'Tap to flip'}</span>
        </button>
      </div>

      <FlashcardNav index={index} last={last} onGo={onGo} />
    </>
  )
}

function FlashcardNav({
  index,
  last,
  onGo,
}: {
  index: number
  last: boolean
  onGo: (nextIndex: number) => void
}) {
  return (
    <div className="flashcard-nav">
      <button type="button" className="btn secondary" onClick={() => onGo(index - 1)} disabled={index === 0}>
        Back
      </button>
      {last ? (
        <button type="button" className="btn" onClick={() => onGo(0)}>
          Start over
        </button>
      ) : (
        <button type="button" className="btn" onClick={() => onGo(index + 1)}>
          Next
        </button>
      )}
    </div>
  )
}
