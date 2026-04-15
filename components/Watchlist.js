import { useState, useMemo, useEffect } from 'react'
import institutions from '../data/institutions.json'

const tierColors = {
  Critical: { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA' },
  High:     { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' },
  Elevated: { bg: '#FFF7ED', text: '#9A3412', border: '#FED7AA' },
  Moderate: { bg: '#F0F9FF', text: '#075985', border: '#BAE6FD' },
  Low:      { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
}
function instSizeLabel(size) {
  const map = {
    1: '<1,000 students',
    2: '1,000–4,999 students',
    3: '5,000–9,999 students',
    4: '10,000–19,999 students',
    5: '>20,000 students',
  }
  return map[size] || ''
}

function getStressColor(value, threshold, direction) {
  if (value === null || value === undefined) return '#D1D5DB'
  let stressed = direction === 'above' ? value > threshold : value < threshold
  if (!stressed) {
    // How close to threshold (0 = far, 1 = at threshold)
    let proximity
    if (direction === 'above') {
      proximity = value / threshold
    } else {
      proximity = threshold === 0 ? 0 : Math.abs(value) / Math.abs(threshold)
    }
    if (proximity >= 0.9) return '#075985' // close but not stressed -- blue
    return '#166534' // healthy -- green
  }
  // Stressed -- how far past threshold
  let overshoot
  if (direction === 'above') {
    overshoot = (value - threshold) / Math.abs(threshold)
  } else {
    overshoot = (threshold - value) / Math.abs(threshold || 0.01)
  }
  if (overshoot >= 0.3) return '#991B1B' // Critical
  if (overshoot >= 0.15) return '#92400E' // High
  return '#9A3412'                        // Elevated
}

function getStressBg(value, threshold, direction) {
  const color = getStressColor(value, threshold, direction)
  const map = {
    '#991B1B': '#FEF2F2',
    '#92400E': '#FFFBEB',
    '#9A3412': '#FFF7ED',
    '#075985': '#F0F9FF',
    '#166634': '#F0FDF4',
    '#166534': '#F0FDF4',
    '#D1D5DB': '#F9FAFB',
  }
  return map[color] || '#F9FAFB'
}

function IndicatorDot({ value, threshold, direction, label, flipTooltip }) {
  const [hovered, setHovered] = useState(false)
  const color = getStressColor(value, threshold, direction)

  const displayVal = value !== null && value !== undefined
    ? (value * 100).toFixed(1) + '%'
    : 'N/A'

  return (
    <td style={{
      padding: '11px 8px',
      textAlign: 'center',
      borderBottom: '1px solid var(--border)',
      verticalAlign: 'middle',
      position: 'relative',
    }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 12, height: 12,
          borderRadius: '50%',
          background: color,
          margin: '0 auto',
          cursor: 'default',
          flexShrink: 0,
        }}
      />
      {hovered && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          ...(flipTooltip
            ? { right: '0', left: 'auto', transform: 'none' }
            : { left: '50%', transform: 'translateX(-50%)' }
          ),
          background: 'var(--navy)',
          color: 'white',
          fontSize: 11,
          padding: '5px 9px',
          borderRadius: 6,
          whiteSpace: 'nowrap',
          zIndex: 100,
          marginBottom: 4,
          pointerEvents: 'none',
        }}>
          {label}: {displayVal}
        </div>
      )}
    </td>
  )
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

function PanelIndicatorRow({ label, value, threshold, direction, meaning }) {
  const fmt = (v) => {
    if (v === null || v === undefined) return 'N/A'
    return (v * 100).toFixed(1) + '%'
  }
  const stressed = value !== null && value !== undefined && (
    direction === 'above' ? value > threshold : value < threshold
  )
  const color = getStressColor(value, threshold, direction)
  const bg = getStressBg(value, threshold, direction)

  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: 3,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: color, flexShrink: 0, marginTop: 2,
          }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {label}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 13, fontWeight: 700,
            color: stressed ? color : 'var(--text-primary)',
            background: stressed ? bg : 'transparent',
            padding: stressed ? '1px 6px' : '0',
            borderRadius: 4,
          }}>
            {fmt(value)}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {direction === 'above' ? '>' : '<'}{(Math.abs(threshold) * 100).toFixed(1)}%
          </span>
        </div>
      </div>
      <p style={{
        fontSize: 11, color: 'var(--text-muted)',
        lineHeight: 1.5, marginLeft: 16,
      }}>
        {meaning}
      </p>
    </div>
  )
}

