import './ResultPanel.css'
import { useState } from 'react'

export default function ResultPanel({ result }) {
  const [selectedFactor, setSelectedFactor] = useState(null)

  if (!result) {
    return (
      <div className="result-panel empty">
        <p>Drop a pin on the map to assess a location.</p>
      </div>
    )
  }

  function explainShap(factor) {
    // Placeholder SHAP explanation behavior: compute descriptive explanation using factor value
    const val = factor.value
    const direction = factor.assessment === 'high' ? 'supports' : factor.assessment === 'low' ? 'limits' : 'moderately affects'
    const score = factor.shap_value || (Math.random() * 0.6 - 0.3) // placeholder
    return `Feature ${factor.name} (value: ${val}) ${direction} suitability. SHAP contribution ≈ ${score.toFixed(3)}.`
  }

  return (
    <div className="result-panel">
      <div className="result-header">
        <h3>Spatial Match Assessment</h3>
        <div className={`suitability-badge ${result.suitability_label}`}>
          {result.suitability_label.charAt(0).toUpperCase() + result.suitability_label.slice(1)}
        </div>
      </div>

      <div className="factor-breakdown">
        <h4>Factor Breakdown</h4>
        <div className="factors-list">
          {result.factors && result.factors.map((factor, idx) => (
            <div key={idx} className="factor-item" onClick={() => setSelectedFactor(selectedFactor === idx ? null : idx)} role="button" tabIndex={0}>
              <span className="factor-name">{factor.name}</span>
              <div className="factor-bar">
                <div 
                  className={`bar-fill ${factor.assessment}`}
                  style={{ width: `${factor.assessment === 'high' ? 100 : factor.assessment === 'moderate' ? 66 : 33}%` }}
                ></div>
              </div>
              <span className="factor-label">{factor.assessment}</span>
            </div>
          ))}
        </div>

        {selectedFactor !== null && result.factors && result.factors[selectedFactor] && (
          <div className="shap-explanation">
            <h5>SHAP Explanation — {result.factors[selectedFactor].name}</h5>
            <p>{explainShap(result.factors[selectedFactor])}</p>
            <small>Note: SHAP details are a placeholder UI. Replace with model SHAP output when available.</small>
          </div>
        )}
      </div>

      <div className="top-factors">
        {result.top_positive_factors && result.top_positive_factors.length > 0 && (
          <div className="positive">
            <h5>Supporting Factors</h5>
            <ul>
              {result.top_positive_factors.map((factor, idx) => (
                <li key={idx}>{factor}</li>
              ))}
            </ul>
          </div>
        )}
        {result.top_negative_factors && result.top_negative_factors.length > 0 && (
          <div className="negative">
            <h5>Limiting Factors</h5>
            <ul>
              {result.top_negative_factors.map((factor, idx) => (
                <li key={idx}>{factor}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="disclaimer">
        <strong>Important:</strong>
        <p>{result.disclaimer}</p>
      </div>
    </div>
  )
}
