import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

async function mount() {
  const rootEl = document.getElementById('root')
  try {
    const { default: App } = await import('./App.jsx')
    ReactDOM.createRoot(rootEl).render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    )
  } catch (err) {
    // Render a visible error message to help diagnose blank page issues
    console.error('Failed to mount React app:', err)
    rootEl.innerHTML = `
      <div style="padding:24px;font-family:system-ui,Segoe UI,Roboto,sans-serif;color:#111;">
        <h2>Application failed to start</h2>
        <pre style="white-space:pre-wrap;color:#b91c1c">${String(err && err.message ? err.message : err)}</pre>
        <p>Check the developer console for details.</p>
      </div>
    `
  }
}

mount()