function SlidePanel({ inst, onClose, onGenerateBrief }) {
  const [visible, setVisible] = useState(false)

  // Trigger slide-in after mount
  useEffect(() => {
    if (inst) {
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
    }
  }, [inst])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!inst) return null

  const fmt = (v) => {
    if (v === null || v === undefined) return 'N/A'
    return (v * 100).toFixed(1) + '%'
  }

  const tc = tierColors[inst.xgb_tier] || tierColors.Moderate

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 200,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.25s ease',
        }}
      />
      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 420,
        background: 'white',
        zIndex: 201,
        overflowY: 'auto',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0,
          background: 'white', zIndex: 1,
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}>
            <div style={{ flex: 1, paddingRight: 12 }}>
              <div style={{
                fontSize: 16, fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.3, marginBottom: 6,
              }}>
                {inst.inst_name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TierBadge tier={inst.xgb_tier} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {inst.state_abbr} · {inst.sector === 1 ? 'Public' : 'Private'}{instSizeLabel(inst.inst_size) ? ' · ' + instSizeLabel(inst.inst_size) : ''}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none',
                fontSize: 22, cursor: 'pointer',
                color: 'var(--text-muted)', padding: '0 4px',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', flex: 1 }}>

          {/* XGB probability */}
          <div style={{
            background: tc.bg,
            border: `1px solid ${tc.border}`,
            borderRadius: 10,
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{
                fontSize: 11, fontWeight: 600,
                color: tc.text, textTransform: 'uppercase',
                letterSpacing: '0.07em', marginBottom: 4,
              }}>
                XGBoost Closure Probability
              </div>
              <div style={{
                fontSize: 32, fontWeight: 700,
                color: tc.text, lineHeight: 1,
              }}>
                {fmt(inst.xgb_prob)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                Models flagging
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
                {inst.models_flagged}
                <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}>/5</span>
              </div>
            </div>
          </div>

          {/* Stress indicators */}
          <div style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 11, fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 4,
            }}>
              Stress Indicators · {inst.stress_score}/6
            </div>
            <PanelIndicatorRow
              label="Acceptance rate"
              value={inst.avg_acceptance_rate}
              threshold={0.701} direction="above"
              meaning="Open admissions signal — institution accepting nearly all applicants"
            />
            <PanelIndicatorRow
              label="Yield rate"
              value={inst.avg_yield_rate}
              threshold={0.545} direction="below"
              meaning="Weak demand — admitted students choosing to enroll elsewhere"
            />
            <PanelIndicatorRow
              label="Enrollment change"
              value={inst.enrollment_pct_change}
              threshold={-0.166} direction="below"
              meaning="Declining headcount — compressing tuition revenue base"
            />
            <PanelIndicatorRow
              label="Grant aid %"
              value={inst.avg_grant_pct}
              threshold={0.975} direction="above"
              meaning="Near-universal discounting — thin margin per enrolled student"
            />
            <PanelIndicatorRow
              label="Operating margin"
              value={inst.avg_operating_margin}
              threshold={-0.268} direction="below"
              meaning="Deficit operations — expenses exceeding revenues"
            />
            <PanelIndicatorRow
              label="Tuition dependency"
              value={inst.avg_tuition_dep}
              threshold={0.822} direction="above"
              meaning="Concentrated revenue risk — over-reliance on tuition income"
            />
          </div>

          {/* Additional stats */}
          <div style={{
            background: 'var(--slate-pale)',
            borderRadius: 8,
            padding: '14px 16px',
            marginBottom: 24,
          }}>
            <div style={{
              fontSize: 11, fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 12,
            }}>
              Additional Metrics
            </div>
            {[
              { label: 'Composite score', value: inst.composite_score !== null ? inst.composite_score.toFixed(1) + '/100' : 'N/A' },
              { label: 'Cox hazard ratio', value: inst.cox_hazard !== null ? inst.cox_hazard.toFixed(2) + 'x' : 'N/A' },
              { label: 'Logistic prob', value: inst.prob_closure_b !== null && inst.prob_closure_b !== undefined ? (inst.prob_closure_b * 100).toFixed(1) + '%' : 'N/A' },
              { label: 'Avg enrollment', value: inst.avg_enrollment !== null ? Math.round(inst.avg_enrollment).toLocaleString() : 'N/A' },
              { label: 'First enrollment', value: inst.first_enrollment !== null ? inst.first_enrollment.toLocaleString() : 'N/A' },
              { label: 'Last enrollment', value: inst.last_enrollment !== null ? inst.last_enrollment.toLocaleString() : 'N/A' },
            ].map(({ label, value }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 13, marginBottom: 8,
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Brief button -- sticky at bottom */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border)',
          background: 'white',
          position: 'sticky', bottom: 0,
        }}>
          <button
            onClick={() => onGenerateBrief(inst)}
            style={{
              width: '100%',
              padding: '13px',
              background: 'var(--navy)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Generate Risk Brief
          </button>
        </div>
      </div>
    </>
  )
}

