import { levelLabel, lockMessage } from './levels.js'

const SOON_LEVELS = ['intermediate-2', 'advanced-1', 'advanced-2']

/** Intermediate 1 lesson text. Never import this from the student app. */
export const INTERMEDIATE_1_TOPICS = [
  {
    id: 'ida',
    title: '이다 / 예요·이에요 (ee-dah / yeh-yoh, ee-eh-yoh)',
    explanation:
      '이다 (ee-dah) means to be. In polite speech, a word with no bottom letter takes 예요 (yeh-yoh). A word with a bottom letter takes 이에요 (ee-eh-yoh).',
    sentences: [
      {
        audioId: 'grammar-i1-ida-1',
        english: 'I am a student. (plain)',
        words: [{ hangul: '학생이다', roman: 'hahk-sehng-ee-dah' }],
      },
      {
        audioId: 'grammar-i1-ida-2',
        english: 'It is water.',
        words: [{ hangul: '물이에요', roman: 'moo-ree-eh-yoh' }],
      },
      {
        audioId: 'grammar-i1-ida-3',
        english: 'It is coffee.',
        words: [{ hangul: '커피예요', roman: 'kuh-pee-yeh-yoh' }],
      },
    ],
  },
  {
    id: 'have',
    title: '있어요 / 없어요 (ee-ssuh-yoh / uhp-ssuh-yoh)',
    explanation:
      '있어요 (ee-ssuh-yoh) means you have it, or it is there. 없어요 (uhp-ssuh-yoh) means you do not have it, or it is not there.',
    sentences: [
      {
        audioId: 'grammar-i1-have-1',
        english: 'There is water.',
        words: [
          { hangul: '물이', roman: 'moo-ree' },
          { hangul: '있어요', roman: 'ee-ssuh-yoh' },
        ],
      },
      {
        audioId: 'grammar-i1-have-2',
        english: 'I do not have time.',
        words: [
          { hangul: '시간이', roman: 'shee-gah-nee' },
          { hangul: '없어요', roman: 'uhp-ssuh-yoh' },
        ],
      },
      {
        audioId: 'grammar-i1-have-3',
        english: 'I have a friend.',
        words: [
          { hangul: '친구가', roman: 'cheen-goo-gah' },
          { hangul: '있어요', roman: 'ee-ssuh-yoh' },
        ],
      },
    ],
  },
  {
    id: 'polite',
    title: 'Basic polite endings',
    explanation:
      'Add 요 (yoh) at the end to sound polite with Jung and in a shop. ㅏ (ah) or ㅗ (oh) takes 아요 (ah-yoh). Other vowels take 어요 (uh-yoh). 하다 (hah-dah) becomes 해요 (heh-yoh).',
    sentences: [
      {
        audioId: 'grammar-i1-polite-1',
        english: 'I eat.',
        words: [{ hangul: '먹어요', roman: 'muh-guh-yoh' }],
      },
      {
        audioId: 'grammar-i1-polite-2',
        english: 'I like it.',
        words: [{ hangul: '좋아요', roman: 'joh-ah-yoh' }],
      },
      {
        audioId: 'grammar-i1-polite-3',
        english: 'Please.',
        words: [{ hangul: '주세요', roman: 'joo-seh-yoh' }],
      },
    ],
  },
]

export function presentGrammar(levels) {
  const open = new Set(Array.isArray(levels) ? levels : [])
  const sections = [
    open.has('intermediate-1')
      ? { id: 'intermediate-1', label: 'Intermediate 1', open: true, topics: INTERMEDIATE_1_TOPICS }
      : {
          id: 'intermediate-1',
          label: 'Intermediate 1',
          open: false,
          message: lockMessage('Intermediate 1'),
        },
  ]
  for (const id of SOON_LEVELS) {
    const label = levelLabel(id)
    sections.push(
      open.has(id)
        ? { id, label, open: true, message: 'Coming soon' }
        : { id, label, open: false, message: lockMessage(label) },
    )
  }
  return { levels: [...open], sections }
}

export async function handleStudentGrammar(ctx) {
  if (ctx.method !== 'GET') return { status: 405, body: { error: 'Use GET.' } }
  const { requireStudent } = await import('./guard.js')
  const student = await requireStudent(ctx)
  if (!student.ok) return { status: student.status, body: { error: student.error } }
  return { status: 200, body: presentGrammar(student.levels) }
}
