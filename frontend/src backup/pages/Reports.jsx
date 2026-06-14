import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { ENDPOINTS } from '../constants'

export default function Reports() {
  const [predictions, setPredictions] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchRecent()
  }, [])

  async function fetchRecent() {
    setLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await axios.get(ENDPOINTS.ADMIN_RECENT_PREDICTIONS, { headers })
      setPredictions(res.data)
    } catch (err) {
      setPredictions({ error: err.response?.data?.detail || err.message || 'Failed to fetch' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 28, maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Reports</h2>
        <div>
          <button className="btn">Export CSV</button>
          <button className="btn" style={{ marginLeft: 8 }}>Export PDF</button>
        </div>
      </header>

      <p style={{ color: '#475569' }}>Recent suitability assessments and activity. Admins can download or filter logs for analysis.</p>

      {loading && <div>Loading recent assessments…</div>}
      {!loading && predictions && predictions.error && <div className="error">{predictions.error}</div>}

      {!loading && predictions && !predictions.error && (
        <div className="page-card" style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>Total: {predictions.count}</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#0f1724' }}>
                  <th style={{ padding: 8 }}>ID</th>
                  <th style={{ padding: 8 }}>When</th>
                  <th style={{ padding: 8 }}>Lat,Lng</th>
                  <th style={{ padding: 8 }}>Category</th>
                  <th style={{ padding: 8 }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {predictions.predictions.map((p) => (
                  <tr key={p.id} style={{ borderTop: '1px solid #eef2f6' }}>
                    <td style={{ padding: 8 }}>{p.id}</td>
                    <td style={{ padding: 8 }}>{p.created_at}</td>
                    <td style={{ padding: 8 }}>{Number(p.latitude).toFixed(5)},{Number(p.longitude).toFixed(5)}</td>
                    <td style={{ padding: 8 }}>{p.business_category}</td>
                    <td style={{ padding: 8 }}>{p.suitability_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
