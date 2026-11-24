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
import { BATCHIM_WORDS, wordSyllables } from './practice-sections.ts'
import { QUIZ_WORDS_CLASS, QUIZ_WORDS_EASY, QUIZ_WORDS_NEXT } from './quiz-words.ts'

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
  ['물', 'mool', 'water'],
  ['밥', 'bahp', 'rice / meal'],
  ['집', 'jeep', 'house / home'],
  ['사람', 'sah-rahm', 'person'],
  ['친구', 'cheen-goo', 'friend'],
  ['사랑', 'sah-rahng', 'love'],
  ['한국', 'hahn-gook', 'Korea'],
  ['미국', 'mee-gook', 'USA'],
  ['엄마', 'uhm-mah', 'mom'],
  ['아빠', 'ah-ppah', 'dad'],
  ['네', 'neh', 'yes'],
  ['아니요', 'ah-nee-yoh', 'no'],
  ['커피', 'kuh-pee', 'coffee'],
  ['학교', 'hahk-gyoh', 'school'],
  ['돈', 'dohn', 'money'],
  ['시간', 'shee-gahn', 'time'],
  ['오늘', 'oh-neul', 'today'],
  ['내일', 'neh-eel', 'tomorrow'],
  ['가게', 'gah-geh', 'store / shop'],
  ['감사', 'gahm-sah', 'thanks'],
]

const CLASS_WORDS = [
  ['안녕하세요', 'ahn-nyuhng-hah-seh-yoh', 'hello'],
  ['감사합니다', 'gahm-sah-hahm-nee-dah', 'thank you'],
  ['주세요', 'joo-seh-yoh', 'please give me'],
  ['얼마예요', 'uhl-mah-yeh-yoh', 'how much is it?'],
  ['맛있어요', 'mah-shee-ssuh-yoh', "it's delicious"],
  ['어디예요', 'uh-dee-yeh-yoh', 'where is it?'],
  ['화장실', 'hwah-jahng-sheel', 'bathroom'],
  ['물 주세요', 'mool joo-seh-yoh', 'water please'],
  ['메뉴', 'meh-nyoo', 'menu'],
  ['주문', 'joo-moon', 'order'],
  ['계산', 'gyeh-sahn', 'check / bill'],
  ['카드', 'kah-deu', 'card'],
  ['현금', 'hyuhn-geum', 'cash'],
  ['도와주세요', 'doh-wah-joo-seh-yoh', 'please help me'],
  ['천천히', 'chuhn-chuhn-hee', 'slowly'],
  ['다시', 'dah-shee', 'again'],
  ['미안해요', 'mee-ahn-heh-yoh', 'sorry'],
  ['괜찮아요', 'gwehn-chah-nah-yoh', "it's okay"],
  ['맛집', 'maht-jeep', 'good restaurant'],
  ['서울', 'suh-ool', 'Seoul'],
]

