import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'

// Apply saved theme before first paint to avoid a flash of the wrong theme
const savedTheme = localStorage.getItem('theme') || 'light'
document.documentElement.setAttribute('data-theme', savedTheme)

const rootEl = document.getElementById('root')

try {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  )
} catch (err) {
  console.error('Failed to mount React app:', err)
  rootEl.innerHTML = `
    <div style="padding:24px;font-family:system-ui,sans-serif;color:#111;">
      <h2>Application failed to start</h2>
      <pre style="white-space:pre-wrap;color:#b91c1c">${String(err?.message || err)}</pre>
      <p>Check the developer console for details.</p>
    </div>
  `
}
