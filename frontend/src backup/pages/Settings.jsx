import React, { useEffect, useState } from 'react'

export default function Settings({ onSave }) {
  const [defaultRadius, setDefaultRadius] = useState(500)
  const [defaultCategory, setDefaultCategory] = useState('personal_care')

  useEffect(() => {
    const r = localStorage.getItem('default_radius')
    const c = localStorage.getItem('default_category')
    if (r) setDefaultRadius(Number(r))
    if (c) setDefaultCategory(c)
  }, [])

  function save() {
    localStorage.setItem('default_radius', defaultRadius)
    localStorage.setItem('default_category', defaultCategory)
    if (onSave) onSave({ defaultRadius, defaultCategory })
    alert('Settings saved locally')
  }

  return (
    <div style={{ padding: 28, maxWidth: 900, margin: '0 auto' }}>
      <h2>Settings</h2>
      <div style={{ display: 'flex', gap: 20 }}>
        <div className="page-card" style={{ flex: 1 }}>
          <h3>Preferences</h3>
          <div style={{ marginTop: 8 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>
              Default analysis radius (meters):
              <input type="number" value={defaultRadius} onChange={(e) => setDefaultRadius(Number(e.target.value))} style={{ marginLeft: 8, padding: 8, borderRadius: 6 }} />
            </label>
            <label style={{ display: 'block', marginBottom: 8 }}>
              Default business category:
              <select value={defaultCategory} onChange={(e) => setDefaultCategory(e.target.value)} style={{ marginLeft: 8, padding: 8, borderRadius: 6 }}>
                <option value="personal_care">Personal Care Services</option>
                <option value="retail">Retail</option>
                <option value="food_beverage">Food & Beverage</option>
              </select>
            </label>
            <div style={{ marginTop: 12 }}>
              <button className="btn primary" onClick={save}>Save preferences</button>
            </div>
          </div>
        </div>

        <div style={{ width: 300 }}>
          <div className="page-card">
            <h3>Administration</h3>
            <p className="muted">Admin tools are restricted. Use the sign-in link below to access import and management tools.</p>
            <div style={{ marginTop: 12 }}>
              <a href="/admin/login" className="btn">Admin Sign In</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
