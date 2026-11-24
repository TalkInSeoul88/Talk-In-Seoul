/** Quiz 단어 cards. Hangul on the front; American-readable romanization + English on the back. No invented MP3s. */

export type QuizWord = {
  hangul: string
  roman: string
  meaning: string
}

/**
 * Free Quiz deck — same access as 모음/자음 flashcards (no access code).
 * Roman: lowercase, syllables split with hyphens, read like English.
 */
export const QUIZ_WORDS_EASY: QuizWord[] = [
  { hangul: '물', roman: 'mool', meaning: 'water' },
  { hangul: '밥', roman: 'bahp', meaning: 'rice / meal' },
  { hangul: '집', roman: 'jeep', meaning: 'house / home' },
  { hangul: '사람', roman: 'sah-rahm', meaning: 'person' },
  { hangul: '친구', roman: 'cheen-goo', meaning: 'friend' },
  { hangul: '사랑', roman: 'sah-rahng', meaning: 'love' },
  { hangul: '한국', roman: 'hahn-gook', meaning: 'Korea' },
  { hangul: '미국', roman: 'mee-gook', meaning: 'USA' },
  { hangul: '엄마', roman: 'uhm-mah', meaning: 'mom' },
  { hangul: '아빠', roman: 'ah-ppah', meaning: 'dad' },
  { hangul: '네', roman: 'neh', meaning: 'yes' },
  { hangul: '아니요', roman: 'ah-nee-yoh', meaning: 'no' },
  { hangul: '커피', roman: 'kuh-pee', meaning: 'coffee' },
  { hangul: '학교', roman: 'hahk-gyoh', meaning: 'school' },
  { hangul: '돈', roman: 'dohn', meaning: 'money' },
  { hangul: '시간', roman: 'shee-gahn', meaning: 'time' },
  { hangul: '오늘', roman: 'oh-neul', meaning: 'today' },
  { hangul: '내일', roman: 'neh-eel', meaning: 'tomorrow' },
  { hangul: '가게', roman: 'gah-geh', meaning: 'store / shop' },
  { hangul: '감사', roman: 'gahm-sah', meaning: 'thanks' },
]

/** Class Quiz deck — same access-code gate as 음절(syllables). */
export const QUIZ_WORDS_CLASS: QuizWord[] = [
  { hangul: '안녕하세요', roman: 'ahn-nyuhng-hah-seh-yoh', meaning: 'hello' },
  { hangul: '감사합니다', roman: 'gahm-sah-hahm-nee-dah', meaning: 'thank you' },
  { hangul: '주세요', roman: 'joo-seh-yoh', meaning: 'please give me' },
  { hangul: '얼마예요', roman: 'uhl-mah-yeh-yoh', meaning: 'how much is it?' },
  { hangul: '맛있어요', roman: 'mah-shee-ssuh-yoh', meaning: "it's delicious" },
  { hangul: '어디예요', roman: 'uh-dee-yeh-yoh', meaning: 'where is it?' },
  { hangul: '화장실', roman: 'hwah-jahng-sheel', meaning: 'bathroom' },
  { hangul: '물 주세요', roman: 'mool joo-seh-yoh', meaning: 'water please' },
  { hangul: '메뉴', roman: 'meh-nyoo', meaning: 'menu' },
  { hangul: '주문', roman: 'joo-moon', meaning: 'order' },
  { hangul: '계산', roman: 'gyeh-sahn', meaning: 'check / bill' },
  { hangul: '카드', roman: 'kah-deu', meaning: 'card' },
  { hangul: '현금', roman: 'hyuhn-geum', meaning: 'cash' },
  { hangul: '도와주세요', roman: 'doh-wah-joo-seh-yoh', meaning: 'please help me' },
  { hangul: '천천히', roman: 'chuhn-chuhn-hee', meaning: 'slowly' },
  { hangul: '다시', roman: 'dah-shee', meaning: 'again' },
  { hangul: '미안해요', roman: 'mee-ahn-heh-yoh', meaning: 'sorry' },
  { hangul: '괜찮아요', roman: 'gwehn-chah-nah-yoh', meaning: "it's okay" },
  { hangul: '맛집', roman: 'maht-jeep', meaning: 'good restaurant' },
  { hangul: '서울', roman: 'suh-ool', meaning: 'Seoul' },
]

