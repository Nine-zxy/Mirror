// ─────────────────────────────────────────────────────────────
//  EmotionBar — bottom status bar
//
//  Shows each partner's current emotional state + conflict
//  profile "fingerprint" (3 mini bars for expression /
//  interpretation / strategy).  The fingerprint stays visible
//  throughout simulation so the profile shapes how the viewer
//  reads the scene.
// ─────────────────────────────────────────────────────────────

// Profile dimension colours — shared with ConflictProfile.jsx
const DIM_COLORS = {
  expression:    '#7ab0e8',  // blue
  interpretation:'#c080e8',  // purple
  strategy:      '#e8b050',  // amber
}

// ── Emotion metadata ──────────────────────────────────────────
const EMOTION_META = {
  neutral:         { icon: '◯', label: '平静',  color: '#888' },
  anxious:         { icon: '〜', label: '焦虑',  color: '#7ab0e8' },
  confrontational: { icon: '▲', label: '对抗',  color: '#e8a840' },
  defensive:       { icon: '◈', label: '防御',  color: '#e8a840' },
  angry:           { icon: '■', label: '愤怒',  color: '#e85858' },
  hurt:            { icon: '▽', label: '受伤',  color: '#9888e8' },
  withdrawn:       { icon: '◁', label: '回避',  color: '#7090a8' },
  warm:            { icon: '◉', label: '温暖',  color: '#58c878' },
  surprised:       { icon: '◎', label: '惊讶',  color: '#e8c840' },
  sitting:         { icon: '◯', label: '平静',  color: '#888' },
}

// ── Three-bar profile fingerprint ────────────────────────────
//  dim.id  → value 0..1
//  Shows as 3 tiny stacked bars, each coloured by dimension.
//  The active dimension for the current beat can glow.
function ProfileFingerprint({ profile }) {
  if (!profile) return null
  const dims = [
    { id: 'expression',    value: profile.expression },
    { id: 'interpretation',value: profile.interpretation },
    { id: 'strategy',      value: profile.strategy },
  ]

  return (
    <div className="flex flex-col gap-0.5 justify-center" title="冲突互动模式">
      {dims.map(d => (
        <div key={d.id} className="flex items-center gap-1">
          {/* Filled track */}
          <div style={{
            width:  '28px',
            height: '3px',
            borderRadius: '1.5px',
            background: 'rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}>
            <div style={{
              width:      `${d.value * 100}%`,
              height:     '100%',
              background: DIM_COLORS[d.id],
              boxShadow:  d.value > 0.65 || d.value < 0.35
                ? `0 0 5px ${DIM_COLORS[d.id]}`
                : 'none',
              transition: 'width 0.35s ease',
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Emotion chip ──────────────────────────────────────────────
function EmotionChip({ persona, pose }) {
  const meta = EMOTION_META[pose] || EMOTION_META.neutral
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-500"
      style={{
        background: `${meta.color}10`,
        border:     `1px solid ${meta.color}30`,
      }}
    >
      <div
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: persona.color, boxShadow: `0 0 5px ${persona.color}` }}
      />
      <span className="font-mono text-[9px] tracking-wider" style={{ color: persona.color }}>
        {persona.name}
      </span>
      <span className="font-mono text-[9px]" style={{ color: meta.color }}>
        {meta.icon}
      </span>
      <span className="font-mono text-[9px] tracking-wide" style={{ color: `${meta.color}cc` }}>
        {meta.label}
      </span>
    </div>
  )
}

// ── Proxemic state indicator ──────────────────────────────────
function ProxemicIndicator({ state, intensity = 0 }) {
  const states = {
    neutral:     { label: '平静',     color: '#666',    dots: 1 },
    approaching: { label: '逼近',     color: '#e8a840', dots: 2 },
    tension:     { label: '张力',     color: '#e87050', dots: 3 },
    hot:         { label: '冲突升温', color: '#e85050', dots: 4 },
    cold:        { label: '冷战',     color: '#70a0e8', dots: 3 },
  }
  const s      = states[state] || states.neutral
  const filled = Math.round(intensity * 5)

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex gap-1 items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-700"
            style={{
              width:      i < filled ? '6px' : '4px',
              height:     i < filled ? '6px' : '4px',
              background: i < filled ? s.color : 'rgba(255,255,255,0.1)',
              boxShadow:  i < filled ? `0 0 4px ${s.color}` : 'none',
            }}
          />
        ))}
      </div>
      <span className="font-mono text-[8px] tracking-widest" style={{ color: `${s.color}99` }}>
        {s.label}
      </span>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────
export default function EmotionBar({ beat, personas, phase, profile }) {
  if (!beat || phase === 'intro') return null

  const poseA = beat.spatial?.A?.pose || 'neutral'
  const poseB = beat.spatial?.B?.pose || 'neutral'

  return (
    <div className="flex items-center justify-between px-5 h-11 border-t border-white/5 bg-black flex-shrink-0">

      {/* Left: Partner A chip + profile fingerprint */}
      <div className="flex items-center gap-2">
        <EmotionChip persona={personas.A} pose={poseA} />
        <ProfileFingerprint profile={profile?.A} />
      </div>

      {/* Centre: proxemic state */}
      <div className="flex items-center gap-2">
        <ProxemicIndicator state={beat.proxemic?.state} intensity={beat.intensity} />
      </div>

      {/* Right: profile fingerprint + Partner B chip */}
      <div className="flex items-center gap-2">
        <ProfileFingerprint profile={profile?.B} />
        <EmotionChip persona={personas.B} pose={poseB} />
      </div>

    </div>
  )
}
