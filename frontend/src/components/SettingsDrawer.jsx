/**
 * SettingsDrawer — slide-out preferences panel.
 * Replaces the settings page. Opened via the gear icon in the navbar.
 * Contains only user-facing preferences (theme, map defaults, display).
 */
import { useEffect } from 'react'

function Toggle({ checked, onChange, id }) {
  return (
    <label className="toggle" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="toggle-track" />
    </label>
  )
}

export default function SettingsDrawer({
  theme, onToggleTheme,
  layers, onLayersChange,
  radiusMeters, onRadiusChange,
  onClose,
}) {
  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      <div className="settings-backdrop" onClick={onClose} />
      <aside className="settings-drawer" role="dialog" aria-label="Preferences">
        <div className="drawer-header">
          <h2>Preferences</h2>
          <button className="drawer-close" onClick={onClose} aria-label="Close">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="drawer-body">
          {/* Appearance */}
          <div className="drawer-section">
            <div className="drawer-section-label">Appearance</div>

            <div className="setting-row">
              <div>
                <div className="setting-label">Dark mode</div>
                <div className="setting-desc">Switch between light and dark themes</div>
              </div>
              <Toggle
                id="theme-toggle"
                checked={theme === 'dark'}
                onChange={() => onToggleTheme()}
              />
            </div>
          </div>

          {/* Map defaults */}
          <div className="drawer-section">
            <div className="drawer-section-label">Map defaults</div>

            <div className="setting-row">
              <div>
                <div className="setting-label">Default analysis radius</div>
                <div className="setting-desc">Competitor and feature search area</div>
              </div>
              <select
                value={radiusMeters}
                onChange={e => onRadiusChange(Number(e.target.value))}
                style={{ width: 90 }}
              >
                <option value={300}>300 m</option>
                <option value={500}>500 m</option>
                <option value={1000}>1 km</option>
              </select>
            </div>

            <div className="setting-row">
              <div>
                <div className="setting-label">Show radius ring</div>
                <div className="setting-desc">Draw the analysis buffer on the map</div>
              </div>
              <Toggle
                id="show-buffer"
                checked={layers.showBuffer}
                onChange={v => onLayersChange(s => ({ ...s, showBuffer: v }))}
              />
            </div>

            <div className="setting-row">
              <div>
                <div className="setting-label">Show nearby businesses</div>
                <div className="setting-desc">Marker clusters for competing locations</div>
              </div>
              <Toggle
                id="show-competitors"
                checked={layers.showCompetitors}
                onChange={v => onLayersChange(s => ({ ...s, showCompetitors: v }))}
              />
            </div>
          </div>

          {/* About */}
          <div className="drawer-section">
            <div className="drawer-section-label">About</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
              KigaliSite is a spatial decision-support tool for personal care service entrepreneurs
              in Kigali. It uses machine learning to analyse location suitability based on
              foot traffic, competition density, transport access, and residential density.
            </div>
            <div style={{ marginTop: 12, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              BSE Capstone 2026 · African Leadership University
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
