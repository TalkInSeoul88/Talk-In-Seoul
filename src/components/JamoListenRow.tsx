import type { JamoExample, TeacherClip } from '../data/content'
import JamoAudioBar from './JamoAudioBar'

type ListenItem = TeacherClip & {
  nameKo?: string
  cue?: string
  example?: JamoExample
}

export default function JamoListenRow({ jamo }: { jamo: ListenItem }) {
  const example = jamo.example
  return (
    <article className="jamo-row" id={`clip-${jamo.audioId}`}>
      <div className="jamo-row-head">
        <div className="jamo-row-glyph" aria-hidden="true">
          {jamo.char}
        </div>
        <div className="jamo-row-copy">
          <div className="jamo-row-title">
            <strong className={example ? 'sound-hint' : undefined}>{jamo.roman || jamo.char}</strong>
            {jamo.nameKo && !example ? <span className="tiny"> · {jamo.nameKo}</span> : null}
          </div>
          {example ? (
            <p className="jamo-row-example">
              <span className="jamo-row-example-word">{example.hangul}</span>
              <span className="sound-hint">{example.sound}</span>
              {example.meaning ? <span className="tiny">({example.meaning})</span> : null}
            </p>
          ) : jamo.cue ? (
            <p className="tiny jamo-row-cue">{jamo.cue}</p>
          ) : null}
        </div>
      </div>
      <JamoAudioBar jamo={jamo} />
    </article>
  )
}
