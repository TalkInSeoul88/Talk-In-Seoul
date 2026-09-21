/** Quiz 단어 cards. Hangul on the front; romanization + English on the back. No invented MP3s. */

export type QuizWord = {
  hangul: string
  roman: string
  meaning: string
}

/** Free Quiz deck — same access as 모음/자음 flashcards (no access code). */
export const QUIZ_WORDS_EASY: QuizWord[] = [
  { hangul: '물', roman: 'mul', meaning: 'water' },
  { hangul: '밥', roman: 'bap', meaning: 'rice / meal' },
  { hangul: '집', roman: 'jip', meaning: 'house / home' },
  { hangul: '사람', roman: 'saram', meaning: 'person' },
  { hangul: '친구', roman: 'chingu', meaning: 'friend' },
  { hangul: '사랑', roman: 'sarang', meaning: 'love' },
  { hangul: '한국', roman: 'hanguk', meaning: 'Korea' },
  { hangul: '미국', roman: 'miguk', meaning: 'USA' },
  { hangul: '엄마', roman: 'eomma', meaning: 'mom' },
  { hangul: '아빠', roman: 'appa', meaning: 'dad' },
  { hangul: '네', roman: 'ne', meaning: 'yes' },
  { hangul: '아니요', roman: 'aniyo', meaning: 'no' },
  { hangul: '커피', roman: 'keopi', meaning: 'coffee' },
  { hangul: '학교', roman: 'hakgyo', meaning: 'school' },
  { hangul: '돈', roman: 'don', meaning: 'money' },
  { hangul: '시간', roman: 'sigan', meaning: 'time' },
  { hangul: '오늘', roman: 'oneul', meaning: 'today' },
  { hangul: '내일', roman: 'naeil', meaning: 'tomorrow' },
  { hangul: '가게', roman: 'gage', meaning: 'store / shop' },
  { hangul: '감사', roman: 'gamsa', meaning: 'thanks' },
]

/** Class Quiz deck — same access-code gate as 음절(syllables). */
export const QUIZ_WORDS_CLASS: QuizWord[] = [
  { hangul: '안녕하세요', roman: 'annyeonghaseyo', meaning: 'hello' },
  { hangul: '감사합니다', roman: 'gamsahamnida', meaning: 'thank you' },
  { hangul: '주세요', roman: 'juseyo', meaning: 'please give me' },
  { hangul: '얼마예요', roman: 'eolmayeyo', meaning: 'how much is it?' },
  { hangul: '맛있어요', roman: 'masisseoyo', meaning: "it's delicious" },
  { hangul: '어디예요', roman: 'eodiyeyo', meaning: 'where is it?' },
  { hangul: '화장실', roman: 'hwajangsil', meaning: 'bathroom' },
  { hangul: '물 주세요', roman: 'mul juseyo', meaning: 'water please' },
  { hangul: '메뉴', roman: 'menyu', meaning: 'menu' },
  { hangul: '주문', roman: 'jumun', meaning: 'order' },
  { hangul: '계산', roman: 'gyesan', meaning: 'check / bill' },
  { hangul: '카드', roman: 'kadeu', meaning: 'card' },
  { hangul: '현금', roman: 'hyeongeum', meaning: 'cash' },
  { hangul: '도와주세요', roman: 'dowajuseyo', meaning: 'please help me' },
  { hangul: '천천히', roman: 'cheoncheonhi', meaning: 'slowly' },
  { hangul: '다시', roman: 'dasi', meaning: 'again' },
  { hangul: '미안해요', roman: 'mianhaeyo', meaning: 'sorry' },
  { hangul: '괜찮아요', roman: 'gwaenchanayo', meaning: "it's okay" },
  { hangul: '맛집', roman: 'matjip', meaning: 'good restaurant' },
  { hangul: '서울', roman: 'seoul', meaning: 'Seoul' },
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
  }
}

assertWordDeck('Easy 20 단어', QUIZ_WORDS_EASY, EASY_HANGUL)
assertWordDeck('Class 단어', QUIZ_WORDS_CLASS, CLASS_HANGUL)
