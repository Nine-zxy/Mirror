// ─────────────────────────────────────────────────────────────
//  ConflictProfile — "冲突模式输入" phase
//
//  Appears between PersonaSetup and simulation.
//  Both partners set 3 behavioural dimensions simultaneously.
//  The "互动张力" strip below shows per-dimension mismatch,
//  giving couples a first reflection moment before the simulation.
//
//  Dimensions (0 → 1):
//    expression    克制 ←→ 直接
//    interpretation 善意 ←→ 防御
//    strategy      退让 ←→ 坚守
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import PixelChar from './PixelChar'

// ── Dimension definitions ─────────────────────────────────────
const DIMENSIONS = [
  {
    id:          'expression',
    label:       '表达方式',
    leftLabel:   '克制',
    rightLabel:  '直接',
    leftDesc:    '压住情绪',
    rightDesc:   '当即回应',
    color:       '#7ab0e8',
  },
  {
    id:          'interpretation',
    label:       '解读偏向',
    leftLabel:   '善意',
    rightLabel:  '防御',
    leftDesc:    '对方有苦衷',
    rightDesc:   '感到被针对',
    color:       '#c080e8',
  },
  {
    id:          'strategy',
    label:       '应对策略',
    leftLabel:   '退让',
    rightLabel:  '坚守',
    leftDesc:    '避免升级',
    rightDesc:   '说清为止',
    color:       '#e8b050',
  },
]

// ── Single slider row ─────────────────────────────────────────
function ProfileSlider({ dim, value, onChange }) {
  const pct = value * 100

  return (
    <div className="flex flex-col gap-1.5">

      {/* Dimension label + 5-dot level indicator */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] tracking-widest" style={{ color: dim.color }}>
          {dim.label}
        </span>
        <div className="flex gap-1 items-center">
          {[1, 2, 3, 4, 5].map(i => {
            const lit = (i / 5) <= value
            return (
              <div key={i} style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background:  lit ? dim.color : 'rgba(255,255,255,0.1)',
                boxShadow:   lit ? `0 0 5px ${dim.color}` : 'none',
                transition:  'all 0.18s',
              }} />
            )
          })}
        </div>
      </div>

      {/* Native range input — track filled via inline gradient */}
      <input
        type="range"
        min={0} max={100} step={1}
        value={Math.round(pct)}
        onChange={e => onChange(Number(e.target.value) / 100)}
        className="conflict-slider"
        style={{
          '--accent': dim.color,
          background: `linear-gradient(to right,
            ${dim.color} 0%, ${dim.color} ${pct}%,
            rgba(255,255,255,0.1) ${pct}%, rgba(255,255,255,0.1) 100%)`,
        }}
      />

      {/* Pole labels */}
      <div className="flex justify-between">
        <div>
          <div className="font-mono text-[9px]" style={{
            color: value < 0.5 ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.28)',
            transition: 'color 0.2s',
          }}>
            {dim.leftLabel}
          </div>
          <div className="font-mono text-[7px] text-white/22">{dim.leftDesc}</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[9px]" style={{
            color: value > 0.5 ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.28)',
            transition: 'color 0.2s',
          }}>
            {dim.rightLabel}
          </div>
          <div className="font-mono text-[7px] text-white/22">{dim.rightDesc}</div>
        </div>
      </div>
    </div>
  )
}

