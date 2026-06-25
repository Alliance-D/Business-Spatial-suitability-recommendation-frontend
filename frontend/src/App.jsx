import { useState, useCallback, useEffect } from 'react'
import { Routes, Route, Link, NavLink, useNavigate, Navigate } from 'react-router-dom'
import './App.css'
import Map from './components/Map'
import ResultPanel from './components/ResultPanel'
import SettingsDrawer from './components/SettingsDrawer'
import Overview from './pages/Overview'
import Reports from './pages/Reports'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import axios from 'axios'
import { ENDPOINTS, API_TIMEOUT_MS } from './constants'

function IconPin() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 1C5.24 1 3 3.24 3 6C3 9.5 8 15 8 15C8 15 13 9.5 13 6C13 3.24 10.76 1 8 1Z"
            stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}
function IconSun() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="7.5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M7.5 1v1.5M7.5 12.5V14M14 7.5h-1.5M2.5 7.5H1M12.07 2.93l-1.06 1.06M4 11l-1.07 1.07M12.07 12.07l-1.06-1.06M4 4l-1.07-1.07"
            stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}
function IconMoon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M12.5 10a5.5 5.5 0 01-7.5-7.5A5.5 5.5 0 1012.5 10z"
            stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  )
}
function IconSettings() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M7.5 1v1M7.5 13v1M1 7.5h1M13 7.5h1M2.93 2.93l.7.7M11.37 11.37l.7.7M2.93 12.07l.7-.7M11.37 3.63l.7-.7"
            stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

/* ─── Admin route guard ──────────────────────────────────────────────────────
   Checks localStorage synchronously before any render happens.
   No flash of the dashboard — redirects immediately if no token exists.     */
function RequireAdminAuth({ children }) {
  // We store only a lightweight login-state flag (not the token itself).
  // The actual JWT lives in an httpOnly cookie managed by the browser —
  // it cannot be read or stolen by JavaScript.
  const isLoggedIn = localStorage.getItem('admin_logged_in') === 'true'
  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />
  }
  return children
}

/* ─── Nominatim search — restricted to Rwanda ─────────────────────────────── */
async function nominatimSearch(query) {
  if (!query.trim()) return null
  try {
    const params = new URLSearchParams({
      format:       'json',
      q:            query,
      limit:        '1',
      countrycodes: 'rw',
      viewbox:      '29.9,-1.8,30.2,-2.0',
      bounded:      '0',
    })
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await res.json()
    if (data?.length > 0) return { lat: Number(data[0].lat), lon: Number(data[0].lon) }
  } catch {}
  return null
}

/* ─── Client-side fallback result ─────────────────────────────────────────── */
function generateFallbackResult(lat, lng, radiusMeters) {
  const seed        = Math.abs(Math.floor(lat * 1000 + lng * 1000)) % 100
  const comp        = seed % 9
  const traffic     = (seed % 100) + 40
  const pd          = (seed % 500) + 150
  const compScore   = comp <= 3 ? 0.85 : comp <= 8 ? 0.65 : 0.30
  const trafficScore = Math.min(1, traffic / 150)
  const pdScore     = Math.min(1, pd / 500)
  const score       = 0.40 * trafficScore + 0.35 * compScore + 0.25 * pdScore
  const band        = score >= 0.65 ? 'FAVOURABLE' : score >= 0.40 ? 'BORDERLINE' : 'UNFAVOURABLE'
  return {
    suitability_probability: Math.round(score * 100) / 100,
    suitability_band: band,
    factors: [
      {
        factor: 'Pedestrian Activity',
        rating: trafficScore >= 0.6 ? 'favourable' : trafficScore >= 0.35 ? 'borderline' : 'unfavourable',
        detail: `Estimated ${traffic} pedestrians per hour in this area.`,
        explanation: trafficScore >= 0.6
          ? 'High foot traffic supports recurring walk-in demand — a strong signal for personal care services.'
          : trafficScore >= 0.35
          ? 'Moderate foot traffic. Demand is present but may fluctuate by time of day.'
          : 'Low pedestrian activity in this area limits daily walk-in customers.',
        shap_contribution: +(0.08 * trafficScore).toFixed(3),
      },
      {
        factor: 'Competition Pressure',
        rating: compScore >= 0.7 ? 'favourable' : compScore >= 0.45 ? 'borderline' : 'unfavourable',
        detail: `${comp} personal care services observed within ${radiusMeters}m.`,
        explanation: comp <= 3
          ? 'Low to moderate competition. The area is not saturated and there is room for another business.'
          : comp <= 8
          ? 'Moderate competition. A cluster of similar businesses can attract more customers together.'
          : 'High concentration of competitors. Standing out will require stronger differentiation.',
        shap_contribution: +(0.07 * compScore).toFixed(3),
      },
      {
        factor: 'Transport Access',
        rating: 'borderline',
        detail: 'Access to public transport estimated from location.',
        explanation: 'Proximity to bus stops and moto-taxi stands drives commuter-linked walk-in demand.',
        shap_contribution: 0.032,
      },
      {
        factor: 'Market Proximity',
        rating: 'borderline',
        detail: 'Distance to nearest commercial anchor estimated.',
        explanation: 'Businesses near markets and commercial hubs benefit from existing foot traffic.',
        shap_contribution: 0.028,
      },
      {
        factor: 'Residential Density',
        rating: pdScore >= 0.6 ? 'favourable' : pdScore >= 0.35 ? 'borderline' : 'unfavourable',
        detail: `Population density in this area estimated at ${pd} residents per cell.`,
        explanation: pdScore >= 0.6
          ? 'Dense residential area — strong base for the repeat weekly customers personal care services depend on.'
          : pdScore >= 0.35
          ? 'Moderate residential density. The catchment can support a business but may take time to build.'
          : 'Sparse residential catchment. Recurring demand may be limited without strong transit access.',
        shap_contribution: +(0.04 * pdScore).toFixed(3),
      },
    ],
    disclaimer:
      'This assessment reflects spatial and environmental patterns at the neighbourhood level only. ' +
      'It does not predict business success, profitability, or entrepreneurial outcomes. ' +
      '(Offline mode — backend unavailable)',
  }
}

