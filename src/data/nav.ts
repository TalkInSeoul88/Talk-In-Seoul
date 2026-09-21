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
    detail: '모음, 자음, and 쌍자음 are free. 음절(syllables) with a class code.',
  },
  {
    to: '/quiz',
    label: 'Quiz',
    ko: '퀴즈',
    detail: 'Free 모음, 자음, and Easy 20 단어. Class 단어 with a code.',
  },
  {
    to: '/this-week',
    label: 'This Week',
    ko: '이번 주',
    detail: 'Free 자음, 모음, and 단어 (animals) sheets.',
  },
] as const
