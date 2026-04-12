import { useState } from 'react'

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      background: 'rgba(255,255,255,0.96)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border)',
      zIndex: 100,
      height: 56,
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        padding: '0 24px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28,
            background: 'var(--navy)',
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>IRI</span>
          </div>
          <span style={{
            fontSize: 15, fontWeight: 600,
            color: 'var(--navy)',
            letterSpacing: '-0.01em',
          }}>
            Institutional Risk Index
          </span>
        </div>

        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {['Overview', 'Methodology', 'Generator', 'Watchlist'].map(section => (
            <a
              key={section}
              href={`#${section.toLowerCase()}`}
              style={{
                padding: '6px 12px',
                fontSize: 14,
                color: 'var(--text-secondary)',
                borderRadius: 6,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.target.style.background = 'var(--slate-pale)'
                e.target.style.color = 'var(--navy)'
              }}
              onMouseLeave={e => {
                e.target.style.background = 'transparent'
                e.target.style.color = 'var(--text-secondary)'
              }}
            >
              {section}
            </a>
          ))}
          <a
            href="https://github.com/ecoulter350"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginLeft: 8,
              padding: '6px 14px',
              fontSize: 13,
              color: 'var(--navy)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              fontWeight: 500,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.target.style.background = 'var(--navy-pale)'
              e.target.style.borderColor = 'var(--navy-light)'
            }}
            onMouseLeave={e => {
              e.target.style.background = 'transparent'
              e.target.style.borderColor = 'var(--border)'
            }}
          >
            GitHub
          </a>
        </div>
      </div>
    </nav>
  )
}
