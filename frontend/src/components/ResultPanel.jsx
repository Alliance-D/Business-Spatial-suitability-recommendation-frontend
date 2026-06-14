/**
 * ResultPanel — spatial suitability output panel.
 * Language is plain and accessible. No technical terms exposed to the user.
 * SHAP values are used internally to drive text — never shown as numbers.
 */
import './ResultPanel.css'

/* ─── Icons ─────────────────────────────────────────────────────────────── */
function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6.5" fill="currentColor" fillOpacity=".15" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function IconMinus() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6.5" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M4.5 7h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}
function IconX() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6.5" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M5 5l4 4M9 5l-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}
function IconPin() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="13" r="5" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M16 3C10.48 3 6 7.48 6 13C6 20.5 16 29 16 29C16 29 26 20.5 26 13C26 7.48 21.52 3 16 3Z"
            stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  )
}
function IconInfo() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <circle cx="6.5" cy="6.5" r="6" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M6.5 5.5v4M6.5 3.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function ratingConfig(rating) {
  switch (rating) {
    case 'favourable': return { color: 'var(--green)',  bg: 'var(--green-dim)',  Icon: IconCheck, label: 'Good' }
    case 'borderline': return { color: 'var(--amber)',  bg: 'var(--amber-dim)',  Icon: IconMinus, label: 'Mixed' }
    case 'unfavourable': return { color: 'var(--red)', bg: 'var(--red-dim)',    Icon: IconX,     label: 'Weak' }
    default:           return { color: 'var(--text-muted)', bg: 'var(--surface-2)', Icon: IconMinus, label: '—' }
  }
}

function bandConfig(band) {
  switch (band) {
    case 'FAVOURABLE':   return { label: 'Strong Match',   badgeClass: 'badge-green', arc: 'var(--green)', pct: 85 }
    case 'BORDERLINE':   return { label: 'Mixed Signals',  badgeClass: 'badge-amber', arc: 'var(--amber)', pct: 52 }
    case 'UNFAVOURABLE': return { label: 'Weak Match',     badgeClass: 'badge-red',   arc: 'var(--red)',   pct: 22 }
    default:             return { label: 'Unknown',        badgeClass: 'badge-brand', arc: 'var(--brand)', pct: 0 }
  }
}

/* Score arc */
function ScoreArc({ probability, color }) {
  const pct = Math.round((probability || 0) * 100)
  const radius = 40
  const circ   = 2 * Math.PI * radius
  const fill   = circ - (pct / 100) * circ * 0.75

  return (
    <div className="score-arc-wrap">
      <svg width="100" height="70" viewBox="0 0 100 80">
        {/* Track */}
        <circle cx="50" cy="55" r={radius} fill="none"
          stroke="var(--border)" strokeWidth="7"
          strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
          strokeDashoffset={circ * 0.125}
          strokeLinecap="round"
          transform="rotate(135 50 55)"
        />
        {/* Fill */}
        <circle cx="50" cy="55" r={radius} fill="none"
          stroke={color} strokeWidth="7"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={fill + circ * 0.125}
          strokeLinecap="round"
          transform="rotate(135 50 55)"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="score-number">{pct}<span className="score-pct">%</span></div>
    </div>
  )
}

/* Factor row */
function FactorRow({ factor }) {
  const cfg = ratingConfig(factor.rating)
  return (
    <div className="factor-row">
      <div className="factor-row-top">
        <div className="factor-icon" style={{ color: cfg.color }}>
          <cfg.Icon />
        </div>
        <div className="factor-name">{factor.factor}</div>
        <div className="factor-badge" style={{ background: cfg.bg, color: cfg.color }}>
          {cfg.label}
        </div>
      </div>
      <div className="factor-bar-track">
        <div
          className="factor-bar-fill"
          style={{
            width: factor.rating === 'favourable' ? '80%' : factor.rating === 'borderline' ? '50%' : '22%',
            background: cfg.color,
          }}
        />
      </div>
      <p className="factor-explanation">{factor.explanation}</p>
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function ResultPanel({ result, assessing }) {
  /* Loading state */
  if (assessing) {
    return (
      <div className="result-panel result-loading">
        <div className="loading-pulse" />
        <div className="loading-pulse" style={{ width: '60%' }} />
        <div className="loading-pulse" style={{ width: '80%' }} />
        <div className="loading-pulse" style={{ width: '50%' }} />
        <p style={{ marginTop: 16, fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Analysing location…
        </p>
      </div>
    )
  }

  /* Empty state */
  if (!result) {
    return (
      <div className="result-panel result-empty">
        <div className="empty-icon"><IconPin /></div>
        <h3 className="empty-title">No location selected</h3>
        <p className="empty-desc">
          Click anywhere on the map to place a pin, then press <strong>Run Assessment</strong> to get a spatial analysis.
        </p>
      </div>
    )
  }

  const band = bandConfig(result.suitability_band)
  const prob = result.suitability_probability ?? 0

  const favourable   = (result.factors || []).filter(f => f.rating === 'favourable')
  const unfavourable = (result.factors || []).filter(f => f.rating === 'unfavourable')

  return (
    <div className="result-panel">
      {/* Header */}
      <div className="result-header">
        <div>
          <div className="result-header-label">Location Assessment</div>
          <h2 className="result-title">Personal Care Services</h2>
        </div>
        <span className={`badge ${band.badgeClass}`}>{band.label}</span>
      </div>

      {/* Score */}
      <div className="score-section">
        <ScoreArc probability={prob} color={band.arc} />
        <div className="score-summary">
          <div className="score-summary-title">Spatial suitability score</div>
          <p className="score-summary-text">
            {result.suitability_band === 'FAVOURABLE'
              ? 'This location has strong spatial characteristics for a personal care service. The area shows good foot traffic, manageable competition, and accessible infrastructure.'
              : result.suitability_band === 'BORDERLINE'
              ? 'This location shows mixed spatial signals. Some factors are favourable; others need attention. Review the breakdown below before deciding.'
              : 'This location has challenging spatial conditions for a personal care service. Consider the limiting factors carefully before committing to this spot.'}
          </p>
        </div>
      </div>

      {/* Quick summary */}
      {(favourable.length > 0 || unfavourable.length > 0) && (
        <div className="quick-summary">
          {favourable.length > 0 && (
            <div className="qs-block qs-good">
              <div className="qs-label">Working in your favour</div>
              {favourable.map((f, i) => (
                <div key={i} className="qs-item">
                  <span className="qs-dot" />
                  {f.factor}: {f.detail}
                </div>
              ))}
            </div>
          )}
          {unfavourable.length > 0 && (
            <div className="qs-block qs-bad">
              <div className="qs-label">Areas to consider</div>
              {unfavourable.map((f, i) => (
                <div key={i} className="qs-item">
                  <span className="qs-dot" />
                  {f.factor}: {f.detail}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Factor breakdown */}
      <div className="factors-section">
        <div className="factors-title">Detailed breakdown</div>
        <div className="factors-list">
          {(result.factors || []).map((f, i) => (
            <FactorRow key={i} factor={f} />
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="result-disclaimer">
        <IconInfo />
        <span>{result.disclaimer}</span>
      </div>
    </div>
  )
}
