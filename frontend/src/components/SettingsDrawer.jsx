/**
 * SettingsDrawer — slide-out preferences panel.
 * Contains only settings that are genuinely useful and not already
 * accessible through the main UI controls.
 *
 * Removed: radius selector (already in the map toolbar, duplicating it here
 * serves no purpose and adds confusion).
 *
 * Kept: theme, map display preferences, data coverage info, about.
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
  theme,
  onToggleTheme,
  layers,
  onLayersChange,
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
      <div className="settings-backdrop" onClick={onClose} aria-hidden="true" />
      <aside className="settings-drawer" role="dialog" aria-label="Preferences" aria-modal="true">
        <div className="drawer-header">
          <h2>Preferences</h2>
          <button
            className="drawer-close"
            onClick={onClose}
            aria-label="Close preferences"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="drawer-body">

          {/* ── Appearance ── */}
          <div className="drawer-section">
            <div className="drawer-section-label">Appearance</div>

            <div className="setting-row">
              <div>
                <div className="setting-label">Dark mode</div>
                <div className="setting-desc">Switch between light and dark interface themes</div>
              </div>
              <Toggle
                id="theme-toggle-drawer"
                checked={theme === 'dark'}
                onChange={onToggleTheme}
              />
            </div>
          </div>

          {/* ── Map display ── */}
          <div className="drawer-section">
            <div className="drawer-section-label">Map display</div>

            <div className="setting-row">
              <div>
                <div className="setting-label">Show radius ring</div>
                <div className="setting-desc">
                  Draw the analysis buffer around a pinned location
                </div>
              </div>
              <Toggle
                id="show-buffer-drawer"
                checked={layers.showBuffer}
                onChange={v => onLayersChange(s => ({ ...s, showBuffer: v }))}
              />
            </div>

            <div className="setting-row">
              <div>
                <div className="setting-label">Show nearby businesses</div>
                <div className="setting-desc">
                  Display reference observations from the dataset as map markers
                </div>
              </div>
              <Toggle
                id="show-competitors-drawer"
                checked={layers.showCompetitors}
                onChange={v => onLayersChange(s => ({ ...s, showCompetitors: v }))}
              />
            </div>
          </div>

          {/* ── Data coverage ── */}
          <div className="drawer-section">
            <div className="drawer-section-label">Data coverage</div>
            <div style={{ fontSize: '0.845rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              This system covers three commercial clusters in Kigali:
            </div>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { name: 'Kimironko', desc: 'High-density market area, Gasabo District' },
                { name: 'Remera',    desc: 'Roadside commercial strips, Gasabo District' },
                { name: 'Kacyiru',  desc: 'Residential-commercial zone, Kicukiro District' },
              ].map(c => (
                <div key={c.name} style={{
                  padding: '10px 12px',
                  background: 'var(--surface-2)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  <div style={{ fontSize: '0.845rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {c.desc}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Assessments outside these areas may be less reliable. The model
              is trained on observations from within these clusters only.
            </div>
          </div>

          {/* ── About ── */}
          <div className="drawer-section">
            <div className="drawer-section-label">About</div>
            <div style={{ fontSize: '0.845rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              KigaliSite is a spatial decision-support tool for personal care
              service entrepreneurs in Kigali. It uses machine learning trained
              on field-collected data to estimate location suitability based on
              foot traffic, competition density, transport access, and
              residential density.
            </div>
            <div style={{ marginTop: 12, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              BSE Capstone 2026 · African Leadership University
            </div>
            <div style={{ marginTop: 4, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Version 1.0.0 · Personal care services only
            </div>
          </div>

        </div>
      </aside>
    </>
  )
}