const STATES = [...new Set(institutions.map(i => i.state_abbr).filter(Boolean))].sort()
const TIERS = ['Critical', 'High', 'Elevated', 'Moderate', 'Low']

export default function Watchlist({ setSelectedInstitution }) {
  const [tierFilter, setTierFilter] = useState('All')
  const [stateFilter, setStateFilter] = useState('All')
  const [sortBy, setSortBy] = useState('xgb_prob')
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [panelInst, setPanelInst] = useState(null)
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
  }, [tierFilter, stateFilter, sortBy, search])

  const paginated = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)

  const handleGenerateBrief = (inst) => {
    setPanelInst(null)
    setSelectedInstitution(inst)
    setTimeout(() => {
      const el = document.getElementById('generator')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

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

  const indicatorThStyle = {
    ...thStyle,
    textAlign: 'center',
    padding: '10px 8px',
    cursor: 'default',
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
              All 1,719 institutions
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              Showing {filtered.length.toLocaleString()} institutions ·{' '}
              sorted by {sortBy === 'xgb_prob' ? 'XGBoost probability' :
                         sortBy === 'stress_score' ? 'stress score' :
                         sortBy === 'flags_total' ? 'model flags' : 'name'} ·{' '}
              click any row for details
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
                padding: '8px 12px', border: '1px solid var(--border)',
                borderRadius: 7, fontSize: 13,
                color: 'var(--text-primary)', background: 'white', cursor: 'pointer',
              }}
            >
              <option value="All">All tiers</option>
              {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              value={stateFilter}
              onChange={e => { setStateFilter(e.target.value); setPage(0) }}
              style={{
                padding: '8px 12px', border: '1px solid var(--border)',
                borderRadius: 7, fontSize: 13,
                color: 'var(--text-primary)', background: 'white', cursor: 'pointer',
              }}
            >
              <option value="All">All states</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); setPage(0) }}
              style={{
                padding: '8px 12px', border: '1px solid var(--border)',
                borderRadius: 7, fontSize: 13,
                color: 'var(--text-primary)', background: 'white', cursor: 'pointer',
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
                  <th style={{ ...thStyle, textAlign: 'right' }} onClick={() => setSortBy('xgb_prob')}>
                    XGB Prob {sortBy === 'xgb_prob' ? '↓' : ''}
                  </th>
                  <th style={{ ...thStyle, textAlign: 'right' }} onClick={() => setSortBy('stress_score')}>
                    Stress {sortBy === 'stress_score' ? '↓' : ''}
                  </th>
                  <th style={{ ...thStyle, textAlign: 'right' }} onClick={() => setSortBy('flags_total')}>
                    Flags {sortBy === 'flags_total' ? '↓' : ''}
                  </th>
                  <th style={indicatorThStyle} title="Acceptance rate">Acc</th>
                  <th style={indicatorThStyle} title="Yield rate">Yld</th>
                  <th style={indicatorThStyle} title="Enrollment change">Enr</th>
                  <th style={indicatorThStyle} title="Grant aid %">Grt</th>
                  <th style={indicatorThStyle} title="Operating margin">Mrgn</th>
                  <th style={indicatorThStyle} title="Tuition dependency">Tuit</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((inst, i) => (
                  <tr
                    key={inst.unitid}
                    onClick={() => setPanelInst(inst)}
                    style={{
                      background: i % 2 === 0 ? 'white' : 'var(--slate-pale)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--navy-pale)'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'white' : 'var(--slate-pale)'}
                  >
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 500 }}>{inst.inst_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                        {instSizeLabel(inst.inst_size)}{instSizeLabel(inst.inst_size) ? ' · ' : ''}{inst.sector === 1 ? 'Public' : 'Private'}
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
                      {inst.stress_score !== null ? `${inst.stress_score}/6` : '—'}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--text-secondary)' }}>
                      {inst.flags_total !== null ? `${inst.flags_total}/5` : '—'}
                    </td>
                    <IndicatorDot value={inst.avg_acceptance_rate} threshold={0.701} direction="above" label="Acceptance rate" />
                    <IndicatorDot value={inst.avg_yield_rate} threshold={0.545} direction="below" label="Yield rate" />
                    <IndicatorDot value={inst.enrollment_pct_change} threshold={-0.166} direction="below" label="Enrollment change" />
                    <IndicatorDot value={inst.avg_grant_pct} threshold={0.975} direction="above" label="Grant aid %" />
                    <IndicatorDot value={inst.avg_operating_margin} threshold={-0.268} direction="below" label="Operating margin" flipTooltip />
                    <IndicatorDot value={inst.avg_tuition_dep} threshold={0.822} direction="above" label="Tuition dependency" flipTooltip />
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

      <SlidePanel
        inst={panelInst}
        onClose={() => setPanelInst(null)}
        onGenerateBrief={handleGenerateBrief}
      />
    </section>
  )
}
