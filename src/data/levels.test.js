import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { LEVELS as serverLevels } from '../../api/_lib/levels.js'
import { GRAMMAR_LEVELS, LEVELS } from './levels.ts'
import { TABS } from './nav.ts'

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

test('student and server levels match, and the menu is five sections', () => {
  assert.deepEqual(
    LEVELS.map((level) => level.id),
    serverLevels.map((level) => level.id),
  )
  assert.deepEqual(
    TABS.map((tab) => tab.label),
    ['Home', 'Sounds', 'Talk', 'Grammar', 'Me'],
  )
  assert.deepEqual(
    TABS.map((tab) => `${tab.ko} (${tab.roman})`),
    ['홈 (hohm)', '소리 (soh-ree)', '대화 (deh-hwah)', '문법 (moon-ppuhp)', '나 (nah)'],
  )
  assert.deepEqual(
    GRAMMAR_LEVELS.map((level) => level.id),
    ['intermediate-1', 'intermediate-2', 'advanced-1', 'advanced-2'],
  )
  const layout = readFileSync(join(root, 'src/components/Layout.tsx'), 'utf8')
  assert.match(layout, /className="tabbar"/)
  assert.match(layout, /className="desktop-nav"/)
  assert.doesNotMatch(layout, /menu-btn/)
})

test('locked grammar sentences stay off the student app', () => {
  const src = walk(join(root, 'src'))
    .filter((path) => !path.endsWith('.test.js') && !path.endsWith('.test.ts'))
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n')
  for (const secret of ['커피예요', 'kuh-pee-yeh-yoh', 'hahk-sehng-ee-dah', 'shee-gah-nee', 'grammar-i1-ida-1', '학생이다']) {
    assert.equal(src.includes(secret), false, secret)
  }
  const page = readFileSync(join(root, 'src/pages/Grammar.tsx'), 'utf8')
  const lock = readFileSync(join(root, 'src/components/LevelLock.tsx'), 'utf8')
  assert.match(lock, /Ask Jung to unlock/)
  assert.match(page, /Recording coming soon/)
  assert.match(page, /Coming soon/)
  assert.doesNotMatch(page, /INTERMEDIATE_1_TOPICS/)
})
