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
  { key: 'overview',    label: 'Overview',       icon: Icon.grid   },
  { key: 'import',      label: 'Import Data',    icon: Icon.upload },
  { key: 'predictions', label: 'Prediction Log', icon: Icon.list   },
  { key: 'model',       label: 'Model Status',   icon: Icon.cpu    },
]

/* ─── Auth helper ─────────────────────────────────────────────────────────── */
function authHeaders() {
  // Send Bearer token for API clients and Swagger UI.
  // The browser also sends the httpOnly cookie automatically
  // due to withCredentials on axios requests.
  const token = localStorage.getItem('admin_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/* ─── Overview tab ────────────────────────────────────────────────────────── */
function OverviewTab() {
  const [status,  setStatus]  = useState(null)
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
          field observations, then use <strong>Model Status → Retrain</strong> to update the model.
        </p>
      </div>
    </div>
  )
}

/* ─── Import tab ──────────────────────────────────────────────────────────── */
function ImportTab() {
  const [file,           setFile]           = useState(null)
  const [previewLines,   setPreviewLines]   = useState(null)
  const [uploadStatus,   setUploadStatus]   = useState(null)
  const [uploading,      setUploading]      = useState(false)
  const [recomputing,    setRecomputing]    = useState(false)
  const [recomputeStatus, setRecomputeStatus] = useState(null)

  async function onFileChange(e) {
    const f = e.target.files?.[0]
    setFile(f)
    setPreviewLines(null)
    setUploadStatus(null)
    if (!f) return
    const text = await f.text()
    setPreviewLines(text.split('\n').slice(0, 6).join('\n'))
  }

  async function upload() {
    if (!file) return
    setUploading(true)
    setUploadStatus(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await axios.post(ENDPOINTS.ADMIN_BULK_OBS, fd, {
        headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
      })
      setUploadStatus({ ok: true, message: res.data.message })
    } catch (err) {
      setUploadStatus({ ok: false, message: err.response?.data?.detail || err.message })
    } finally {
      setUploading(false)
    }
  }

  async function recomputeSpatial() {
    if (!window.confirm(
      'This will recalculate competitor counts and distance bands for ALL observations ' +
      'using PostGIS spatial queries.\n\n' +
      'Run this after uploading new field data so spatial features reflect the current ' +
      'state of the dataset.\n\n' +
      'It may take 30–60 seconds. Proceed?'
    )) return

    setRecomputing(true)
    setRecomputeStatus(null)
    try {
      const res = await axios.post(
        ENDPOINTS.ADMIN_RECOMPUTE,
        {},
        { headers: authHeaders(), timeout: 120000 }
      )
      setRecomputeStatus({ ok: true, message: res.data.message })
    } catch (err) {
      setRecomputeStatus({ ok: false, message: err.response?.data?.detail || err.message })
    } finally {
      setRecomputing(false)
    }
  }

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Import Data</h1>
          <p className="section-sub">
            Upload field-collected observations as a CSV. After import, recompute spatial
            features, then go to <strong>Model Status</strong> to retrain.
          </p>
        </div>
      </div>

      {/* Upload card */}
      <div className="card" style={{ padding: 22, marginBottom: 20 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>
          Step 1 — Upload CSV
        </h3>
        <label htmlFor="csv-upload" style={{ display: 'block' }}>
          <div className="import-dropzone">
            <div style={{ display: 'flex', justifyContent: 'center' }}><Icon.upArrow /></div>
            <h4>{file ? file.name : 'Click to select a CSV file'}</h4>
            <p>Required columns must match the dataset schema below</p>
          </div>
        </label>
        <input id="csv-upload" type="file" accept=".csv" onChange={onFileChange} style={{ display: 'none' }} />

        {previewLines && (
          <div className="import-preview">{previewLines}</div>
        )}

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={upload} disabled={!file || uploading}>
            {uploading ? 'Uploading…' : 'Upload and import'}
          </button>
        </div>

        {uploadStatus && (
          <div className={`status-banner ${uploadStatus.ok ? 'ok' : 'err'}`}>
            {uploadStatus.message}
          </div>
        )}
      </div>

      {/* Recompute spatial card */}
      <div className="card" style={{ padding: 22, marginBottom: 20 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 8 }}>
          Step 2 — Recompute spatial features
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
          After uploading new observations, run this to recalculate competitor counts
          (<code>comp_count_300/500/1k</code>) and distance bands
          (<code>dist_transport/market/road</code>) for every row using PostGIS spatial
          queries. This ensures the training data reflects the current state of the
          full dataset before retraining.
        </p>

        <button
          className="btn btn-primary"
          onClick={recomputeSpatial}
          disabled={recomputing}
        >
          {recomputing ? 'Recomputing… (30–60s)' : 'Recompute spatial features'}
        </button>

        {recomputeStatus && (
          <div className={`status-banner ${recomputeStatus.ok ? 'ok' : 'err'}`} style={{ marginTop: 16 }}>
            {recomputeStatus.message}
          </div>
        )}
      </div>

      {/* Schema reference */}
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 12 }}>
          Required CSV columns
        </h3>
        <div className="schema-table">
          <table>
            <thead>
              <tr><th>Column</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr><td><code>latitude</code>, <code>longitude</code></td><td>GPS coordinates (WGS84 / EPSG:4326)</td></tr>
              <tr><td><code>comp_count_300/500/1k</code></td><td>Competitor counts at each radius — recalculated by Step 2</td></tr>
              <tr><td><code>traffic_morning/midday/evening</code></td><td>Field pedestrian counts per observation window</td></tr>
              <tr><td><code>dist_transport/market/road</code></td><td>Proximity bands 0–3 — recalculated by Step 2</td></tr>
              <tr><td><code>pop_density</code></td><td>NISR 2022 census value for the cell</td></tr>
              <tr><td><code>road_type</code></td><td>0 = unpaved, 1 = tarmac</td></tr>
              <tr><td><code>reference_label</code></td><td>1 = positive spatial reference, 0 = negative</td></tr>
              <tr><td><code>cluster</code></td><td>Cluster ID: 0 = Kimironko, 1 = Remera, 2 = Kacyiru</td></tr>
              <tr><td><code>cluster_name</code></td><td>Cluster name (optional)</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ─── Predictions tab ─────────────────────────────────────────────────────── */
function scoreToBand(score) {
  if (score == null) return '—'
  if (score >= 0.65) return 'FAVOURABLE'
  if (score >= 0.40) return 'BORDERLINE'
  return 'UNFAVOURABLE'
}

function PredictionsTab() {
  const [data,    setData]    = useState(null)
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
              {(data.predictions || []).map(p => {
                const band = scoreToBand(p.suitability_score)
                const bandClass = band === 'FAVOURABLE' ? 'badge-green' : band === 'BORDERLINE' ? 'badge-amber' : band === 'UNFAVOURABLE' ? 'badge-red' : 'badge-brand'
                return (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.created_at ? new Date(p.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}</td>
                    <td>{Number(p.latitude).toFixed(5)}, {Number(p.longitude).toFixed(5)}</td>
                    <td><span className={`mini-badge ${bandClass}`}>{band}</span></td>
                    <td>{p.suitability_score != null ? (p.suitability_score * 100).toFixed(1) + '%' : '—'}</td>
                  </tr>
                )
              })}
              {(!data.predictions || data.predictions.length === 0) && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No predictions logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

/* --- Model status tab ------------------------------------------------------ */
function ModelTab() {
  const [metrics,      setMetrics]      = useState(null)
  const [metricsLoad,  setMetricsLoad]  = useState(true)
  const [retraining,   setRetraining]   = useState(false)
  const [retrainMsg,   setRetrainMsg]   = useState(null)

  const pollRef = { current: null }

  function fetchMetrics() {
    setMetricsLoad(true)
    axios.get(ENDPOINTS.ADMIN_MODEL_METRICS, { headers: authHeaders() })
      .then(res => setMetrics(res.data))
      .catch(() => setMetrics({ error: true }))
      .finally(() => setMetricsLoad(false))
  }

  useEffect(() => { fetchMetrics() }, [])

  function startPolling() {
    const iv = setInterval(async () => {
      try {
        const statusUrl = ENDPOINTS.ADMIN_RETRAIN + '/status'
        const res = await axios.get(statusUrl, { headers: authHeaders() })
        const data = res.data
        if (!data.running) {
          clearInterval(iv)
          setRetraining(false)
          if (data.last_result) {
            setRetrainMsg({ ok: true, data: data.last_result })
            fetchMetrics()
          } else if (data.last_error) {
            setRetrainMsg({ ok: false, message: data.last_error })
          }
        }
      } catch {
        clearInterval(iv)
        setRetraining(false)
        setRetrainMsg({ ok: false, message: 'Lost connection while waiting for retrain result.' })
      }
    }, 5000)
  }

  async function handleRetrain() {
    if (!window.confirm(
      'This will retrain the model from scratch using all observations in the database.\n\n' +
      'Retraining runs in the background — the API stays available.\n' +
      'This page polls for the result automatically.\n\nProceed?'
    )) return

    setRetraining(true)
    setRetrainMsg(null)
    try {
      await axios.post(ENDPOINTS.ADMIN_RETRAIN, {}, { headers: authHeaders(), timeout: 15000 })
      startPolling()
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to start retraining.'
      if (msg.includes('already in progress')) {
        setRetrainMsg({ ok: false, message: 'Already in progress — check status below.' })
        startPolling()
      } else {
        setRetraining(false)
        setRetrainMsg({ ok: false, message: msg })
      }
    }
  }

  const metricRows = metrics && !metrics.error ? [
    ['Model',         metrics.model],
    ['AUC-ROC',       metrics.test_auc_roc != null ? metrics.test_auc_roc.toFixed(4) : '\u2014'],
    ['F1-Score',      metrics.test_f1      != null ? metrics.test_f1.toFixed(4)      : '\u2014'],
    ['OOB Score',     metrics.oob_score    != null ? metrics.oob_score.toFixed(4)    : '\u2014'],
    ['Training set',  metrics.n_train      != null ? `${metrics.n_train} observations` : '\u2014'],
    ['Test set',      metrics.n_test       != null
      ? `${metrics.n_test} observations (${metrics.cluster_test ?? 'hold-out'})`
      : '\u2014'],
    ['Train clusters', Array.isArray(metrics.clusters_train) ? metrics.clusters_train.join(', ') : '\u2014'],
  ] : []

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Model Status</h1>
          <p className="section-sub">Active model metrics and retraining.</p>
        </div>
        <button className="btn btn-primary" onClick={handleRetrain} disabled={retraining}>
          {retraining ? 'Retraining\u2026 (background)' : 'Retrain model'}
        </button>
      </div>

      {retraining && (
        <div className="status-banner ok" style={{ marginBottom: 20 }}>
          Retraining is running in the background. The API remains fully available.
          This page updates automatically when complete.
        </div>
      )}

      {retrainMsg && (
        <div className={`status-banner ${retrainMsg.ok ? 'ok' : 'err'}`} style={{ marginBottom: 20 }}>
          {retrainMsg.ok ? retrainMsg.data?.message : retrainMsg.message}
          {retrainMsg.ok && retrainMsg.data && (
            <div style={{ marginTop: 8, fontSize: '0.82rem', opacity: 0.85 }}>
              AUC-ROC: {retrainMsg.data.test_auc_roc} | F1: {retrainMsg.data.test_f1} |
              OOB: {retrainMsg.data.oob_score} | {retrainMsg.data.n_train} train /
              {retrainMsg.data.n_test} test | {retrainMsg.data.elapsed_seconds}s
            </div>
          )}
        </div>
      )}

      <div className="card" style={{ padding: 22, marginBottom: 20 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>Current metrics</h3>
        {metricsLoad && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading\u2026</p>}
        {!metricsLoad && metrics?.error && (
          <div className="status-banner err">
            Model metadata unavailable. Ensure artefacts are present and the server has restarted.
          </div>
        )}
        {!metricsLoad && metricRows.length > 0 && (
          <table><tbody>
            {metricRows.map(([k, v]) => (
              <tr key={k}>
                <td style={{ fontWeight: 500, color: 'var(--text-primary)', width: 160 }}>{k}</td>
                <td>{String(v ?? '\u2014')}</td>
              </tr>
            ))}
          </tbody></table>
        )}
      </div>

      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 8 }}>About retraining</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Retraining reads all observations from the database, engineers the five derived spatial
          features, and runs a 30-iteration randomised hyperparameter search with 3-fold
          cross-validation. The spatial hold-out split (Kimironko + Remera for training,
          Kacyiru for evaluation) is preserved automatically. Retraining runs as a background
          task so the API stays available. The new model is saved only if AUC-ROC &ge; 0.70.
        </p>
      </div>
    </div>
  )
}

/* ─── Dashboard shell ─────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [tab, setTab] = useState('overview')
  const navigate = useNavigate()

  useEffect(() => {
    if (localStorage.getItem('admin_logged_in') !== 'true') {
      navigate('/admin/login')
    }
  }, [navigate])

  const logout = useCallback(async () => {
    try {
      await axios.post(
        ENDPOINTS.ADMIN_LOGIN.replace('/login', '/logout'),
        {},
        { headers: authHeaders(), withCredentials: true }
      )
    } catch {}
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_logged_in')
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
