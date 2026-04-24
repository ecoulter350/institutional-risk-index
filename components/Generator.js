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

function TierBadge({ tier }) {
  const c = tierColors[tier] || tierColors.Moderate
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      background: c.bg,
      color: c.text,
      border: `1px solid ${c.border}`,
    }}>
      {tier}
    </span>
  )
}

function IndicatorRow({ label, value, threshold, stressed }) {
  if (value === null || value === undefined) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '10px 0',
        borderBottom: '1px solid var(--border)',
        fontSize: 13,
      }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>N/A</span>
      </div>
    )
  }
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', padding: '10px 0',
      borderBottom: '1px solid var(--border)',
      fontSize: 13,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: stressed ? '#EF4444' : '#22C55E',
          flexShrink: 0,
        }} />
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          fontWeight: 600,
          color: stressed ? '#B91C1C' : 'var(--text-primary)',
        }}>
          {value}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          threshold {threshold}
        </span>
      </div>
    </div>
  )
}

function BriefDisplay({ brief }) {
  if (!brief) return null
  const sections = brief.split(/^## /m).filter(Boolean)
  return (
    <div style={{ marginTop: 24 }}>
      {sections.map((section, i) => {
        const lines = section.trim().split('\n')
        const title = lines[0].trim()
        const body = lines.slice(1).join('\n').trim()
        return (
          <div key={i} style={{
            marginBottom: 24,
            paddingBottom: 24,
            borderBottom: i < sections.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <h4 style={{
              fontSize: 13, fontWeight: 600,
              color: 'var(--navy)',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              marginBottom: 10,
            }}>
              {title}
            </h4>
            <p style={{
              fontSize: 14, color: 'var(--text-secondary)',
              lineHeight: 1.75,
              whiteSpace: 'pre-line',
            }}>
              {body}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export default function Generator({ selectedInstitution }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const audience = 'general'
  const [loading, setLoading] = useState(false)
  const [brief, setBrief] = useState(null)
  const [error, setError] = useState(null)

  // When selectedInstitution changes (from Watchlist panel), pre-populate
  useEffect(() => {
    if (selectedInstitution) {
      setSelected(selectedInstitution)
      setQuery(selectedInstitution.inst_name)
      setShowDropdown(false)
      setBrief(null)
      setError(null)
    }
  }, [selectedInstitution])

  const filtered = useMemo(() => {
    if (!query || query.length < 2) return []
    const q = query.toLowerCase()
    return institutions
      .filter(i => i.inst_name.toLowerCase().includes(q))
      .slice(0, 8)
  }, [query])

  const fmt = (v, isPercent = true) => {
    if (v === null || v === undefined) return null
    if (isPercent) return (v * 100).toFixed(1) + '%'
    return v.toFixed(2)
  }

  const handleSelect = (inst) => {
    setSelected(inst)
    setQuery(inst.inst_name)
    setShowDropdown(false)
    setBrief(null)
    setError(null)
  }

  const handleGenerate = async () => {
    if (!selected) return
    setLoading(true)
    setBrief(null)
    setError(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ institution: selected, audience }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setBrief(data.brief)
    } catch (err) {
      setError('Failed to generate brief. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="generator" style={{
      padding: '80px 24px',
      background: 'var(--slate-pale)',
      borderTop: '1px solid var(--border)',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 40, maxWidth: 640 }}>
          <p style={{
            fontSize: 12, fontWeight: 600, color: 'var(--navy)',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            marginBottom: 12,
          }}>
            Risk Brief Generator
          </p>
          <h2 style={{
            fontSize: 'clamp(24px, 3vw, 36px)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            marginBottom: 16,
          }}>
            Generate an institutional health brief
          </h2>
          <p style={{
            fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7,
          }}>
            Select any of the 1,716 institutions in the dataset. The brief is
            generated by Claude using the institution's stress indicators and
            model scores as grounding context.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.4fr',
          gap: 24,
          alignItems: 'start',
        }}>
          <div style={{
            background: 'var(--white)',
            borderRadius: 12,
            border: '1px solid var(--border)',
            padding: 24,
          }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block', fontSize: 13,
                fontWeight: 600, color: 'var(--text-primary)',
                marginBottom: 8,
              }}>
                Institution
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search by institution name..."
                  value={query}
                  onChange={e => {
                    setQuery(e.target.value)
                    setShowDropdown(true)
                    if (!e.target.value) setSelected(null)
                  }}
                  onFocus={() => setShowDropdown(true)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 14,
                    outline: 'none',
                    color: 'var(--text-primary)',
                    background: 'white',
                  }}
                />
                {showDropdown && filtered.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    background: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    marginTop: 4,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    zIndex: 50,
                    maxHeight: 280,
                    overflowY: 'auto',
                  }}>
                    {filtered.map(inst => (
                      <button
                        key={inst.unitid}
                        onClick={() => handleSelect(inst)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: '100%',
                          padding: '10px 14px',
                          background: 'none',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--border)',
                          gap: 8,
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--slate-pale)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                            {inst.inst_name}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {inst.state_abbr}{instSizeLabel(inst.inst_size) ? ' · ' + instSizeLabel(inst.inst_size) : ''}
                          </div>
                        </div>
                        <TierBadge tier={inst.xgb_tier} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {selected && (
              <div style={{
                background: 'var(--slate-pale)',
                borderRadius: 8,
                padding: '14px 16px',
                marginBottom: 20,
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 12,
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {selected.inst_name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {selected.state_abbr}{instSizeLabel(selected.inst_size) ? ' · ' + instSizeLabel(selected.inst_size) : ''} · {selected.xgb_tier} risk
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: 22, fontWeight: 700,
                      color: selected.xgb_prob > 0.5 ? '#991B1B' :
                             selected.xgb_prob > 0.25 ? '#92400E' :
                             'var(--navy)',
                    }}>
                      {fmt(selected.xgb_prob)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      closure probability
                    </div>
                  </div>
                </div>

                <div>
                  <IndicatorRow label="Acceptance rate"
                    value={fmt(selected.avg_acceptance_rate)}
                    threshold=">71.9%"
                    stressed={selected.avg_acceptance_rate > 0.719} />
                  <IndicatorRow label="Yield rate"
                    value={fmt(selected.avg_yield_rate)}
                    threshold="<45.1%"
                    stressed={selected.avg_yield_rate !== null && selected.avg_yield_rate < 0.451} />
                  <IndicatorRow label="Enrollment change"
                    value={fmt(selected.enrollment_pct_change)}
                    threshold="<-18.4%"
                    stressed={selected.enrollment_pct_change < -0.184} />
                  <IndicatorRow label="Grant aid %"
                    value={fmt(selected.avg_grant_pct)}
                    threshold=">99.6%"
                    stressed={selected.avg_grant_pct > 0.996} />
                  <IndicatorRow label="Operating margin"
                    value={fmt(selected.avg_operating_margin)}
                    threshold="<-50.4%"
                    stressed={selected.avg_operating_margin !== null && selected.avg_operating_margin < -0.504} />
                  <IndicatorRow label="Tuition dependency"
                    value={fmt(selected.avg_tuition_dep)}
                    threshold=">101.0%"
                    stressed={selected.avg_tuition_dep !== null && selected.avg_tuition_dep > 1.010} />
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    paddingTop: 10, fontSize: 12, color: 'var(--text-muted)',
                  }}>
                    <span>Models flagging: <strong style={{ color: 'var(--text-primary)' }}>{selected.models_flagged}/5</strong></span>
                    <span>Stress score: <strong style={{ color: 'var(--text-primary)' }}>{selected.stress_score}/6</strong></span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!selected || loading}
              style={{
                width: '100%',
                padding: '12px',
                background: selected && !loading ? 'var(--navy)' : 'var(--border)',
                color: selected && !loading ? 'white' : 'var(--text-muted)',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: selected && !loading ? 'pointer' : 'default',
                transition: 'all 0.15s',
              }}
            >
              {loading ? 'Generating brief...' : 'Generate risk brief'}
            </button>
          </div>

          <div style={{
            background: 'var(--white)',
            borderRadius: 12,
            border: '1px solid var(--border)',
            padding: 24,
            minHeight: 400,
          }}>
            {!selected && !brief && (
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                height: 360, color: 'var(--text-muted)',
                textAlign: 'center', gap: 12,
              }}>
                <div style={{
                  width: 48, height: 48, background: 'var(--slate-pale)',
                  borderRadius: 12, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 22,
                }}>
                  📋
                </div>
                <p style={{ fontSize: 14, maxWidth: 260 }}>
                  Select an institution and generate a brief to see the
                  AI-generated risk assessment here.
                </p>
              </div>
            )}

            {selected && !brief && !loading && (
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                height: 360, color: 'var(--text-muted)',
                textAlign: 'center', gap: 12,
              }}>
                <p style={{ fontSize: 14 }}>
                  Click "Generate risk brief" to create the assessment for{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>{selected.inst_name}</strong>
                </p>
              </div>
            )}

            {loading && (
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                height: 360, gap: 16,
              }}>
                <div style={{
                  width: 32, height: 32,
                  border: '3px solid var(--border)',
                  borderTopColor: 'var(--navy)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                  Generating brief for {selected.inst_name}...
                </p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
              </div>
            )}

            {error && (
              <div style={{
                padding: '16px', background: '#FEF2F2',
                border: '1px solid #FECACA', borderRadius: 8,
                color: '#991B1B', fontSize: 14,
              }}>
                {error}
              </div>
            )}

            {brief && (
              <div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: 20,
                  paddingBottom: 16, borderBottom: '1px solid var(--border)',
                }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {selected.inst_name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      General audience brief · Generated by Claude
                    </div>
                  </div>
                  <TierBadge tier={selected.xgb_tier} />
                </div>
                <BriefDisplay brief={brief} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
