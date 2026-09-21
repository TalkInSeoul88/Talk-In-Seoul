import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  BASIC_CONSONANTS,
  BASIC_CV_SYLLABLES,
  BASIC_VOWELS,
  DOUBLE_CONSONANTS,
  QUIZ_CONSONANTS,
  QUIZ_FLASHCARDS,
  QUIZ_VOWELS,
} from './content.ts'
import { QUIZ_WORDS_CLASS, QUIZ_WORDS_EASY } from './quiz-words.ts'

const VOWELS = 'ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ'
const BASIC_CONS = 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ'
const SSANG = 'ㄲㄸㅃㅆㅉ'
const COMPOUND_VOWELS = 'ㅐㅒㅔㅖㅘㅙㅚㅝㅞㅟㅢ'

test('quiz deck is 10 free vowels + 19 free consonants (29)', () => {
  assert.equal(QUIZ_VOWELS.length, 10)
  assert.equal(QUIZ_CONSONANTS.length, 19)
  assert.equal(DOUBLE_CONSONANTS.length, 5)
  assert.equal(QUIZ_FLASHCARDS.length, 29)
  assert.equal(QUIZ_VOWELS.map((item) => item.char).join(''), VOWELS)
  assert.equal(QUIZ_CONSONANTS.map((item) => item.char).join(''), BASIC_CONS + SSANG)
  assert.equal(DOUBLE_CONSONANTS.map((item) => item.char).join(''), SSANG)
  assert.equal(new Set(QUIZ_FLASHCARDS.map((item) => item.char)).size, 29)
  assert.equal(new Set(QUIZ_FLASHCARDS.map((item) => item.audioId)).size, 29)
})

test('quiz cards stay free jamo — no compound vowels and no 음절', () => {
  for (const card of QUIZ_FLASHCARDS) {
    assert.equal(COMPOUND_VOWELS.includes(card.char), false, `compound vowel ${card.char}`)
    assert.equal(card.audioId.startsWith('syllable-'), false, card.audioId)
    assert.ok(card.nameKo)
    assert.ok(card.roman)
    assert.ok(card.audioId.startsWith(card.kind === 'vowel' ? 'vowel-' : 'consonant-'))
  }
  assert.equal(
    QUIZ_VOWELS.every((item) => item.kind === 'vowel' && item.audioId.startsWith('vowel-')),
    true,
  )
  assert.equal(
    QUIZ_CONSONANTS.every((item) => item.kind === 'consonant' && item.audioId.startsWith('consonant-')),
    true,
  )
})

test('쌍자음 stay off the 140 CV chart and use kk/tt/pp/ss/jj clips', () => {
  assert.equal(BASIC_VOWELS.length, 10)
  assert.equal(BASIC_CONSONANTS.length, 14)
  assert.equal(BASIC_CV_SYLLABLES.length, 140)
  assert.equal(
    BASIC_CONSONANTS.some((item) => SSANG.includes(item.char)),
    false,
  )
  assert.equal(
    DOUBLE_CONSONANTS.every((item) => item.family === 'ssang'),
    true,
  )
  assert.deepEqual(
    DOUBLE_CONSONANTS.map((item) => item.audioId),
    ['consonant-kk', 'consonant-tt', 'consonant-pp', 'consonant-ss', 'consonant-jj'],
  )
  assert.deepEqual(
    DOUBLE_CONSONANTS.map((item) => [item.char, item.roman, item.nameKo]),
    [
      ['ㄲ', 'kk', '쌍기역'],
      ['ㄸ', 'tt', '쌍디귿'],
      ['ㅃ', 'pp', '쌍비읍'],
      ['ㅆ', 'ss', '쌍시옷'],
      ['ㅉ', 'jj', '쌍지읒'],
    ],
  )
  const audioDir = join(dirname(fileURLToPath(import.meta.url)), '../../public/audio')
  for (const item of DOUBLE_CONSONANTS) {
    assert.equal(existsSync(join(audioDir, `${item.audioId}.mp3`)), true, item.audioId)
  }
})

