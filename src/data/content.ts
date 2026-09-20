/** Anything Play can look up as /audio/{audioId}.mp3 */
export type TeacherClip = {
  char: string
  roman: string
  /** Filename stem under /audio/{audioId}.mp3 — e.g. vowel-a or syllable-ga */
  audioId: string
}

export type Jamo = TeacherClip & {
  nameKo: string
  cue: string
  kind: 'vowel' | 'consonant'
  /** 쌍자음 (ㄲㄸㅃㅆㅉ). Omitted on the 10 vowels and 14 basic consonants. */
  family?: 'ssang'
}

export const BASIC_VOWELS: Jamo[] = [
  { char: 'ㅏ', roman: 'a', nameKo: '아', cue: 'like the a in father', kind: 'vowel', audioId: 'vowel-a' },
  { char: 'ㅑ', roman: 'ya', nameKo: '야', cue: 'yah — ㅏ with an extra stroke', kind: 'vowel', audioId: 'vowel-ya' },
  { char: 'ㅓ', roman: 'eo', nameKo: '어', cue: 'like the u in sun', kind: 'vowel', audioId: 'vowel-eo' },
  { char: 'ㅕ', roman: 'yeo', nameKo: '여', cue: 'yuh — ㅓ with an extra stroke', kind: 'vowel', audioId: 'vowel-yeo' },
  { char: 'ㅗ', roman: 'o', nameKo: '오', cue: 'like the o in go', kind: 'vowel', audioId: 'vowel-o' },
  { char: 'ㅛ', roman: 'yo', nameKo: '요', cue: 'yo — ㅗ with an extra stroke', kind: 'vowel', audioId: 'vowel-yo' },
  { char: 'ㅜ', roman: 'u', nameKo: '우', cue: 'like the oo in moon', kind: 'vowel', audioId: 'vowel-u' },
  { char: 'ㅠ', roman: 'yu', nameKo: '유', cue: 'you — ㅜ with an extra stroke', kind: 'vowel', audioId: 'vowel-yu' },
  { char: 'ㅡ', roman: 'eu', nameKo: '으', cue: 'unrounded “uh,” teeth close, smile slightly', kind: 'vowel', audioId: 'vowel-eu' },
  { char: 'ㅣ', roman: 'i', nameKo: '이', cue: 'like the ee in see', kind: 'vowel', audioId: 'vowel-i' },
]

export const BASIC_CONSONANTS: Jamo[] = [
  { char: 'ㄱ', roman: 'g/k', nameKo: '기역', cue: 'g at the start of a word, k at the end', kind: 'consonant', audioId: 'consonant-g' },
  { char: 'ㄴ', roman: 'n', nameKo: '니은', cue: 'n as in name', kind: 'consonant', audioId: 'consonant-n' },
  { char: 'ㄷ', roman: 'd/t', nameKo: '디귿', cue: 'd at the start, t at the end', kind: 'consonant', audioId: 'consonant-d' },
  { char: 'ㄹ', roman: 'r/l', nameKo: '리을', cue: 'a light r between vowels, l at the end', kind: 'consonant', audioId: 'consonant-r' },
  { char: 'ㅁ', roman: 'm', nameKo: '미음', cue: 'm as in mom — lips together', kind: 'consonant', audioId: 'consonant-m' },
  { char: 'ㅂ', roman: 'b/p', nameKo: '비읍', cue: 'b at the start, p at the end', kind: 'consonant', audioId: 'consonant-b' },
  { char: 'ㅅ', roman: 's', nameKo: '시옷', cue: 's as in sun (sh before ㅣ, ㅑ, ㅕ, ㅛ, ㅠ)', kind: 'consonant', audioId: 'consonant-s' },
  { char: 'ㅇ', roman: '∅ / ng', nameKo: '이응', cue: 'silent at the start of a syllable; ng at the end', kind: 'consonant', audioId: 'consonant-ng' },
  { char: 'ㅈ', roman: 'j', nameKo: '지읒', cue: 'j as in jam', kind: 'consonant', audioId: 'consonant-j' },
  { char: 'ㅊ', roman: 'ch', nameKo: '치읓', cue: 'ch as in chat — ㅈ with a hat', kind: 'consonant', audioId: 'consonant-ch' },
  { char: 'ㅋ', roman: 'k', nameKo: '키읔', cue: 'strong k — ㄱ with an extra stroke', kind: 'consonant', audioId: 'consonant-k' },
  { char: 'ㅌ', roman: 't', nameKo: '티읕', cue: 'strong t — ㄷ with an extra stroke', kind: 'consonant', audioId: 'consonant-t' },
  { char: 'ㅍ', roman: 'p', nameKo: '피읖', cue: 'strong p — ㅂ with an extra stroke', kind: 'consonant', audioId: 'consonant-p' },
  { char: 'ㅎ', roman: 'h', nameKo: '히읗', cue: 'h as in hat', kind: 'consonant', audioId: 'consonant-h' },
]

