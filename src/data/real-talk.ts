export const REAL_TALK_LOCK = 'Unlock with the 8-week course! Ask Jung to join.'

export type TalkLine = {
  who: 'you' | 'cashier'
  hangul: string
  roman: string
  english: string
  audioId: string
}

export type TalkWeek = {
  week: number
  title: string
  lines: TalkLine[]
}

export type TalkCard = {
  week: number
  title: string
  free: boolean
}

export const REAL_TALK_CARDS: TalkCard[] = [
  { week: 3, title: '이거 주세요 (ee-guh joo-seh-yoh)', free: true },
  { week: 4, title: '이거 뭐예요? (ee-guh mwuh-yeh-yoh)', free: true },
  { week: 5, title: 'Food + 주세요 (joo-seh-yoh)', free: false },
  { week: 6, title: '맛있어요! (mah-shee-ssuh-yoh)', free: false },
  { week: 7, title: '매워요? (meh-wuh-yoh)', free: false },
]

/** Weeks 3–4 are free. Weeks 5–7 live on the server. */
export const FREE_TALKS: TalkWeek[] = [
  {
    week: 3,
    title: '이거 주세요 (ee-guh joo-seh-yoh)',
    lines: [
      {
        who: 'you',
        hangul: '안녕하세요',
        roman: 'ahn-nyuhng-hah-seh-yoh',
        english: 'Hello',
        audioId: 'phrase-an-nyeong-ha-se-yo',
      },
      {
        who: 'you',
        hangul: '이거 주세요',
        roman: 'ee-guh joo-seh-yoh',
        english: 'This one, please. Point while you say it.',
        audioId: 'phrase-i-geo-ju-se-yo',
      },
      { who: 'cashier', hangul: '네', roman: 'neh', english: 'Yes. Hands it over.', audioId: 'phrase-ne' },
      {
        who: 'you',
        hangul: '감사합니다',
        roman: 'gahm-sah-hahm-nee-dah',
        english: 'Thank you',
        audioId: 'phrase-gam-sa-ham-ni-da',
      },
    ],
  },
  {
    week: 4,
    title: '이거 뭐예요? (ee-guh mwuh-yeh-yoh)',
    lines: [
      {
        who: 'you',
        hangul: '안녕하세요',
        roman: 'ahn-nyuhng-hah-seh-yoh',
        english: 'Hello',
        audioId: 'phrase-an-nyeong-ha-se-yo',
      },
      {
        who: 'you',
        hangul: '이거 뭐예요?',
        roman: 'ee-guh mwuh-yeh-yoh',
        english: 'What is this?',
        audioId: 'realtalk-ee-guh-mwuh-yeh-yoh',
      },
      {
        who: 'cashier',
        hangul: '빵이에요',
        roman: 'ppahng-ee-eh-yoh',
        english: 'It’s bread.',
        audioId: 'realtalk-ppahng-ee-eh-yoh',
      },
      {
        who: 'you',
        hangul: '이거 얼마예요?',
        roman: 'ee-guh uhl-mah-yeh-yoh',
        english: 'How much is this?',
        audioId: 'phrase-i-geo-eol-ma-ye-yo',
      },
      {
        who: 'you',
        hangul: '와, 싸요!',
        roman: 'wah ssah-yoh',
        english: 'Wow, cheap!',
        audioId: 'realtalk-wah-ssah-yoh',
      },
      {
        who: 'you',
        hangul: '이거 주세요',
        roman: 'ee-guh joo-seh-yoh',
        english: 'This one, please.',
        audioId: 'phrase-i-geo-ju-se-yo',
      },
      {
        who: 'you',
        hangul: '감사합니다',
        roman: 'gahm-sah-hahm-nee-dah',
        english: 'Thank you',
        audioId: 'phrase-gam-sa-ham-ni-da',
      },
    ],
  },
]
