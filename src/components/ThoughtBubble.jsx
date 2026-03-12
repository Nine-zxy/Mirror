import { useEffect, useRef, useState } from 'react'

// ─────────────────────────────────────────────────────────────
//  ThoughtBubble
//
//  New: dispute interaction
//    • Hover → shows "✎" edit icon
//    • Click → opens inline dispute panel
//    • Source badge shows modification origin
//    • Disputed text replaces AI original inline
// ─────────────────────────────────────────────────────────────

const BUBBLE_TYPES = {
  cloud: {
    borderRadius: '18px', borderStyle: 'solid', borderWidth: '1.5px',
    filter: 'blur(0.3px)', anim: 'floatUp 3.5s ease-in-out infinite',
    extraShadow: '0 4px 24px rgba(0,0,0,0.3)',
  },
  aggressive: {
    borderRadius: '4px', borderStyle: 'solid', borderWidth: '2px',
    filter: 'none', anim: 'shake 0.3s ease-in-out infinite',
    extraShadow: '0 0 16px rgba(220,60,60,0.4)',
  },
  hesitation: {
    borderRadius: '14px', borderStyle: 'dashed', borderWidth: '1.5px',
    filter: 'none', anim: 'pulseSoft 2s ease-in-out infinite',
    extraShadow: 'none',
  },
  warm: {
    borderRadius: '16px', borderStyle: 'solid', borderWidth: '1.5px',
    filter: 'none', anim: 'warmGlow 2s ease-in-out infinite',
    extraShadow: '0 0 20px rgba(80,200,120,0.25)',
  },
  default: {
    borderRadius: '14px', borderStyle: 'solid', borderWidth: '1.5px',
    filter: 'none', anim: 'pulseSoft 2.5s ease-in-out infinite',
    extraShadow: 'none',
  },
}

const EMOTION_STYLE = {
  anxious:    { bg: 'rgba(70,110,200,0.14)',  border: '#5872c8', text: '#a8c0f0', icon: '〜' },
  defensive:  { bg: 'rgba(200,140,50,0.14)',  border: '#c8922a', text: '#f0c878', icon: '◈' },
  angry:      { bg: 'rgba(210,55,55,0.18)',   border: '#d03030', text: '#f09090', icon: '■' },
  hurt:       { bg: 'rgba(90,80,170,0.15)',   border: '#6050b0', text: '#b0a8e0', icon: '▽' },
  withdrawn:  { bg: 'rgba(70,80,100,0.13)',   border: '#5a6080', text: '#8898b0', icon: '◁' },
  warm:       { bg: 'rgba(70,190,110,0.13)',  border: '#48c870', text: '#88e8a0', icon: '◉' },
  reflective: { bg: 'rgba(130,110,200,0.14)', border: '#9880c8', text: '#c8b8f0', icon: '✦' },
  surprised:  { bg: 'rgba(200,160,55,0.14)',  border: '#c8a030', text: '#f0d890', icon: '◎' },
  neutral:    { bg: 'rgba(90,90,90,0.12)',    border: '#666',    text: '#aaa',    icon: '○' },
}

// ── Source badge ──────────────────────────────────────────────
function SourceBadge({ source }) {
  const colors = { AI: '#666', user: '#90e8a8' }
  const labels = { AI: 'AI原始', user: '已标注' }
  return (
    <span
      className="font-mono text-[7px] px-1.5 py-0.5 rounded"
      style={{
        color:      colors[source] || '#666',
        background: `${colors[source] || '#666'}18`,
        border:     `1px solid ${colors[source] || '#666'}40`,
      }}
    >
      {labels[source] || source}
    </span>
  )
}

