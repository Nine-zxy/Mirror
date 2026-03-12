// Emotion state display bar — shows both partners' current emotional state
const EMOTION_META = {
  neutral:        { icon: '◯', label: '平静',   color: '#888' },
  anxious:        { icon: '〜', label: '焦虑',   color: '#7ab0e8' },
  confrontational:{ icon: '▲', label: '对抗',   color: '#e8a840' },
  defensive:      { icon: '◈', label: '防御',   color: '#e8a840' },
  angry:          { icon: '■', label: '愤怒',   color: '#e85858' },
  hurt:           { icon: '▽', label: '受伤',   color: '#9888e8' },
  withdrawn:      { icon: '◁', label: '回避',   color: '#7090a8' },
  warm:           { icon: '◉', label: '温暖',   color: '#58c878' },
  surprised:      { icon: '◎', label: '惊讶',   color: '#e8c840' },
  sitting:        { icon: '◯', label: '平静',   color: '#888' },
}

function EmotionChip({ persona, pose }) {
  const meta = EMOTION_META[pose] || EMOTION_META.neutral
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-500"
      style={{
        background: `${meta.color}10`,
        border: `1px solid ${meta.color}30`,
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

export default function EmotionBar({ beat, personas, phase }) {
  if (!beat || phase === 'intro') return null

  const poseA = beat.spatial?.A?.pose || 'neutral'
  const poseB = beat.spatial?.B?.pose || 'neutral'

  return (
    <div className="flex items-center justify-between px-5 h-11 border-t border-white/5 bg-black flex-shrink-0">

      <div className="flex items-center gap-2">
        <EmotionChip persona={personas.A} pose={poseA} />
      </div>

      {/* Center: proxemic state indicator */}
      <div className="flex items-center gap-2">
        <ProxemicIndicator state={beat.proxemic?.state} intensity={beat.intensity} />
      </div>

      <div className="flex items-center gap-2">
        <EmotionChip persona={personas.B} pose={poseB} />
      </div>
    </div>
  )
}

function ProxemicIndicator({ state, intensity = 0 }) {
  const states = {
    neutral:    { label: '平静',       color: '#666',    dots: 1 },
    approaching:{ label: '逼近',       color: '#e8a840', dots: 2 },
    tension:    { label: '张力',       color: '#e87050', dots: 3 },
    hot:        { label: '冲突升温',   color: '#e85050', dots: 4 },
    cold:       { label: '冷战',       color: '#70a0e8', dots: 3 },
  }
  const s = states[state] || states.neutral
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