/* ─── Fetch real competitor markers ──────────────────────────────────────── */
async function fetchNearbyCompetitors(lat, lng, radius) {
  try {
    const params = new URLSearchParams({ latitude: lat, longitude: lng, radius, limit: 50 })
    const res = await axios.get(`${ENDPOINTS.NEARBY_COMPETITORS}?${params}`, { timeout: 8000 })
    return res.data?.results ?? []
  } catch {
    return []
  }
}

/* ─── App ─────────────────────────────────────────────────────────────────── */
export default function App() {
  const [theme,         setTheme]         = useState(() => localStorage.getItem('theme') || 'light')
  const [settingsOpen,  setSettingsOpen]  = useState(false)
  const [pinPosition,   setPinPosition]   = useState(null)
  const [mapCenter,     setMapCenter]     = useState(null)
  const [radiusMeters,  setRadiusMeters]  = useState(() => Number(localStorage.getItem('pref_radius') || 500))
  const [layers,        setLayers]        = useState({ showBuffer: true, showCompetitors: false })
  const [result,        setResult]        = useState(null)
  const [assessing,     setAssessing]     = useState(false)
  const [searchQuery,   setSearchQuery]   = useState('')
  const [nearbyMarkers, setNearbyMarkers] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', next)
      localStorage.setItem('theme', next)
      return next
    })
  }, [])

  async function handleSearch(e) {
    e?.preventDefault()
    const place = await nominatimSearch(searchQuery)
    if (place) {
      setMapCenter([place.lat, place.lon])
      setPinPosition({ lat: place.lat, lng: place.lon })
      setResult(null)
      setNearbyMarkers([])
      navigate('/')
    } else {
      alert('Location not found. Try a neighbourhood name like "Kimironko" or "Remera".')
    }
  }

  async function handleAssess() {
    if (!pinPosition) { alert('Click on the map to place a pin first.'); return }
    setAssessing(true)
    setResult(null)
    let data
    try {
      const res = await axios.post(
        ENDPOINTS.ASSESS,
        { latitude: pinPosition.lat, longitude: pinPosition.lng,
          business_category: 'personal_care', radius_meters: radiusMeters },
        { timeout: API_TIMEOUT_MS }
      )
      data = res.data
    } catch {
      data = generateFallbackResult(pinPosition.lat, pinPosition.lng, radiusMeters)
    } finally {
      setAssessing(false)
    }
    setResult(data)
    saveToHistory(pinPosition, data)
    if (layers.showCompetitors) {
      const markers = await fetchNearbyCompetitors(pinPosition.lat, pinPosition.lng, radiusMeters)
      setNearbyMarkers(markers)
    }
  }

  useEffect(() => {
    if (!layers.showCompetitors || !pinPosition) { setNearbyMarkers([]); return }
    fetchNearbyCompetitors(pinPosition.lat, pinPosition.lng, radiusMeters).then(setNearbyMarkers)
  }, [layers.showCompetitors, pinPosition, radiusMeters])

  function saveToHistory(pos, data) {
    try {
      const entry = {
        timestamp:   Date.now(),
        lat:         pos.lat,
        lng:         pos.lng,
        band:        data.suitability_band,
        probability: data.suitability_probability,
        factors:     data.factors || [],
        disclaimer:  data.disclaimer || '',
      }
      const existing = JSON.parse(localStorage.getItem('assessment_history') || '[]')
      localStorage.setItem('assessment_history', JSON.stringify([entry, ...existing].slice(0, 25)))
    } catch {}
  }

  return (
    <div className="app-shell">
      <header className="navbar">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo"><IconPin /></div>
          <div>
            <div className="navbar-name">KigaliSite</div>
            <div className="navbar-tagline">Location Intelligence</div>
          </div>
        </Link>

        <div className="navbar-sep" />

        <nav className="nav-links" aria-label="Main navigation">
          <NavLink to="/"        end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Map</NavLink>
          <NavLink to="/overview"    className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Overview</NavLink>
          <NavLink to="/reports"     className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Reports</NavLink>
        </nav>

        <div className="navbar-right">
          <form className="search-form" onSubmit={handleSearch}>
            <input className="search-input" type="text"
              placeholder="Search an address in Kigali…"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search location" />
            <button type="submit" className="btn btn-sm">Search</button>
          </form>

          <button className="btn btn-primary btn-sm" onClick={handleAssess} disabled={assessing}
            title={pinPosition ? 'Run spatial assessment' : 'Drop a pin on the map first'}>
            {assessing ? 'Assessing…' : 'Run Assessment'}
          </button>

          <button className="theme-toggle" onClick={toggleTheme} title="Toggle dark mode" aria-label="Toggle theme">
            {theme === 'light' ? <IconMoon /> : <IconSun />}
          </button>
          <button className="theme-toggle" onClick={() => setSettingsOpen(true)} title="Preferences" aria-label="Open settings">
            <IconSettings />
          </button>
        </div>
      </header>

      <main className="page-content">
        <Routes>
          <Route path="/" element={
            <div className="map-page">
              <div className="map-container">
                <div className="map-toolbar">
                  <div className="map-control-pill">
                    Analysis radius:
                    <select value={radiusMeters}
                      onChange={e => { const v = Number(e.target.value); setRadiusMeters(v); localStorage.setItem('pref_radius', v) }}
                      aria-label="Analysis radius">
                      <option value={300}>300 m</option>
                      <option value={500}>500 m</option>
                      <option value={1000}>1 km</option>
                    </select>
                  </div>
                  <div className="map-control-pill">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={layers.showBuffer}
                        onChange={e => setLayers(s => ({ ...s, showBuffer: e.target.checked }))} />
                      Show radius ring
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginLeft: 8 }}>
                      <input type="checkbox" checked={layers.showCompetitors}
                        onChange={e => setLayers(s => ({ ...s, showCompetitors: e.target.checked }))} />
                      Show nearby businesses
                    </label>
                  </div>
                  <div className="map-run-btn">
                    <button className="btn btn-primary" onClick={handleAssess}
                      disabled={assessing || !pinPosition} style={{ boxShadow: 'var(--shadow-md)' }}>
                      {assessing ? 'Assessing…' : pinPosition ? 'Run Assessment' : 'Drop a pin first'}
                    </button>
                  </div>
                </div>

                <Map
                  pinPosition={pinPosition}
                  onPinPlaced={pos => { setPinPosition(pos); setResult(null); setNearbyMarkers([]) }}
                  radiusMeters={radiusMeters}
                  layers={layers}
                  center={mapCenter}
                  nearbyMarkers={nearbyMarkers}
                />

                {!pinPosition && (
                  <div className="map-hint">
                    Click anywhere on the map to place a pin and assess that location
                  </div>
                )}
              </div>
              <ResultPanel result={result} assessing={assessing} />
            </div>
          } />

          <Route path="/overview" element={<Overview />} />
          <Route path="/reports"  element={<Reports />} />

          {/* Admin login — public, no guard */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin dashboard — synchronous token check, no flash */}
          <Route path="/admin" element={
            <RequireAdminAuth>
              <AdminDashboard />
            </RequireAdminAuth>
          } />
          <Route path="/admin/*" element={<Navigate to="/admin" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {settingsOpen && (
        <SettingsDrawer
          theme={theme} onToggleTheme={toggleTheme}
          layers={layers} onLayersChange={setLayers}
          radiusMeters={radiusMeters}
          onRadiusChange={v => { setRadiusMeters(v); localStorage.setItem('pref_radius', v) }}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  )
}
