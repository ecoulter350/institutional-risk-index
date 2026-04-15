export default function Hero() {
  return (
    <section id="overview" style={{
      background: 'var(--navy)',
      padding: '120px 24px 80px',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 20,
          padding: '5px 14px',
          marginBottom: 28,
        }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            fontWeight: 500 }}>
            Higher Education Research
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 700,
          color: 'white',
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          marginBottom: 20,
        }}>
          Institutional Risk Index
        </h1>

        <p style={{
          fontSize: 18,
          color: 'rgba(255,255,255,0.7)',
          lineHeight: 1.7,
          marginBottom: 40,
          maxWidth: 580,
          margin: '0 auto 40px',
        }}>
          A machine learning system for predicting college closure risk across
          1,719 four-year institutions, validated against 44 confirmed closures
          from 2017–2026.
        </p>

        <div style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: 56,
        }}>
          <a href="#generator" style={{
            background: 'white',
            color: 'var(--navy)',
            padding: '12px 28px',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.target.style.background = 'var(--navy-pale)'}
          onMouseLeave={e => e.target.style.background = 'white'}
          >
            Generate a Risk Brief
          </a>
          <a href="#methodology" style={{
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            padding: '12px 28px',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 500,
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.18)'}
          onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
          >
            View Methodology
          </a>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: 40,
          width: '100%',
          maxWidth: 640,
          margin: '0 auto',
        }}>
          {[
            { value: '1,719', label: 'Institutions monitored' },
            { value: '44', label: 'Closed school validation set' },
            { value: '0.998', label: 'XGBoost test AUC' },
            { value: '33.8×', label: 'Mean probability separation' },
          ].map((stat, i) => (
            <div key={i} style={{
              borderRight: i < 3 ? '1px solid rgba(255,255,255,0.1)' : 'none',
              textAlign: 'center',
              padding: '0 12px',
            }}>
              <div style={{
                fontSize: 28, fontWeight: 700, color: 'white',
                letterSpacing: '-0.02em', lineHeight: 1,
                marginBottom: 6,
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: 13, color: 'rgba(255,255,255,0.5)',
                fontWeight: 400,
                lineHeight: 1.4,
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
