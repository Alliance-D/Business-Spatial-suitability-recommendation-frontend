import React, { useState } from 'react'
import axios from 'axios'
import { ENDPOINTS } from '../constants'

export default function AdminLogin({ onAuth }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post(ENDPOINTS.ADMIN_LOGIN, { username, password })
      if (res.data && res.data.token) {
        onAuth(res.data.token)
      } else {
        setError('Unexpected login response')
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 28, maxWidth: 540, margin: '0 auto' }}>
      <div className="page-card">
        <h2 style={{ marginTop: 0 }}>Admin Sign In</h2>
        <p style={{ color: '#475569' }}>Sign in with your administrator credentials to manage data and imports.</p>
        <form onSubmit={submit} style={{ maxWidth: 420 }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e6eef6' }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e6eef6' }} />
          </div>
          <div>
            <button className="btn primary" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
          </div>
          {error && <div style={{ marginTop: 12, color: 'crimson' }}>{error}</div>}
        </form>
      </div>
    </div>
  )
}
