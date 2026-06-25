/**
 * Frontend constants — API base URL, timeouts, named endpoints.
 * Set VITE_API_BASE_URL in .env to override the default localhost target.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) ||
  'http://localhost:8000'

const API_TIMEOUT_MS = Number(
  import.meta.env.VITE_API_TIMEOUT_MS ||
  (typeof process !== 'undefined' && process.env?.REACT_APP_API_TIMEOUT_MS) ||
  12000
)

const ENDPOINTS = {
  // Public
  ASSESS:             `${API_BASE_URL}/api/v1/assess`,        // was /api/v1/query — fixed
  HEALTH:             `${API_BASE_URL}/api/v1/health`,
  SCHEMA:             `${API_BASE_URL}/api/v1/schema`,
  NEARBY_COMPETITORS: `${API_BASE_URL}/api/v1/nearby/competitors`,

  // Admin — authenticated
  ADMIN_LOGIN:        `${API_BASE_URL}/api/v1/admin/login`,
  ADMIN_DB_STATUS:    `${API_BASE_URL}/api/v1/admin/db/status`,
  ADMIN_BULK_OBS:     `${API_BASE_URL}/api/v1/admin/observations/bulk`,
  ADMIN_SINGLE_OBS:   `${API_BASE_URL}/api/v1/admin/observations/single`,
  ADMIN_RECOMPUTE:    `${API_BASE_URL}/api/v1/admin/observations/recompute-spatial`,
  ADMIN_RECENT_PREDS: `${API_BASE_URL}/api/v1/admin/predictions/recent`,
  ADMIN_RETRAIN:      `${API_BASE_URL}/api/v1/admin/model/retrain`,
  ADMIN_RETRAIN_STATUS:`${API_BASE_URL}/api/v1/admin/model/retrain/status`,
  ADMIN_MODEL_METRICS:`${API_BASE_URL}/api/v1/admin/model/metrics`,
}

export { API_BASE_URL, API_TIMEOUT_MS, ENDPOINTS }
