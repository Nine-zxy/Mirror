import { useEffect, useRef, useState } from 'react'

// ─────────────────────────────────────────────────────────────
//  ThoughtBubble — Assumption Editing Interface (DP3 + DP4)
//
//  Core interaction: externalizes AI-inferred inner states as
//  visible, type-encoded, disputable/editable UI elements.
//
//  Three interaction modes:
//    1. Observe — default; typewriter reveal, read-only
//    2. Quick React — click to choose 👍像/👎不像/✎改
//    3. Edit — rewrite the assumption text + re-tag emotion
//
//  Visual states:
//    • Original (AI inference) — emotion-colored, italic, dashed
//    • Confirmed (user says 像) — subtle green check
//    • Disputed (user says 不像) — red strikethrough + user text
//    • Edited (user rewrites) — green border + 已修正 badge
// ─────────────────────────────────────────────────────────────

const BUBBLE_TYPES = {
  cloud: {
    borderRadius: '20px', borderStyle: 'dashed', borderWidth: '1.5px',
    filter: 'blur(0.2px)', anim: 'floatUp 3.5s ease-in-out infinite',
    extraShadow: '0 4px 20px rgba(0,0,0,0.22)',
    italic: true,
  },
  aggressive: {
    borderRadius: '4px', borderStyle: 'solid', borderWidth: '2px',
    filter: 'none', anim: 'shake 0.3s ease-in-out infinite',
    extraShadow: '0 0 16px rgba(220,60,60,0.4)',
    italic: false,
  },
  hesitation: {
    borderRadius: '16px', borderStyle: 'dashed', borderWidth: '1.5px',
    filter: 'none', anim: 'pulseSoft 2s ease-in-out infinite',
    extraShadow: 'none',
    italic: true,
  },
  warm: {
    borderRadius: '18px', borderStyle: 'dashed', borderWidth: '1.5px',
    filter: 'none', anim: 'warmGlow 2s ease-in-out infinite',
    extraShadow: '0 0 20px rgba(80,200,120,0.25)',
    italic: true,
  },
  default: {
    borderRadius: '16px', borderStyle: 'dashed', borderWidth: '1.5px',
    filter: 'none', anim: 'pulseSoft 2.5s ease-in-out infinite',
    extraShadow: 'none',
    italic: true,
  },
}

const EMOTION_STYLE = {
  anxious:    { bg: 'rgba(70,110,200,0.10)',  border: '#6882d8', text: '#b8cff8', icon: '〜', label: '焦虑', imgSrc: '/assets/ui/emotions/stressed.png' },
  defensive:  { bg: 'rgba(200,140,50,0.10)',  border: '#d8a040', text: '#f8d898', icon: '◈', label: '防备', imgSrc: '/assets/ui/emotions/confused.png' },
  angry:      { bg: 'rgba(210,55,55,0.14)',   border: '#e04040', text: '#f8a0a0', icon: '■', label: '愤怒', imgSrc: '/assets/ui/emotions/angry.png' },
  hurt:       { bg: 'rgba(90,80,170,0.10)',   border: '#7060c0', text: '#c0b8f0', icon: '▽', label: '受伤', imgSrc: '/assets/ui/emotions/sleepy.png' },
  withdrawn:  { bg: 'rgba(70,80,100,0.09)',   border: '#6a7090', text: '#98a8c0', icon: '◁', label: '退缩', imgSrc: '/assets/ui/emotions/sleepy.png' },
  warm:       { bg: 'rgba(70,190,110,0.09)',  border: '#58d880', text: '#98f0b0', icon: '◉', label: '温暖', imgSrc: '/assets/ui/emotions/happy.png' },
  reflective: { bg: 'rgba(130,110,200,0.10)', border: '#a890d8', text: '#d8c8f8', icon: '✦', label: '反思', imgSrc: '/assets/ui/emotions/thinking.png' },
  surprised:  { bg: 'rgba(200,160,55,0.10)',  border: '#d8b040', text: '#f8e8a0', icon: '◎', label: '惊讶', imgSrc: '/assets/ui/emotions/surprised.png' },
  neutral:    { bg: 'rgba(90,90,90,0.09)',    border: '#7a7a7a', text: '#c0c0c0', icon: '○', label: '平静', imgSrc: '/assets/ui/emotions/thinking.png' },
}

// Emotion options for re-tagging (subset most relevant to conflict)
const EMOTION_RETAG_OPTIONS = ['anxious', 'defensive', 'angry', 'hurt', 'withdrawn', 'warm', 'reflective', 'neutral']

