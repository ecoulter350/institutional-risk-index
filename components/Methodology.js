const models = [
  {
    number: '01',
    name: 'Threshold Scoring',
    description: 'Binary flags for each of six stress indicators compared against empirical thresholds derived from closed school medians. Institutions scoring 3 or more flags are placed on the watchlist. Simple, interpretable, and useful as a baseline.',
    metric: '60 institutions flagged',
    metricLabel: 'Score ≥ 3/6',
  },
  {
    number: '02',
    name: 'Composite Index',
    description: 'A weighted 0–100 score where weights are proportional to each indicator\'s correlation with closure. Operating margin (40.5%) and tuition dependency (26.9%) carry the most weight, reflecting their predictive power in the closed school validation set.',
    metric: '47 institutions',
    metricLabel: 'Score ≥ 60/100',
  },
  {
    number: '03',
    name: 'Logistic Regression',
    description: 'A binary classification model estimating closure probability directly. Tuition dependency is the strongest statistically significant predictor (p<0.001), with yield rate and enrollment change also contributing meaningful signal. Test AUC of 0.921.',
    metric: '107 institutions',
    metricLabel: 'Probability ≥ 5%',
  },
  {
    number: '04',
    name: 'Survival Analysis',
    description: 'A Cox proportional hazards model treating closure as a time-to-event outcome. Concordance of 0.911. Yield rate shows the strongest effect (HR=0.007, p<0.001), with tuition dependency (HR=58.975) and operating margin also highly significant.',
    metric: '843 institutions',
    metricLabel: 'Relative hazard ≥ 1.0',
  },
  {
    number: '05',
    name: 'XGBoost',
    description: 'A gradient-boosted machine learning model trained on 14 features including six stress indicators and institutional characteristics. Test AUC of 0.998. Mean closed school probability of 96.7% versus 2.9% for live institutions — a 33.8× separation.',
    metric: '14 institutions',
    metricLabel: 'Probability ≥ 50% · best performing model',
    highlight: true,
  },
]

const indicators = [
  { name: 'Acceptance rate', threshold: '> 70.1%', meaning: 'Open admissions signal — institution accepting nearly all applicants' },
  { name: 'Yield rate', threshold: '< 54.5%', meaning: 'Weak demand — admitted students choosing to enroll elsewhere' },
  { name: 'Enrollment change', threshold: '< −16.6%', meaning: 'Declining headcount — compressing tuition revenue base' },
  { name: 'Grant aid recipients', threshold: '> 97.5%', meaning: 'Near-universal discounting — thin margin per enrolled student' },
  { name: 'Operating margin', threshold: '< −26.8%', meaning: 'Deficit operations — expenses exceeding revenues' },
  { name: 'Tuition dependency', threshold: '> 82.2%', meaning: 'Concentrated revenue risk — over-reliance on tuition income' },
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
            The IRI uses IPEDS data from 2018–2024 across 1,719 four-year public
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
            Six stress indicators
          </h3>
          <p style={{
            fontSize: 14, color: 'var(--text-secondary)',
            marginBottom: 28, lineHeight: 1.6,
          }}>
            Thresholds derived from the median values of 44 confirmed closed
            institutions. All indicators are calculated from IPEDS data
            covering 2018–2024.
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
