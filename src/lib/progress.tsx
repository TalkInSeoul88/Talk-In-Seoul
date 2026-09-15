import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { HOMEWORK } from '../data/content'
import {
  loadHomework,
  loadNextClass,
  loadQuiz,
  saveHomework,
  saveNextClass,
  saveQuiz,
  type HomeworkState,
  type QuizResult,
} from './storage'

type ProgressContextValue = {
  homework: HomeworkState
  quiz: QuizResult | null
  nextClass: string
  homeworkDone: number
  homeworkTotal: number
  toggleHomework: (id: string) => void
  resetHomework: () => void
  recordQuiz: (score: number, total: number) => void
  updateNextClass: (value: string) => void
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [homework, setHomework] = useState<HomeworkState>(() =>
    typeof window === 'undefined' ? {} : loadHomework(),
  )
  const [quiz, setQuiz] = useState<QuizResult | null>(() =>
    typeof window === 'undefined' ? null : loadQuiz(),
  )
  const [nextClass, setNextClass] = useState(() =>
    typeof window === 'undefined' ? '' : loadNextClass(),
  )

  const toggleHomework = useCallback((id: string) => {
    setHomework((current) => {
      const next = { ...current, [id]: !current[id] }
      saveHomework(next)
      return next
    })
  }, [])

  const resetHomework = useCallback(() => {
    const cleared = Object.fromEntries(HOMEWORK.map((item) => [item.id, false]))
    saveHomework(cleared)
    setHomework(cleared)
  }, [])

  const recordQuiz = useCallback((score: number, total: number) => {
    const result = { score, total, completedAt: new Date().toISOString() }
    saveQuiz(result)
    setQuiz(result)
  }, [])

  const updateNextClass = useCallback((value: string) => {
    saveNextClass(value)
    setNextClass(value)
  }, [])

  const value = useMemo(
    () => ({
      homework,
      quiz,
      nextClass,
      homeworkDone: HOMEWORK.filter((item) => homework[item.id]).length,
      homeworkTotal: HOMEWORK.length,
      toggleHomework,
      resetHomework,
      recordQuiz,
      updateNextClass,
    }),
    [homework, quiz, nextClass, toggleHomework, resetHomework, recordQuiz, updateNextClass],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const value = useContext(ProgressContext)
  if (!value) throw new Error('useProgress must be used within ProgressProvider')
  return value
}
