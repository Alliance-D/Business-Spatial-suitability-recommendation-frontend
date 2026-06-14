import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom'
import './App.css'
import Map from './components/Map'
import ResultPanel from './components/ResultPanel'
import Overview from './pages/Overview'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import ImportPage from './pages/ImportPage'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import axios from 'axios'
import { ENDPOINTS, API_TIMEOUT_MS } from './constants'

function App() {
  const [result, setResult] = useState(null)
  const [businessCategory, setBusinessCategory] = useState(() => localStorage.getItem('default_category') || 'personal_care')
  const [searchQuery, setSearchQuery] = useState('')
  const [radiusMeters, setRadiusMeters] = useState(() => Number(localStorage.getItem('default_radius') || 500))
  const [layers, setLayers] = useState({ showBuffer: true, showCompetitors: false, showPopDensity: false })
  const [pinPosition, setPinPosition] = useState(null)
  const [mapCenter, setMapCenter] = useState(null)
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('admin_token') || '')
  const navigate = useNavigate()

  async function handleSearch() {
    if (!searchQuery) return
    const place = await performNominatimSearch(searchQuery)
    if (place) {
      setMapCenter([place.lat, place.lon])
      setPinPosition({ lat: place.lat, lng: place.lon })
      navigate('/map')
    } else {
      alert('No results found')
    }
  }

  async function handleRunAssessment() {
    if (!pinPosition) {
      alert('Drop a pin on the map first (click on the map)')
      return
    }
    const payload = {
      latitude: pinPosition.lat,
      longitude: pinPosition.lng,
      business_category: businessCategory,
      radius_meters: Number(radiusMeters || 500)
    }
    try {
      const res = await axios.post(ENDPOINTS.QUERY, payload, { timeout: API_TIMEOUT_MS })
      setResult(res.data)
      // center map on pin (ensure visibility of buffer)
      setMapCenter([pinPosition.lat, pinPosition.lng])
    } catch (err) {
      console.error('Assessment error', err)
      // Fallback: deterministic sample (simple)
      const sample = generateSampleResult(pinPosition.lat, pinPosition.lng)
      setResult(sample)
    }
  }

  function generateSampleResult(lat, lng) {
    const seed = Math.abs(Math.floor((lat * 1000 + lng * 1000))) % 100
    const comp = Math.floor(seed % 8)
    const traffic = (seed % 120) + 40
    const nearest = (seed % 800) + 60
    const pd = (seed % 600) + 100
    const comp_score = 1.0 / (1.0 + comp)
    const traffic_score = Math.min(1.0, traffic / 400)
    const access_score = 1.0 / (1.0 + nearest / 1000)
    let suitability = 0.35 * traffic_score + 0.35 * comp_score + 0.3 * access_score
    suitability = Math.max(0, Math.min(1, suitability))
    let label = 'weak'
    if (suitability >= 0.66) label = 'strong'
    else if (suitability >= 0.4) label = 'moderate'
    const assess = (v) => (v >= 0.66 ? 'high' : v >= 0.33 ? 'moderate' : 'low')
    const factors = [
      { name: `Competition (${radiusMeters}m)`, value: comp, assessment: assess(comp_score), shap_value: 0 },
      { name: `Local footfall`, value: traffic, assessment: assess(traffic_score), shap_value: 0 },
      { name: `Nearest business distance (m)`, value: nearest, assessment: assess(access_score), shap_value: 0 },
      { name: `Population density`, value: pd, assessment: assess(Math.min(1, pd / 600)), shap_value: 0 }
    ]
    return {
      suitability_score: Number(suitability.toFixed(3)),
      suitability_label: label,
      factors,
      top_positive_factors: factors.filter(f => f.assessment === 'high').map(f => f.name),
      top_negative_factors: factors.filter(f => f.assessment === 'low').map(f => f.name),
      disclaimer: 'Client-side sample result — replace with backend result when available.'
    }
  }

  return (
    <div className="app-container">
      <header className="navbar">
        <div className="brand">
          <div className="logo">KS</div>
          <div>
            <div className="title">Kigali Spatial Suitability</div>
            <div className="subtitle">Business location assessment</div>
          </div>
        </div>

        <nav className="nav-links" aria-label="Main navigation">
          <Link to="/overview">Overview</Link>
          <Link to="/">Map</Link>
          <Link to="/reports">Reports</Link>
          <Link to="/settings">Settings</Link>
        </nav>

        <div className="header-actions">
          <input
            aria-label="Search locations"
            type="text"
            placeholder="Search address or place"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #e6eef6' }}
          />
          
          <button className="btn" onClick={() => handleSearch()}>Search</button>
          <button className="btn primary" onClick={() => handleRunAssessment()}>Run Assessment</button>
        </div>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<div className="map-wrapper"><div className="top-controls">
                <label>
                  Business Type:
                  <select
                    value={businessCategory}
                    onChange={(e) => { setBusinessCategory(e.target.value); localStorage.setItem('default_category', e.target.value) }}
                    style={{ marginLeft: 8 }}
                  >
                    <option value="personal_care">Personal Care Services</option>
                  </select>
                </label>

                <label>
                  Analysis radius (competitor radius):
                  <select style={{ marginLeft: 8 }} value={radiusMeters} onChange={(e) => { const v = Number(e.target.value); setRadiusMeters(v); localStorage.setItem('default_radius', String(v)) }}>
                    <option value={300}>300 m</option>
                    <option value={500}>500 m</option>
                    <option value={1000}>1 km</option>
                  </select>
                </label>

                <label style={{ marginLeft: 12 }}>
                  Layers:
                  <label style={{ marginLeft: 8 }}><input type="checkbox" checked={layers.showBuffer} onChange={(e) => setLayers(s => ({...s, showBuffer: e.target.checked}))} /> Buffer</label>
                  <label style={{ marginLeft: 8 }}><input type="checkbox" checked={layers.showCompetitors} onChange={(e) => setLayers(s => ({...s, showCompetitors: e.target.checked}))} /> Competitors</label>
                  <label style={{ marginLeft: 8 }}><input type="checkbox" checked={layers.showPopDensity} onChange={(e) => setLayers(s => ({...s, showPopDensity: e.target.checked}))} /> Pop. Density</label>
                </label>
              </div>
              <div className="map-section">
                <Map businessCategory={businessCategory} radiusMeters={radiusMeters} layers={layers} pinPosition={pinPosition} onPinPlaced={setPinPosition} center={mapCenter} />
              </div>
              <div className="result-overlay" role="complementary" aria-live="polite"><ResultPanel result={result} /></div>
            </div>} />
          <Route path="/map" element={<Navigate to="/" replace />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings onSave={(s) => { setRadiusMeters(s.defaultRadius); setBusinessCategory(s.defaultCategory) }} />} />
          <Route path="/admin/login" element={<AdminLogin onAuth={(token) => { setAdminToken(token); localStorage.setItem('admin_token', token); navigate('/admin') }} />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>© Kigali Spatial Suitability — Built for decision support</div>
          <div style={{ fontSize: '0.9rem' }}><Link to="/admin/login" style={{ color: '#0f1724', textDecoration: 'underline' }}>Admin sign-in</Link></div>
        </div>
      </footer>
      
      
    </div>
  )
}

// Helper: perform search using Nominatim and center the map on first result
async function performNominatimSearch(query) {
  if (!query) return null
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
    const data = await res.json()
    if (data && data.length > 0) {
      const { lat, lon } = data[0]
      return { lat: Number(lat), lon: Number(lon) }
    }
  } catch (err) {
    console.error('Search error', err)
  }
  return null
}

export default App
