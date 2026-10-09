import UnlockControl from './UnlockControl'
import { COURSE_CLOSED } from '../lib/course-access.ts'

export default function CourseLocked({
  title,
  inputId,
  enrolled,
  message = COURSE_CLOSED,
  error,
}: {
  title: string
  inputId: string
  enrolled: boolean
  message?: string
  error?: string | null
}) {
  return (
    <section className="card">
      <p className="kicker">8-week course</p>
      <h2>{title}</h2>
      <p className="lede homework-closed">{message}</p>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      {enrolled ? null : (
        <div className="unlock-bar">
          <p className="tiny">Have an 8-week class code?</p>
          <UnlockControl inputId={inputId} />
        </div>
      )}
    </section>
  )
}