// ── One persona's panel (character preview + 3 sliders) ───────
function ProfilePanel({ personaId, persona, profile, onChange }) {
  const isA = personaId === 'A'
  const color = persona.color

  return (
    <div
      className="flex flex-col gap-4 rounded-xl p-5 flex-1"
      style={{
        background: `rgba(${isA ? '74,124,212' : '184,74,74'},0.05)`,
        border:     `1px solid rgba(${isA ? '122,176,232' : '232,122,122'},0.15)`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{
          background: color, boxShadow: `0 0 6px ${color}`,
        }} />
        <span className="font-mono text-[9px] tracking-[0.18em] uppercase" style={{
          color: 'rgba(255,255,255,0.35)',
        }}>
          {persona.name} · Partner {personaId}
        </span>
      </div>

      {/* Character preview */}
      <div className="flex justify-center items-end" style={{ height: '82px' }}>
        <PixelChar
          persona={persona}
          emotion="neutral"
          facing={isA ? 'right' : 'left'}
          lean="none"
          scale={0.85}
          glow={true}
          features={persona.features || []}
        />
      </div>

      {/* Sliders */}
      <div className="flex flex-col gap-4">
        {DIMENSIONS.map(dim => (
          <ProfileSlider
            key={dim.id}
            dim={dim}
            value={profile[dim.id]}
            onChange={v => onChange({ ...profile, [dim.id]: v })}
          />
        ))}
      </div>
    </div>
  )
}

// ── Mismatch strip — shows per-dimension A↔B friction ────────
function MismatchStrip({ profileA, profileB }) {
  return (
    <div
      className="rounded-xl px-5 py-3 flex items-center gap-4"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border:     '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex flex-col gap-0.5 flex-shrink-0">
        <span className="font-mono text-[7px] text-white/22 tracking-widest">互动</span>
        <span className="font-mono text-[7px] text-white/22 tracking-widest">张力</span>
      </div>

      <div className="flex-1 flex gap-3">
        {DIMENSIONS.map(dim => {
          const diff = Math.abs(profileA[dim.id] - profileB[dim.id])
          const pct  = diff * 100

          return (
            <div key={dim.id} className="flex flex-col items-center gap-1 flex-1">
              {/* Bar */}
              <div className="w-full h-1 rounded-full overflow-hidden" style={{
                background: 'rgba(255,255,255,0.07)',
              }}>
                <div style={{
                  width:      `${pct}%`,
                  height:     '100%',
                  background: dim.color,
                  boxShadow:  diff > 0.38 ? `0 0 8px ${dim.color}` : 'none',
                  transition: 'all 0.3s ease',
                }} />
              </div>
              {/* Label + value */}
              <div className="flex items-center gap-1">
                <span className="font-mono text-[7px]" style={{ color: `${dim.color}80` }}>
                  {dim.label}
                </span>
                {diff > 0.38 && (
                  <span className="font-mono text-[6px]" style={{ color: `${dim.color}70` }}>
                    ↑
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <span className="font-mono text-[7px] text-white/18 flex-shrink-0 text-right leading-tight">
        差异越大<br />冲突越激烈
      </span>
    </div>
  )
}

// ── Analysing loader ──────────────────────────────────────────
function AnalysingLoader() {
  return (
    <div className="flex flex-col items-center gap-3 py-5 anim-fadeIn">
      <div className="flex gap-1.5 items-center">
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#7ab0e8',
            animation: `blink 1.1s ${i * 0.28}s ease-in-out infinite`,
          }} />
        ))}
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="font-mono text-[10px] text-white/40 tracking-widest">
          正在构建互动轨迹…
        </p>
        <p className="font-mono text-[8px] text-white/20 tracking-widest">
          RECONSTRUCTING INTERACTION DYNAMICS
        </p>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────
export default function ConflictProfile({ personas, onConfirm }) {
  const [profileA, setProfileA] = useState({
    expression: 0.5, interpretation: 0.5, strategy: 0.5,
  })
  const [profileB, setProfileB] = useState({
    expression: 0.5, interpretation: 0.5, strategy: 0.5,
  })
  const [analysing, setAnalysing] = useState(false)

  const handleConfirm = () => {
    setAnalysing(true)
    setTimeout(() => onConfirm({ A: profileA, B: profileB }), 2000)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black overflow-auto py-8 px-6">

      {/* Subtle technical grid */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: [
          'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
        ].join(','),
        backgroundSize: '44px 44px',
      }} />

      <div className="relative w-full max-w-2xl flex flex-col gap-6 anim-fadeIn">

        {/* Header */}
        <div className="text-center flex flex-col gap-1">
          <span className="font-pixel text-[8px] tracking-[0.35em]" style={{ color: '#7ab0e8' }}>
            MIRROR
          </span>
          <div className="w-12 h-px mx-auto my-1" style={{
            background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)',
          }} />
          <p className="font-mono text-[10px] text-white/30 tracking-[0.2em]">
            冲突模式输入 / CONFLICT PROFILE
          </p>
          <p className="text-sm mt-1" style={{
            color: 'rgba(255,255,255,0.38)',
            fontFamily: '"PingFang SC","Inter",sans-serif',
          }}>
            描述<em>这次冲突</em>中你们各自的互动方式 — 系统将据此重建对话轨迹。
          </p>
        </div>

        {/* Dyadic panels — both visible simultaneously */}
        <div className="flex gap-4">
          <ProfilePanel
            personaId="A"
            persona={personas.A}
            profile={profileA}
            onChange={setProfileA}
          />
          <ProfilePanel
            personaId="B"
            persona={personas.B}
            profile={profileB}
            onChange={setProfileB}
          />
        </div>

        {/* Mismatch strip */}
        <MismatchStrip profileA={profileA} profileB={profileB} />

        {/* Confirm / analysing */}
        {analysing ? (
          <AnalysingLoader />
        ) : (
          <div className="flex justify-center pt-1">
            <button
              onClick={handleConfirm}
              className="font-mono text-[12px] tracking-[0.2em] px-10 py-3.5 rounded-xl border transition-all duration-300"
              style={{
                color:       '#7ab0e8',
                borderColor: 'rgba(122,176,232,0.4)',
                background:  'rgba(122,176,232,0.07)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background   = 'rgba(122,176,232,0.15)'
                e.currentTarget.style.borderColor  = 'rgba(122,176,232,0.7)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background   = 'rgba(122,176,232,0.07)'
                e.currentTarget.style.borderColor  = 'rgba(122,176,232,0.4)'
              }}
            >
              生成模拟 / GENERATE SIMULATION
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
