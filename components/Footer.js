export default function Footer() {
  return (
    <footer style={{
      background: 'var(--navy)',
      padding: '48px 24px',
      borderTop: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 32,
      }}>
        <div style={{ maxWidth: 380 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
          }}>
            <div style={{
              width: 24, height: 24,
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: 'white', fontSize: 11, fontWeight: 600 }}>IRI</span>
            </div>
            <span style={{
              fontSize: 14, fontWeight: 600, color: 'white',
            }}>
              Institutional Risk Index
            </span>
          </div>
          <p style={{
            fontSize: 13, color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.7,
          }}>
            A research project using IPEDS data and machine learning to identify
            financial stress signals in higher education. Built by Elliott
            Coulter.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
          <div>
            <p style={{
              fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              marginBottom: 12,
            }}>
              Data
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'IPEDS via Urban Institute', href: 'https://educationdata.urban.org' },
                { label: 'IPEDS Data Center', href: 'https://nces.ed.gov/ipeds' },
              ].map(link => (
                <a key={link.label} href={link.href}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    fontSize: 13, color: 'rgba(255,255,255,0.6)',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => e.target.style.color = 'white'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p style={{
              fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              marginBottom: 12,
            }}>
              Project
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'GitHub', href: 'https://github.com/ecoulter350' },
              ].map(link => (
                <a key={link.label} href={link.href}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    fontSize: 13, color: 'rgba(255,255,255,0.6)',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => e.target.style.color = 'white'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: 1100, margin: '32px auto 0',
        paddingTop: 24,
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
          AI-generated briefs are for research purposes only.
          Data covers 2010–2022. Finance indicators available through 2017.
        </p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
          Built with Next.js · Claude API · IPEDS data
        </p>
      </div>
    </footer>
  )
}
