import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { FREE_LESSONS, GRAMMAR_CARDS, GRAMMAR_LOCK } from './grammar.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist') continue
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walk(path, out)
    else out.push(path)
  }
  return out
}

test('two free grammar lessons are on the page and six titles stay locked', () => {
  assert.equal(GRAMMAR_CARDS.length, 8)
  assert.deepEqual(
    GRAMMAR_CARDS.filter((card) => card.free).map((card) => card.id),
    [1, 2],
  )
  assert.equal(FREE_LESSONS.length, 2)
  for (const lesson of FREE_LESSONS) {
    assert.equal(lesson.sentences.length, 3)
    lesson.sentences.forEach((sentence, index) => {
      assert.equal(sentence.audioId, `grammar-${lesson.id}-${index + 1}`)
      assert.equal(sentence.words.length > 0, true)
      for (const word of sentence.words) {
        assert.match(word.roman, /^[a-z]+(?:-[a-z]+)*$/)
        assert.equal(/[\u4e00-\u9fff]/.test(`${word.hangul}${sentence.english}${lesson.explanation}`), false)
      }
    })
  }
  assert.equal(FREE_LESSONS[0].sentences[0].words.map((word) => `${word.hangul} (${word.roman})`).join(' '), '저는 (juh-neun) 밥을 (bah-beul) 먹어요 (muh-guh-yoh)')
  assert.equal(FREE_LESSONS[1].sentences[1].words.map((word) => word.hangul).join(' '), '김밥 주세요')
  assert.equal(GRAMMAR_LOCK, 'Unlock with the 8-week course! Ask Jung to join.')
})

test('locked grammar sentences are not in the student app', () => {
  const src = walk(join(root, 'src'))
    .filter((path) => /\.(tsx?|css)$/.test(path) || (path.endsWith('.js') && !path.endsWith('.test.js')))
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n')
  const published = readFileSync(join(root, 'public/audio/README.md'), 'utf8')
  for (const secret of ['커피예요', 'kuh-pee-yeh-yoh', 'kuh-pee-reul', 'geem-bah-beun', 'shee-gah-nee', 'hahk-seng-ee-eh-yoh']) {
    assert.equal(src.includes(secret), false, secret)
    assert.equal(published.includes(secret), false, `public readme ${secret}`)
  }
  assert.match(src, /Unlock with the 8-week course! Ask Jung to join\./)
  assert.match(src, /Recording coming soon/)
  const page = readFileSync(join(root, 'src/pages/Grammar.tsx'), 'utf8')
  assert.doesNotMatch(page, /LOCKED_LESSONS|api\/_lib\/grammar/)
  const nav = readFileSync(join(root, 'src/data/nav.ts'), 'utf8')
  const app = readFileSync(join(root, 'src/App.tsx'), 'utf8')
  assert.match(nav, /label: 'Basic Grammar'/)
  assert.match(app, /path="\/grammar"/)
})
