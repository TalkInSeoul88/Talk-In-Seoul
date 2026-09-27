const KEY = 'talk-in-seoul:trace'

export type TraceProgress = {
  lineId: string
  index: number
  byLine: Record<string, number>
}

export function loadTraceProgress(): TraceProgress | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<TraceProgress>
    if (!parsed || typeof parsed.lineId !== 'string') return null
    const index = typeof parsed.index === 'number' && parsed.index >= 0 ? Math.floor(parsed.index) : 0
    const byLine: Record<string, number> = {}
    if (parsed.byLine && typeof parsed.byLine === 'object') {
      for (const [id, value] of Object.entries(parsed.byLine)) {
        if (typeof value === 'number' && value >= 0) byLine[id] = Math.floor(value)
      }
    }
    byLine[parsed.lineId] = index
    return { lineId: parsed.lineId, index, byLine }
  } catch {
    return null
  }
}

export function saveTraceProgress(progress: TraceProgress) {
  const next: TraceProgress = {
    lineId: progress.lineId,
    index: progress.index,
    byLine: { ...progress.byLine, [progress.lineId]: progress.index },
  }
  localStorage.setItem(KEY, JSON.stringify(next))
}

export function rememberedIndex(progress: TraceProgress | null, lineId: string): number {
  if (!progress) return 0
  const value = progress.byLine[lineId]
  return typeof value === 'number' ? value : 0
}
