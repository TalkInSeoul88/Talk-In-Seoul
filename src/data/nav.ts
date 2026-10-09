export const STUDENT_NAV = [
  { to: '/', label: 'Home', ko: '홈' },
  { to: '/notices', label: 'Notices', ko: '알림' },
  { to: '/homework', label: 'Homework', ko: '숙제' },
  { to: '/pronunciation', label: 'Pronunciation', ko: '발음' },
  { to: '/trace', label: 'Trace', ko: '쓰기' },
  { to: '/quiz', label: 'Quiz', ko: '퀴즈' },
  { to: '/this-week', label: 'This Week', ko: '이번 주' },
] as const

export const HOME_LINKS = [
  {
    to: '/notices',
    label: 'Notices',
    ko: '알림',
    detail: 'Reminders from Jung. Needs a class code.',
  },
  {
    to: '/homework',
    label: 'Homework',
    ko: '숙제',
    detail: 'Files for the 8-week course, week by week.',
  },
  {
    to: '/pronunciation',
    label: 'Pronunciation',
    ko: '발음',
    detail: '모음, 이중모음, 자음, and 쌍자음 are free. 음절(syllables) with a class code.',
  },
  {
    to: '/trace',
    label: 'Trace',
    ko: '쓰기',
    detail: 'Finger tracing for the 8-week course.',
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
    detail: 'Writing sheets for the 8-week course.',
  },
] as const
