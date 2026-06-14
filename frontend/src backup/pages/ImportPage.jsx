import React, { useState } from 'react'
import axios from 'axios'
import { ENDPOINTS } from '../constants'
import { useNavigate } from 'react-router-dom'

export default function ImportPage() {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [previewRows, setPreviewRows] = useState(null)
  const navigate = useNavigate()

  async function upload() {
    const token = localStorage.getItem('admin_token')
    if (!file) return alert('Select a CSV file')
    if (!token) return alert('Admin login required. Please sign in via Admin → Sign in')
    setLoading(true)
    setStatus(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await axios.post(ENDPOINTS.ADMIN_BULK_OBS, fd, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      })
      setStatus({ ok: true, message: res.data.message || JSON.stringify(res.data) })
    } catch (err) {
      setStatus({ ok: false, message: err.response?.data?.detail || err.message })
    } finally {
      setLoading(false)
    }
  }

  async function previewFile(e) {
    const f = e.target.files?.[0]
    setFile(f)
    setPreviewRows(null)
    if (!f) return
    // try reading first few lines for preview
    const text = await f.text()
    const lines = text.split('\n').slice(0, 6)
    setPreviewRows(lines)
  }

  return (
    <div style={{ padding: 20 }}>
      <div className="page-card">
        <h2 style={{ marginTop: 0 }}>Import Observations (Admin)</h2>
        <p className="muted">Upload a CSV with observation rows. Required columns: latitude,longitude,biz_category,comp_count_300,comp_count_500,comp_count_1k,traffic_morning,traffic_midday,traffic_evening,dist_transport,dist_market,dist_road,pop_density,road_type,stability_label</p>
      <div style={{ marginBottom: 12 }}>
        <button className="btn" onClick={() => navigate('/admin/login')}>Admin Sign In</button>
        <span style={{ marginLeft: 8 }}>Use Admin → Sign in to authenticate before uploading</span>
      </div>
      <input type="file" accept=".csv" onChange={previewFile} />
      {previewRows && (
        <div style={{ marginTop: 8, background: '#fff', padding: 8, borderRadius: 6 }}>
          <strong>Preview (first lines)</strong>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{previewRows.join('\n')}</pre>
        </div>
      )}
        <div style={{ marginTop: 12 }}>
          <button className="btn primary" onClick={upload} disabled={loading}>{loading ? 'Uploading...' : 'Upload CSV'}</button>
        </div>
        {status && (
          <div style={{ marginTop: 12 }} className={status.ok ? 'success' : 'error'}>{status.message}</div>
        )}
      </div>
    </div>
  )
}