const EASY_WORDS = [
  ['물', 'mul', 'water'],
  ['밥', 'bap', 'rice / meal'],
  ['집', 'jip', 'house / home'],
  ['사람', 'saram', 'person'],
  ['친구', 'chingu', 'friend'],
  ['사랑', 'sarang', 'love'],
  ['한국', 'hanguk', 'Korea'],
  ['미국', 'miguk', 'USA'],
  ['엄마', 'eomma', 'mom'],
  ['아빠', 'appa', 'dad'],
  ['네', 'ne', 'yes'],
  ['아니요', 'aniyo', 'no'],
  ['커피', 'keopi', 'coffee'],
  ['학교', 'hakgyo', 'school'],
  ['돈', 'don', 'money'],
  ['시간', 'sigan', 'time'],
  ['오늘', 'oneul', 'today'],
  ['내일', 'naeil', 'tomorrow'],
  ['가게', 'gage', 'store / shop'],
  ['감사', 'gamsa', 'thanks'],
]

const CLASS_WORDS = [
  ['안녕하세요', 'annyeonghaseyo', 'hello'],
  ['감사합니다', 'gamsahamnida', 'thank you'],
  ['주세요', 'juseyo', 'please give me'],
  ['얼마예요', 'eolmayeyo', 'how much is it?'],
  ['맛있어요', 'masisseoyo', "it's delicious"],
  ['어디예요', 'eodiyeyo', 'where is it?'],
  ['화장실', 'hwajangsil', 'bathroom'],
  ['물 주세요', 'mul juseyo', 'water please'],
  ['메뉴', 'menyu', 'menu'],
  ['주문', 'jumun', 'order'],
  ['계산', 'gyesan', 'check / bill'],
  ['카드', 'kadeu', 'card'],
  ['현금', 'hyeongeum', 'cash'],
  ['도와주세요', 'dowajuseyo', 'please help me'],
  ['천천히', 'cheoncheonhi', 'slowly'],
  ['다시', 'dasi', 'again'],
  ['미안해요', 'mianhaeyo', 'sorry'],
  ['괜찮아요', 'gwaenchanayo', "it's okay"],
  ['맛집', 'matjip', 'good restaurant'],
  ['서울', 'seoul', 'Seoul'],
]

test('free Easy 20 단어 deck is exact hangul / roman / English order', () => {
  assert.equal(QUIZ_WORDS_EASY.length, 20)
  assert.deepEqual(
    QUIZ_WORDS_EASY.map((item) => [item.hangul, item.roman, item.meaning]),
    EASY_WORDS,
  )
})

test('class 단어 deck is exact hangul / roman / English order', () => {
  assert.equal(QUIZ_WORDS_CLASS.length, 20)
  assert.deepEqual(
    QUIZ_WORDS_CLASS.map((item) => [item.hangul, item.roman, item.meaning]),
    CLASS_WORDS,
  )
})

test('quiz word cards stay silent — no invented word MP3s', () => {
  const audioDir = join(dirname(fileURLToPath(import.meta.url)), '../../public/audio')
  const files = readdirSync(audioDir)
  assert.equal(
    files.some((name) => name.startsWith('word-') && name.endsWith('.mp3')),
    false,
  )
  for (const card of [...QUIZ_WORDS_EASY, ...QUIZ_WORDS_CLASS]) {
    assert.equal('audioId' in card, false, card.hangul)
  }
})

test('Quiz page keeps jamo decks free and gates only class 단어', () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
  const quizSrc = readFileSync(join(root, 'src/pages/Quiz.tsx'), 'utf8')
  const navSrc = readFileSync(join(root, 'src/data/nav.ts'), 'utf8')
  assert.match(quizSrc, /QUIZ_WORDS_EASY/)
  assert.match(quizSrc, /QUIZ_WORDS_CLASS/)
  assert.match(quizSrc, /QUIZ_VOWELS/)
  assert.match(quizSrc, /QUIZ_CONSONANTS/)
  assert.match(quizSrc, /words-class' && !enrollment\.enrolled/)
  assert.match(quizSrc, /UnlockControl/)
  assert.match(quizSrc, /FlashcardPlay/)
  assert.match(navSrc, /Easy 20 단어/)
  assert.match(navSrc, /Class 단어/)
  assert.doesNotMatch(quizSrc, /deck === 'vowels' && !enrollment/)
  assert.doesNotMatch(quizSrc, /deck === 'consonants' && !enrollment/)
  assert.doesNotMatch(quizSrc, /deck === 'words-easy' && !enrollment/)
})
