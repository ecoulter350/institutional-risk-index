# Institutional Risk Index

A machine learning early warning system for higher education institutional closure risk.

## Overview

The IRI monitors 1,728 four-year public and private nonprofit institutions using IPEDS data from 2010–2022. Five predictive models, threshold scoring, composite index, logistic regression, survival analysis, and XGBoost to identify institutions exhibiting stress patterns consistent with those observed in 31 confirmed closures from 2019 to 2025.

The XGBoost model achieves a cross-validated AUC of 0.818, with all 31 closed schools scoring Critical (≥50% probability). Mean closure probability is 83.1% for closed schools vs 14.9% for live institutions — a 5.6× separation.

## Features

- **Risk Brief Generator** — AI-generated institutional health briefs for any of 1,728 institutions, powered by the Claude API. 
- **Watchlist** — Filterable, sortable table of all institutions with XGBoost probabilities, stress scores, and multi-model flags.
- **Methodology** — Plain-English explanation of all five models and seven stress indicators.

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

All institutional data is sourced from IPEDS via the Urban Institute Education Data API. Indicators are five-year averages computed from 2017–2022 data. Finance indicators (operating margin, tuition dependency, discount rate) are available through 2017 only due to IPEDS survey coverage.

## Deployment

Deployed on Vercel. Set `ANTHROPIC_API_KEY` as an environment variable in the Vercel dashboard — never commit your API key to the repository.

## Methodology

Five models are combined into a consensus watchlist:

| Model | Key metric |
|-------|-----------|
| Threshold scoring | 300 institutions flagged (score ≥ 3/7) |
| Composite index | 12 institutions (score ≥ 40/100) |
| Logistic regression | 31 institutions (prob ≥ 5%) |
| Survival analysis | 777 institutions (hazard ≥ 1.0) |
| XGBoost | CV AUC 0.818 — primary model |

## Author

Elliott Coulter — [github.com/ecoulter350](https://github.com/ecoulter350)
