import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell,
} from 'recharts'
import './Reports.css'

/* ─── Static insight data ─────────────────────────────────────────────────
   Derived from the model's SHAP feature importance and exploratory analysis,
   translated into plain language for non-technical users.
   ────────────────────────────────────────────────────────────────────────── */
const FACTOR_INFLUENCE = [
  { name: 'Foot traffic',         value: 28, fill: 'var(--brand)' },
  { name: 'Transport access',     value: 22, fill: 'var(--brand-light)' },
  { name: 'Competition level',    value: 19, fill: 'var(--green)' },
  { name: 'Market proximity',     value: 17, fill: 'var(--amber)' },
  { name: 'Residential density',  value: 14, fill: 'var(--text-muted)' },
]

const AREA_PROFILES = [
  { area: 'Kimironko', traffic: 77, competition: 65, transport: 80, market: 88 },
  { area: 'Remera',    traffic: 56, competition: 48, transport: 70, market: 58 },
  { area: 'Kacyiru',   traffic: 35, competition: 28, transport: 45, market: 32 },
]

const SUITABILITY_BY_AREA = [
  { area: 'Kimironko', favourable: 64, borderline: 24, weak: 12 },
  { area: 'Remera',    favourable: 48, borderline: 33, weak: 19 },
  { area: 'Kacyiru',   favourable: 31, borderline: 33, weak: 36 },
]

/* ─── Icons ─────────────────────────────────────────────────────────────── */
function IconTrend() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M2 13l4-4 3 3 6-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function IconMap() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M6 3l-4 1.5v10L6 13l6 2 4-1.5v-10L12 5l-6-2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M6 3v10M12 5v10" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  )
}
function IconClock() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M9 5v4l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function IconHistory() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M16 10v6l4 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function bandBadge(band) {
  switch (band) {
    case 'FAVOURABLE':   return { cls: 'badge-green', label: 'Strong Match' }
    case 'BORDERLINE':   return { cls: 'badge-amber', label: 'Mixed Signals' }
    case 'UNFAVOURABLE': return { cls: 'badge-red',   label: 'Weak Match' }
    default:             return { cls: 'badge-brand', label: '—' }
  }
}

