import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Overview() {
  const navigate = useNavigate()
  return (
    <div style={{ padding: 28, maxWidth: 1100, margin: '0 auto' }}>
      <div className="page-card page-hero">
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0 }}>Kigali Spatial Suitability</h1>
          <p className="muted" style={{ marginTop: 8 }}>A decision-support tool to evaluate business location suitability using spatial data, competition, footfall, infrastructure and demographic indicators.</p>
          <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
            <button className="btn primary" onClick={() => navigate('/')}>Open Map</button>
            <button className="btn" onClick={() => navigate('/reports')}>View Reports</button>
          </div>
        </div>
        <div style={{ width: 420 }}>
          <div style={{ height: 200, borderRadius: 8, overflow: 'hidden', background: '#eef4f8' }}>
            {/* small visual placeholder — image optional */}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginTop: 16 }}>
        <div className="page-card">
          <h3>How it works</h3>
          <p className="muted">The platform aggregates spatial indicators around a point (competition counts, traffic, distances, population density) using PostGIS and applies a suitability heuristic and ML model to estimate opportunity.</p>
        </div>
        <div className="page-card">
          <h3>Quick Start</h3>
          <ol className="muted">
            <li>Open the Map and search for a place.</li>
            <li>Drop a pin or use the search result.</li>
            <li>Choose the analysis radius and run the assessment.</li>
          </ol>
        </div>
        <div className="page-card">
          <h3>For Admins</h3>
          <p className="muted">Data managers can import observation data and review prediction logs. Admin sign-in is available in the Settings or footer.</p>
        </div>
      </div>
    </div>
  )
}
