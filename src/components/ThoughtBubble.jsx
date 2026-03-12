import { useEffect, useState } from 'react'

// ── Bubble type visual configurations ────────────────────────
//  cloud      → soft, blurred edges, slow float (introspective)
//  aggressive → sharp corners, red, shake (anger)
//  hesitation → dotted border, slow pulsing (anxious/uncertain)
//  warm       → green glow, gentle pulse

const BUBBLE_TYPES = {
  cloud: {
    borderRadius: '18px',
    borderStyle: 'solid',
    borderWidth: '1.5px',
    filter: 'blur(0.3px)',
    anim: 'floatUp 3.5s ease-in-out infinite',
    extraShadow: '0 4px 24px rgba(0,0,0,0.3)',
  },
  aggressive: {
    borderRadius: '4px',
    borderStyle: 'solid',
    borderWidth: '2px',
    filter: 'none',
    anim: 'shake 0.3s ease-in-out infinite',
    extraShadow: '0 0 16px rgba(220,60,60,0.4)',
  },
  hesitation: {
    borderRadius: '14px',
    borderStyle: 'dashed',
    borderWidth: '1.5px',
    filter: 'none',
    anim: 'pulseSoft 2s ease-in-out infinite',
    extraShadow: 'none',
  },
  warm: {
    borderRadius: '16px',
    borderStyle: 'solid',
    borderWidth: '1.5px',
    filter: 'none',
    anim: 'warmGlow 2s ease-in-out infinite',
    extraShadow: '0 0 20px rgba(80,200,120,0.25)',
  },
  default: {
    borderRadius: '14px',
    borderStyle: 'solid',
    borderWidth: '1.5px',
    filter: 'none',
    anim: 'pulseSoft 2.5s ease-in-out infinite',
    extraShadow: 'none',
  },
}

const EMOTION_STYLE = {
  anxious:    { bg: 'rgba(70,110,200,0.14)', border: '#5872c8', text: '#a8c0f0', icon: '〜' },
  defensive:  { bg: 'rgba(200,140,50,0.14)', border: '#c8922a', text: '#f0c878', icon: '◈' },
  angry:      { bg: 'rgba(210,55,55,0.18)',  border: '#d03030', text: '#f09090', icon: '■' },
  hurt:       { bg: 'rgba(90,80,170,0.15)',  border: '#6050b0', text: '#b0a8e0', icon: '▽' },
  withdrawn:  { bg: 'rgba(70,80,100,0.13)',  border: '#5a6080', text: '#8898b0', icon: '◁' },
  warm:       { bg: 'rgba(70,190,110,0.13)', border: '#48c870', text: '#88e8a0', icon: '◉' },
  reflective: { bg: 'rgba(130,110,200,0.14)',border: '#9880c8', text: '#c8b8f0', icon: '✦' },
  surprised:  { bg: 'rgba(200,160,55,0.14)', border: '#c8a030', text: '#f0d890', icon: '◎' },
  neutral:    { bg: 'rgba(90,90,90,0.12)',   border: '#666',    text: '#aaa',    icon: '○' },
}

export default function ThoughtBubble({ thought, personaId, visible }) {
  const [text, setText]     = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(false)
    setText('')
    if (!thought?.text) return
    const t = setTimeout(() => {
      setMounted(true)
      let i = 0
      const iv = setInterval(() => {
        i++
        setText(thought.text.slice(0, i))
        if (i >= thought.text.length) clearInterval(iv)
      }, thought.bubbleType === 'hesitation' ? 45 : 25)
      return () => clearInterval(iv)
    }, 100)
    return () => clearTimeout(t)
  }, [thought?.text, thought?.emotion, thought?.bubbleType])

  if (!thought || !visible || !mounted) return null

  const es = EMOTION_STYLE[thought.emotion] || EMOTION_STYLE.neutral
  const bt = BUBBLE_TYPES[thought.bubbleType] || BUBBLE_TYPES.default
  const isA = personaId === 'A'

  return (
    <div
      className={`thought-bubble thought-bubble-${personaId} absolute`}
      style={{
        bottom: '100%',
        left:   isA ? '50%' : 'auto',
        right:  isA ? 'auto' : '50%',
        transform: isA ? 'translateX(-50%)' : 'translateX(50%)',
        marginBottom: '30px',
        minWidth: '130px',
        maxWidth: '200px',
        padding: '9px 13px',
        background: es.bg,
        border: `${bt.borderWidth} ${bt.borderStyle} ${es.border}`,
        borderRadius: bt.borderRadius,
        color: es.text,
        fontSize: '11.5px',
        lineHeight: '1.6',
        whiteSpace: 'pre-line',
        zIndex: 20,
        animation: bt.anim,
        filter: bt.filter,
        boxShadow: `${bt.extraShadow}, inset 0 0 10px ${es.bg}`,
        backdropFilter: thought.bubbleType === 'cloud' ? 'blur(2px)' : 'none',
      }}
    >
      <span className="text-[9px] block mb-0.5 opacity-50" style={{ fontFamily: 'system-ui' }}>
        {es.icon}
      </span>
      {text}
      {text.length < (thought.text?.length || 0) && (
        <span className="animate-blink opacity-60">_</span>
      )}
    </div>
  )
}
