import type { TeacherClip } from '../data/content'
import JamoAudioBar from './JamoAudioBar'

type ListenItem = TeacherClip & {
  nameKo?: string
  cue?: string
}

export default function JamoListenRow({ jamo }: { jamo: ListenItem }) {
  return (
    <article className="jamo-row" id={`clip-${jamo.audioId}`}>
      <div className="jamo-row-head">
        <div className="jamo-row-glyph" aria-hidden="true">
          {jamo.char}
        </div>
        <div className="jamo-row-copy">
          <div className="jamo-row-title">
            <strong>{jamo.roman || jamo.char}</strong>
            {jamo.nameKo ? <span className="tiny"> · {jamo.nameKo}</span> : null}
          </div>
          {jamo.cue ? <p className="tiny jamo-row-cue">{jamo.cue}</p> : null}
        </div>
      </div>
      <JamoAudioBar jamo={jamo} />
    </article>
  )
}
