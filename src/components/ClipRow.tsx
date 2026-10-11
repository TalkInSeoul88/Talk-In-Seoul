import JamoAudioBar from './JamoAudioBar'
import { batchimLetters, toClip, wordSyllables, type SpokenItem } from '../data/practice-sections.ts'

export function SpokenLine({ item, markBatchim = false }: { item: SpokenItem; markBatchim?: boolean }) {
  const parts = markBatchim ? wordSyllables(item.hangul) : null
  return (
    <p className="word-line">
      {parts
        ? parts.map((part, index) => (
            <span key={`${part.char}-${index}`} className={part.batchim ? 'batchim-letter' : undefined}>
              {part.char}
            </span>
          ))
        : item.hangul}{' '}
      <span className="word-roman">({item.roman})</span>
    </p>
  )
}

export default function ClipRow({ item, markBatchim = false }: { item: SpokenItem; markBatchim?: boolean }) {
  const bottoms = markBatchim ? batchimLetters(item.hangul) : []
  return (
    <article className="jamo-row" id={`clip-${item.audioId}`}>
      <SpokenLine item={item} markBatchim={markBatchim} />
      <p className="tiny clip-detail">
        {item.english}
        {bottoms.length > 0 ? ` · bottom ${bottoms.join(' · ')}` : ''}
      </p>
      <JamoAudioBar jamo={toClip(item)} soonText="Recording coming soon" />
    </article>
  )
}
