import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ENDPOINTS } from '../../constants'
import './Admin.css'

/* ─── Icons ─────────────────────────────────────────────────────────────── */
const Icon = {
  pin: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M8 1.5C5.24 1.5 3 3.74 3 6.5C3 9.5 8 14 8 14C8 14 13 9.5 13 6.5C13 3.74 10.76 1.5 8 1.5Z" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  ),
  grid: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  ),
  upload: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 11V3M5 6l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 12v1a1 1 0 001 1h8a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  list: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 4h10M3 8h10M3 12h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="1.3" cy="4" r=".8" fill="currentColor"/>
      <circle cx="1.3" cy="8" r=".8" fill="currentColor"/>
      <circle cx="1.3" cy="12" r=".8" fill="currentColor"/>
    </svg>
  ),
  cpu: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="4" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M6 1.5v2.5M10 1.5v2.5M6 12v2.5M10 12v2.5M1.5 6H4M1.5 10H4M12 6h2.5M12 10h2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  logout: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 14H3.5a1.5 1.5 0 01-1.5-1.5v-9A1.5 1.5 0 013.5 2H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.5 11l3-3-3-3M13.5 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  upArrow: () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 20V8M8 13l6-6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 22h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
}

const NAV_ITEMS = [
  { key: 'overview',   label: 'Overview',         icon: Icon.grid },
  { key: 'import',     label: 'Import Data',      icon: Icon.upload },
  { key: 'predictions',label: 'Prediction Log',   icon: Icon.list },
  { key: 'model',      label: 'Model Status',     icon: Icon.cpu },
]

/* ─── Auth helper ─────────────────────────────────────────────────────────── */
function authHeaders() {
  const token = localStorage.getItem('admin_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/* ─── Overview tab ────────────────────────────────────────────────────────── */
function OverviewTab() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(ENDPOINTS.ADMIN_DB_STATUS, { headers: authHeaders() })
      .then(res => setStatus(res.data))
      .catch(() => setStatus({ error: true }))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Overview</h1>
          <p className="section-sub">System status and dataset summary.</p>
        </div>
      </div>

      <div className="admin-stats">
        <div className="card admin-stat-card">
          <div className="admin-stat-label">Database connection</div>
          <div className={`admin-stat-value ${loading ? '' : status?.error ? 'err' : 'ok'}`}>
            {loading ? '…' : status?.error ? 'Offline' : 'Connected'}
          </div>
        </div>
        <div className="card admin-stat-card">
          <div className="admin-stat-label">Total observations</div>
          <div className="admin-stat-value">{loading ? '…' : status?.total_observations ?? '—'}</div>
        </div>
        <div className="card admin-stat-card">
          <div className="admin-stat-label">Positive references</div>
          <div className="admin-stat-value ok">{loading ? '…' : status?.positive_references ?? '—'}</div>
        </div>
        <div className="card admin-stat-card">
          <div className="admin-stat-label">Negative references</div>
          <div className="admin-stat-value">{loading ? '…' : status?.negative_references ?? '—'}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 8 }}>Coverage</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          The reference dataset covers three commercial clusters in Gasabo and Kicukiro districts:
          Kimironko, Remera, and Kacyiru. Use <strong>Import Data</strong> to add newly collected
          field observations, and <strong>Model Status</strong> to review the active model's
          performance metrics.
        </p>
      </div>
    </div>
  )
}

