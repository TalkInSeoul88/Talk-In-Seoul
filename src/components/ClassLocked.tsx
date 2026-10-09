import UnlockControl from './UnlockControl'

export default function ClassLocked({
  kicker,
  title,
  detail,
  inputId,
  error,
}: {
  kicker: string
  title: string
  detail: string
  inputId: string
  error?: string | null
}) {
  return (
    <section className="card">
      <p className="kicker">{kicker}</p>
      <h2>{title}</h2>
      <p className="tiny material-note">{detail}</p>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="unlock-bar">
        <p className="tiny">Access code needed</p>
        <UnlockControl inputId={inputId} />
      </div>
    </section>
  )
}
