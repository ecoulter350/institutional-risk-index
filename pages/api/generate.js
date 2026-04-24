const requestCounts = new Map()

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const origin = req.headers.origin
  const allowedOrigins = [
    'https://institutional-risk-index.vercel.app',
    'http://localhost:3000'
  ]
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
  const now = Date.now()
  const windowMs = 60 * 1000
  const limit = 10
  if (!requestCounts.has(ip)) requestCounts.set(ip, [])
  const timestamps = requestCounts.get(ip).filter(t => now - t < windowMs)
  timestamps.push(now)
  requestCounts.set(ip, timestamps)
  if (timestamps.length > limit) {
    return res.status(429).json({ error: 'Too many requests. Please wait a minute and try again.' })
  }

  const { institution, audience } = req.body

  if (!institution) {
    return res.status(400).json({ error: 'Institution data required' })
  }

  const validInstitutions = require('../../data/institutions.json')
  const validUnitIds = new Set(validInstitutions.map(i => i.unitid))
  if (!institution.unitid || !validUnitIds.has(institution.unitid)) {
    return res.status(400).json({ error: 'Invalid institution' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  const fmt = (v, isPercent = false) => {
    if (v === null || v === undefined) return 'N/A'
    if (isPercent) return (v * 100).toFixed(1) + '%'
    return v.toFixed(1)
  }

  const riskColor = (tier) => {
    const map = { Critical: 'CRITICAL', High: 'HIGH', Elevated: 'ELEVATED',
                   Moderate: 'MODERATE', Low: 'LOW' }
    return map[tier] || tier
  }

  const systemPrompt = `You are an analyst for the Institutional Risk Index (IRI), a data-driven early warning system for higher education institutional closure risk. You generate structured institutional health briefs grounded strictly in provided quantitative data.

Your briefs are based on a five-model predictive system trained on IPEDS data from 1,716 four-year public and private nonprofit institutions, validated against 57 confirmed closures from 2018-2026. The logistic regression model achieved a test AUC of 0.925.

The six stress indicators and their closed-school thresholds are:
- Acceptance rate: stress if > 71.9% (open admissions signal)
- Yield rate: stress if < 45.1% (weak demand signal)
- Enrollment change (5yr): stress if < -18.4% (declining headcount)
- Grant aid %: stress if > 99.6% (near-universal discounting)
- Operating margin: stress if < -50.4% (deficit operations)
- Tuition dependency: stress if > 101.0% (revenue concentration risk)

RULES:
- Only reference data explicitly provided. Never invent figures.
- If a value is N/A, note it as unavailable and explain why.
- Be direct, specific, but respectful.
- Write in plain English. No jargon without explanation.
- Keep each section concise. Executive summary: 3 sentences max. Each other section: 4-6 sentences.`

  const generalPrompt = `Generate an institutional health brief for ${institution.inst_name} for a GENERAL EDUCATED AUDIENCE (policy analysts, journalists, accreditors, higher education administrators).

INSTITUTION DATA:
- Name: ${institution.inst_name}
- Location: ${institution.state_abbr}
- Sector: ${institution.sector === 1 ? 'Public' : 'Private nonprofit'}
- Size: ${institution.inst_size} (enrollment category)

MODEL SCORES:
- XGBoost closure probability: ${fmt(institution.xgb_prob, true)} (${riskColor(institution.xgb_tier)})
- Threshold stress score: ${institution.stress_score !== null ? institution.stress_score + '/6' : 'N/A'} (${institution.risk_tier || 'N/A'})
- Composite index score: ${institution.composite_score !== null ? institution.composite_score.toFixed(1) : 'N/A'}/100
- Logistic regression probability: ${fmt(institution.prob_closure_b, true)}
- Cox hazard ratio: ${institution.cox_hazard !== null ? institution.cox_hazard.toFixed(2) + 'x' : 'N/A'}
- Models flagging institution: ${institution.models_flagged}/5

STRESS INDICATORS (5-year averages):
- Acceptance rate: ${fmt(institution.avg_acceptance_rate, true)} [threshold: >71.9% = stress]
- Yield rate: ${fmt(institution.avg_yield_rate, true)} [threshold: <45.1% = stress]
- Enrollment change: ${fmt(institution.enrollment_pct_change, true)} [threshold: <-18.4% = stress]
- Grant aid recipients: ${fmt(institution.avg_grant_pct, true)} [threshold: >99.6% = stress]
- Operating margin: ${institution.avg_operating_margin !== null ? fmt(institution.avg_operating_margin, true) : 'N/A'}
- Tuition dependency: ${institution.avg_tuition_dep !== null ? fmt(institution.avg_tuition_dep, true) : 'N/A'} [threshold: >101.0% = stress]

Generate a brief with exactly these four sections. Use the section headers exactly as written:

## Executive Summary
[3 sentences. Name the overall risk level. Identify the 2-3 most important stress signals. State what the pattern suggests.]

## Indicator Analysis
[For each available indicator, one sentence: what the value is, whether it crosses the stress threshold, and what it means in plain English. Group by severity -- start with the most concerning.]

## Trajectory Assessment
[Based on the combination of indicators, describe what kind of institution this appears to be and what its pattern suggests about its near-term trajectory. Reference comparable closed institutions only if the pattern is genuinely similar. Do not speculate beyond what the data supports.]

## Comparable Institutions
[Name 1-2 closed institutions from the validation set whose profiles most resemble this institution's, and briefly explain the resemblance. If no close comparison exists, say so clearly. Closed institutions in validation set include: Birmingham-Southern College (2024), Wells College (2024), Cazenovia College (2023), Medaille University (2023), Iowa Wesleyan University (2023), Cardinal Stritch University (2023), Finlandia University (2023), Holy Names University (2023), Alderson Broaddus University (2023), MacMurray College (2020), Judson College (2021), Lincoln College (2022), Marygrove College (2019), Becker College (2021), San Francisco Art Institute (2022), and others.]`

  const endowmentPrompt = `Generate an institutional health brief for ${institution.inst_name} for an ENDOWMENT MANAGER / INSTITUTIONAL INVESTOR AUDIENCE. Focus on financial viability, revenue model risk, and implications for bond exposure or philanthropic capital.

INSTITUTION DATA:
- Name: ${institution.inst_name}
- Location: ${institution.state_abbr}
- Sector: ${institution.sector === 1 ? 'Public' : 'Private nonprofit'}
- Size: ${institution.inst_size} (enrollment category)

MODEL SCORES:
- XGBoost closure probability: ${fmt(institution.xgb_prob, true)} (${riskColor(institution.xgb_tier)})
- Threshold stress score: ${institution.stress_score !== null ? institution.stress_score + '/6' : 'N/A'}
- Composite index score: ${institution.composite_score !== null ? institution.composite_score.toFixed(1) : 'N/A'}/100
- Logistic regression probability: ${fmt(institution.prob_closure_b, true)}
- Cox hazard ratio: ${institution.cox_hazard !== null ? institution.cox_hazard.toFixed(2) + 'x' : 'N/A'}
- Models flagging institution: ${institution.models_flagged}/5

FINANCIAL STRESS INDICATORS:
- Acceptance rate: ${fmt(institution.avg_acceptance_rate, true)} [high = demand weakness = revenue risk]
- Yield rate: ${fmt(institution.avg_yield_rate, true)} [low = enrollment management failure = discounting pressure]
- Enrollment change (5yr): ${fmt(institution.enrollment_pct_change, true)} [negative = net tuition revenue declining]
- Grant aid recipients: ${fmt(institution.avg_grant_pct, true)} [high = near-universal discounting, thin margin per student]
- Operating margin: ${institution.avg_operating_margin !== null ? fmt(institution.avg_operating_margin, true) : 'N/A'}
- Tuition dependency: ${institution.avg_tuition_dep !== null ? fmt(institution.avg_tuition_dep, true) : 'N/A'} [high = concentrated revenue risk]

Generate a brief with exactly these four sections:

## Financial Risk Summary
[3 sentences. Lead with the XGBoost probability and what it means for financial viability. Identify the primary revenue model vulnerability. State the bottom-line risk assessment for capital exposure.]

## Revenue Model Analysis
[Analyze the tuition revenue model: enrollment trend + yield rate together tell a story about whether net tuition revenue is growing, stable, or compressing. Operating margin and tuition dependency indicate structural resilience. Be specific about which combinations are most concerning and why.]

## Liquidity and Closure Risk
[Assess the probability that financial stress leads to operational disruption or closure within a 3-5 year horizon based on the indicator profile. Reference the closed school validation set where relevant. Note what additional data (endowment size, debt load, state appropriations) would sharpen the assessment.]

## Capital Exposure Considerations
[For an endowment manager or bondholder: what does this profile suggest about the risk of holding bonds, planned gifts, or major donor commitments to this institution? What monitoring signals would indicate deteriorating conditions? Keep this practical and action-oriented.]`

  const prompt = audience === 'endowment' ? endowmentPrompt : generalPrompt

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic API error:', err)
      return res.status(500).json({ error: 'API request failed' })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ''

    return res.status(200).json({ brief: text })
  } catch (error) {
    console.error('Error calling Anthropic:', error)
    return res.status(500).json({ error: 'Failed to generate brief' })
  }
}
