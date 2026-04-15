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

Your briefs are based on a five-model predictive system trained on IPEDS data from 1,728 four-year public and private nonprofit institutions, validated against 31 confirmed closures from 2019-2025. The XGBoost model achieved a cross-validated AUC of 0.818.

The seven stress indicators and their closed-school thresholds are:
- Acceptance rate: stress if > 73.3% (open admissions signal)
- Yield rate: stress if < 22.2% (weak demand signal)
- Enrollment change (5yr): stress if < -11.8% (declining headcount)
- Grant aid %: stress if > 93.0% (near-universal discounting)
- Operating margin: stress if < -5.0% (deficit operations)
- Tuition dependency: stress if > 40.6% (revenue concentration risk)
- Discount rate: stress if > 42.5% (unsustainable discounting)

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
- Sector: ${institution.sector}
- Size: ${institution.inst_size} (enrollment category)
- Carnegie Classification: ${institution.cc_basic_2021 || 'N/A'}

MODEL SCORES:
- XGBoost closure probability: ${fmt(institution.xgb_prob, true)} (${riskColor(institution.xgb_tier)})
- Threshold stress score: ${institution.stress_score !== null ? institution.stress_score + '/7' : 'N/A'} (${institution.risk_tier || 'N/A'})
- Composite index score: ${institution.composite_score !== null ? institution.composite_score : 'N/A'}/100 (${institution.composite_tier || 'N/A'})
- Logistic regression probability: ${fmt(institution.prob_closure_b, true)}
- Models flagging institution: ${institution.flags_total}/5

STRESS INDICATORS (5-year averages):
- Acceptance rate: ${fmt(institution.avg_acceptance_rate, true)} [threshold: >73.3% = stress]
- Yield rate: ${fmt(institution.avg_yield_rate, true)} [threshold: <22.2% = stress]
- Enrollment change: ${fmt(institution.enrollment_pct_change, true)} [threshold: <-11.8% = stress]
- Grant aid recipients: ${fmt(institution.avg_grant_pct, true)} [threshold: >93.0% = stress]
- Operating margin: ${institution.avg_operating_margin !== null ? fmt(institution.avg_operating_margin, true) : 'N/A (finance data unavailable post-2017)'}
- Tuition dependency: ${institution.avg_tuition_dep !== null ? fmt(institution.avg_tuition_dep, true) : 'N/A'}
- Discount rate: ${institution.avg_discount_rate !== null ? fmt(institution.avg_discount_rate, true) : 'N/A'}

Generate a brief with exactly these four sections. Use the section headers exactly as written:

## Executive Summary
[3 sentences. Name the overall risk level. Identify the 2-3 most important stress signals. State what the pattern suggests.]

## Indicator Analysis
[For each available indicator, one sentence: what the value is, whether it crosses the stress threshold, and what it means in plain English. Group by severity -- start with the most concerning.]

## Trajectory Assessment
[Based on the combination of indicators, describe what kind of institution this appears to be and what its pattern suggests about its near-term trajectory. Reference comparable closed institutions only if the pattern is genuinely similar. Do not speculate beyond what the data supports.]

## Comparable Institutions
[Name 1-2 closed institutions from the validation set whose profiles most resemble this institution's, and briefly explain the resemblance. If no close comparison exists, say so clearly. Closed institutions in validation set include: Cabrini University (2024), Wells College (2024), Birmingham-Southern College (2025), Iowa Wesleyan University (2023), Cardinal Stritch University (2023), Cazenovia College (2023), MacMurray College (2021), Judson College (2021), Holy Names University (2023), Finlandia University (2023), Lincoln College (2022), and others.]`

  const endowmentPrompt = `Generate an institutional health brief for ${institution.inst_name} for an ENDOWMENT MANAGER / INSTITUTIONAL INVESTOR AUDIENCE. Focus on financial viability, revenue model risk, and implications for bond exposure or philanthropic capital.

INSTITUTION DATA:
- Name: ${institution.inst_name}
- Location: ${institution.state_abbr}
- Sector: ${institution.sector}
- Size: ${institution.inst_size} (enrollment category)
- Carnegie Classification: ${institution.cc_basic_2021 || 'N/A'}

MODEL SCORES:
- XGBoost closure probability: ${fmt(institution.xgb_prob, true)} (${riskColor(institution.xgb_tier)})
- Threshold stress score: ${institution.stress_score !== null ? institution.stress_score + '/7' : 'N/A'}
- Models flagging institution: ${institution.flags_total}/5

FINANCIAL STRESS INDICATORS:
- Acceptance rate: ${fmt(institution.avg_acceptance_rate, true)} [high = demand weakness = revenue risk]
- Yield rate: ${fmt(institution.avg_yield_rate, true)} [low = enrollment management failure = discounting pressure]
- Enrollment change (5yr): ${fmt(institution.enrollment_pct_change, true)} [negative = net tuition revenue declining]
- Grant aid recipients: ${fmt(institution.avg_grant_pct, true)} [high = near-universal discounting, thin margin per student]
- Operating margin: ${institution.avg_operating_margin !== null ? fmt(institution.avg_operating_margin, true) : 'N/A (finance data unavailable post-2017)'}
- Tuition dependency: ${institution.avg_tuition_dep !== null ? fmt(institution.avg_tuition_dep, true) : 'N/A'} [high = concentrated revenue risk]
- Discount rate: ${institution.avg_discount_rate !== null ? fmt(institution.avg_discount_rate, true) : 'N/A'} [high = gross-to-net tuition spread compressed]

Generate a brief with exactly these four sections:

## Financial Risk Summary
[3 sentences. Lead with the XGBoost probability and what it means for financial viability. Identify the primary revenue model vulnerability. State the bottom-line risk assessment for capital exposure.]

## Revenue Model Analysis
[Analyze the tuition revenue model: enrollment trend + yield + discount rate together tell a story about whether net tuition revenue is growing, stable, or compressing. Operating margin and tuition dependency indicate structural resilience. Be specific about which combinations are most concerning and why.]

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
