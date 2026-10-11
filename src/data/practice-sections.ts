import type { TeacherClip } from './content.ts'

export type SpokenItem = {
  hangul: string
  roman: string
  english: string
  audioId: string
}

const FINALS = [
  '',
  'ㄱ',
  'ㄲ',
  'ㄳ',
  'ㄴ',
  'ㄵ',
  'ㄶ',
  'ㄷ',
  'ㄹ',
  'ㄺ',
  'ㄻ',
  'ㄼ',
  'ㄽ',
  'ㄾ',
  'ㄿ',
  'ㅀ',
  'ㅁ',
  'ㅂ',
  'ㅄ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
]

export function syllableBatchim(char: string): string {
  const code = char.codePointAt(0) ?? 0
  if (code < 0xac00 || code > 0xd7a3) return ''
  return FINALS[(code - 0xac00) % 28] ?? ''
}

export function wordSyllables(hangul: string): { char: string; batchim: string }[] {
  return [...hangul].map((char) => ({ char, batchim: syllableBatchim(char) }))
}

export function batchimLetters(hangul: string): string[] {
  return wordSyllables(hangul)
    .map((part) => part.batchim)
    .filter((letter) => letter.length > 0)
}

export function toClip(item: SpokenItem): TeacherClip {
  return { char: item.hangul, roman: item.roman, audioId: item.audioId }
}

export function recordingFile(item: SpokenItem): string {
  return `${item.audioId}.mp3`
}

/** Easy words with a bottom letter, in teaching order. 우유 is not here; 공 is. */
export const BATCHIM_WORDS: SpokenItem[] = [
  { hangul: '간장', roman: 'gan-jang', english: 'soy sauce', audioId: 'batchim-gan-jang' },
  { hangul: '나방', roman: 'na-bang', english: 'moth', audioId: 'batchim-na-bang' },
  { hangul: '다람쥐', roman: 'da-ram-jwi', english: 'squirrel', audioId: 'batchim-da-ram-jwi' },
  { hangul: '마늘', roman: 'ma-neul', english: 'garlic', audioId: 'batchim-ma-neul' },
  { hangul: '방', roman: 'bang', english: 'room', audioId: 'batchim-bang' },
  { hangul: '사슴', roman: 'sa-seum', english: 'deer', audioId: 'batchim-sa-seum' },
  { hangul: '아들', roman: 'a-deul', english: 'son', audioId: 'batchim-a-deul' },
  { hangul: '자동차', roman: 'ja-dong-cha', english: 'car', audioId: 'batchim-ja-dong-cha' },
  { hangul: '책', roman: 'chaek', english: 'book', audioId: 'batchim-chaek' },
  { hangul: '콩', roman: 'kong', english: 'bean', audioId: 'batchim-kong' },
  { hangul: '탑', roman: 'tap', english: 'tower', audioId: 'batchim-tap' },
  { hangul: '팔', roman: 'pal', english: 'arm', audioId: 'batchim-pal' },
  { hangul: '하늘', roman: 'ha-neul', english: 'sky', audioId: 'batchim-ha-neul' },
  { hangul: '밥', roman: 'bap', english: 'rice', audioId: 'batchim-bap' },
  { hangul: '물', roman: 'mul', english: 'water', audioId: 'batchim-mul' },
  { hangul: '집', roman: 'jip', english: 'house', audioId: 'batchim-jip' },
  { hangul: '김밥', roman: 'gim-bap', english: 'kimbap', audioId: 'batchim-gim-bap' },
  { hangul: '라면', roman: 'ra-myeon', english: 'ramen', audioId: 'batchim-ra-myeon' },
  { hangul: '사랑', roman: 'sa-rang', english: 'love', audioId: 'batchim-sa-rang' },
  { hangul: '공', roman: 'gong', english: 'ball', audioId: 'batchim-gong' },
]

export const NATIVE_NUMBERS: SpokenItem[] = [
  { hangul: '하나', roman: 'ha-na', english: '1', audioId: 'number-ha-na' },
  { hangul: '둘', roman: 'dul', english: '2', audioId: 'number-dul' },
  { hangul: '셋', roman: 'set', english: '3', audioId: 'number-set' },
  { hangul: '넷', roman: 'net', english: '4', audioId: 'number-net' },
  { hangul: '다섯', roman: 'da-seot', english: '5', audioId: 'number-da-seot' },
  { hangul: '여섯', roman: 'yeo-seot', english: '6', audioId: 'number-yeo-seot' },
  { hangul: '일곱', roman: 'il-gop', english: '7', audioId: 'number-il-gop' },
  { hangul: '여덟', roman: 'yeo-deol', english: '8', audioId: 'number-yeo-deol' },
  { hangul: '아홉', roman: 'a-hop', english: '9', audioId: 'number-a-hop' },
  { hangul: '열', roman: 'yeol', english: '10', audioId: 'number-yeol' },
]

