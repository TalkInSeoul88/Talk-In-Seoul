import type { Jamo } from '../data/content'
import JamoAudioBar from './JamoAudioBar'

export default function JamoListenRow({ jamo }: { jamo: Jamo }) {
  return (
    <article className="jamo-row">
      <div className="jamo-row-head">
        <div className="jamo-row-glyph" aria-hidden="true">
          {jamo.char}
        </div>
        <div className="jamo-row-copy">
          <div className="jamo-row-title">
            <strong>{jamo.roman}</strong>
            <span className="tiny"> · {jamo.nameKo}</span>
          </div>
          <p className="tiny jamo-row-cue">{jamo.cue}</p>
        </div>
      </div>
      <JamoAudioBar jamo={jamo} />
    </article>
  )
}