// ── Status badge ────────────────────────────────────────────
function StatusBadge({ status }) {
  const configs = {
    original:  { color: '#666',    label: '推断', bg: '#66661a' },
    confirmed: { color: '#60c880', label: '像TA', bg: 'rgba(96,200,128,0.15)' },
    disputed:  { color: '#e87a7a', label: '不像',  bg: 'rgba(232,122,122,0.15)' },
    edited:    { color: '#90e8a8', label: '已修正', bg: 'rgba(144,232,168,0.12)' },
  }
  const c = configs[status] || configs.original
  return (
    <span
      className="font-mono text-[7px] px-1.5 py-0.5 rounded"
      style={{
        color: c.color,
        background: c.bg,
        border: `1px solid ${c.color}40`,
      }}
    >
      {c.label}
    </span>
  )
}

// ── Quick reaction bar ──────────────────────────────────────
// Two rows: Row 1 = confirm/dispute/edit, Row 2 = emotion quick-tags
// Emotion tags let users quickly mark "I think they're feeling THIS"
// without needing to open the full edit panel — lowers interaction cost
function QuickReactBar({ onConfirm, onDispute, onEdit, onEmotionTag, onClose, currentEmotion }) {
  return (
    <div
      className="mt-2 flex flex-col gap-1.5 anim-fadeIn"
      onClick={e => e.stopPropagation()}
    >
      {/* Row 1: confirm / dispute / edit */}
      <div className="flex items-center gap-1">
        <span className="font-mono text-[7px] text-white/25 mr-1">像TA吗？</span>
        <button onClick={onConfirm}
          className="font-mono text-[9px] px-2 py-1 rounded transition-all hover:scale-105"
          style={{ background: 'rgba(96,200,128,0.12)', color: '#60c880', border: '1px solid rgba(96,200,128,0.25)' }}>
          <img src="/assets/ui/icons/yes.png" alt="" style={{width:'12px',height:'12px',display:'inline',imageRendering:'pixelated'}} /> 像
        </button>
        <button onClick={onDispute}
          className="font-mono text-[9px] px-2 py-1 rounded transition-all hover:scale-105"
          style={{ background: 'rgba(232,122,122,0.12)', color: '#e87a7a', border: '1px solid rgba(232,122,122,0.25)' }}>
          <img src="/assets/ui/icons/no.png" alt="" style={{width:'12px',height:'12px',display:'inline',imageRendering:'pixelated'}} /> 不像
        </button>
        <button onClick={onEdit}
          className="font-mono text-[9px] px-2 py-1 rounded transition-all hover:scale-105"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <img src="/assets/ui/icons/edit.png" alt="" style={{width:'12px',height:'12px',display:'inline',imageRendering:'pixelated'}} /> 改
        </button>
        <button onClick={onClose}
          className="ml-auto font-mono text-[8px] text-white/20 hover:text-white/40 px-1">
          ✕
        </button>
      </div>
      {/* Row 2: emotion quick-tags — click to re-tag emotion without opening full edit */}
      <div className="flex items-center gap-0.5">
        <span className="font-mono text-[6px] text-white/18 mr-0.5">情绪：</span>
        {EMOTION_RETAG_OPTIONS.map(emo => {
          const es = EMOTION_STYLE[emo] || EMOTION_STYLE.neutral
          const active = currentEmotion === emo
          return (
            <button key={emo} onClick={() => onEmotionTag(emo)}
              className="rounded transition-all hover:scale-110"
              title={es.label}
              style={{
                padding: '2px',
                background: active ? `${es.bg}` : 'transparent',
                border: `1px solid ${active ? es.border + '60' : 'transparent'}`,
                opacity: active ? 1 : 0.55,
              }}>
              <img src={es.imgSrc} alt={es.label}
                style={{width:'18px', height:'18px', imageRendering:'pixelated'}} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Full edit panel (assumption rewrite + emotion re-tag) ───
function EditPanel({ original, current, originalEmotion, currentEmotion, onSave, onClose }) {
  const [text, setText] = useState(current || original)
  const [emotion, setEmotion] = useState(currentEmotion || originalEmotion || 'neutral')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div
      className="mt-2 rounded-lg overflow-hidden anim-fadeIn"
      style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.6)' }}
      onClick={e => e.stopPropagation()}
    >
      {/* Original text (struck through) */}
      <div className="px-2.5 py-1.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <p className="font-mono text-[7px] text-white/25 tracking-wider">你认为TA当时在想什么？</p>
        <p className="text-[10px] text-white/20 line-through mt-0.5"
          style={{ fontFamily: '"PingFang SC","Inter",sans-serif' }}>
          {original}
        </p>
      </div>

      <div className="px-2.5 py-2 flex flex-col gap-2">
        {/* Text rewrite */}
        <textarea
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="写出你认为TA真正的想法..."
          rows={2}
          className="w-full bg-white/6 rounded px-2 py-1.5 text-[11px] text-white/80 placeholder-white/18 resize-none focus:outline-none border border-white/10 focus:border-white/25"
          style={{ fontFamily: '"PingFang SC","Inter",sans-serif' }}
        />

        {/* Emotion re-tag */}
        <div>
          <p className="font-mono text-[7px] text-white/22 tracking-wider mb-1">情绪标签</p>
          <div className="flex flex-wrap gap-1">
            {EMOTION_RETAG_OPTIONS.map(emo => {
              const es = EMOTION_STYLE[emo] || EMOTION_STYLE.neutral
              const active = emotion === emo
              return (
                <button key={emo} onClick={() => setEmotion(emo)}
                  className="font-mono text-[8px] px-1.5 py-0.5 rounded transition-all"
                  style={{
                    color: active ? es.text : 'rgba(255,255,255,0.25)',
                    background: active ? es.bg : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${active ? es.border + '60' : 'rgba(255,255,255,0.06)'}`,
                  }}>
                  {es.icon} {es.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-1.5">
          <button onClick={onClose}
            className="font-mono text-[8px] px-2 py-1 rounded text-white/30 hover:text-white/50 transition-colors">
            取消
          </button>
          <button onClick={() => onSave(text, emotion)}
            className="font-mono text-[8px] px-2.5 py-1 rounded transition-all"
            style={{ background: 'rgba(144,232,168,0.12)', color: '#90e8a8', border: '1px solid rgba(144,232,168,0.3)' }}>
            确认修正
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────
export default function ThoughtBubble({
  thought, personaId, visible,
  beatId,
  dispute,     // { source, status, text, original, emotion }
  onDispute,
}) {
  const [displayText, setDisplayText] = useState('')
  const [mounted, setMounted]         = useState(false)
  const [mode, setMode]               = useState('observe')  // 'observe' | 'react' | 'edit'

  useEffect(() => {
    setMounted(false)
    setDisplayText('')
    setMode('observe')
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

  const status = dispute?.status || 'original'
  const es   = EMOTION_STYLE[dispute?.emotion || thought.emotion] || EMOTION_STYLE.neutral
  const bt   = BUBBLE_TYPES[thought.bubbleType] || BUBBLE_TYPES.default
  const isA  = personaId === 'A'

  // Pixel bubble background asset selection
  const isEdited = status === 'edited' || status === 'disputed'
  const bubbleBgSrc = isA
    ? (isEdited ? '/assets/ui/dialogue/thought_bubble_blue_edited.svg' : '/assets/ui/dialogue/blue-bubble.svg')
    : (isEdited ? '/assets/ui/dialogue/thought_bubble_red_edited.svg' : '/assets/ui/dialogue/red-bubble.svg')

  // Determine displayed text
  const shownText = (status === 'edited' || status === 'disputed') ? (dispute?.text || displayText) : displayText
  const hasInteraction = status !== 'original'

  // Border color based on status
  const borderColor = {
    original:  es.border,
    confirmed: 'rgba(96,200,128,0.45)',
    disputed:  'rgba(232,122,122,0.45)',
    edited:    'rgba(144,232,168,0.50)',
  }[status] || es.border

  // Handlers
  const handleConfirm = () => {
    onDispute?.(personaId, beatId, {
      source: 'user', status: 'confirmed',
      text: thought.text, original: thought.text,
      emotion: thought.emotion,
    })
    setMode('observe')
  }

  const handleDisputeQuick = () => {
    // Mark as "不像" without rewriting — user can later click edit to add their version
    onDispute?.(personaId, beatId, {
      source: 'user', status: 'disputed',
      text: thought.text, original: thought.text,
      emotion: thought.emotion,
    })
    setMode('observe')
  }

  const handleEditSave = (newText, newEmotion) => {
    onDispute?.(personaId, beatId, {
      source: 'user',
      status: newText !== thought.text ? 'edited' : 'confirmed',
      text: newText,
      original: thought.text,
      emotion: newEmotion || thought.emotion,
    })
    setMode('observe')
  }

  // Quick emotion re-tag: one-tap to change the emotion without editing text
  const handleEmotionTag = (newEmotion) => {
    onDispute?.(personaId, beatId, {
      source: 'user',
      status: 'edited',
      text: dispute?.text || thought.text,
      original: thought.text,
      emotion: newEmotion,
      originalEmotion: thought.emotion,
    })
    setMode('observe')
  }

  const handleClear = () => {
    onDispute?.(personaId, beatId, null)
    setMode('observe')
  }

  return (
    <div
      className={`thought-bubble thought-bubble-${personaId} absolute anim-bloom`}
      style={{
        bottom:    '100%',
        left:      isA ? '50%' : 'auto',
        right:     isA ? 'auto' : '50%',
        transform: isA ? 'translateX(-50%)' : 'translateX(50%)',
        marginBottom: '30px',
        minWidth:  '160px',
        maxWidth:  '290px',
        padding:   '9px 13px',
        background: es.bg,
        border: `${bt.borderWidth} ${status === 'disputed' ? 'solid' : bt.borderStyle} ${borderColor}`,
        borderRadius: bt.borderRadius,
        overflow: 'hidden',
        color:     es.text,
        fontSize:  '14px',
        fontStyle: bt.italic && mode === 'observe' ? 'italic' : 'normal',
        lineHeight: '1.7',
        whiteSpace: 'pre-line',
        zIndex:    20,
        animation: mode !== 'observe' ? 'none' : bt.anim,
        filter:    bt.filter,
        boxShadow: `${bt.extraShadow}, inset 0 0 14px ${es.bg}${status === 'edited' ? ', 0 0 12px rgba(144,232,168,0.15)' : ''}`,
        backdropFilter: thought.bubbleType === 'cloud' ? 'blur(3px)' : 'none',
        cursor:    mode === 'observe' ? 'pointer' : 'default',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
      onClick={() => mode === 'observe' && setMode('react')}
    >
      {/* Pixel bubble SVG background overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `url("${bubbleBgSrc}")`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        opacity: 0.35,
        borderRadius: bt.borderRadius,
      }} />

      {/* Top row: label + icon + status + actions */}
      <div className="flex items-center justify-between mb-1.5 relative z-[1]">
        <div className="flex items-center gap-1">
          <span className="font-mono text-[7px] tracking-wider"
            style={{ color: '#e8dcc8', opacity: 0.5 }}>
            内心
          </span>
          <img src={es.imgSrc} alt="" style={{width:'14px', height:'14px', display:'inline', imageRendering:'pixelated', opacity: 0.7}} />
        </div>
        <div className="flex items-center gap-1.5">
          {hasInteraction && <StatusBadge status={status} />}
          {mode === 'observe' && (
            <button
              onClick={(e) => { e.stopPropagation(); setMode('react') }}
              className="font-mono text-[8px] px-1.5 py-0.5 rounded transition-all hover:bg-white/10"
              style={{
                color: hasInteraction ? borderColor : 'rgba(255,255,255,0.30)',
                border: `1px solid ${hasInteraction ? borderColor + '60' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              {hasInteraction ? <><img src="/assets/ui/icons/edit.png" alt="" style={{width:'12px',height:'12px',display:'inline',imageRendering:'pixelated'}} /> 改</> : '像TA吗？'}
            </button>
          )}
        </div>
      </div>

      {/* Original text (shown struck if disputed/edited) */}
      {(status === 'disputed' || status === 'edited') && dispute?.text !== thought.text && (
        <div className="mb-1">
          <span className="text-[9px] text-white/18 line-through"
            style={{ fontFamily: '"PingFang SC","Inter",sans-serif' }}>
            {thought.text}
          </span>
        </div>
      )}

      {/* Main text */}
      <span style={{ fontFamily: '"PingFang SC","Inter",sans-serif' }}>
        {shownText}
        {!hasInteraction && displayText.length < (thought.text?.length || 0) && (
          <span className="animate-blink opacity-60">_</span>
        )}
      </span>

      {/* Quick react bar (像TA吗？) */}
      {mode === 'react' && (
        <QuickReactBar
          onConfirm={handleConfirm}
          onDispute={handleDisputeQuick}
          onEdit={() => setMode('edit')}
          onEmotionTag={handleEmotionTag}
          onClose={() => setMode('observe')}
          currentEmotion={dispute?.emotion || thought.emotion}
        />
      )}

      {/* Full edit panel */}
      {mode === 'edit' && (
        <EditPanel
          original={thought.text}
          current={dispute?.text !== thought.text ? dispute?.text : null}
          originalEmotion={thought.emotion}
          currentEmotion={dispute?.emotion}
          onSave={handleEditSave}
          onClose={() => setMode('react')}
        />
      )}

      {/* Clear button (small, bottom-right, only when interacted) */}
      {hasInteraction && mode === 'observe' && (
        <button
          onClick={(e) => { e.stopPropagation(); handleClear() }}
          className="absolute font-mono text-[6px] text-white/12 hover:text-white/30 transition-colors"
          style={{ bottom: '4px', right: '8px' }}
          title="撤销标注"
        >
          撤销
        </button>
      )}
    </div>
  )
}
