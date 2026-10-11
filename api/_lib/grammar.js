export const GRAMMAR_LOCKED = 'Unlock with the 8-week course! Ask Jung to join.'

/** Lessons 3–8. Never import this from the student app. */
export const LOCKED_LESSONS = [
  {
    id: 3,
    title: '이에요/예요 (ee-eh-yoh / yeh-yoh)',
    explanation:
      'Use this to say what something is. If the word ends with a bottom letter, add 이에요 (ee-eh-yoh). If it does not, add 예요 (yeh-yoh).',
    sentences: [
      {
        audioId: 'grammar-3-1',
        english: 'I am a student.',
        words: [{ hangul: '학생이에요', roman: 'hahk-seng-ee-eh-yoh' }],
      },
      {
        audioId: 'grammar-3-2',
        english: 'It is water.',
        words: [{ hangul: '물이에요', roman: 'moo-ree-eh-yoh' }],
      },
      {
        audioId: 'grammar-3-3',
        english: 'It is coffee.',
        words: [{ hangul: '커피예요', roman: 'kuh-pee-yeh-yoh' }],
      },
    ],
  },
  {
    id: 4,
    title: '을/를 (eul / reul)',
    explanation:
      '을 (eul) or 를 (reul) sits on the thing the action happens to. A bottom letter takes 을. No bottom letter takes 를.',
    sentences: [
      {
        audioId: 'grammar-4-1',
        english: 'I eat rice.',
        words: [
          { hangul: '밥을', roman: 'bah-beul' },
          { hangul: '먹어요', roman: 'muh-guh-yoh' },
        ],
      },
      {
        audioId: 'grammar-4-2',
        english: 'I drink water.',
        words: [
          { hangul: '물을', roman: 'moo-reul' },
          { hangul: '마셔요', roman: 'mah-syuh-yoh' },
        ],
      },
      {
        audioId: 'grammar-4-3',
        english: 'I drink coffee.',
        words: [
          { hangul: '커피를', roman: 'kuh-pee-reul' },
          { hangul: '마셔요', roman: 'mah-syuh-yoh' },
        ],
      },
    ],
  },
  {
    id: 5,
    title: '은/는 (eun / neun)',
    explanation:
      '은 (eun) or 는 (neun) shows what you are talking about. A bottom letter takes 은. No bottom letter takes 는.',
    sentences: [
      {
        audioId: 'grammar-5-1',
        english: 'I am a student.',
        words: [
          { hangul: '저는', roman: 'juh-neun' },
          { hangul: '학생이에요', roman: 'hahk-seng-ee-eh-yoh' },
        ],
      },
      {
        audioId: 'grammar-5-2',
        english: 'Kimbap is delicious.',
        words: [
          { hangul: '김밥은', roman: 'geem-bah-beun' },
          { hangul: '맛있어요', roman: 'mah-shee-ssuh-yoh' },
        ],
      },
      {
        audioId: 'grammar-5-3',
        english: 'The apple is delicious.',
        words: [
          { hangul: '사과는', roman: 'sah-gwah-neun' },
          { hangul: '맛있어요', roman: 'mah-shee-ssuh-yoh' },
        ],
      },
    ],
  },
  {
    id: 6,
    title: '이/가 (ee / gah)',
    explanation:
      '이 (ee) or 가 (gah) shows who or what does it. A bottom letter takes 이. No bottom letter takes 가.',
    sentences: [
      {
        audioId: 'grammar-6-1',
        english: 'It is raining.',
        words: [
          { hangul: '비가', roman: 'bee-gah' },
          { hangul: '와요', roman: 'wah-yoh' },
        ],
      },
      {
        audioId: 'grammar-6-2',
        english: 'A friend is coming.',
        words: [
          { hangul: '친구가', roman: 'cheen-goo-gah' },
          { hangul: '와요', roman: 'wah-yoh' },
        ],
      },
      {
        audioId: 'grammar-6-3',
        english: 'The student eats.',
        words: [
          { hangul: '학생이', roman: 'hahk-seng-ee' },
          { hangul: '먹어요', roman: 'muh-guh-yoh' },
        ],
      },
    ],
  },
  {
    id: 7,
    title: '있어요/없어요 (ee-ssuh-yoh / uhp-ssuh-yoh)',
    explanation:
      '있어요 (ee-ssuh-yoh) means you have it, or it is there. 없어요 (uhp-ssuh-yoh) means you do not have it, or it is not there.',
    sentences: [
      {
        audioId: 'grammar-7-1',
        english: 'There is water.',
        words: [
          { hangul: '물이', roman: 'moo-ree' },
          { hangul: '있어요', roman: 'ee-ssuh-yoh' },
        ],
      },
      {
        audioId: 'grammar-7-2',
        english: 'I do not have time.',
        words: [
          { hangul: '시간이', roman: 'shee-gah-nee' },
          { hangul: '없어요', roman: 'uhp-ssuh-yoh' },
        ],
      },
      {
        audioId: 'grammar-7-3',
        english: 'I have a friend.',
        words: [
          { hangul: '친구가', roman: 'cheen-goo-gah' },
          { hangul: '있어요', roman: 'ee-ssuh-yoh' },
        ],
      },
    ],
  },
  {
    id: 8,
    title: '요 (yoh) makes it polite',
    explanation:
      'Add 요 (yoh) at the end to sound polite. Use it with Jung and in a shop. Close friends can skip it.',
    sentences: [
      {
        audioId: 'grammar-8-1',
        english: 'I eat.',
        words: [{ hangul: '먹어요', roman: 'muh-guh-yoh' }],
      },
      {
        audioId: 'grammar-8-2',
        english: 'I like it.',
        words: [{ hangul: '좋아요', roman: 'joh-ah-yoh' }],
      },
      {
        audioId: 'grammar-8-3',
        english: 'Please.',
        words: [{ hangul: '주세요', roman: 'joo-seh-yoh' }],
      },
    ],
  },
]
