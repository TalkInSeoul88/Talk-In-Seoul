export const TABS = [
  {
    id: 'home',
    to: '/',
    label: 'Home',
    ko: '홈',
    roman: 'hohm',
    paths: ['/', '/notices', '/homework', '/this-week'],
  },
  {
    id: 'sounds',
    to: '/sounds',
    label: 'Sounds',
    ko: '소리',
    roman: 'soh-ree',
    paths: ['/sounds', '/pronunciation', '/sound', '/batchim', '/trace'],
  },
  {
    id: 'talk',
    to: '/talk',
    label: 'Talk',
    ko: '대화',
    roman: 'deh-hwah',
    paths: ['/talk', '/conversation', '/real-talk', '/numbers'],
  },
  {
    id: 'grammar',
    to: '/grammar',
    label: 'Grammar',
    ko: '문법',
    roman: 'moon-ppuhp',
    paths: ['/grammar'],
  },
  {
    id: 'me',
    to: '/me',
    label: 'Me',
    ko: '나',
    roman: 'nah',
    paths: ['/me', '/progress', '/quiz'],
  },
] as const

export type SectionId = 'sounds' | 'talk' | 'me'

export const SECTIONS: Record<
  SectionId,
  {
    label: string
    ko: string
    roman: string
    lede: string
    links: { to: string; label: string; ko: string; roman: string; detail: string }[]
  }
> = {
  sounds: {
    label: 'Sounds',
    ko: '소리',
    roman: 'soh-ree',
    lede: 'Hear the letters, drill a sound, then trace it.',
    links: [
      {
        to: '/pronunciation',
        label: 'Pronunciation',
        ko: '발음',
        roman: 'bahl-eum',
        detail: 'Vowels, consonants, and syllables.',
      },
      {
        to: '/sound',
        label: 'Sound Workout',
        ko: '소리',
        roman: 'soh-ree',
        detail: 'Tap and listen drills.',
      },
      {
        to: '/batchim',
        label: 'Bottom Sounds',
        ko: '받침',
        roman: 'bah-chim',
        detail: 'Easy words with a bottom letter.',
      },
      {
        to: '/trace',
        label: 'Trace',
        ko: '쓰기',
        roman: 'sseuh-gee',
        detail: 'Finger tracing for the 8-week course.',
      },
    ],
  },
  talk: {
    label: 'Talk',
    ko: '대화',
    roman: 'deh-hwah',
    lede: 'Phrases, counter talk, and numbers.',
    links: [
      {
        to: '/conversation',
        label: 'Conversation',
        ko: '대화',
        roman: 'deh-hwah',
        detail: 'Everyday phrases.',
      },
      {
        to: '/real-talk',
        label: 'Real Talk',
        ko: '실전',
        roman: 'sheel-juhn',
        detail: 'At the counter with Jung.',
      },
      {
        to: '/numbers',
        label: 'Numbers',
        ko: '숫자',
        roman: 'soo-jah',
        detail: 'Native and Sino-Korean counts.',
      },
    ],
  },
  me: {
    label: 'Me',
    ko: '나',
    roman: 'nah',
    lede: 'Your checklist and the quiz.',
    links: [
      {
        to: '/progress',
        label: 'My Progress',
        ko: '진도',
        roman: 'jeen-doh',
        detail: 'What class covered, and what you reviewed.',
      },
      {
        to: '/quiz',
        label: 'Quiz',
        ko: '퀴즈',
        roman: 'kwee-jeuh',
        detail: 'Free 모음 (moh-eum), 자음 (jah-eum), and Easy 20 단어 (dah-nuh). Class 단어 (dah-nuh) with a code.',
      },
    ],
  },
}

export function tabForPath(pathname: string) {
  return (
    TABS.find((tab) => tab.paths.some((path) => pathname === path || (path !== '/' && pathname.startsWith(`${path}/`)))) ??
    TABS[0]
  )
}
