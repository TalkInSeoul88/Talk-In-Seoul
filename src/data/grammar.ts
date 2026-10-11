export const GRAMMAR_LOCK = 'Unlock with the 8-week course! Ask Jung to join.'

export type GrammarWord = {
  hangul: string
  roman: string
}

export type GrammarSentence = {
  audioId: string
  english: string
  words: GrammarWord[]
}

export type GrammarLesson = {
  id: number
  title: string
  explanation: string
  sentences: GrammarSentence[]
}

export type GrammarCard = {
  id: number
  title: string
  free: boolean
}

/** Titles are safe to show. Lesson text for 3–8 stays on the server. */
export const GRAMMAR_CARDS: GrammarCard[] = [
  { id: 1, title: 'Sentence order', free: true },
  { id: 2, title: '___ 주세요 (joo-seh-yoh)', free: true },
  { id: 3, title: '이에요/예요 (ee-eh-yoh / yeh-yoh)', free: false },
  { id: 4, title: '을/를 (eul / reul)', free: false },
  { id: 5, title: '은/는 (eun / neun)', free: false },
  { id: 6, title: '이/가 (ee / gah)', free: false },
  { id: 7, title: '있어요/없어요 (ee-ssuh-yoh / uhp-ssuh-yoh)', free: false },
  { id: 8, title: '요 (yoh) makes it polite', free: false },
]

export const FREE_LESSONS: GrammarLesson[] = [
  {
    id: 1,
    title: 'Sentence order',
    explanation: 'In Korean, the action comes last. Say who it is, then the thing, then the action.',
    sentences: [
      {
        audioId: 'grammar-1-1',
        english: 'I eat rice.',
        words: [
          { hangul: '저는', roman: 'juh-neun' },
          { hangul: '밥을', roman: 'bah-beul' },
          { hangul: '먹어요', roman: 'muh-guh-yoh' },
        ],
      },
      {
        audioId: 'grammar-1-2',
        english: 'I drink water.',
        words: [
          { hangul: '저는', roman: 'juh-neun' },
          { hangul: '물을', roman: 'moo-reul' },
          { hangul: '마셔요', roman: 'mah-syuh-yoh' },
        ],
      },
      {
        audioId: 'grammar-1-3',
        english: 'I like kimbap.',
        words: [
          { hangul: '저는', roman: 'juh-neun' },
          { hangul: '김밥을', roman: 'geem-bah-beul' },
          { hangul: '좋아해요', roman: 'joh-ah-heh-yoh' },
        ],
      },
    ],
  },
  {
    id: 2,
    title: '___ 주세요 (joo-seh-yoh)',
    explanation: 'Name the thing, then say 주세요 (joo-seh-yoh). That means please.',
    sentences: [
      {
        audioId: 'grammar-2-1',
        english: 'Water, please.',
        words: [
          { hangul: '물', roman: 'mool' },
          { hangul: '주세요', roman: 'joo-seh-yoh' },
        ],
      },
      {
        audioId: 'grammar-2-2',
        english: 'Kimbap, please.',
        words: [
          { hangul: '김밥', roman: 'geem-bahp' },
          { hangul: '주세요', roman: 'joo-seh-yoh' },
        ],
      },
      {
        audioId: 'grammar-2-3',
        english: 'This one, please.',
        words: [
          { hangul: '이거', roman: 'ee-guh' },
          { hangul: '주세요', roman: 'joo-seh-yoh' },
        ],
      },
    ],
  },
]
