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
  { hangul: '간장', roman: 'gahn-jahng', english: 'soy sauce', audioId: 'batchim-gan-jang' },
  { hangul: '나방', roman: 'nah-bahng', english: 'moth', audioId: 'batchim-na-bang' },
  { hangul: '다람쥐', roman: 'dah-rahm-jwee', english: 'squirrel', audioId: 'batchim-da-ram-jwi' },
  { hangul: '마늘', roman: 'mah-neul', english: 'garlic', audioId: 'batchim-ma-neul' },
  { hangul: '방', roman: 'bahng', english: 'room', audioId: 'batchim-bang' },
  { hangul: '사슴', roman: 'sah-seum', english: 'deer', audioId: 'batchim-sa-seum' },
  { hangul: '아들', roman: 'ah-deul', english: 'son', audioId: 'batchim-a-deul' },
  { hangul: '자동차', roman: 'jah-dohng-chah', english: 'car', audioId: 'batchim-ja-dong-cha' },
  { hangul: '책', roman: 'chehk', english: 'book', audioId: 'batchim-chaek' },
  { hangul: '콩', roman: 'kohng', english: 'bean', audioId: 'batchim-kong' },
  { hangul: '탑', roman: 'tahp', english: 'tower', audioId: 'batchim-tap' },
  { hangul: '팔', roman: 'pahl', english: 'arm', audioId: 'batchim-pal' },
  { hangul: '하늘', roman: 'hah-neul', english: 'sky', audioId: 'batchim-ha-neul' },
  { hangul: '밥', roman: 'bahp', english: 'rice', audioId: 'batchim-bap' },
  { hangul: '물', roman: 'mool', english: 'water', audioId: 'batchim-mul' },
  { hangul: '집', roman: 'jeep', english: 'house', audioId: 'batchim-jip' },
  { hangul: '김밥', roman: 'geem-bahp', english: 'kimbap', audioId: 'batchim-gim-bap' },
  { hangul: '라면', roman: 'rah-myuhn', english: 'ramen', audioId: 'batchim-ra-myeon' },
  { hangul: '사랑', roman: 'sah-rahng', english: 'love', audioId: 'batchim-sa-rang' },
  { hangul: '공', roman: 'gohng', english: 'ball', audioId: 'batchim-gong' },
]

export const NATIVE_NUMBERS: SpokenItem[] = [
  { hangul: '하나', roman: 'hah-nah', english: '1', audioId: 'number-ha-na' },
  { hangul: '둘', roman: 'dool', english: '2', audioId: 'number-dul' },
  { hangul: '셋', roman: 'seht', english: '3', audioId: 'number-set' },
  { hangul: '넷', roman: 'neht', english: '4', audioId: 'number-net' },
  { hangul: '다섯', roman: 'dah-suht', english: '5', audioId: 'number-da-seot' },
  { hangul: '여섯', roman: 'yuh-suht', english: '6', audioId: 'number-yeo-seot' },
  { hangul: '일곱', roman: 'eel-gohp', english: '7', audioId: 'number-il-gop' },
  { hangul: '여덟', roman: 'yuh-duhl', english: '8', audioId: 'number-yeo-deol' },
  { hangul: '아홉', roman: 'ah-hohp', english: '9', audioId: 'number-a-hop' },
  { hangul: '열', roman: 'yuhl', english: '10', audioId: 'number-yeol' },
]

export const SINO_NUMBERS: SpokenItem[] = [
  { hangul: '일', roman: 'eel', english: '1', audioId: 'number-il' },
  { hangul: '이', roman: 'ee', english: '2', audioId: 'number-i' },
  { hangul: '삼', roman: 'sahm', english: '3', audioId: 'number-sam' },
  { hangul: '사', roman: 'sah', english: '4', audioId: 'number-sa' },
  { hangul: '오', roman: 'oh', english: '5', audioId: 'number-o' },
  { hangul: '육', roman: 'yook', english: '6', audioId: 'number-yuk' },
  { hangul: '칠', roman: 'cheel', english: '7', audioId: 'number-chil' },
  { hangul: '팔', roman: 'pahl', english: '8', audioId: 'number-pal' },
  { hangul: '구', roman: 'goo', english: '9', audioId: 'number-gu' },
  { hangul: '십', roman: 'sheep', english: '10', audioId: 'number-sip' },
]

export const NUMBER_PATTERN: SpokenItem[] = [
  { hangul: '십일', roman: 'shee-beel', english: '11', audioId: 'number-si-bil' },
  { hangul: '이십이', roman: 'ee-shee-bee', english: '22', audioId: 'number-i-si-bi' },
  { hangul: '삼십삼', roman: 'sahm-sheep-sahm', english: '33', audioId: 'number-sam-sip-sam' },
  { hangul: '사십사', roman: 'sah-sheep-sah', english: '44', audioId: 'number-sa-sip-sa' },
  { hangul: '오십오', roman: 'oh-sheep-oh', english: '55', audioId: 'number-o-sip-o' },
  { hangul: '육십육', roman: 'yook-sheep-yook', english: '66', audioId: 'number-yuk-sip-yuk' },
  { hangul: '칠십칠', roman: 'cheel-sheep-cheel', english: '77', audioId: 'number-chil-sip-chil' },
  { hangul: '팔십팔', roman: 'pahl-sheep-pahl', english: '88', audioId: 'number-pal-sip-pal' },
  { hangul: '구십구', roman: 'goo-sheep-goo', english: '99', audioId: 'number-gu-sip-gu' },
]

export const CONVERSATION_PHRASES: SpokenItem[] = [
  { hangul: '안녕하세요', roman: 'ahn-nyuhng-hah-seh-yoh', english: 'Hello', audioId: 'phrase-an-nyeong-ha-se-yo' },
  { hangul: '이거 얼마예요?', roman: 'ee-guh uhl-mah-yeh-yoh', english: 'How much is this?', audioId: 'phrase-i-geo-eol-ma-ye-yo' },
  { hangul: '이거 주세요', roman: 'ee-guh joo-seh-yoh', english: 'This one, please', audioId: 'phrase-i-geo-ju-se-yo' },
  { hangul: '감사합니다', roman: 'gahm-sah-hahm-nee-dah', english: 'Thank you', audioId: 'phrase-gam-sa-ham-ni-da' },
  { hangul: '네', roman: 'neh', english: 'Yes', audioId: 'phrase-ne' },
  { hangul: '아니요', roman: 'ah-nee-yoh', english: 'No', audioId: 'phrase-a-ni-yo' },
  { hangul: '맛있어요', roman: 'mah-shee-ssuh-yoh', english: "It's delicious", audioId: 'phrase-ma-si-sseo-yo' },
  { hangul: '화장실 어디예요?', roman: 'hwah-jahng-sheel uh-dee-yeh-yoh', english: 'Where is the restroom?', audioId: 'phrase-hwa-jang-sil-eo-di-ye-yo' },
  { hangul: '다시 말해 주세요', roman: 'dah-shee mahl-heh joo-seh-yoh', english: 'Please say it again', audioId: 'phrase-da-si-mal-hae-ju-se-yo' },
  { hangul: '안녕히 계세요', roman: 'ahn-nyuhng-hee gyeh-seh-yoh', english: 'Goodbye', audioId: 'phrase-an-nyeong-hi-gye-se-yo' },
]

export const PRACTICE_RECORDINGS: SpokenItem[] = [
  ...BATCHIM_WORDS,
  ...NATIVE_NUMBERS,
  ...SINO_NUMBERS,
  ...NUMBER_PATTERN,
  ...CONVERSATION_PHRASES,
]
