import React from 'react'
import ImportPage from './ImportPage'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem('admin_token')
    navigate('/')
    window.location.reload()
  }

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2>Admin Dashboard</h2>
        <div>
          <button className="btn" onClick={() => navigate('/admin/login')}>Sign In</button>
          <button className="btn" style={{ marginLeft: 8 }} onClick={logout}>Sign Out</button>
        </div>
      </div>
      <p className="muted">Use the tools below to manage observations and imports.</p>
      <div style={{ marginTop: 12 }}>
        <div className="page-card">
          <ImportPage />
        </div>
      </div>
    </div>
  )
}
