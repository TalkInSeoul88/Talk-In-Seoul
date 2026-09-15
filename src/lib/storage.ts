import { HOMEWORK, WEEK_1_LESSON } from '../data/content'

const HOMEWORK_KEY = 'talk-in-seoul:homework'
const QUIZ_KEY = 'talk-in-seoul:quiz'
const CLASS_KEY = 'talk-in-seoul:next-class'

export type HomeworkState = Record<string, boolean>
export type QuizResult = {
  score: number
  total: number
  completedAt: string
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function emptyHomework(): HomeworkState {
  return Object.fromEntries(HOMEWORK.map((item) => [item.id, false]))
}

export function loadHomework(): HomeworkState {
  const saved = readJson<HomeworkState>(HOMEWORK_KEY, {})
  return { ...emptyHomework(), ...saved }
}

export function saveHomework(state: HomeworkState) {
  localStorage.setItem(HOMEWORK_KEY, JSON.stringify(state))
}

export function loadQuiz(): QuizResult | null {
  return readJson<QuizResult | null>(QUIZ_KEY, null)
}

export function saveQuiz(result: QuizResult) {
  localStorage.setItem(QUIZ_KEY, JSON.stringify(result))
}

export function loadNextClass(): string {
  return localStorage.getItem(CLASS_KEY) ?? WEEK_1_LESSON.nextClassDefault
}

export function saveNextClass(value: string) {
  localStorage.setItem(CLASS_KEY, value)
}