/** Free Quiz deck — weeks 5–8 words with an easy batchim. Same access as Easy 20. */
export const QUIZ_WORDS_NEXT: QuizWord[] = [
  { hangul: '김밥', roman: 'geem-bahp', meaning: 'kimbap' },
  { hangul: '라면', roman: 'rah-myuhn', meaning: 'ramen' },
  { hangul: '빵', roman: 'ppahng', meaning: 'bread' },
  { hangul: '김치', roman: 'geem-chee', meaning: 'kimchi' },
  { hangul: '국', roman: 'gook', meaning: 'soup' },
  { hangul: '만두', roman: 'mahn-doo', meaning: 'dumpling' },
  { hangul: '계란', roman: 'gyeh-rahn', meaning: 'egg' },
  { hangul: '시장', roman: 'shee-jahng', meaning: 'market' },
  { hangul: '컵', roman: 'kuhp', meaning: 'cup' },
  { hangul: '포장', roman: 'poh-jahng', meaning: 'takeout' },
  { hangul: '책', roman: 'chehk', meaning: 'book' },
  { hangul: '산', roman: 'sahn', meaning: 'mountain' },
  { hangul: '눈', roman: 'noon', meaning: 'eye / snow' },
  { hangul: '손', roman: 'sohn', meaning: 'hand' },
  { hangul: '문', roman: 'moon', meaning: 'door' },
  { hangul: '꽃', roman: 'kkoht', meaning: 'flower' },
  { hangul: '옷', roman: 'oht', meaning: 'clothes' },
  { hangul: '가방', roman: 'gah-bahng', meaning: 'bag' },
  { hangul: '전화', roman: 'juhn-hwah', meaning: 'phone' },
  { hangul: '동생', roman: 'dohng-sehng', meaning: 'younger sibling' },
]

const EASY_HANGUL = [
  '물',
  '밥',
  '집',
  '사람',
  '친구',
  '사랑',
  '한국',
  '미국',
  '엄마',
  '아빠',
  '네',
  '아니요',
  '커피',
  '학교',
  '돈',
  '시간',
  '오늘',
  '내일',
  '가게',
  '감사',
]

const CLASS_HANGUL = [
  '안녕하세요',
  '감사합니다',
  '주세요',
  '얼마예요',
  '맛있어요',
  '어디예요',
  '화장실',
  '물 주세요',
  '메뉴',
  '주문',
  '계산',
  '카드',
  '현금',
  '도와주세요',
  '천천히',
  '다시',
  '미안해요',
  '괜찮아요',
  '맛집',
  '서울',
]

const NEXT_HANGUL = [
  '김밥',
  '라면',
  '빵',
  '김치',
  '국',
  '만두',
  '계란',
  '시장',
  '컵',
  '포장',
  '책',
  '산',
  '눈',
  '손',
  '문',
  '꽃',
  '옷',
  '가방',
  '전화',
  '동생',
]

function assertWordDeck(name: string, cards: QuizWord[], expectedHangul: string[]) {
  if (cards.length !== 20) {
    throw new Error(`${name} must have 20 cards, got ${cards.length}`)
  }
  const hangul = cards.map((item) => item.hangul)
  if (hangul.join('|') !== expectedHangul.join('|')) {
    throw new Error(`${name} hangul order is wrong`)
  }
  if (new Set(hangul).size !== cards.length) {
    throw new Error(`${name} has duplicate hangul`)
  }
  for (const card of cards) {
    if (!card.roman.trim() || !card.meaning.trim()) {
      throw new Error(`${name} card ${card.hangul} is missing romanization or English`)
    }
    if (!/^[a-z]+(?:[ -][a-z]+)*$/.test(card.roman)) {
      throw new Error(`${name} card ${card.hangul} romanization must be lowercase hyphenated syllables`)
    }
    const syllables = [...card.hangul].filter((char) => char >= '\uac00' && char <= '\ud7a3').length
    const chunks = card.roman.split(/[ -]/).length
    if (chunks !== syllables) {
      throw new Error(`${name} card ${card.hangul} romanization ${card.roman} does not match syllable count`)
    }
  }
}

assertWordDeck('Easy 20 단어', QUIZ_WORDS_EASY, EASY_HANGUL)
assertWordDeck('Class 단어', QUIZ_WORDS_CLASS, CLASS_HANGUL)
assertWordDeck('Next 20 단어', QUIZ_WORDS_NEXT, NEXT_HANGUL)

const allHangul = [...QUIZ_WORDS_EASY, ...QUIZ_WORDS_NEXT, ...QUIZ_WORDS_CLASS].map((item) => item.hangul)
if (new Set(allHangul).size !== allHangul.length) {
  throw new Error('Quiz word decks share a hangul card')
}
