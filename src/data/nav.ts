export const STUDENT_NAV = [
  { to: '/', label: 'Home', ko: '홈' },
  { to: '/pronunciation', label: 'Pronunciation', ko: '발음' },
  { to: '/quiz', label: 'Quiz', ko: '퀴즈' },
  { to: '/this-week', label: 'This Week', ko: '이번 주' },
] as const

export const HOME_LINKS = [
  {
    to: '/pronunciation',
    label: 'Pronunciation',
    ko: '발음',
    detail: '모음(vowels) and 자음(consonants). 음절(syllables) with a class code.',
  },
  {
    to: '/quiz',
    label: 'Quiz',
    ko: '퀴즈',
    detail: '29 free flashcards — 모음(vowels) and 자음(consonants).',
  },
  {
    to: '/this-week',
    label: 'This Week',
    ko: '이번 주',
    detail: 'Free 자음 and 모음 sheets. Word practice with a class code.',
  },
] as const
