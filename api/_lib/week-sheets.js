import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../content/materials')

/** Ids the This Week page may request. Files are not in public/. */
export const WEEK_SHEETS = {
  'week-1-consonant-writing': 'hangul-consonant-practice.pdf',
  'week-1-vowel-writing': 'hangul-vowel-practice.pdf',
  'week-1-word-writing': 'hangul-word-practice.pdf',
}

export async function readWeekSheet(id) {
  const name = WEEK_SHEETS[String(id || '')]
  if (!name || name.includes('/') || name.includes('..')) return null
  try {
    const bytes = await readFile(path.join(DIR, name))
    return { name, bytes }
  } catch (error) {
    if (error && error.code === 'ENOENT') return null
    throw error
  }
}
