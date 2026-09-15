export type Jamo = {
  char: string
  roman: string
  nameKo: string
  cue: string
  kind: 'vowel' | 'consonant'
}

export const BASIC_VOWELS: Jamo[] = [
  { char: 'ㅏ', roman: 'a', nameKo: '아', cue: 'like the a in father', kind: 'vowel' },
  { char: 'ㅑ', roman: 'ya', nameKo: '야', cue: 'yah — ㅏ with an extra stroke', kind: 'vowel' },
  { char: 'ㅓ', roman: 'eo', nameKo: '어', cue: 'like the u in sun', kind: 'vowel' },
  { char: 'ㅕ', roman: 'yeo', nameKo: '여', cue: 'yuh — ㅓ with an extra stroke', kind: 'vowel' },
  { char: 'ㅗ', roman: 'o', nameKo: '오', cue: 'like the o in go', kind: 'vowel' },
  { char: 'ㅛ', roman: 'yo', nameKo: '요', cue: 'yo — ㅗ with an extra stroke', kind: 'vowel' },
  { char: 'ㅜ', roman: 'u', nameKo: '우', cue: 'like the oo in moon', kind: 'vowel' },
  { char: 'ㅠ', roman: 'yu', nameKo: '유', cue: 'you — ㅜ with an extra stroke', kind: 'vowel' },
  { char: 'ㅡ', roman: 'eu', nameKo: '으', cue: 'unrounded “uh,” teeth close, smile slightly', kind: 'vowel' },
  { char: 'ㅣ', roman: 'i', nameKo: '이', cue: 'like the ee in see', kind: 'vowel' },
]

export const BASIC_CONSONANTS: Jamo[] = [
  { char: 'ㄱ', roman: 'g/k', nameKo: '기역', cue: 'g at the start of a word, k at the end', kind: 'consonant' },
  { char: 'ㄴ', roman: 'n', nameKo: '니은', cue: 'n as in name', kind: 'consonant' },
  { char: 'ㄷ', roman: 'd/t', nameKo: '디귿', cue: 'd at the start, t at the end', kind: 'consonant' },
  { char: 'ㄹ', roman: 'r/l', nameKo: '리을', cue: 'a light r between vowels, l at the end', kind: 'consonant' },
  { char: 'ㅁ', roman: 'm', nameKo: '미음', cue: 'm as in mom — lips together', kind: 'consonant' },
  { char: 'ㅂ', roman: 'b/p', nameKo: '비읍', cue: 'b at the start, p at the end', kind: 'consonant' },
  { char: 'ㅅ', roman: 's', nameKo: '시옷', cue: 's as in sun (sh before ㅣ, ㅑ, ㅕ, ㅛ, ㅠ)', kind: 'consonant' },
  { char: 'ㅇ', roman: '∅ / ng', nameKo: '이응', cue: 'silent at the start of a syllable; ng at the end', kind: 'consonant' },
  { char: 'ㅈ', roman: 'j', nameKo: '지읒', cue: 'j as in jam', kind: 'consonant' },
  { char: 'ㅊ', roman: 'ch', nameKo: '치읓', cue: 'ch as in chat — ㅈ with a hat', kind: 'consonant' },
  { char: 'ㅋ', roman: 'k', nameKo: '키읔', cue: 'strong k — ㄱ with an extra stroke', kind: 'consonant' },
  { char: 'ㅌ', roman: 't', nameKo: '티읕', cue: 'strong t — ㄷ with an extra stroke', kind: 'consonant' },
  { char: 'ㅍ', roman: 'p', nameKo: '피읖', cue: 'strong p — ㅂ with an extra stroke', kind: 'consonant' },
  { char: 'ㅎ', roman: 'h', nameKo: '히읗', cue: 'h as in hat', kind: 'consonant' },
]

export const ALL_JAMO: Jamo[] = [...BASIC_VOWELS, ...BASIC_CONSONANTS]

export type Syllable = {
  char: string
  roman: string
  note: string
}

export const SAMPLE_SYLLABLES: Syllable[] = [
  { char: '가', roman: 'ga', note: 'ㄱ + ㅏ' },
  { char: '나', roman: 'na', note: 'ㄴ + ㅏ' },
  { char: '다', roman: 'da', note: 'ㄷ + ㅏ' },
  { char: '마', roman: 'ma', note: 'ㅁ + ㅏ' },
  { char: '바', roman: 'ba', note: 'ㅂ + ㅏ' },
  { char: '사', roman: 'sa', note: 'ㅅ + ㅏ' },
  { char: '아', roman: 'a', note: 'silent ㅇ + ㅏ' },
  { char: '이', roman: 'i', note: 'silent ㅇ + ㅣ' },
  { char: '오', roman: 'o', note: 'silent ㅇ + ㅗ' },
  { char: '우', roman: 'u', note: 'silent ㅇ + ㅜ' },
  { char: '고', roman: 'go', note: 'ㄱ + ㅗ (vowel sits below)' },
  { char: '구', roman: 'gu', note: 'ㄱ + ㅜ (vowel sits below)' },
]

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
