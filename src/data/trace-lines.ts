import {
  BASIC_CONSONANTS,
  BASIC_VOWELS,
  DOUBLE_CONSONANTS,
  syllablesForVowel,
  type CvSyllable,
  type Jamo,
  type TeacherClip,
} from './content.ts'

export type TraceItem = TeacherClip

export type TraceLine = {
  id: string
  /** English name, e.g. "Consonants" or "ㅏ line: 가 ~ 하". */
  label: string
  /** Short range shown under the label, e.g. "ㄱ ~ ㅎ". */
  range: string
  /** Only the 14 basic consonants are free. */
  free: boolean
  items: TraceItem[]
}

function rangeLabel(chars: string[]): string {
  const first = chars[0] ?? ''
  const last = chars[chars.length - 1] ?? ''
  return `${first} ~ ${last}`
}

function fromJamo(item: Jamo): TraceItem {
  return { char: item.char, roman: item.roman, audioId: item.audioId }
}

function fromSyllable(item: CvSyllable): TraceItem {
  return { char: item.char, roman: item.roman, audioId: item.audioId }
}

function buildTraceLines(): TraceLine[] {
  const consonantChars = BASIC_CONSONANTS.map((item) => item.char)
  const doubleChars = DOUBLE_CONSONANTS.map((item) => item.char)
  const vowelChars = BASIC_VOWELS.map((item) => item.char)

  const letters: TraceLine[] = [
    {
      id: 'consonants',
      label: 'Consonants',
      range: rangeLabel(consonantChars),
      free: true,
      items: BASIC_CONSONANTS.map(fromJamo),
    },
    {
      id: 'doubles',
      label: 'Double consonants',
      range: rangeLabel(doubleChars),
      free: false,
      items: DOUBLE_CONSONANTS.map(fromJamo),
    },
    {
      id: 'vowels',
      label: 'Vowels',
      range: rangeLabel(vowelChars),
      free: false,
      items: BASIC_VOWELS.map(fromJamo),
    },
  ]

  const syllables: TraceLine[] = BASIC_VOWELS.map((vowel) => {
    const row = syllablesForVowel(vowel.char)
    const chars = row.map((item) => item.char)
    const span = rangeLabel(chars)
    return {
      id: `syllable-${vowel.roman}`,
      label: `${vowel.char} line: ${span}`,
      range: span,
      free: false,
      items: row.map(fromSyllable),
    }
  })

  return [...letters, ...syllables]
}

/** One practice line per picker row, in teaching order. */
export const TRACE_LINES: TraceLine[] = buildTraceLines()

export function findTraceLine(id: string): TraceLine | undefined {
  return TRACE_LINES.find((line) => line.id === id)
}

export function nextTraceLine(id: string): TraceLine | null {
  const index = TRACE_LINES.findIndex((line) => line.id === id)
  if (index < 0) return null
  return TRACE_LINES[index + 1] ?? null
}

export function lineIsLocked(line: TraceLine, enrolled: boolean): boolean {
  return !line.free && !enrolled
}