const NEXT_WORDS = [
  ['김밥', 'geem-bahp', 'kimbap'],
  ['라면', 'rah-myuhn', 'ramen'],
  ['빵', 'ppahng', 'bread'],
  ['김치', 'geem-chee', 'kimchi'],
  ['국', 'gook', 'soup'],
  ['만두', 'mahn-doo', 'dumpling'],
  ['계란', 'gyeh-rahn', 'egg'],
  ['시장', 'shee-jahng', 'market'],
  ['컵', 'kuhp', 'cup'],
  ['포장', 'poh-jahng', 'takeout'],
  ['책', 'chehk', 'book'],
  ['산', 'sahn', 'mountain'],
  ['눈', 'noon', 'eye / snow'],
  ['손', 'sohn', 'hand'],
  ['문', 'moon', 'door'],
  ['꽃', 'kkoht', 'flower'],
  ['옷', 'oht', 'clothes'],
  ['가방', 'gah-bahng', 'bag'],
  ['전화', 'juhn-hwah', 'phone'],
  ['동생', 'dohng-sehng', 'younger sibling'],
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

test('free Next 20 단어 deck is exact hangul / roman / English order', () => {
  assert.equal(QUIZ_WORDS_NEXT.length, 20)
  assert.deepEqual(
    QUIZ_WORDS_NEXT.map((item) => [item.hangul, item.roman, item.meaning]),
    NEXT_WORDS,
  )
})

test('Next 20 words each have one easy batchim and stay off the other decks', () => {
  const taken = new Set([...QUIZ_WORDS_EASY, ...QUIZ_WORDS_CLASS].map((item) => item.hangul))
  const batchimRoman = new Map(BATCHIM_WORDS.map((item) => [item.hangul, item.roman]))
  for (const card of QUIZ_WORDS_NEXT) {
    assert.equal(taken.has(card.hangul), false, card.hangul)
    const parts = wordSyllables(card.hangul)
    assert.equal(
      parts.some((part) => part.batchim.length === 1),
      true,
      card.hangul,
    )
    assert.equal(
      parts.every((part) => part.batchim.length <= 1),
      true,
      card.hangul,
    )
    const taught = batchimRoman.get(card.hangul)
    if (taught) assert.equal(card.roman, taught, card.hangul)
  }
})

test('quiz word romanization stays lowercase, hyphenated, and one chunk per syllable', () => {
  for (const card of [...QUIZ_WORDS_EASY, ...QUIZ_WORDS_NEXT, ...QUIZ_WORDS_CLASS]) {
    assert.match(card.roman, /^[a-z]+(?:[ -][a-z]+)*$/, card.hangul)
    const syllables = [...card.hangul].filter((char) => char >= '\uac00' && char <= '\ud7a3').length
    assert.equal(card.roman.split(/[ -]/).length, syllables, `${card.hangul} ${card.roman}`)
  }
})

test('quiz word cards stay silent — no invented word MP3s', () => {
  const audioDir = join(dirname(fileURLToPath(import.meta.url)), '../../public/audio')
  const files = readdirSync(audioDir)
  assert.equal(
    files.some((name) => name.startsWith('word-') && name.endsWith('.mp3')),
    false,
  )
  for (const card of [...QUIZ_WORDS_EASY, ...QUIZ_WORDS_NEXT, ...QUIZ_WORDS_CLASS]) {
    assert.equal('audioId' in card, false, card.hangul)
  }
})

test('Quiz page keeps jamo decks free and gates only class 단어', () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
  const quizSrc = readFileSync(join(root, 'src/pages/Quiz.tsx'), 'utf8')
  const navSrc = readFileSync(join(root, 'src/data/nav.ts'), 'utf8')
  assert.match(quizSrc, /QUIZ_WORDS_EASY/)
  assert.match(quizSrc, /QUIZ_WORDS_NEXT/)
  assert.match(quizSrc, /QUIZ_WORDS_CLASS/)
  assert.match(quizSrc, /QUIZ_VOWELS/)
  assert.match(quizSrc, /QUIZ_CONSONANTS/)
  assert.match(quizSrc, /words-easy[\s\S]*words-next[\s\S]*words-class/)
  assert.match(quizSrc, /words-class' && !enrollment\.enrolled/)
  assert.match(quizSrc, /UnlockControl/)
  assert.match(quizSrc, /FlashcardPlay/)
  assert.match(navSrc, /Easy 20 단어/)
  assert.match(navSrc, /Next 20 단어/)
  assert.match(navSrc, /Class 단어/)
  assert.doesNotMatch(quizSrc, /deck === 'vowels' && !enrollment/)
  assert.doesNotMatch(quizSrc, /deck === 'consonants' && !enrollment/)
  assert.doesNotMatch(quizSrc, /deck === 'words-easy' && !enrollment/)
  assert.doesNotMatch(quizSrc, /deck === 'words-next' && !enrollment/)
})