/* ─── Import tab ──────────────────────────────────────────────────────────── */
function ImportTab() {
  const [file, setFile] = useState(null)
  const [previewLines, setPreviewLines] = useState(null)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const REQUIRED_COLUMNS = [
    'latitude', 'longitude', 'comp_count_300', 'comp_count_500', 'comp_count_1k',
    'traffic_morning', 'traffic_midday', 'traffic_evening',
    'dist_transport', 'dist_market', 'dist_road',
    'pop_density', 'road_type', 'reference_label',
  ]

  async function onFileChange(e) {
    const f = e.target.files?.[0]
    setFile(f)
    setPreviewLines(null)
    setStatus(null)
    if (!f) return
    const text = await f.text()
    setPreviewLines(text.split('\n').slice(0, 6).join('\n'))
  }

  async function upload() {
    if (!file) return
    setLoading(true)
    setStatus(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await axios.post(ENDPOINTS.ADMIN_BULK_OBS, fd, {
        headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
      })
      setStatus({ ok: true, message: res.data.message || `Imported successfully.` })
    } catch (err) {
      setStatus({ ok: false, message: err.response?.data?.detail || err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Import Data</h1>
          <p className="section-sub">Upload field-collected observations as a CSV file.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 20 }}>
        <label htmlFor="csv-upload" style={{ display: 'block' }}>
          <div className="import-dropzone">
            <div style={{ display: 'flex', justifyContent: 'center' }}><Icon.upArrow /></div>
            <h4>{file ? file.name : 'Click to select a CSV file'}</h4>
            <p>Required columns must match the dataset schema</p>
          </div>
        </label>
        <input id="csv-upload" type="file" accept=".csv" onChange={onFileChange} style={{ display: 'none' }} />

        {previewLines && (
          <div className="import-preview">{previewLines}</div>
        )}

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={upload} disabled={!file || loading}>
            {loading ? 'Uploading…' : 'Upload and import'}
          </button>
        </div>

        {status && (
          <div className={`status-banner ${status.ok ? 'ok' : 'err'}`}>{status.message}</div>
        )}
      </div>

      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 12 }}>Required columns</h3>
        <div className="schema-table">
          <table>
            <thead>
              <tr><th>Column</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr><td><code>latitude</code>, <code>longitude</code></td><td>GPS coordinates (WGS84 / EPSG:4326)</td></tr>
              <tr><td><code>comp_count_300/500/1k</code></td><td>Computed via PostGIS ST_DWithin against the POI layer</td></tr>
              <tr><td><code>traffic_morning/midday/evening</code></td><td>Field pedestrian counts for each observation window</td></tr>
              <tr><td><code>dist_transport/market/road</code></td><td>Proximity bands (0–3) from PostGIS ST_Distance</td></tr>
              <tr><td><code>pop_density</code></td><td>NISR 2022 census value for the cell</td></tr>
              <tr><td><code>road_type</code></td><td>0 = unpaved, 1 = tarmac</td></tr>
              <tr><td><code>reference_label</code></td><td>1 = positive reference, 0 = negative reference</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ─── Predictions tab ─────────────────────────────────────────────────────── */
function PredictionsTab() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(ENDPOINTS.ADMIN_RECENT_PREDS, { headers: authHeaders() })
      .then(res => setData(res.data))
      .catch(err => setData({ error: err.response?.data?.detail || 'Unable to load predictions.' }))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Prediction Log</h1>
          <p className="section-sub">Recent assessments served by the API.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 22 }}>
        {loading && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</p>}
        {!loading && data?.error && <div className="status-banner err">{data.error}</div>}
        {!loading && data && !data.error && (
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Timestamp</th><th>Location</th><th>Band</th><th>Score</th>
              </tr>
            </thead>
            <tbody>
              {(data.predictions || []).map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.created_at}</td>
                  <td>{Number(p.latitude).toFixed(5)}, {Number(p.longitude).toFixed(5)}</td>
                  <td>{p.suitability_band}</td>
                  <td>{p.suitability_score}</td>
                </tr>
              ))}
              {(!data.predictions || data.predictions.length === 0) && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No predictions logged yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

/* ─── Model status tab ────────────────────────────────────────────────────── */
function ModelTab() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(ENDPOINTS.ADMIN_MODEL_METRICS, { headers: authHeaders() })
      .then(res => setMetrics(res.data))
      .catch(() => setMetrics({ error: true }))
      .finally(() => setLoading(false))
  }, [])

  const rows = metrics && !metrics.error ? [
    ['Model',        metrics.model],
    ['AUC-ROC',      metrics.test_auc_roc],
    ['F1-Score',     metrics.test_f1],
    ['OOB Score',    metrics.oob_score],
    ['Training set', `${metrics.n_train} observations`],
    ['Test set',     `${metrics.n_test} observations (Kacyiru hold-out)`],
  ] : []

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Model Status</h1>
          <p className="section-sub">Active model metadata and evaluation metrics.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 22 }}>
        {loading && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</p>}
        {!loading && metrics?.error && (
          <div className="status-banner err">Model metadata unavailable. Check that the backend artefacts are loaded.</div>
        )}
        {!loading && rows.length > 0 && (
          <table>
            <tbody>
              {rows.map(([k, v]) => (
                <tr key={k}><td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{k}</td><td>{String(v)}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

/* ─── Dashboard shell ─────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [tab, setTab] = useState('overview')
  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem('admin_token')) {
      navigate('/admin/login')
    }
  }, [navigate])

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token')
    navigate('/admin/login')
  }, [navigate])

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo"><Icon.pin /></div>
          <div>
            <div className="admin-sidebar-title">KigaliSite</div>
            <div className="admin-sidebar-sub">Admin Panel</div>
          </div>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              className={`admin-nav-item${tab === item.key ? ' active' : ''}`}
              onClick={() => setTab(item.key)}
            >
              <item.icon />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-nav-item" onClick={logout}>
            <Icon.logout />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {tab === 'overview'    && <OverviewTab />}
        {tab === 'import'      && <ImportTab />}
        {tab === 'predictions' && <PredictionsTab />}
        {tab === 'model'       && <ModelTab />}
      </main>
    </div>
  )
}
