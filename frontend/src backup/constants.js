// Centralized frontend constants and API endpoints
// Professional-grade configuration: base URL, timeouts, and named endpoints

// Use Vite's import.meta.env first. Fall back to `process.env` only when available
// (some dev environments may set REACT_APP_*). Use a safe typeof check to avoid
// throwing `ReferenceError: process is not defined` in the browser.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  ((typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) || 'http://localhost:8000')

const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS ||
  ((typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_TIMEOUT_MS) || 10000))

const ENDPOINTS = {
  QUERY: `${API_BASE_URL}/api/v1/query`,
  CATEGORIES: `${API_BASE_URL}/api/v1/categories`,
  ADMIN_DB_STATUS: `${API_BASE_URL}/api/v1/admin/db/status`,
  ADMIN_BULK_OBS: `${API_BASE_URL}/api/v1/admin/observations/bulk`,
  ADMIN_SINGLE_OBS: `${API_BASE_URL}/api/v1/admin/observations/single`,
  ADMIN_RECENT_PREDICTIONS: `${API_BASE_URL}/api/v1/admin/predictions/recent`,
  ADMIN_LOGIN: `${API_BASE_URL}/api/v1/admin/login`,
  NEARBY_COMPETITORS: `${API_BASE_URL}/api/v1/nearby/competitors`,
  LAYER_POP_DENSITY: `${API_BASE_URL}/api/v1/layers/pop_density`,
}

export { API_BASE_URL, API_TIMEOUT_MS, ENDPOINTS }
export default { API_BASE_URL, API_TIMEOUT_MS, ENDPOINTS }
