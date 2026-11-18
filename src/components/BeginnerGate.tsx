import type { ReactNode } from 'react'
import LevelLock from './LevelLock'
import { hasLevel } from '../data/levels.ts'
import { useEnrollment } from '../lib/enrollment.tsx'

export default function BeginnerGate({ children }: { children: ReactNode }) {
  const { enrollment } = useEnrollment()
  if (enrollment.enrolled && !hasLevel(enrollment.levels, 'beginner')) {
    return (
      <div className="stack">
        <LevelLock label="Beginner" />
      </div>
    )
  }
  return children
}
