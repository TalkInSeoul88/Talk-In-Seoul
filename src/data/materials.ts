export type WeekMaterial = {
  id: string
  title: string
  detail: string
  href: string
}

/** This Week sheets. The PDF bytes are served only with full course access. */
export const PUBLIC_MATERIALS: WeekMaterial[] = [
  {
    id: 'week-1-consonant-writing',
    title: 'Week 1 — Consonant writing practice (자음)',
    detail: 'Printable look → trace → write sheet. ㄱ–ㅎ.',
    href: '',
  },
  {
    id: 'week-1-vowel-writing',
    title: 'Week 1 — Vowel writing practice (모음)',
    detail: 'Printable look → trace → write sheet. ㅏ–ㅣ.',
    href: '',
  },
  {
    id: 'week-1-word-writing',
    title: 'Word writing practice (단어) — animals',
    detail: '개 호랑이 토끼 다람쥐 새 개구리 나비 곰 · look → trace → write.',
    href: '',
  },
]

export function weekSheetHref(id: string, code: string): string {
  const params = new URLSearchParams({ id, code })
  return `/api/class/material?${params.toString()}`
}

/** Shown only after a student redeems a class access code. Empty until Jung adds class-only sheets. */
export const CLASS_MATERIALS: WeekMaterial[] = []
