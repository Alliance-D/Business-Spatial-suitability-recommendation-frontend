import { useNavigate } from 'react-router-dom'
import './Overview.css'

/* ─── Icons ─────────────────────────────────────────────────────────────── */
const icons = {
  foot: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M7 3a2 2 0 100 4 2 2 0 000-4zM13 3a2 2 0 100 4 2 2 0 000-4z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 17v-3l2-4 3 2 3-2 2 4v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  compete: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="4" cy="4" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="16" cy="4" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="4" cy="16" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="16" cy="16" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  bus: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 9h14M6 17v-1M14 17v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="6.5" cy="11.5" r=".5" fill="currentColor"/>
      <circle cx="13.5" cy="11.5" r=".5" fill="currentColor"/>
    </svg>
  ),
  market: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 7l1.5-3h11L17 7M3 7v9a1 1 0 001 1h12a1 1 0 001-1V7M3 7h14" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8 17v-4h4v4" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  density: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="10" width="3" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="8.5" y="6" width="3" height="11" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="14" y="3" width="3" height="14" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  warning: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 2L20 19H2L11 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M11 8v5M11 16v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
}

export default function Overview() {
  const navigate = useNavigate()

  return (
    <div className="inner-page">
      {/* Hero */}
      <section className="overview-hero">
        <div>
          <span className="overview-eyebrow">Spatial decision support</span>
          <h1 className="overview-title">
            Find out if a location is <em>right</em> for your salon — before you sign the lease.
          </h1>
          <p className="overview-lead">
            KigaliSite analyses the spatial conditions around any point in Kigali — foot traffic,
            nearby competition, transport access, and residential density — and tells you how that
            location compares to areas where personal care businesses are currently thriving.
          </p>
          <div className="overview-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>
              Assess a location
            </button>
            <button className="btn btn-lg" onClick={() => navigate('/reports')}>
              View insights
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <svg viewBox="0 0 200 150" fill="none">
            <rect width="200" height="150" rx="12" fill="none"/>
            <path d="M10 110 Q60 90 100 100 Q150 112 190 80" stroke="var(--border-2)" strokeWidth="10" fill="none"/>
            <path d="M30 10 L45 140" stroke="var(--border-2)" strokeWidth="8" fill="none"/>
            <circle cx="100" cy="70" r="32" fill="none" stroke="var(--brand)" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.5"/>
            <circle cx="100" cy="70" r="5" fill="var(--brand)"/>
            <circle cx="78" cy="55" r="3" fill="var(--green)" opacity="0.7"/>
            <circle cx="120" cy="58" r="3" fill="var(--green)" opacity="0.7"/>
            <circle cx="115" cy="90" r="3" fill="var(--amber)" opacity="0.7"/>
            <circle cx="85" cy="92" r="3" fill="var(--green)" opacity="0.7"/>
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="stat-strip">
        <div className="stat-cell">
          <div className="stat-value">187</div>
          <div className="stat-label">Locations studied</div>
        </div>
        <div className="stat-cell">
          <div className="stat-value">3</div>
          <div className="stat-label">Commercial areas covered</div>
        </div>
        <div className="stat-cell">
          <div className="stat-value">5</div>
          <div className="stat-label">Spatial factors analysed</div>
        </div>
        <div className="stat-cell">
          <div className="stat-value">300m–1km</div>
          <div className="stat-label">Analysis radius range</div>
        </div>
      </section>

      {/* How it works */}
      <section className="overview-section">
        <div className="overview-section-head">
          <h2>How it works</h2>
          <p>Three steps — no technical knowledge required.</p>
        </div>
        <div className="step-grid">
          <div className="card step-card">
            <div className="step-number">1</div>
            <h3>Choose a location</h3>
            <p>Search for an address or click directly on the map to drop a pin anywhere in Kigali.</p>
          </div>
          <div className="card step-card">
            <div className="step-number">2</div>
            <h3>Run the assessment</h3>
            <p>The system looks at what's happening around that exact point — foot traffic, nearby
            businesses, transport links, and the surrounding population.</p>
          </div>
          <div className="card step-card">
            <div className="step-number">3</div>
            <h3>Read the breakdown</h3>
            <p>Get a plain-language summary of what's working in your favour and what to watch out
            for, factor by factor.</p>
          </div>
        </div>
      </section>

      {/* What we analyse */}
      <section className="overview-section">
        <div className="overview-section-head">
          <h2>What we look at</h2>
          <p>Five spatial factors, each shown to influence whether personal care businesses thrive
          in a given area.</p>
        </div>
        <div className="factor-grid">
          <div className="card factor-tile">
            <div className="factor-tile-icon">{icons.foot}</div>
            <h4>Foot traffic</h4>
            <p>How many people pass by at different times of day</p>
          </div>
          <div className="card factor-tile">
            <div className="factor-tile-icon">{icons.compete}</div>
            <h4>Competition</h4>
            <p>How many similar businesses are already nearby</p>
          </div>
          <div className="card factor-tile">
            <div className="factor-tile-icon">{icons.bus}</div>
            <h4>Transport access</h4>
            <p>Distance to the nearest bus or moto-taxi stop</p>
          </div>
          <div className="card factor-tile">
            <div className="factor-tile-icon">{icons.market}</div>
            <h4>Market proximity</h4>
            <p>How close the location is to markets and commercial hubs</p>
          </div>
          <div className="card factor-tile">
            <div className="factor-tile-icon">{icons.density}</div>
            <h4>Residential density</h4>
            <p>How many people live within the surrounding area</p>
          </div>
        </div>
      </section>

      {/* Scope */}
      <section className="overview-section">
        <div className="overview-section-head">
          <h2>Where this applies</h2>
        </div>
        <div className="scope-grid">
          <div className="card scope-card">
            <h4><span className="scope-dot" />Business type</h4>
            <p>Personal care services — hair salons, barbershops, beauty salons, and nail studios.
            In Kigali these are commonly run from the same premises, so the system treats them as
            one category.</p>
          </div>
          <div className="card scope-card">
            <h4><span className="scope-dot" />Coverage area</h4>
            <p>Kimironko, Remera, and Kacyiru in Gasabo and Kicukiro districts. The model is trained
            on patterns observed in these commercial clusters.</p>
          </div>
          <div className="card scope-card">
            <h4><span className="scope-dot" />Data source</h4>
            <p>Field-collected spatial observations combined with map data, processed through a
            machine learning model trained to recognise patterns associated with active,
            established businesses.</p>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="overview-section">
        <div className="overview-disclaimer">
          <div className="overview-disclaimer-icon">{icons.warning}</div>
          <div>
            <h4>This is a decision-support tool, not a guarantee</h4>
            <p>
              KigaliSite estimates how closely a location's spatial conditions match areas where
              personal care businesses currently operate. It does not predict business success,
              profitability, or guarantee outcomes, and says nothing about your readiness, capital,
              or management skills. Use it as one input among many when evaluating a location.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
