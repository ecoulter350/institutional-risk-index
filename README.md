# Institutional Risk Index
A machine learning early warning system for higher education institutional closure risk.

## Overview
The IRI monitors 1,716 four-year public and private nonprofit institutions using IPEDS data from 2018–2024. Five predictive models — threshold scoring, composite index, logistic regression, survival analysis, and XGBoost — identify institutions exhibiting stress patterns consistent with those observed in 57 confirmed closures from 2018 to 2026.

The logistic regression model achieves a test AUC of 0.925. The XGBoost model produces a mean closure probability of 96.3% for closed schools versus 3.6% for live institutions — a 26.7× separation.

## Features
- **Risk Brief Generator** — AI-generated institutional health briefs for any of 1,716 institutions, powered by the Claude API.
- **Watchlist** — Filterable, sortable table of all institutions with XGBoost probabilities, stress scores, multi-model flags, and per-indicator dot visualization. Click any row to open a detailed slide panel.
- **Methodology** — Plain-English explanation of all five models and six stress indicators.

## Stack
- Next.js 14
- React 18
- Anthropic Claude API (claude-sonnet-4-20250514)
- IPEDS data via Urban Institute Education Data API
- Deployed on Vercel

## Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and add your Anthropic API key
4. Run locally: `npm run dev`
5. Open `http://localhost:3000`

## Data
All institutional data is sourced from IPEDS via the Urban Institute Education Data API. Indicators are five-year averages computed from 2018–2024 data. The closed school validation set consists of 57 verified true closures — institutions that ceased operations entirely, excluding mergers, acquisitions, and rebrands.

## Deployment
Deployed on Vercel. Set `ANTHROPIC_API_KEY` as an environment variable in the Vercel dashboard — never commit your API key to the repository.

## Methodology
Five models are combined into a consensus watchlist:

| Model | Key metric |
|-------|-----------|
| Threshold scoring | 60 institutions flagged (score ≥ 3/6) |
| Composite index | 47 institutions (score ≥ 60/100) |
| Logistic regression | 107 institutions (prob ≥ 5%) · AUC 0.925 |
| Survival analysis | 843 institutions (hazard ≥ 1.0) · concordance 0.911 |
| XGBoost | 13 institutions (prob ≥ 50%) · primary model |

Stress indicator thresholds are derived from the median values of 57 confirmed closed institutions:

| Indicator | Threshold |
|-----------|-----------|
| Acceptance rate | > 71.9% |
| Yield rate | < 45.1% |
| Enrollment change | < −18.4% |
| Grant aid recipients | > 99.6% |
| Operating margin | < −50.4% |
| Tuition dependency | > 101.0% |

## Author
Elliott Coulter — [github.com/ecoulter350](https://github.com/ecoulter350)