export const SINO_NUMBERS: SpokenItem[] = [
  { hangul: '일', roman: 'il', english: '1', audioId: 'number-il' },
  { hangul: '이', roman: 'i', english: '2', audioId: 'number-i' },
  { hangul: '삼', roman: 'sam', english: '3', audioId: 'number-sam' },
  { hangul: '사', roman: 'sa', english: '4', audioId: 'number-sa' },
  { hangul: '오', roman: 'o', english: '5', audioId: 'number-o' },
  { hangul: '육', roman: 'yuk', english: '6', audioId: 'number-yuk' },
  { hangul: '칠', roman: 'chil', english: '7', audioId: 'number-chil' },
  { hangul: '팔', roman: 'pal', english: '8', audioId: 'number-pal' },
  { hangul: '구', roman: 'gu', english: '9', audioId: 'number-gu' },
  { hangul: '십', roman: 'sip', english: '10', audioId: 'number-sip' },
]

export const NUMBER_PATTERN: SpokenItem[] = [
  { hangul: '십일', roman: 'si-bil', english: '11', audioId: 'number-si-bil' },
  { hangul: '이십이', roman: 'i-si-bi', english: '22', audioId: 'number-i-si-bi' },
  { hangul: '삼십삼', roman: 'sam-sip-sam', english: '33', audioId: 'number-sam-sip-sam' },
  { hangul: '사십사', roman: 'sa-sip-sa', english: '44', audioId: 'number-sa-sip-sa' },
  { hangul: '오십오', roman: 'o-sip-o', english: '55', audioId: 'number-o-sip-o' },
  { hangul: '육십육', roman: 'yuk-sip-yuk', english: '66', audioId: 'number-yuk-sip-yuk' },
  { hangul: '칠십칠', roman: 'chil-sip-chil', english: '77', audioId: 'number-chil-sip-chil' },
  { hangul: '팔십팔', roman: 'pal-sip-pal', english: '88', audioId: 'number-pal-sip-pal' },
  { hangul: '구십구', roman: 'gu-sip-gu', english: '99', audioId: 'number-gu-sip-gu' },
]

export const CONVERSATION_PHRASES: SpokenItem[] = [
  { hangul: '안녕하세요', roman: 'an-nyeong-ha-se-yo', english: 'Hello', audioId: 'phrase-an-nyeong-ha-se-yo' },
  { hangul: '이거 얼마예요?', roman: 'i-geo eol-ma-ye-yo', english: 'How much is this?', audioId: 'phrase-i-geo-eol-ma-ye-yo' },
  { hangul: '이거 주세요', roman: 'i-geo ju-se-yo', english: 'This one, please', audioId: 'phrase-i-geo-ju-se-yo' },
  { hangul: '감사합니다', roman: 'gam-sa-ham-ni-da', english: 'Thank you', audioId: 'phrase-gam-sa-ham-ni-da' },
  { hangul: '네', roman: 'ne', english: 'Yes', audioId: 'phrase-ne' },
  { hangul: '아니요', roman: 'a-ni-yo', english: 'No', audioId: 'phrase-a-ni-yo' },
  { hangul: '맛있어요', roman: 'ma-si-sseo-yo', english: "It's delicious", audioId: 'phrase-ma-si-sseo-yo' },
  { hangul: '화장실 어디예요?', roman: 'hwa-jang-sil eo-di-ye-yo', english: 'Where is the restroom?', audioId: 'phrase-hwa-jang-sil-eo-di-ye-yo' },
  { hangul: '다시 말해 주세요', roman: 'da-si mal-hae ju-se-yo', english: 'Please say it again', audioId: 'phrase-da-si-mal-hae-ju-se-yo' },
  { hangul: '안녕히 계세요', roman: 'an-nyeong-hi gye-se-yo', english: 'Goodbye', audioId: 'phrase-an-nyeong-hi-gye-se-yo' },
]

export const PRACTICE_RECORDINGS: SpokenItem[] = [
  ...BATCHIM_WORDS,
  ...NATIVE_NUMBERS,
  ...SINO_NUMBERS,
  ...NUMBER_PATTERN,
  ...CONVERSATION_PHRASES,
]
