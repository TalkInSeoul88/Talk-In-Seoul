import JamoAudioBar from '../components/JamoAudioBar'
import ListenPick from '../components/ListenPick'
import { BREATH_SETS, RIEUL_LADDER, type SoundClip } from '../data/sound-workout.ts'

function ClipBlock({ clip }: { clip: SoundClip }) {
  return (
    <div className="grammar-sentence">
      <p className="word-line">
        {clip.hangul} <span className="word-roman">({clip.roman})</span>
      </p>
      <p className="tiny clip-detail">{clip.english}</p>
      <JamoAudioBar
        jamo={{ char: clip.hangul, roman: clip.roman, audioId: clip.audioId }}
        soonText="Recording coming soon"
      />
    </div>
  )
}

export default function SoundWorkout() {
  return (
    <div className="stack">
      <header>
        <p className="kicker">Sound Workout · 발음</p>
        <h2 className="page-title">Trouble sounds</h2>
        <p className="lede">A short warm-up. No class code needed. Record, then compare with Jung. Your voice stays on this phone.</p>
      </header>

      <section className="card">
        <h2>
          ㄹ <span className="word-roman">(reu) / (ri-eul)</span>
        </h2>
        <p className="grammar-explain">
          One quick tongue tap. The tip hits the bumpy spot just behind the top teeth, then lets go. Lips stay still.
        </p>
        <div className="jamo-list">
          {RIEUL_LADDER.map((rung, index) => (
            <article key={rung.id} className="ladder-rung" id={`ladder-${rung.id}`}>
              <h3>
                {index + 1} · {rung.title}
              </h3>
              <p className="sound-tip">{rung.tip}</p>
              {rung.clips.map((clip) => (
                <ClipBlock key={clip.audioId + clip.hangul} clip={clip} />
              ))}
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>
          ㅂ <span className="word-roman">(beu) / (bi-eup)</span>
          {' · '}
          ㅍ <span className="word-roman">(peu) / (pi-eup)</span>
          {' · '}
          ㅃ <span className="word-roman">(ppeu) / (ssahng-bi-eup)</span>
        </h2>
        <p className="grammar-explain">
          Hold a tissue (휴지 <span className="word-roman">(hyoo-jee)</span>) two inches from your lips. ㅂ (beu) is a lazy b: a small
          wiggle. ㅍ (peu) blows out a candle: the tissue flies. ㅃ (ppeu) is the p in “spy”: lips pressed, no air, the tissue stays
          still.
        </p>
        <div className="jamo-list">
          {BREATH_SETS.map((set) => (
            <article key={set.id} className="ladder-rung" id={`breath-${set.id}`}>
              <h3>{set.title}</h3>
              <ListenPick choices={set.choices} />
              {set.choices.map((clip) => (
                <ClipBlock key={clip.audioId} clip={clip} />
              ))}
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