/** 쌍자음 — Quiz only. Do not fold into BASIC_CONSONANTS (that set drives the 140 CV chart). */
export const DOUBLE_CONSONANTS: Jamo[] = [
  { char: 'ㄲ', roman: 'kk', nameKo: '쌍기역', cue: 'tense g/k — doubled ㄱ', kind: 'consonant', family: 'ssang', audioId: 'consonant-kk' },
  { char: 'ㄸ', roman: 'tt', nameKo: '쌍디귿', cue: 'tense d/t — doubled ㄷ', kind: 'consonant', family: 'ssang', audioId: 'consonant-tt' },
  { char: 'ㅃ', roman: 'pp', nameKo: '쌍비읍', cue: 'tense b/p — doubled ㅂ', kind: 'consonant', family: 'ssang', audioId: 'consonant-pp' },
  { char: 'ㅆ', roman: 'ss', nameKo: '쌍시옷', cue: 'tense s — doubled ㅅ', kind: 'consonant', family: 'ssang', audioId: 'consonant-ss' },
  { char: 'ㅉ', roman: 'jj', nameKo: '쌍지읒', cue: 'tense j — doubled ㅈ', kind: 'consonant', family: 'ssang', audioId: 'consonant-jj' },
]

/** Free Quiz deck: 10 basic 모음 + 19 자음 (14 basic + 5 쌍자음). No compound vowels, no 음절. */
export const QUIZ_VOWELS: Jamo[] = BASIC_VOWELS
export const QUIZ_CONSONANTS: Jamo[] = [...BASIC_CONSONANTS, ...DOUBLE_CONSONANTS]
export const QUIZ_FLASHCARDS: Jamo[] = [...QUIZ_VOWELS, ...QUIZ_CONSONANTS]

const QUIZ_VOWEL_CHARS = 'ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ'
const QUIZ_CONSONANT_CHARS = 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎㄲㄸㅃㅆㅉ'
const COMPOUND_VOWELS = 'ㅐㅒㅔㅖㅘㅙㅚㅝㅞㅟㅢ'

function assertQuizFlashcards() {
  const vowels = QUIZ_VOWELS.map((item) => item.char).join('')
  const consonants = QUIZ_CONSONANTS.map((item) => item.char).join('')
  if (vowels !== QUIZ_VOWEL_CHARS) {
    throw new Error(`Quiz vowels must be the 10 basic 모음, got ${vowels}`)
  }
  if (consonants !== QUIZ_CONSONANT_CHARS) {
    throw new Error(`Quiz consonants must be 14 basic + 5 쌍자음, got ${consonants}`)
  }
  if (QUIZ_FLASHCARDS.length !== 29) {
    throw new Error(`Expected 29 free quiz cards, got ${QUIZ_FLASHCARDS.length}`)
  }
  if (QUIZ_FLASHCARDS.some((item) => COMPOUND_VOWELS.includes(item.char))) {
    throw new Error('Quiz must not include compound vowels')
  }
  if (QUIZ_FLASHCARDS.some((item) => item.audioId.startsWith('syllable-'))) {
    throw new Error('Quiz must not include 음절(syllable) cards')
  }
}

assertQuizFlashcards()

export const ALL_JAMO: Jamo[] = [...BASIC_VOWELS, ...BASIC_CONSONANTS]

export type CvSyllable = TeacherClip & {
  initial: string
  vowel: string
  note: string
}

/** Unicode choseong index (full 19-letter set) for the 14 basic consonants. */
const CHOSEONG_INDEX: Record<string, number> = {
  ㄱ: 0,
  ㄴ: 2,
  ㄷ: 3,
  ㄹ: 5,
  ㅁ: 6,
  ㅂ: 7,
  ㅅ: 9,
  ㅇ: 11,
  ㅈ: 12,
  ㅊ: 14,
  ㅋ: 15,
  ㅌ: 16,
  ㅍ: 17,
  ㅎ: 18,
}

/** Unicode jungseong index (full 21-letter set) for the 10 basic vowels. */
const JUNGSEONG_INDEX: Record<string, number> = {
  ㅏ: 0,
  ㅑ: 2,
  ㅓ: 4,
  ㅕ: 6,
  ㅗ: 8,
  ㅛ: 12,
  ㅜ: 13,
  ㅠ: 17,
  ㅡ: 18,
  ㅣ: 20,
}

/**
 * Revised Romanization stem used in `syllable-{roman}.mp3`.
 * ㅇ is silent at the start of a syllable, so 아 → `syllable-a.mp3`.
 */
export const SYLLABLE_INITIAL_ROMAN: Record<string, string> = {
  ㄱ: 'g',
  ㄴ: 'n',
  ㄷ: 'd',
  ㄹ: 'r',
  ㅁ: 'm',
  ㅂ: 'b',
  ㅅ: 's',
  ㅇ: '',
  ㅈ: 'j',
  ㅊ: 'ch',
  ㅋ: 'k',
  ㅌ: 't',
  ㅍ: 'p',
  ㅎ: 'h',
}

