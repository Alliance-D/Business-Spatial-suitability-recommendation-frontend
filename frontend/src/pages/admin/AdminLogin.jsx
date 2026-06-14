import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ENDPOINTS } from '../../constants'
import './Admin.css'

function IconLock() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="3.5" y="8" width="11" height="7" rx="1.5" stroke="white" strokeWidth="1.5"/>
      <path d="M6 8V5.5a3 3 0 016 0V8" stroke="white" strokeWidth="1.5"/>
    </svg>
  )
}

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post(ENDPOINTS.ADMIN_LOGIN, { username, password })
      if (res.data?.token) {
        localStorage.setItem('admin_token', res.data.token)
        navigate('/admin')
      } else {
        setError('Unexpected response from server.')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-shell">
      <div className="card admin-login-card">
        <div className="admin-login-logo"><IconLock /></div>
        <h2>Admin sign in</h2>
        <p className="section-sub">Manage observations, imports, and model status.</p>

        <form onSubmit={submit}>
          <div className="admin-form-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="admin-form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          {error && <div className="admin-error">{error}</div>}
        </form>

        <a href="/" className="admin-back-link">← Back to KigaliSite</a>
      </div>
    </div>
  )
}