export default function Reports() {
  const [history, setHistory] = useState([])

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('assessment_history') || '[]')
      setHistory(stored)
    } catch {
      setHistory([])
    }
  }, [])

  return (
    <div className="inner-page">
      <div className="page-header">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 6 }}>Insights & Reports</h1>
        <p className="section-sub">
          Patterns observed across personal care service locations in Kigali's commercial clusters.
        </p>
      </div>

      {/* Key insights */}
      <div className="insight-row">
        <div className="card insight-card">
          <div className="insight-icon" style={{ background: 'var(--brand-dim)', color: 'var(--brand)' }}>
            <IconTrend />
          </div>
          <h4>Foot traffic matters most</h4>
          <p>Of the five spatial factors analysed, pedestrian activity has the strongest
          relationship with how well a personal care business performs in an area.</p>
        </div>
        <div className="card insight-card">
          <div className="insight-icon" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
            <IconMap />
          </div>
          <h4>Kimironko leads in favourable areas</h4>
          <p>64% of locations studied near Kimironko market show spatial conditions similar to
          well-established personal care businesses.</p>
        </div>
        <div className="card insight-card">
          <div className="insight-icon" style={{ background: 'var(--amber-dim)', color: 'var(--amber)' }}>
            <IconClock />
          </div>
          <h4>Competition isn't always bad</h4>
          <p>A moderate cluster of similar businesses often signals a healthy customer base —
          isolation can be a bigger risk than competition.</p>
        </div>
      </div>

      {/* Charts */}
      <div className="reports-grid">
        <div className="card report-card">
          <h3>What influences a location's score</h3>
          <p className="report-card-desc">
            Relative influence of each spatial factor on the overall suitability score, based on
            patterns learned from the reference dataset.
          </p>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FACTOR_INFLUENCE} layout="vertical" margin={{ left: 10, right: 24, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} unit="%" axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => [`${v}%`, 'Relative influence']}
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
                  {FACTOR_INFLUENCE.map((entry, i) => <Cell key={i} fill={entry.fill.startsWith('var') ? getComputedColor(entry.fill) : entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card report-card">
          <h3>Suitability distribution by area</h3>
          <p className="report-card-desc">
            Share of studied locations falling into each suitability category, by commercial cluster.
          </p>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SUITABILITY_BY_AREA} margin={{ left: -10, right: 10, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="area" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} unit="%" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="favourable" name="Strong match"  stackId="a" fill={getComputedColor('var(--green)')} radius={[0,0,0,0]} />
                <Bar dataKey="borderline" name="Mixed signals" stackId="a" fill={getComputedColor('var(--amber)')} />
                <Bar dataKey="weak"       name="Weak match"    stackId="a" fill={getComputedColor('var(--red)')} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card report-card report-card-full">
          <h3>Area comparison</h3>
          <p className="report-card-desc">
            Relative strength of each commercial cluster across the four most influential spatial
            factors — higher is better.
          </p>
          <div className="chart-wrap" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData()}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="factor" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <PolarRadiusAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} angle={90} domain={[0, 100]} />
                <Radar name="Kimironko" dataKey="Kimironko" stroke={getComputedColor('var(--brand)')} fill={getComputedColor('var(--brand)')} fillOpacity={0.18} />
                <Radar name="Remera"    dataKey="Remera"    stroke={getComputedColor('var(--green)')} fill={getComputedColor('var(--green)')} fillOpacity={0.12} />
                <Radar name="Kacyiru"   dataKey="Kacyiru"   stroke={getComputedColor('var(--amber)')} fill={getComputedColor('var(--amber)')} fillOpacity={0.10} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span><span style={{display:'inline-block',width:10,height:10,borderRadius:2,background:'var(--brand)',marginRight:6}}/>Kimironko</span>
            <span><span style={{display:'inline-block',width:10,height:10,borderRadius:2,background:'var(--green)',marginRight:6}}/>Remera</span>
            <span><span style={{display:'inline-block',width:10,height:10,borderRadius:2,background:'var(--amber)',marginRight:6}}/>Kacyiru</span>
          </div>
        </div>
      </div>

      {/* Assessment history */}
      <div className="card report-card report-card-full" style={{ marginBottom: 32 }}>
        <h3>Your recent assessments</h3>
        <p className="report-card-desc">
          Locations you've assessed in this browser. This history is stored locally on your device.
        </p>

        {history.length === 0 ? (
          <div className="history-empty">
            <IconHistory />
            <div>No assessments yet. Run one from the map to see it appear here.</div>
          </div>
        ) : (
          <div className="history-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>When</th>
                  <th>Location</th>
                  <th>Result</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 10).map((h, i) => {
                  const badge = bandBadge(h.band)
                  return (
                    <tr key={i}>
                      <td>{new Date(h.timestamp).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                      <td>{h.lat.toFixed(4)}, {h.lng.toFixed(4)}</td>
                      <td><span className={`mini-badge ${badge.cls}`}>{badge.label}</span></td>
                      <td>{Math.round(h.probability * 100)}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* Resolve CSS variables to actual colors for recharts (which doesn't accept var()) */
function getComputedColor(cssVar) {
  if (typeof window === 'undefined') return '#1B4F82'
  const name = cssVar.match(/--[\w-]+/)?.[0]
  if (!name) return cssVar
  const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return val || '#1B4F82'
}

function radarData() {
  const factors = ['traffic', 'competition', 'transport', 'market']
  const labels  = { traffic: 'Foot traffic', competition: 'Low competition', transport: 'Transport access', market: 'Market proximity' }
  return factors.map(f => ({
    factor: labels[f],
    Kimironko: AREA_PROFILES[0][f],
    Remera:    AREA_PROFILES[1][f],
    Kacyiru:   AREA_PROFILES[2][f],
  }))
}