export function composeCvSyllable(initial: string, vowel: string): string {
  const cho = CHOSEONG_INDEX[initial]
  const jung = JUNGSEONG_INDEX[vowel]
  if (cho === undefined || jung === undefined) {
    throw new Error(`Cannot compose ${initial}+${vowel}`)
  }
  return String.fromCharCode(0xac00 + (cho * 21 + jung) * 28)
}

export function syllableRoman(initial: string, vowel: string): string {
  const vowelJamo = BASIC_VOWELS.find((item) => item.char === vowel)
  const prefix = SYLLABLE_INITIAL_ROMAN[initial]
  if (!vowelJamo || prefix === undefined) {
    throw new Error(`Cannot romanize ${initial}+${vowel}`)
  }
  return `${prefix}${vowelJamo.roman}`
}

function buildBasicCvSyllables(): CvSyllable[] {
  const list: CvSyllable[] = []
  for (const cons of BASIC_CONSONANTS) {
    for (const vowel of BASIC_VOWELS) {
      const char = composeCvSyllable(cons.char, vowel.char)
      const roman = syllableRoman(cons.char, vowel.char)
      list.push({
        char,
        roman,
        audioId: `syllable-${roman}`,
        initial: cons.char,
        vowel: vowel.char,
        note: cons.char === 'ㅇ' ? `silent ㅇ + ${vowel.char}` : `${cons.char} + ${vowel.char}`,
      })
    }
  }
  if (list.length !== 140) {
    throw new Error(`Expected 140 CV syllables, got ${list.length}`)
  }
  const ids = new Set(list.map((item) => item.audioId))
  if (ids.size !== 140) {
    throw new Error('Duplicate syllable audioId values')
  }
  const first = list[0]
  const gi = list[9]
  const ha = list[130]
  const hi = list[139]
  if (first?.char !== '가' || first.audioId !== 'syllable-ga') {
    throw new Error(`CV chart must start at 가 / syllable-ga, got ${first?.char} ${first?.audioId}`)
  }
  if (gi?.char !== '기' || ha?.char !== '하' || hi?.char !== '히') {
    throw new Error('CV chart corners are wrong (expected 가…기 / 하…히)')
  }
  return list
}

/** 14 consonants × 10 vowels, row-major: 가갸거겨… then 나냐너녀… through 하햐허혀…히 */
export const BASIC_CV_SYLLABLES: CvSyllable[] = buildBasicCvSyllables()

export function syllablesForInitial(initial: string): CvSyllable[] {
  return BASIC_CV_SYLLABLES.filter((item) => item.initial === initial)
}

export function syllablesForVowel(vowel: string): CvSyllable[] {
  return BASIC_CV_SYLLABLES.filter((item) => item.vowel === vowel)
}

export const SAMPLE_WORDS = [
  { hangul: '아이', roman: 'ai', meaning: 'child' },
  { hangul: '오이', roman: 'oi', meaning: 'cucumber' },
  { hangul: '우유', roman: 'uyu', meaning: 'milk' },
  { hangul: '하나', roman: 'hana', meaning: 'one' },
  { hangul: '안녕', roman: 'annyeong', meaning: 'hi / well-being' },
  { hangul: '안녕하세요', roman: 'annyeonghaseyo', meaning: 'hello (polite)' },
]

export const WEEK_1_LESSON = {
  weekLabel: 'Week 1',
  weekLabelKo: '1주차',
  title: 'Hangul basics',
  titleKo: '한글 기초',
  summary:
    'Meet the Korean alphabet: 10 basic vowels, 14 basic consonants, and how they stack into syllable blocks.',
  nextClassDefault: 'Saturday, Sep 19 · 11:00 AM\nPop In Seoul · Springfield, IL',
}

export type HomeworkItem = {
  id: string
  title: string
  titleKo: string
  detail: string
}

export const HOMEWORK: HomeworkItem[] = [
  {
    id: 'vowels',
    title: 'Say the 10 basic vowels out loud',
    titleKo: '기본 모음 10개 소리 내기',
    detail: 'ㅏ ㅑ ㅓ ㅕ ㅗ ㅛ ㅜ ㅠ ㅡ ㅣ — slowly, then a little faster.',
  },
  {
    id: 'write',
    title: 'Write six consonants three times each',
    titleKo: '자음 쓰기',
    detail: 'ㄱ ㄴ ㄷ ㅁ ㅂ ㅅ — stroke order can wait; focus on the shapes.',
  },
  {
    id: 'syllables',
    title: 'Read 가 나 다 마 바 사 아 aloud',
    titleKo: '음절 읽기',
    detail: 'Point to each block, say the romanization, then the Korean sound.',
  },
  {
    id: 'hello',
    title: 'Practice 안녕하세요 in the mirror',
    titleKo: '인사 연습',
    detail: 'An-nyeong-ha-se-yo. Smile on 요 — you’ll use this at the store.',
  },
  {
    id: 'question',
    title: 'Bring one question to next class',
    titleKo: '질문 하나 준비하기',
    detail: 'A letter that still looks similar, a sound that feels odd — anything counts.',
  },
]
