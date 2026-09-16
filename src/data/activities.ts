import { BASIC_CONSONANTS, BASIC_VOWELS, type Jamo } from './content'

export type PracticePrompt = {
  id: string
  prompt: string
  promptKo: string
  hint: string
  answer: string
  options: string[]
  target: Jamo
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function distractors(target: Jamo, pool: Jamo[], count: number): string[] {
  return shuffle(pool.filter((item) => item.char !== target.char))
    .slice(0, count)
    .map((item) => item.char)
}

function makeItem(target: Jamo, pool: Jamo[], index: number, mode: 'roman' | 'cue'): PracticePrompt {
  const options = shuffle([target.char, ...distractors(target, pool, 3)])
  if (mode === 'cue') {
    return {
      id: `${target.char}-cue-${index}`,
      prompt: `Which letter matches this sound?`,
      promptKo: '이 소리에 맞는 글자는?',
      hint: target.cue,
      answer: target.char,
      options,
      target,
    }
  }
  return {
    id: `${target.char}-roman-${index}`,
    prompt: `Tap the character for “${target.roman}”`,
    promptKo: `“${target.roman}”에 해당하는 글자를 고르세요`,
    hint: `${target.nameKo} · ${target.cue}`,
    answer: target.char,
    options,
    target,
  }
}

export function buildPracticeRound(count = 10): PracticePrompt[] {
  const vowelPicks = shuffle(BASIC_VOWELS).slice(0, 5)
  const consonantPicks = shuffle(BASIC_CONSONANTS).slice(0, 5)
  const mixed = shuffle([...vowelPicks, ...consonantPicks]).slice(0, count)
  return mixed.map((jamo, index) =>
    makeItem(jamo, jamo.kind === 'vowel' ? BASIC_VOWELS : BASIC_CONSONANTS, index, index % 2 === 0 ? 'roman' : 'cue'),
  )
}

export type QuizQuestion = {
  id: string
  prompt: string
  promptKo: string
  options: string[]
  answer: string
  explain: string
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: 'Which character is ㄱ?',
    promptKo: 'ㄱ는 어느 글자일까요?',
    options: ['ㄱ', 'ㄴ', 'ㅁ', 'ㅇ'],
    answer: 'ㄱ',
    explain: 'ㄱ (giyeok) is the g/k sound. It looks a bit like a gun or a 7.',
  },
  {
    id: 'q2',
    prompt: 'How is ㅏ romanized?',
    promptKo: 'ㅏ의 로마자 표기는?',
    options: ['a', 'eo', 'o', 'u'],
    answer: 'a',
    explain: 'ㅏ sounds like the a in father. The stroke points right.',
  },
  {
    id: 'q3',
    prompt: 'What does 안녕 mean?',
    promptKo: '안녕의 뜻은?',
    options: ['hello / well-being', 'thank you', 'yes', 'water'],
    answer: 'hello / well-being',
    explain: '안녕 is the root of 안녕하세요 — a greeting that also means “peace” or “are you well?”',
  },
  {
    id: 'q4',
    prompt: 'Which syllable is “ga”?',
    promptKo: '“ga”에 해당하는 음절은?',
    options: ['가', '나', '다', '마'],
    answer: '가',
    explain: '가 is ㄱ + ㅏ. The vowel sits to the right of the consonant.',
  },
  {
    id: 'q5',
    prompt: 'What does ㅇ do at the start of a syllable?',
    promptKo: '음절 맨 앞의 ㅇ은?',
    options: ['It is silent', 'It is always ng', 'It is an m sound', 'It doubles the vowel'],
    answer: 'It is silent',
    explain: 'Initial ㅇ is a placeholder so a vowel can stand alone — 아, 이, 오, 우. As a final consonant it is ng.',
  },
  {
    id: 'q6',
    prompt: 'Which vowel is ㅣ (i, as in see)?',
    promptKo: 'ㅣ (이)는 어느 모음일까요?',
    options: ['ㅣ', 'ㅡ', 'ㅏ', 'ㅜ'],
    answer: 'ㅣ',
    explain: 'ㅣ is a straight vertical line. ㅡ is the horizontal “eu” vowel.',
  },
  {
    id: 'q7',
    prompt: 'How do you romanize 나?',
    promptKo: '나의 로마자 표기는?',
    options: ['na', 'da', 'ma', 'ga'],
    answer: 'na',
    explain: 'ㄴ is n, ㅏ is a, so 나 is na. It also means “I/me” in Korean.',
  },
  {
    id: 'q8',
    prompt: 'Who commissioned Hangul in the 1440s?',
    promptKo: '한글을 창제한 이는?',
    options: ['King Sejong', 'King Gojong', 'Queen Min', 'Admiral Yi'],
    answer: 'King Sejong',
    explain: 'King Sejong the Great (세종대왕) created Hangul so more people could read and write.',
  },
]

export function buildQuiz(): QuizQuestion[] {
  return QUIZ_QUESTIONS.map((question) => ({
    ...question,
    options: shuffle(question.options),
  }))
}

