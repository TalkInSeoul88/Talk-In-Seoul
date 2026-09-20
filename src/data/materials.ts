export type WeekMaterial = {
  id: string
  title: string
  detail: string
  href: string
}

/** Public This Week downloads — no access code. */
export const PUBLIC_MATERIALS: WeekMaterial[] = [
  {
    id: 'week-1-consonant-writing',
    title: 'Week 1 — Consonant writing practice (자음)',
    detail: 'Printable look → trace → write sheet. ㄱ–ㅎ.',
    href: '/materials/hangul-consonant-practice.pdf',
  },
  {
    id: 'week-1-vowel-writing',
    title: 'Week 1 — Vowel writing practice (모음)',
    detail: 'Printable look → trace → write sheet. ㅏ–ㅣ.',
    href: '/materials/hangul-vowel-practice.pdf',
  },
]

/** Shown only after a student redeems a class access code. */
export const CLASS_MATERIALS: WeekMaterial[] = [
  {
    id: 'week-1-word-writing',
    title: 'Word writing practice (단어)',
    detail: 'Week 1 words · look → trace → write.',
    href: '/materials/hangul-word-practice-week1.pdf',
  },
]
