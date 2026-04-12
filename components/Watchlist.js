import { useState, useMemo } from 'react'
import institutions from '../data/institutions.json'

const tierOrder = { Critical: 0, High: 1, Elevated: 2, Moderate: 3, Low: 4 }

const tierColors = {
  Critical: { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA' },
  High:     { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' },
  Elevated: { bg: '#FFF7ED', text: '#9A3412', border: '#FED7AA' },
  Moderate: { bg: '#F0F9FF', text: '#075985', border: '#BAE6FD' },
  Low:      { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
}

function TierBadge({ tier }) {
  const c = tierColors[tier] || tierColors.Moderate
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 9px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      background: c.bg,
      color: c.text,
      border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap',
    }}>
      {tier}
    </span>
  )
}

const STATES = [...new Set(institutions.map(i => i.state_abbr)
  .filter(Boolean))].sort()

const TIERS = ['Critical', 'High', 'Elevated', 'Moderate', 'Low']

export default function Watchlist() {
  const [tierFilter, setTierFilter] = useState('All')
  const [stateFilter, setStateFilter] = useState('All')
  const [sortBy, setSortBy] = useState('xgb_prob')
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const PER_PAGE = 20

  const fmt = (v) => {
    if (v === null || v === undefined) return '—'
    return (v * 100).toFixed(1) + '%'
  }

 const filtered = useMemo(() => {
    return institutions
      .filter(i => tierFilter === 'All' || i.xgb_tier === tierFilter)
      .filter(i => stateFilter === 'All' || i.state_abbr === stateFilter)
      .filter(i => !search || i.inst_name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'xgb_prob') return (b.xgb_prob || 0) - (a.xgb_prob || 0)
        if (sortBy === 'stress_score') return (b.stress_score || 0) - (a.stress_score || 0)
        if (sortBy === 'flags_total') return (b.flags_total || 0) - (a.flags_total || 0)
        if (sortBy === 'inst_name') return a.inst_name.localeCompare(b.inst_name)
        return 0
      })
  }, [tierFilter, stateFilter, sortBy])

  const paginated = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)

  const thStyle = {
    padding: '10px 14px',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    textAlign: 'left',
    background: 'var(--slate-pale)',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  }

  const tdStyle = {
    padding: '11px 14px',
    fontSize: 13,
    color: 'var(--text-primary)',
    borderBottom: '1px solid var(--border)',
    verticalAlign: 'middle',
  }

  return (
    <section id="watchlist" style={{
      padding: '80px 24px',
      background: 'var(--white)',
      borderTop: '1px solid var(--border)',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 32,
          flexWrap: 'wrap',
          gap: 20,
        }}>
          <div>
            <p style={{
              fontSize: 12, fontWeight: 600, color: 'var(--navy)',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              Watchlist
            </p>
            <h2 style={{
              fontSize: 'clamp(22px, 3vw, 32px)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: 8,
            }}>
              All 1,728 institutions
            </h2>
            <p style={{
              fontSize: 14, color: 'var(--text-secondary)',
            }}>
              Showing {filtered.length.toLocaleString()} institutions ·{' '}
              sorted by {sortBy === 'xgb_prob' ? 'XGBoost probability' :
                         sortBy === 'stress_score' ? 'stress score' :
                         sortBy === 'flags_total' ? 'model flags' : 'name'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                 <input
              type="text"
              placeholder="Search institutions..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0) }}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--border)',
                borderRadius: 7,
                fontSize: 13,
                color: 'var(--text-primary)',
                background: 'white',
                width: 220,
                outline: 'none',
              }}
            />
            <select
              value={tierFilter}
              onChange={e => { setTierFilter(e.target.value); setPage(0) }}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--border)',
                borderRadius: 7,
                fontSize: 13,
                color: 'var(--text-primary)',
                background: 'white',
                cursor: 'pointer',
              }}
            >
              <option value="All">All tiers</option>
              {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <select
              value={stateFilter}
              onChange={e => { setStateFilter(e.target.value); setPage(0) }}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--border)',
                borderRadius: 7,
                fontSize: 13,
                color: 'var(--text-primary)',
                background: 'white',
                cursor: 'pointer',
              }}
            >
              <option value="All">All states</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); setPage(0) }}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--border)',
                borderRadius: 7,
                fontSize: 13,
                color: 'var(--text-primary)',
                background: 'white',
                cursor: 'pointer',
              }}
            >
              <option value="xgb_prob">Sort: XGBoost prob</option>
              <option value="stress_score">Sort: Stress score</option>
              <option value="flags_total">Sort: Model flags</option>
              <option value="inst_name">Sort: Name A–Z</option>
            </select>
          </div>
        </div>

        <div style={{
          border: '1px solid var(--border)',
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: 700,
            }}>
              <thead>
                <tr>
                  <th style={thStyle} onClick={() => setSortBy('inst_name')}>
                    Institution {sortBy === 'inst_name' ? '↑' : ''}
                  </th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>State</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Tier</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}
                    onClick={() => setSortBy('xgb_prob')}>
                    XGB Prob {sortBy === 'xgb_prob' ? '↓' : ''}
                  </th>
                  <th style={{ ...thStyle, textAlign: 'right' }}
                    onClick={() => setSortBy('stress_score')}>
                    Stress {sortBy === 'stress_score' ? '↓' : ''}
                  </th>
                  <th style={{ ...thStyle, textAlign: 'right' }}
                    onClick={() => setSortBy('flags_total')}>
                    Flags {sortBy === 'flags_total' ? '↓' : ''}
                  </th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>
                    Enrollment Δ
                  </th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>
                    Yield
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((inst, i) => (
                  <tr key={inst.unitid}
                    style={{ background: i % 2 === 0 ? 'white' : 'var(--slate-pale)' }}
                  >
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 500 }}>{inst.inst_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                        {inst.inst_size} · {inst.cc_basic_2021 || 'N/A'}
                      </div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-secondary)' }}>
                      {inst.state_abbr}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <TierBadge tier={inst.xgb_tier} />
                    </td>
                    <td style={{
                      ...tdStyle, textAlign: 'right', fontWeight: 600,
                      color: inst.xgb_prob > 0.5 ? '#991B1B' :
                             inst.xgb_prob > 0.25 ? '#92400E' :
                             'var(--text-primary)',
                    }}>
                      {fmt(inst.xgb_prob)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--text-secondary)' }}>
                      {inst.stress_score !== null ? `${inst.stress_score}/7` : '—'}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--text-secondary)' }}>
                      {inst.flags_total !== null ? `${inst.flags_total}/5` : '—'}
                    </td>
                    <td style={{
                      ...tdStyle, textAlign: 'right',
                      color: inst.enrollment_pct_change < -0.118
                        ? '#B91C1C' : 'var(--text-secondary)',
                    }}>
                      {fmt(inst.enrollment_pct_change)}
                    </td>
                    <td style={{
                      ...tdStyle, textAlign: 'right',
                      color: inst.avg_yield_rate < 0.222
                        ? '#B91C1C' : 'var(--text-secondary)',
                    }}>
                      {fmt(inst.avg_yield_rate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 20px',
            borderTop: '1px solid var(--border)',
            background: 'var(--slate-pale)',
          }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Page {page + 1} of {totalPages} · {filtered.length} institutions
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                style={{
                  padding: '6px 14px',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  background: page === 0 ? 'var(--border)' : 'white',
                  color: page === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                  fontSize: 13,
                  cursor: page === 0 ? 'default' : 'pointer',
                }}
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                style={{
                  padding: '6px 14px',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  background: page >= totalPages - 1 ? 'var(--border)' : 'white',
                  color: page >= totalPages - 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                  fontSize: 13,
                  cursor: page >= totalPages - 1 ? 'default' : 'pointer',
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
