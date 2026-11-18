export default function LevelLock({ label }: { label: string }) {
  return (
    <article className="card grammar-card">
      <h2>{label}</h2>
      <p className="grammar-lock">
        <svg className="grammar-lock-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M8 10V8a4 4 0 1 1 8 0v2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <rect x="5.5" y="10" width="13" height="9.5" rx="2" fill="currentColor" />
        </svg>
        <span>Ask Jung to unlock {label}</span>
      </p>
    </article>
  )
}
