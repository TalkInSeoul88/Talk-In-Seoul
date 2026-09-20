export type WeekMaterial = {
  id: string
  title: string
  detail: string
  href: string
}

/** Public This Week downloads — no access code. Add more sheets here later. */
export const THIS_WEEK_MATERIALS: WeekMaterial[] = [
  {
    id: 'week-1-consonant-writing',
    title: 'Week 1 — Consonant writing practice (자음)',
    detail: 'Printable look → trace → write sheet. ㄱ–ㅅ and ㅇ–ㅎ.',
    href: '/materials/hangul-consonant-practice.pdf',
  },
]
