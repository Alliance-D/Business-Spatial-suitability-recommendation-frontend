import { useEffect, useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, Cell,
} from 'recharts'
import './Reports.css'

/* ─── Utilities ───────────────────────────────────────────────────────────── */
function bandMeta(band) {
  switch (band) {
    case 'FAVOURABLE':   return { label: 'Strong Match',  color: 'var(--green)', cls: 'band-green' }
    case 'BORDERLINE':   return { label: 'Mixed Signals', color: 'var(--amber)', cls: 'band-amber' }
    case 'UNFAVOURABLE': return { label: 'Weak Match',    color: 'var(--red)',   cls: 'band-red'   }
    default:             return { label: 'Unknown',       color: 'var(--brand)', cls: 'band-brand' }
  }
}

function fmt(ts) {
  return new Date(ts).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

function ratingColor(r) {
  if (r === 'favourable')   return 'var(--green)'
  if (r === 'unfavourable') return 'var(--red)'
  return 'var(--amber)'
}

function ratingBg(r) {
  if (r === 'favourable')   return 'var(--green-dim)'
  if (r === 'unfavourable') return 'var(--red-dim)'
  return 'var(--amber-dim)'
}

function ratingLabel(r) {
  if (r === 'favourable')   return 'Positive'
  if (r === 'unfavourable') return 'Concern'
  return 'Mixed'
}

function factorScore(rating) {
  if (rating === 'favourable')   return 85
  if (rating === 'borderline')   return 50
  if (rating === 'unfavourable') return 20
  return 0
}

/* ─── Competition explanation fix ────────────────────────────────────────────
   Field data shows stable and unstable businesses have near-identical
   competitor counts (26.15 vs 25.89 within 300m). Competition count alone
   is not predictive of stability in this dataset. The explanation reflects
   this honestly — it is the combination with traffic and location that matters.
   ─────────────────────────────────────────────────────────────────────────── */
const COMPETITION_EXPLANATIONS = {
  favourable:   'The competition level here is consistent with areas where personal care businesses operate steadily. In Kigali, similar businesses tend to cluster in areas where customer demand already exists.',
  borderline:   'Moderate competition nearby. The area has some similar businesses but is not heavily saturated. How well this works for you depends more on foot traffic and accessibility than on competitor count alone.',
  unfavourable: 'Either very high or very low competition in this immediate area. On its own, competitor count is a weak signal — what matters more is whether foot traffic and market proximity support consistent customer flow.',
}

/* ─── Location profile ────────────────────────────────────────────────────── */
function deriveProfile(factors, band) {
  if (!factors?.length) return null
  const get = name => factors.find(f => f.factor === name)
  const traffic    = get('Pedestrian Activity')
  const comp       = get('Competition Pressure')
  const transport  = get('Transport Access')
  const market     = get('Market Proximity')
  const density    = get('Residential Density')

  const hiTraffic  = traffic?.rating   === 'favourable'
  const loTraffic  = traffic?.rating   === 'unfavourable'
  const hiComp     = comp?.rating      === 'unfavourable'
  const loComp     = comp?.rating      === 'favourable'
  const goodAccess = transport?.rating === 'favourable' || market?.rating === 'favourable'
  const hiDensity  = density?.rating   === 'favourable'

  if (hiTraffic && hiComp) return {
    type: 'Active Commercial Area',
    summary: 'This location sits in a busy commercial zone with consistent pedestrian flow and a concentration of similar businesses. The customer base is proven — the question is how to stand out within it.',
    angle: 'In areas like this, the businesses that thrive tend to be the ones with a clear identity. Quality, specialisation, or a specific customer focus matters more than price.',
    opportunities: ['Target a customer segment that existing businesses serve less well', 'Invest in the quality of the experience to build loyalty over volume', 'Consider a specialisation — bridal, professional, or men\'s grooming — that differentiates clearly'],
    watchFor: 'High foot traffic areas often come with higher rent. Make sure the commercial terms make sense before the location does.',
  }
  if (hiTraffic && loComp) return {
    type: 'Underserved High-Traffic Location',
    summary: 'Strong pedestrian activity with relatively few competing businesses nearby. This combination is uncommon and suggests that customer demand in this area has not yet been fully met.',
    angle: 'The opportunity here is timing. Establishing a presence before others discover the same gap creates a loyal customer base that is harder for later entrants to take.',
    opportunities: ['Build brand recognition early while competition is still limited', 'Focus on converting walk-in traffic into repeat customers through consistency and service quality', 'The location can do much of your marketing work for you — invest in visibility'],
    watchFor: 'Low competition can sometimes mean the area has been tried before without success. Spend time observing actual foot traffic patterns before committing.',
  }
  if (loTraffic && loComp) return {
    type: 'Developing or Residential Area',
    summary: 'Limited current foot traffic and few nearby competitors. This may be a residential zone that relies on local community demand rather than passing trade, or an area still developing commercially.',
    angle: 'A business here would depend less on location and more on building relationships directly with the surrounding community. The lower commercial pressure can be an advantage for a patient, community-focused approach.',
    opportunities: ['Build a loyal local following through community presence and word of mouth', 'Appointment-based models work well here — the customer comes to you by choice, not by passing by', 'Lower competition means you can grow at your own pace without immediate pressure'],
    watchFor: 'Customer acquisition takes longer without walk-in traffic. Your capital needs to cover a longer runway before reaching consistent revenue.',
  }
  if (loTraffic && hiComp) return {
    type: 'Challenging Spatial Environment',
    summary: 'Low pedestrian activity combined with a concentration of existing businesses is a difficult combination. Customer flow is limited and already divided across multiple options.',
    angle: 'This does not mean a business cannot work here, but it would need to operate differently — relying on appointment bookings, community reputation, or a specialised service that attracts customers who travel specifically to reach you.',
    opportunities: ['A highly specialised niche can attract customers from beyond the immediate area', 'Mobile or home-visit services reduce dependence on location entirely'],
    watchFor: 'Businesses that rely on walk-in traffic tend to find this combination the hardest to sustain. Explore alternative nearby locations before committing.',
  }
  if (goodAccess && hiDensity) return {
    type: 'Accessible Residential Hub',
    summary: 'Good transport access and a dense surrounding population create a catchment that reaches beyond the immediate neighbourhood. Customers can reach this location easily from a wider area.',
    angle: 'Accessibility is a genuine competitive advantage. A business here can serve a broader customer base than one in an equally dense but harder-to-reach area.',
    opportunities: ['Market to customers beyond walking distance — your transport links support a wider catchment', 'Commuter-linked timing (early morning, evening) may drive significant traffic'],
    watchFor: 'Verify that the specific street-level environment matches what the spatial data suggests. Proximity to a road or stop varies significantly within small areas.',
  }
  if (band === 'FAVOURABLE') return {
    type: 'Spatially Well-Suited Location',
    summary: 'Multiple spatial factors align favourably here. The environment is broadly supportive of a personal care business — foot traffic, accessibility, and the surrounding population all contribute positively.',
    angle: 'Strong spatial fundamentals reduce one layer of business risk, but they do not eliminate the others. The location supports you; the business still depends on execution.',
    opportunities: ['A solid foundation to build from', 'Multiple factors working in your favour reduces early-stage location risk'],
    watchFor: 'Continue to verify non-spatial factors — lease terms, personal readiness, and startup capital — before committing.',
  }
  if (band === 'UNFAVOURABLE') return {
    type: 'Spatially Challenging Location',
    summary: 'Several spatial factors present meaningful challenges here. The environment does not strongly support a walk-in personal care business based on the patterns observed in similar areas.',
    angle: 'Spatial conditions are not the only thing that determines whether a business succeeds, but they are hard to overcome through effort alone. It is worth comparing this location against nearby alternatives.',
    opportunities: ['A highly specialised appointment-only model reduces dependence on spatial conditions'],
    watchFor: 'Explore two or three nearby alternatives before deciding. A short distance can make a significant difference in the spatial profile.',
  }
  return {
    type: 'Mixed Spatial Profile',
    summary: 'This location shows a mix of favourable and less favourable spatial conditions. Some factors support a business here; others present challenges worth understanding before deciding.',
    angle: 'The specific combination of strengths and weaknesses matters more than the overall score. Review the factor breakdown below to understand which aspects of this location are working for you and which are not.',
    opportunities: ['The favourable factors can be built on', 'Addressing the weaker factors through business model choices may offset their impact'],
    watchFor: 'Investigate the specific weak factors more closely before making a final decision.',
  }
}

/* ─── Strategy ────────────────────────────────────────────────────────────── */
function deriveStrategy(factors, band) {
  if (!factors?.length) return null
  const get = name => factors.find(f => f.factor === name)
  const hiTraffic  = get('Pedestrian Activity')?.rating   === 'favourable'
  const loTraffic  = get('Pedestrian Activity')?.rating   === 'unfavourable'
  const hiComp     = get('Competition Pressure')?.rating  === 'unfavourable'
  const loComp     = get('Competition Pressure')?.rating  === 'favourable'
  const goodAccess = get('Transport Access')?.rating      === 'favourable' || get('Market Proximity')?.rating === 'favourable'

  if (hiTraffic && loComp) return {
    headline: 'Make the most of an early-mover position',
    points: [
      'Clear, well-placed signage can convert a significant share of passing foot traffic into first-time customers.',
      'Keeping services accessible and competitively priced early on helps build a loyal base before others are drawn to the same area.',
      'Word of mouth grows faster in low-competition areas — quality and consistency from the start pays off more here than anywhere else.',
      'Establishing your brand identity now makes it harder for future competitors to displace you once the area becomes more attractive.',
    ],
  }
  if (hiTraffic && hiComp) return {
    headline: 'Stand out within a competitive but active market',
    points: [
      'Competing on price alone in a saturated area tends not to work — customers have too many options and the margins become unsustainable.',
      'Identifying a specific service or customer type that existing businesses serve less well gives you a defensible position.',
      'The quality of the customer experience — speed, cleanliness, booking convenience — often matters more than price in areas with established competition.',
      'A clear specialisation (bridal services, professional grooming, a specific technique) can attract customers willing to travel specifically to reach you.',
    ],
  }
  if (loTraffic && loComp) return {
    headline: 'Build through relationships rather than foot traffic',
    points: [
      'Walk-in trade will be limited here, so active outreach to the surrounding community matters more than it would in a busier area.',
      'Building an appointment book through WhatsApp, social media, and referrals from early customers is likely to be the main growth path.',
      'Partnering with nearby businesses, schools, or community organisations can accelerate awareness in a way that signage alone cannot.',
      'Flexible availability — particularly evenings and weekends — may matter more than midday hours in a residential area.',
    ],
  }
  if (loTraffic && hiComp) return {
    headline: 'Consider whether this is the right location before committing',
    points: [
      'Low foot traffic and high competition is the hardest spatial combination to build from. It is worth exploring two or three nearby alternatives before deciding.',
      'If this location is the only option, a deeply specialised service that attracts customers from beyond the immediate area may be the most viable path.',
      'An appointment-only or mobile model reduces dependence on walk-in traffic and may make the location viable in a way a traditional setup would not.',
      'The lower the location\'s spatial score, the more the business depends on factors like personal reputation, specialisation, and marketing to compensate.',
    ],
  }
  if (goodAccess) return {
    headline: 'Use accessibility as a competitive advantage',
    points: [
      'Good transport links mean your potential customer base extends beyond the immediate neighbourhood — consider marketing to customers who can reach you by bus or moto-taxi.',
      'Commuter patterns (morning and evening peaks) may drive significant traffic — being open and visible during those windows can make a real difference.',
      'A well-connected location can support a specialised service that customers are willing to travel for, even if they would not pass by naturally.',
    ],
  }
  if (band === 'FAVOURABLE') return {
    headline: 'Build on strong spatial fundamentals',
    points: [
      'The location reduces one layer of business risk — the environment is supportive. The priority now is execution quality and customer retention.',
      'Investing in the physical space and the customer experience early creates the reputation that drives word-of-mouth growth.',
      'A strong location is an asset worth protecting — locking in favourable lease terms while the business is not yet established gives you stability.',
    ],
  }
  return {
    headline: 'Validate the weaker factors before deciding',
    points: [
      'Spending time at this location at different times and days gives a clearer picture than any data analysis can provide.',
      'Talking to business owners already operating nearby about their actual experience is one of the most reliable sources of insight available.',
      'Comparing this location against one or two nearby alternatives puts the assessment in context and may reveal a significantly better option nearby.',
    ],
  }
}

/* ─── Next steps ──────────────────────────────────────────────────────────── */
function deriveNextSteps(factors, band) {
  const steps = []
  const weak   = (factors || []).filter(f => f.rating === 'unfavourable').map(f => f.factor)
  const mixed  = (factors || []).filter(f => f.rating === 'borderline').map(f => f.factor)

  if (band === 'FAVOURABLE') {
    steps.push({ n: 'Visit at different times', d: 'Confirm what the data suggests by spending time at the location during morning, midday, and evening on both weekdays and weekends.' })
    steps.push({ n: 'Talk to nearby business owners', d: 'Ask about their customer patterns, what has changed over time, and what they would do differently. Their experience is data the model cannot capture.' })
    steps.push({ n: 'Review your lease terms carefully', d: 'Understand the rent, deposit, notice period, and any restrictions on how you can use the space before signing anything.' })
    steps.push({ n: 'Look into formal registration', d: 'The WDA Recognition of Prior Learning programme specifically covers personal care services. Formal registration opens access to the Business Development Fund and other support.' })
    steps.push({ n: 'Plan the first two months deliberately', d: 'An opening offer or community outreach in the first weeks builds the word-of-mouth that sustains a new business. Have a plan for this before you open.' })
  } else if (band === 'BORDERLINE') {
    if (weak.includes('Competition Pressure') || mixed.includes('Competition Pressure'))
      steps.push({ n: 'Visit competing businesses nearby', d: 'Note their pricing, services offered, and how busy they are at different times. Look for gaps in what they offer that you could fill.' })
    if (weak.includes('Pedestrian Activity') || mixed.includes('Pedestrian Activity'))
      steps.push({ n: 'Count foot traffic yourself', d: 'Spend a few hours at the location on different days. The model estimates from field data — your direct observation adds a layer of certainty the data alone cannot give you.' })
    if (weak.includes('Transport Access') || mixed.includes('Transport Access'))
      steps.push({ n: 'Check nearby street alternatives', d: 'A street one or two blocks closer to a main road or moto-taxi stage can change the accessibility profile significantly.' })
    if (weak.includes('Market Proximity') || mixed.includes('Market Proximity'))
      steps.push({ n: 'Ask local residents where they currently go', d: 'If residents travel far for personal care services, that is an opportunity this location could fill. If they have options nearby they prefer, that is useful to know.' })
    steps.push({ n: 'Compare at least one nearby alternative', d: 'Before committing, assess one other candidate location in the same area. A few streets can change the spatial profile in ways that are worth knowing.' })
    steps.push({ n: 'Model your costs conservatively', d: 'Mixed spatial signals often mean a longer runway to consistent revenue. Make sure your capital covers at least three to four months of operating costs.' })
  } else {
    if (weak.includes('Pedestrian Activity'))
      steps.push({ n: 'Prioritise foot traffic in your next search', d: 'Streets closer to markets, main roads, or moto-taxi stages tend to perform significantly better. This factor is hard to compensate for through effort alone.' })
    if (weak.includes('Transport Access'))
      steps.push({ n: 'Look for better-connected locations', d: 'Accessibility affects how wide your potential customer base can be. Prioritising proximity to public transport in your next search is likely to improve the overall profile significantly.' })
    if (weak.includes('Competition Pressure'))
      steps.push({ n: 'Look for less saturated areas nearby', d: 'High competition in a low-traffic area creates a difficult environment. Nearby streets or the next commercial cluster may offer a meaningfully better balance.' })
    steps.push({ n: 'Explore two or three alternative locations first', d: 'Use this assessment as a reference point, not a final answer. Assessing nearby alternatives gives you context and may reveal a significantly better option close by.' })
    steps.push({ n: 'Consider whether a fixed premises is the right model here', d: 'If this area is the only option available, an appointment-based or mobile approach reduces the dependence on walk-in traffic that the spatial conditions here do not strongly support.' })
  }
  return steps
}

const BEYOND = [
  { t: 'Your skills and experience',       d: 'The spatial environment is one factor. Your technical skills, how you treat customers, and how you run day-to-day operations are equally important — and they cannot be assessed from a map.' },
  { t: 'Startup capital and runway',        d: 'Understand your full cost picture before opening: rent deposit, equipment, supplies, registration, and enough operating capital to cover at least two to three months before revenue becomes consistent.' },
  { t: 'Business registration',             d: 'Registering formally opens access to the Business Development Fund and other government support programmes. The WDA Recognition of Prior Learning programme specifically covers personal care services.' },
  { t: 'Supplier relationships',            d: 'Reliable access to products and equipment matters as much as location for day-to-day operations. Identify your suppliers before you open.' },
  { t: 'Your lease agreement',              d: 'Read the terms carefully. Understand the notice period, what happens if you need to leave early, and what you are and are not allowed to modify in the space.' },
  { t: 'Building a loyal customer base',    d: 'Location brings customers through the door — relationships keep them coming back. Your first thirty to fifty loyal customers will drive more growth than any spatial advantage.' },
]

/* ─── Charts ──────────────────────────────────────────────────────────────── */
function FactorRadar({ factors }) {
  const data = (factors || []).map(f => ({
    factor: f.factor.replace(' ', '\n'),
    score:  factorScore(f.rating),
    fullMark: 100,
  }))
  if (!data.length) return null

  function getColor(value) {
    if (value >= 70) return 'var(--green)'
    if (value >= 40) return 'var(--amber)'
    return 'var(--red)'
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis
          dataKey="factor"
          tick={{ fontSize: 11, fill: 'var(--text-secondary)', fontFamily: 'var(--font)' }}
        />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          name="Score"
          dataKey="score"
          stroke="var(--brand)"
          fill="var(--brand)"
          fillOpacity={0.15}
          strokeWidth={2}
        />
        <Tooltip
          formatter={v => [`${v}%`, 'Score']}
          contentStyle={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            fontSize: 12,
            fontFamily: 'var(--font)',
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}

function FactorBars({ factors }) {
  const data = (factors || []).map(f => ({
    name:  f.factor,
    score: factorScore(f.rating),
    rating: f.rating,
  }))
  if (!data.length) return null

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 40, top: 4, bottom: 4 }}>
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
          axisLine={false} tickLine={false} unit="%" />
        <YAxis type="category" dataKey="name" width={130}
          tick={{ fontSize: 12, fill: 'var(--text-secondary)', fontFamily: 'var(--font)' }}
          axisLine={false} tickLine={false} />
        <Tooltip
          formatter={v => [`${v}%`, 'Score']}
          contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
        />
        <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={14}>
          {data.map((entry, i) => (
            <Cell key={i} fill={ratingColor(entry.rating)} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ─── Score arc ───────────────────────────────────────────────────────────── */
function ScoreArc({ probability, color }) {
  const pct    = Math.round((probability || 0) * 100)
  const radius = 52
  const circ   = 2 * Math.PI * radius
  const fill   = circ - (pct / 100) * circ * 0.75

  return (
    <div style={{ position: 'relative', width: 130, height: 90 }}>
      <svg width="130" height="90" viewBox="0 0 130 100">
        <circle cx="65" cy="72" r={radius} fill="none"
          stroke="var(--border)" strokeWidth="9"
          strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
          strokeDashoffset={circ * 0.125}
          strokeLinecap="round"
          transform="rotate(135 65 72)" />
        <circle cx="65" cy="72" r={radius} fill="none"
          stroke={color} strokeWidth="9"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={fill + circ * 0.125}
          strokeLinecap="round"
          transform="rotate(135 65 72)"
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        textAlign: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: '1.8rem', fontWeight: 700,
        color: 'var(--text-primary)',
        lineHeight: 1,
      }}>
        {pct}<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>%</span>
      </div>
    </div>
  )
}

/* ─── Report ──────────────────────────────────────────────────────────────── */
function Report({ entry }) {
  const meta     = bandMeta(entry.band)
  const profile  = deriveProfile(entry.factors, entry.band)
  const strategy = deriveStrategy(entry.factors, entry.band)
  const steps    = deriveNextSteps(entry.factors, entry.band)
  const factors  = entry.factors || []

  const favourable   = factors.filter(f => f.rating === 'favourable')
  const borderline   = factors.filter(f => f.rating === 'borderline')
  const unfavourable = factors.filter(f => f.rating === 'unfavourable')
  const ordered      = [...favourable, ...borderline, ...unfavourable]

  const hasFactors = factors.length > 0

  return (
    <article className="rp-report">

      {/* ── Header ── */}
      <header className="rp-header">
        <div className="rp-header-left">
          <p className="rp-eyebrow">Location Assessment Report</p>
          <h1 className="rp-coords">
            {entry.lat.toFixed(4)}°,&nbsp;{entry.lng.toFixed(4)}°
          </h1>
          <p className="rp-submeta">{fmt(entry.timestamp)} · Personal Care Services · Kigali</p>
        </div>
        <div className="rp-header-right">
          <ScoreArc probability={entry.probability} color={meta.color} />
          <div className="rp-band-label" style={{ color: meta.color, borderColor: meta.color + '40', background: meta.color + '0f' }}>
            {meta.label}
          </div>
          <button className="btn btn-sm rp-print-btn" onClick={() => window.print()}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <rect x="1" y="4" width="11" height="7" rx="1" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M4 4V2h5v2M4 9h5M4 11h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Save as PDF
          </button>
        </div>
      </header>

      {/* ── Factor overview ── */}
      {hasFactors && (
        <section className="rp-section">
          <h2 className="rp-section-title">Spatial Overview</h2>
          <div className="rp-charts-row">
            <div className="rp-chart-card">
              <p className="rp-chart-label">Factor scores</p>
              <FactorRadar factors={factors} />
            </div>
            <div className="rp-chart-card">
              <p className="rp-chart-label">Score breakdown</p>
              <FactorBars factors={factors} />
              <div className="rp-chart-legend">
                <span className="rp-legend-dot" style={{ background: 'var(--green)' }} />Positive
                <span className="rp-legend-dot" style={{ background: 'var(--amber)', marginLeft: 14 }} />Mixed
                <span className="rp-legend-dot" style={{ background: 'var(--red)', marginLeft: 14 }} />Concern
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Location character ── */}
      {profile && (
        <section className="rp-section">
          <h2 className="rp-section-title">What this location looks like</h2>
          <div className="rp-card rp-profile">
            <div className="rp-profile-type">{profile.type}</div>
            <p className="rp-profile-summary">{profile.summary}</p>
            <p className="rp-profile-angle">{profile.angle}</p>
            <div className="rp-profile-cols">
              <div>
                <p className="rp-col-head rp-col-green">What works in your favour</p>
                {profile.opportunities.map((o, i) => (
                  <div key={i} className="rp-bullet">
                    <span className="rp-bullet-dot" style={{ background: 'var(--green)' }} />{o}
                  </div>
                ))}
              </div>
              <div>
                <p className="rp-col-head rp-col-amber">What to look into</p>
                <div className="rp-bullet">
                  <span className="rp-bullet-dot" style={{ background: 'var(--amber)' }} />{profile.watchFor}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Factor detail ── */}
      {hasFactors && (
        <section className="rp-section">
          <h2 className="rp-section-title">Factor by factor</h2>
          <div className="rp-factors-grid">
            {ordered.map((f, i) => {
              const explanation = f.factor === 'Competition Pressure'
                ? COMPETITION_EXPLANATIONS[f.rating] || f.explanation
                : f.explanation
              return (
                <div key={i} className="rp-factor-card" style={{ borderLeftColor: ratingColor(f.rating) }}>
                  <div className="rp-factor-top">
                    <span className="rp-factor-name">{f.factor}</span>
                    <span className="rp-factor-badge"
                      style={{ color: ratingColor(f.rating), background: ratingBg(f.rating) }}>
                      {ratingLabel(f.rating)}
                    </span>
                  </div>
                  <p className="rp-factor-detail">{f.detail}</p>
                  <p className="rp-factor-explanation">{explanation}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Strategy ── */}
      {strategy && (
        <section className="rp-section">
          <h2 className="rp-section-title">A strategic angle to consider</h2>
          <div className="rp-card">
            <p className="rp-strategy-headline">{strategy.headline}</p>
            <div className="rp-strategy-list">
              {strategy.points.map((p, i) => (
                <div key={i} className="rp-strategy-item">
                  <div className="rp-strategy-num">{i + 1}</div>
                  <p>{p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Next steps ── */}
      <section className="rp-section">
        <h2 className="rp-section-title">Where to go from here</h2>
        <div className="rp-card rp-steps">
          {steps.map((s, i) => (
            <div key={i} className="rp-step">
              <div className="rp-step-num" style={{ color: meta.color, background: meta.color + '15' }}>
                {i + 1}
              </div>
              <div>
                <p className="rp-step-name">{s.n}</p>
                <p className="rp-step-detail">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Beyond location ── */}
      <section className="rp-section">
        <h2 className="rp-section-title">Beyond the location</h2>
        <p className="rp-section-lead">
          Spatial conditions are one input into a business decision. The factors below are equally
          important and cannot be assessed from location data alone.
        </p>
        <div className="rp-beyond-grid">
          {BEYOND.map((b, i) => (
            <div key={i} className="rp-card rp-beyond-card">
              <p className="rp-beyond-title">{b.t}</p>
              <p className="rp-beyond-detail">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <div className="rp-disclaimer">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M7 6v4M7 4v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <span>
          {entry.disclaimer ||
            'This assessment reflects spatial and environmental patterns only. It does not predict business success, profitability, or entrepreneurial outcomes.'}
        </span>
      </div>
    </article>
  )
}

/* ─── Empty state ─────────────────────────────────────────────────────────── */
function Empty() {
  return (
    <div className="rp-empty">
      <div className="rp-empty-icon">
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <circle cx="22" cy="18" r="7" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M22 7C15.9 7 11 11.9 11 18C11 27 22 37 22 37C22 37 33 27 33 18C33 11.9 28.1 7 22 7Z"
                stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        </svg>
      </div>
      <h3>No assessments yet</h3>
      <p>Go to the map, drop a pin, and run an assessment. Your reports will appear here.</p>
    </div>
  )
}

/* ─── Main ────────────────────────────────────────────────────────────────── */
export default function Reports() {
  const [history,  setHistory]  = useState([])
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('assessment_history') || '[]')
      setHistory(stored)
    } catch { setHistory([]) }
  }, [])

  return (
    <div className="rp-page">
      {/* History sidebar — always visible, no toggle */}
      <aside className="rp-sidebar">
        <div className="rp-sidebar-head">
          <span>History</span>
          <span className="rp-sidebar-count">{history.length}</span>
        </div>
        <div className="rp-sidebar-list">
          {history.length === 0 && (
            <p className="rp-sidebar-empty">No assessments yet.</p>
          )}
          {history.map((e, i) => {
            const m = bandMeta(e.band)
            return (
              <div key={i}
                className={`rp-sidebar-item${selected === i ? ' active' : ''}`}
                onClick={() => setSelected(i)}>
                <div className="rp-sidebar-item-row">
                  <span className="rp-sidebar-coord">
                    {e.lat.toFixed(4)}, {e.lng.toFixed(4)}
                  </span>
                  <span style={{ color: m.color, fontSize: '0.78rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {Math.round((e.probability || 0) * 100)}%
                  </span>
                </div>
                <div className="rp-sidebar-item-row rp-sidebar-meta">
                  <span>{fmt(e.timestamp)}</span>
                  <span style={{ color: m.color }}>{m.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      </aside>

      {/* Report area */}
      <main className="rp-main">
        {history.length === 0
          ? <Empty />
          : history[selected]
          ? <Report entry={history[selected]} />
          : null}
      </main>
    </div>
  )
}
