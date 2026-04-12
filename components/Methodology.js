const models = [
  {
    number: '01',
    name: 'Threshold Scoring',
    description: 'Binary flags for each of seven stress indicators compared against empirical thresholds derived from closed school medians. Institutions scoring 3 or more flags are placed on the watchlist. Simple, interpretable, and useful as a baseline.',
    metric: '300 institutions flagged',
    metricLabel: 'Score ≥ 3/7',
  },
  {
    number: '02',
    name: 'Composite Index',
    description: 'A weighted 0–100 score where weights are proportional to each indicator\'s correlation with closure. Discount rate (53%) and grant aid percentage (11%) carry the most weight, reflecting their predictive power in the closed school validation set.',
    metric: '12 institutions',
    metricLabel: 'Score ≥ 40/100',
  },
  {
    number: '03',
    name: 'Logistic Regression',
    description: 'A binary classification model estimating closure probability directly. Grant aid percentage is the only statistically significant predictor in the four-variable model (p=0.002, OR=323), confirming near-universal discounting as the strongest admissions-side signal.',
    metric: '31 institutions',
    metricLabel: 'Probability ≥ 5%',
  },
  {
    number: '04',
    name: 'Survival Analysis',
    description: 'A Cox proportional hazards model treating closure as a time-to-event outcome. Concordance of 0.70 in the four-predictor specification. Grant aid shows the highest hazard ratio (HR=3.26), consistent with findings from the logistic model.',
    metric: '777 institutions',
    metricLabel: 'Relative hazard ≥ 1.0',
  },
  {
    number: '05',
    name: 'XGBoost',
    description: 'A gradient-boosted machine learning model trained on 19 features including seven stress indicators and institutional characteristics. Cross-validated AUC of 0.818. All 31 closed schools score Critical (≥50% probability), with mean closed school probability of 83.1% versus 14.9% for live institutions — a 5.6× separation.',
    metric: 'CV AUC 0.818',
    metricLabel: 'Best model',
    highlight: true,
  },
]

const indicators = [
  { name: 'Acceptance rate', threshold: '> 73.3%', meaning: 'Open admissions signal — institution accepting nearly all applicants' },
  { name: 'Yield rate', threshold: '< 22.2%', meaning: 'Weak demand — admitted students choosing to enroll elsewhere' },
  { name: 'Enrollment change', threshold: '< −11.8%', meaning: 'Declining headcount — compressing tuition revenue base' },
  { name: 'Grant aid recipients', threshold: '> 93.0%', meaning: 'Near-universal discounting — thin margin per enrolled student' },
  { name: 'Operating margin', threshold: '< −5.0%', meaning: 'Deficit operations — expenses exceeding revenues' },
  { name: 'Tuition dependency', threshold: '> 40.6%', meaning: 'Concentrated revenue risk — over-reliance on tuition income' },
  { name: 'Discount rate', threshold: '> 42.5%', meaning: 'Unsustainable discounting — gross-to-net spread severely compressed' },
]

export default function Methodology() {
  return (
    <section id="methodology" style={{
      padding: '80px 24px',
      background: 'var(--white)',
      borderTop: '1px solid var(--border)',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 56, maxWidth: 640 }}>
          <p style={{
            fontSize: 12, fontWeight: 600, color: 'var(--navy)',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            marginBottom: 12,
          }}>
            Methodology
          </p>
          <h2 style={{
            fontSize: 'clamp(24px, 3vw, 36px)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            marginBottom: 16,
          }}>
            Five predictive models, one consensus watchlist
          </h2>
          <p style={{
            fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7,
          }}>
            The IRI uses IPEDS data from 2010–2022 across 1,728 four-year public
            and private nonprofit institutions. Each model surfaces risk signals
            from a different analytical angle. Institutions flagged by multiple
            models represent the highest-confidence watchlist entries.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16,
          marginBottom: 64,
        }}>
          {models.map(model => (
            <div key={model.number} style={{
              border: model.highlight
                ? '1.5px solid var(--navy)'
                : '1px solid var(--border)',
              borderRadius: 12,
              padding: '24px',
              background: model.highlight ? 'var(--navy-pale)' : 'var(--white)',
              position: 'relative',
            }}>
              {model.highlight && (
                <div style={{
                  position: 'absolute', top: -1, left: 20,
                  background: 'var(--navy)',
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '3px 10px',
                  borderRadius: '0 0 6px 6px',
                }}>
                  Primary model
                </div>
              )}
              <div style={{
                fontSize: 12, fontWeight: 600, color: 'var(--slate-light)',
                marginBottom: 8, marginTop: model.highlight ? 12 : 0,
              }}>
                {model.number}
              </div>
              <h3 style={{
                fontSize: 16, fontWeight: 600,
                color: model.highlight ? 'var(--navy)' : 'var(--text-primary)',
                marginBottom: 10,
              }}>
                {model.name}
              </h3>
              <p style={{
                fontSize: 13, color: 'var(--text-secondary)',
                lineHeight: 1.65, marginBottom: 16,
              }}>
                {model.description}
              </p>
              <div style={{
                display: 'flex', gap: 8, alignItems: 'baseline',
              }}>
                <span style={{
                  fontSize: 15, fontWeight: 600,
                  color: model.highlight ? 'var(--navy)' : 'var(--text-primary)',
                }}>
                  {model.metric}
                </span>
                <span style={{
                  fontSize: 12, color: 'var(--text-muted)',
                }}>
                  {model.metricLabel}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: 48,
        }}>
          <h3 style={{
            fontSize: 20, fontWeight: 600, color: 'var(--text-primary)',
            marginBottom: 8,
          }}>
            Seven stress indicators
          </h3>
          <p style={{
            fontSize: 14, color: 'var(--text-secondary)',
            marginBottom: 28, lineHeight: 1.6,
          }}>
            Thresholds derived from the median values of 31 confirmed closed
            institutions. Finance indicators (operating margin, tuition
            dependency, discount rate) are based on IPEDS finance data available
            through 2017.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 10,
          }}>
            {indicators.map(ind => (
              <div key={ind.name} style={{
                padding: '14px 16px',
                background: 'var(--slate-pale)',
                borderRadius: 8,
                display: 'flex',
                gap: 12,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600,
                    color: 'var(--text-primary)', marginBottom: 2,
                  }}>
                    {ind.name}
                  </div>
                  <div style={{
                    fontSize: 12, color: 'var(--text-muted)',
                    lineHeight: 1.5,
                  }}>
                    {ind.meaning}
                  </div>
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 600,
                  color: 'var(--navy)',
                  background: 'var(--navy-pale)',
                  padding: '3px 8px',
                  borderRadius: 6,
                  whiteSpace: 'nowrap',
                  alignSelf: 'flex-start',
                  border: '1px solid rgba(31,56,100,0.15)',
                }}>
                  {ind.threshold}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