// ── Dispute panel (inline edit) ───────────────────────────────
function DisputePanel({ original, current, onSave, onClose }) {
  const [text, setText] = useState(current || original)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div
      className="mt-2 rounded-lg overflow-hidden anim-fadeIn"
      style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.55)' }}
      onClick={e => e.stopPropagation()}
    >
      <div className="px-2.5 py-1.5 border-b border-white/8">
        <p className="font-mono text-[7px] text-white/30 tracking-wider">AI原始 → 修改</p>
        <p className="text-[10px] text-white/25 line-through mt-0.5"
          style={{ fontFamily: '"PingFang SC","Inter",sans-serif' }}>
          {original}
        </p>
      </div>
      <div className="px-2.5 py-2 flex flex-col gap-1.5">
        <textarea
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          rows={2}
          className="w-full bg-white/6 rounded px-2 py-1 text-[11px] text-white/80 placeholder-white/20 resize-none focus:outline-none border border-white/10 focus:border-white/25"
          style={{ fontFamily: '"PingFang SC","Inter",sans-serif' }}
        />
        <div className="flex justify-end gap-1.5">
          <button onClick={onClose}
            className="font-mono text-[8px] px-2 py-1 rounded text-white/30 hover:text-white/50 transition-colors">
            取消
          </button>
          <button onClick={() => onSave(text)}
            className="font-mono text-[8px] px-2.5 py-1 rounded transition-all"
            style={{ background: 'rgba(144,232,168,0.12)', color: '#90e8a8', border: '1px solid rgba(144,232,168,0.3)' }}>
            确认
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────
export default function ThoughtBubble({
  thought, personaId, visible,
  beatId,           // used as dispute key
  dispute,          // { source, text, original } | null
  onDispute,        // (personaId, beatId, update|null) => void
}) {
  const [displayText, setDisplayText] = useState('')
  const [mounted, setMounted]         = useState(false)
  const [hovered, setHovered]         = useState(false)
  const [editing, setEditing]         = useState(false)

  useEffect(() => {
    setMounted(false)
    setDisplayText('')
    setEditing(false)
    if (!thought?.text) return
    const t = setTimeout(() => {
      setMounted(true)
      let i = 0
      const iv = setInterval(() => {
        i++
        setDisplayText(thought.text.slice(0, i))
        if (i >= thought.text.length) clearInterval(iv)
      }, thought.bubbleType === 'hesitation' ? 45 : 25)
      return () => clearInterval(iv)
    }, 100)
    return () => clearTimeout(t)
  }, [thought?.text, thought?.emotion, thought?.bubbleType])

  if (!thought || !visible || !mounted) return null

  const es   = EMOTION_STYLE[thought.emotion] || EMOTION_STYLE.neutral
  const bt   = BUBBLE_TYPES[thought.bubbleType] || BUBBLE_TYPES.default
  const isA  = personaId === 'A'

  // Active text: disputed text overrides AI
  const shownText  = dispute?.text || displayText
  const isDisputed = !!dispute

  const handleSave = (newText) => {
    onDispute?.(personaId, beatId, {
      source:   'user',
      text:     newText,
      original: thought.text,
    })
    setEditing(false)
  }

  return (
    <div
      className={`thought-bubble thought-bubble-${personaId} absolute`}
      style={{
        bottom:    '100%',
        left:      isA ? '50%' : 'auto',
        right:     isA ? 'auto' : '50%',
        transform: isA ? 'translateX(-50%)' : 'translateX(50%)',
        marginBottom: '30px',
        minWidth:  '130px',
        maxWidth:  '210px',
        padding:   '9px 13px',
        background: es.bg,
        border: `${bt.borderWidth} ${bt.borderStyle} ${isDisputed ? 'rgba(144,232,168,0.45)' : es.border}`,
        borderRadius: bt.borderRadius,
        color:     es.text,
        fontSize:  '11.5px',
        lineHeight: '1.6',
        whiteSpace: 'pre-line',
        zIndex:    20,
        animation: editing ? 'none' : bt.anim,
        filter:    bt.filter,
        boxShadow: `${bt.extraShadow}, inset 0 0 10px ${es.bg}`,
        backdropFilter: thought.bubbleType === 'cloud' ? 'blur(2px)' : 'none',
        cursor:    'pointer',
        transition: 'border-color 0.3s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => !editing && setEditing(true)}
    >
      {/* Top row: icon + source badge + edit hint */}
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[9px] opacity-50" style={{ fontFamily: 'system-ui' }}>
          {es.icon}
        </span>
        <div className="flex items-center gap-1">
          {isDisputed && <SourceBadge source={dispute.source} />}
          {(hovered || editing) && !editing && (
            <span className="font-mono text-[7px] text-white/30 animate-fadeIn">✎</span>
          )}
        </div>
      </div>

      {/* Text */}
      <span>
        {shownText}
        {!isDisputed && displayText.length < (thought.text?.length || 0) && (
          <span className="animate-blink opacity-60">_</span>
        )}
      </span>

      {/* Inline dispute / edit panel */}
      {editing && (
        <DisputePanel
          original={thought.text}
          current={dispute?.text}
          onSave={handleSave}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  )
}
