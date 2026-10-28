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
  // All bubble types now use the same clean, high-contrast style
  // No blur, no shake, no animation differences — just clear readable text
  cloud: {
    borderRadius: '14px', borderStyle: 'solid', borderWidth: '2.5px',
    filter: 'none', anim: 'none',
    extraShadow: 'none',
    italic: false,
  },
  aggressive: {
    borderRadius: '14px', borderStyle: 'solid', borderWidth: '2.5px',
    filter: 'none', anim: 'none',
    extraShadow: 'none',
    italic: false,
  },
  hesitation: {
    borderRadius: '14px', borderStyle: 'solid', borderWidth: '2.5px',
    filter: 'none', anim: 'none',
    extraShadow: 'none',
    italic: false,
  },
  warm: {
    borderRadius: '14px', borderStyle: 'solid', borderWidth: '2.5px',
    filter: 'none', anim: 'none',
    extraShadow: 'none',
    italic: false,
  },
  default: {
    borderRadius: '14px', borderStyle: 'solid', borderWidth: '2.5px',
    filter: 'none', anim: 'none',
    extraShadow: 'none',
    italic: false,
  },
}

// 8 emotions, each with a unique icon from /assets/ui/emotions/ — no duplicates
export const EMOTION_STYLE = {
  angry:      { bg: 'rgba(210,55,55,0.14)',   border: '#e04040', text: '#f8a0a0', label: 'Angry', imgSrc: import.meta.env.BASE_URL + 'assets/ui/emotions/angry.png' },
  confused:   { bg: 'rgba(200,140,50,0.10)',  border: '#d8a040', text: '#f8d898', label: 'Confused', imgSrc: import.meta.env.BASE_URL + 'assets/ui/emotions/confused.png' },
  happy:      { bg: 'rgba(70,190,110,0.09)',  border: '#58d880', text: '#98f0b0', label: 'Happy', imgSrc: import.meta.env.BASE_URL + 'assets/ui/emotions/happy.png' },
  love:       { bg: 'rgba(200,80,130,0.10)',  border: '#d05888', text: '#f0a8c8', label: 'Love', imgSrc: import.meta.env.BASE_URL + 'assets/ui/emotions/love.png' },
  sleepy:     { bg: 'rgba(70,80,100,0.09)',   border: '#6a7090', text: '#98a8c0', label: 'Sleepy', imgSrc: import.meta.env.BASE_URL + 'assets/ui/emotions/sleepy.png' },
  stressed:   { bg: 'rgba(70,110,200,0.10)',  border: '#6882d8', text: '#b8cff8', label: 'Stressed', imgSrc: import.meta.env.BASE_URL + 'assets/ui/emotions/stressed.png' },
  surprised:  { bg: 'rgba(200,160,55,0.10)',  border: '#d8b040', text: '#f8e8a0', label: 'Surprised', imgSrc: import.meta.env.BASE_URL + 'assets/ui/emotions/surprised.png' },
  thinking:   { bg: 'rgba(130,110,200,0.10)', border: '#a890d8', text: '#d8c8f8', label: 'Thinking', imgSrc: import.meta.env.BASE_URL + 'assets/ui/emotions/thinking.png' },
  // Legacy mappings — map old emotion names to new ones
  anxious:    { bg: 'rgba(70,110,200,0.10)',  border: '#6882d8', text: '#b8cff8', label: 'Anxious', imgSrc: import.meta.env.BASE_URL + 'assets/ui/emotions/stressed.png' },
  defensive:  { bg: 'rgba(200,140,50,0.10)',  border: '#d8a040', text: '#f8d898', label: 'Defensive', imgSrc: import.meta.env.BASE_URL + 'assets/ui/emotions/confused.png' },
  hurt:       { bg: 'rgba(90,80,170,0.10)',   border: '#7060c0', text: '#c0b8f0', label: 'Hurt', imgSrc: import.meta.env.BASE_URL + 'assets/ui/emotions/sleepy.png' },
  withdrawn:  { bg: 'rgba(70,80,100,0.09)',   border: '#6a7090', text: '#98a8c0', label: 'Withdrawn', imgSrc: import.meta.env.BASE_URL + 'assets/ui/emotions/sleepy.png' },
  warm:       { bg: 'rgba(70,190,110,0.09)',  border: '#58d880', text: '#98f0b0', label: 'Warm', imgSrc: import.meta.env.BASE_URL + 'assets/ui/emotions/happy.png' },
  reflective: { bg: 'rgba(130,110,200,0.10)', border: '#a890d8', text: '#d8c8f8', label: 'Reflective', imgSrc: import.meta.env.BASE_URL + 'assets/ui/emotions/thinking.png' },
  neutral:    { bg: 'rgba(90,90,90,0.09)',    border: '#7a7a7a', text: '#c0c0c0', label: 'Calm', imgSrc: import.meta.env.BASE_URL + 'assets/ui/emotions/thinking.png' },
}

// Emotion options for re-tagging: exactly 8 unique icons, no duplicates
export const EMOTION_RETAG_OPTIONS = ['angry', 'confused', 'happy', 'love', 'sleepy', 'stressed', 'surprised', 'thinking']

// ── Status badge ────────────────────────────────────────────
function StatusBadge({ status }) {
  const configs = {
    original:  { color: '#666',    label: 'AI', bg: '#66661a' },
    confirmed: { color: '#60c880', label: 'Confirmed', bg: 'rgba(96,200,128,0.15)' },
    disputed:  { color: '#e87a7a', label: 'Disputed',  bg: 'rgba(232,122,122,0.15)' },
    edited:    { color: '#90e8a8', label: 'Edited', bg: 'rgba(144,232,168,0.12)' },
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
// Two rows: Row 1 = confirm/dispute/edit, Row 2 = text-based emotion tags
// Emotion tags let users quickly mark "I think they're feeling THIS"
// without needing to open the full edit panel — lowers interaction cost
function QuickReactBar({ onConfirm, onDispute, onEdit, onEmotionTag, onClose, currentEmotion, emotionCandidates }) {
  // Use emotionCandidates from scenario if available, otherwise fall back to defaults
  const tagOptions = (emotionCandidates && emotionCandidates.length > 0)
    ? emotionCandidates
    : EMOTION_RETAG_OPTIONS

  return (
    <div
      className="mt-2 flex flex-col gap-1.5 anim-fadeIn"
      onClick={e => e.stopPropagation()}
    >
      {/* Row 1: confirm / dispute / edit */}
      <div className="flex items-center gap-1">
        <span className="font-mono text-[7px] text-white/25 mr-1">Like them?</span>
        <button onClick={onConfirm}
          className="font-mono text-[11px] px-2 py-1 rounded transition-all hover:scale-105"
          style={{ background: 'rgba(96,200,128,0.12)', color: '#60c880', border: '1px solid rgba(96,200,128,0.25)' }}>
          Yes
        </button>
        <button onClick={onDispute}
          className="font-mono text-[11px] px-2 py-1 rounded transition-all hover:scale-105"
          style={{ background: 'rgba(232,122,122,0.12)', color: '#e87a7a', border: '1px solid rgba(232,122,122,0.25)' }}>
          No
        </button>
        <button onClick={onEdit}
          className="font-mono text-[11px] px-2 py-1 rounded transition-all hover:scale-105"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
          Edit
        </button>
        <button onClick={onClose}
          className="ml-auto font-mono text-[8px] text-white/20 hover:text-white/40 px-1">
          ✕
        </button>
      </div>
      {/* Row 2: text-based emotion tags — click to re-tag */}
      <div className="flex items-center gap-1 flex-wrap">
        <span className="font-mono text-[7px] text-white/25 mr-0.5">Emotion:</span>
        {tagOptions.map(emo => {
          const es = EMOTION_STYLE[emo] || EMOTION_STYLE.neutral
          const active = currentEmotion === emo
          return (
            <button key={emo} onClick={() => onEmotionTag(emo)}
              className="rounded-full font-mono text-[10px] tracking-wide transition-all hover:scale-105"
              style={{
                padding: '2px 8px',
                background: active ? es.bg : 'rgba(255,255,255,0.04)',
                border: `1px solid ${active ? es.border + '80' : 'rgba(255,255,255,0.1)'}`,
                color: active ? es.text : 'rgba(255,255,255,0.45)',
              }}>
              {emo}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Full edit panel (assumption rewrite + emotion re-tag) ───
function EditPanel({ original, current, originalEmotion, currentEmotion, onSave, onClose, emotionCandidates }) {
  const [text, setText] = useState(current || original)
  const [emotion, setEmotion] = useState(currentEmotion || originalEmotion || 'neutral')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div
      className="mt-2 rounded-lg overflow-hidden anim-fadeIn"
      style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(20,24,36,0.95)' }}
      onClick={e => e.stopPropagation()}
    >
      {/* Original text (struck through) */}
      <div className="px-2.5 py-1.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <p className="font-mono text-[7px] text-white/25 tracking-wider">What do you think they were thinking?</p>
        <p className="text-[10px] text-white/20 line-through mt-0.5"
          style={{ fontFamily: 'var(--font-ui)' }}>
          {original}
        </p>
      </div>

      <div className="px-2.5 py-2 flex flex-col gap-2">
        {/* Text rewrite */}
        <textarea
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write what you think they were really thinking..."
          rows={2}
          className="w-full rounded px-2.5 py-2 text-[13px] text-white/90 placeholder-white/25 resize-none focus:outline-none"
          style={{
            fontFamily: 'var(--font-ui)',
            background: 'rgba(10,10,20,0.85)',
            border: '1.5px solid rgba(122,176,232,0.4)',
            lineHeight: '1.7',
          }}
        />

        {/* Emotion re-tag — text tags */}
        <div>
          <p className="font-mono text-[7px] text-white/22 tracking-wider mb-1">Emotion tag</p>
          <div className="flex flex-wrap gap-1">
            {((emotionCandidates && emotionCandidates.length > 0) ? emotionCandidates : EMOTION_RETAG_OPTIONS).map(emo => {
              const es = EMOTION_STYLE[emo] || EMOTION_STYLE.neutral
              const active = emotion === emo
              return (
                <button key={emo} onClick={() => setEmotion(emo)}
                  className="rounded-full font-mono text-[10px] tracking-wide transition-all hover:scale-105"
                  style={{
                    padding: '2px 8px',
                    background: active ? es.bg : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${active ? es.border + '80' : 'rgba(255,255,255,0.1)'}`,
                    color: active ? es.text : 'rgba(255,255,255,0.45)',
                  }}>
                  {emo}
                </button>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-1.5">
          <button onClick={onClose}
            className="font-mono text-[8px] px-2 py-1 rounded text-white/30 hover:text-white/50 transition-colors">
            Cancel
          </button>
          <button onClick={() => onSave(text, emotion)}
            className="font-mono text-[8px] px-2.5 py-1 rounded transition-all"
            style={{ background: 'rgba(144,232,168,0.12)', color: '#90e8a8', border: '1px solid rgba(144,232,168,0.3)' }}>
            Confirm revision
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
  onStartEdit, // callback to open bottom edit panel: (personaId, beatId, thought, dispute) => void
  emotionCandidates, // text-based emotion options from scenario beat
}) {
  const [displayText, setDisplayText] = useState('')
  const [mounted, setMounted]         = useState(false)
  const [mode, setMode]               = useState('observe')  // 'observe' | 'react' | 'edit'

  useEffect(() => {
    setMode('observe')
    if (!thought?.text) { setMounted(false); setDisplayText(''); return }
    // Show thought text instantly — no typewriter animation
    setDisplayText(thought.text)
    setMounted(true)
  }, [thought?.text, thought?.emotion, thought?.bubbleType])

  if (!thought || !visible || !mounted) return null

  const status = dispute?.status || 'original'
  const es   = EMOTION_STYLE[dispute?.emotion || thought.emotion] || EMOTION_STYLE.neutral
  const bt   = BUBBLE_TYPES[thought.bubbleType] || BUBBLE_TYPES.default
  const isA  = personaId === 'A'

  // Persona-based bubble background: A=blue, B=red — FULLY OPAQUE, high contrast
  const personaBg = isA
    ? 'rgb(20,35,75)'
    : 'rgb(75,20,20)'
  const personaBorder = isA ? '#88aae8' : '#e88888'
  // Text color: near-white with persona tint for maximum readability
  const personaTextColor = isA ? '#dce8ff' : '#ffe0e0'

  // Determine displayed text
  const shownText = (status === 'edited' || status === 'disputed') ? (dispute?.text || displayText) : displayText
  const hasInteraction = status !== 'original'

  // Border color based on status (default uses persona color)
  const borderColor = {
    original:  personaBorder,
    confirmed: 'rgba(96,200,128,0.45)',
    disputed:  'rgba(232,122,122,0.45)',
    edited:    'rgba(144,232,168,0.50)',
  }[status] || personaBorder

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
        background: personaBg,
        border: `2.5px solid ${borderColor}`,
        borderRadius: bt.borderRadius,
        overflow: 'hidden',
        color:     personaTextColor,
        fontSize:  '15px',
        fontStyle: bt.italic && mode === 'observe' ? 'italic' : 'normal',
        lineHeight: '1.7',
        whiteSpace: 'pre-line',
        zIndex:    20,
        animation: 'none',
        filter:    'none',
        boxShadow: `0 0 20px ${isA ? 'rgba(80,120,220,0.4)' : 'rgba(220,80,80,0.4)'}, 0 2px 12px rgba(0,0,0,0.5)${status === 'edited' ? ', 0 0 12px rgba(144,232,168,0.2)' : ''}`,
        backdropFilter: 'none',
        cursor:    mode === 'observe' ? 'pointer' : 'default',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
      onClick={() => mode === 'observe' && setMode('react')}
    >
      {/* Top row: label + status + actions */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1">
          <span className="font-mono text-[7px] tracking-wider"
            style={{ color: '#e8dcc8', opacity: 0.5 }}>
            Inner
          </span>
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
              {hasInteraction ? <><img src={import.meta.env.BASE_URL + 'assets/ui/icons/edit.png'} alt="" style={{width:'12px',height:'12px',display:'inline',imageRendering:'pixelated'}} /> Edit</> : 'Like them?'}
            </button>
          )}
        </div>
      </div>

      {/* Original text (shown struck if disputed/edited) */}
      {(status === 'disputed' || status === 'edited') && dispute?.text !== thought.text && (
        <div className="mb-1">
          <span className="text-[9px] text-white/18 line-through"
            style={{ fontFamily: 'var(--font-ui)' }}>
            {thought.text}
          </span>
        </div>
      )}

      {/* Main text */}
      <span style={{ fontFamily: 'var(--font-ui)' }}>
        {shownText}
        {!hasInteraction && displayText.length < (thought.text?.length || 0) && (
          <span className="animate-blink opacity-60">_</span>
        )}
      </span>

      {/* Emotion tag label — always visible on the bubble */}
      {(() => {
        const emo = dispute?.emotion || thought.emotion
        const emoStyle = EMOTION_STYLE[emo] || EMOTION_STYLE.neutral
        return emo ? (
          <div className="mt-2 flex items-center gap-1">
            <span className="rounded-full font-mono text-[10px] tracking-wide"
              style={{
                padding: '2px 10px',
                background: emoStyle.bg,
                border: `1px solid ${emoStyle.border}60`,
                color: emoStyle.text,
              }}>
              {emo}
            </span>
          </div>
        ) : null
      })()}

      {/* Quick react bar */}
      {mode === 'react' && (
        <QuickReactBar
          onConfirm={handleConfirm}
          onDispute={handleDisputeQuick}
          onEdit={() => {
            // Open bottom edit panel instead of inline
            onStartEdit?.(personaId, beatId, thought, dispute)
            setMode('observe')
          }}
          onEmotionTag={handleEmotionTag}
          onClose={() => setMode('observe')}
          currentEmotion={dispute?.emotion || thought.emotion}
          emotionCandidates={emotionCandidates}
        />
      )}

      {/* Clear button (small, bottom-right, only when interacted) */}
      {hasInteraction && mode === 'observe' && (
        <button
          onClick={(e) => { e.stopPropagation(); handleClear() }}
          className="absolute font-mono text-[6px] text-white/12 hover:text-white/30 transition-colors"
          style={{ bottom: '4px', right: '8px' }}
          title="Undo annotation"
        >
          Undo
        </button>
      )}
    </div>
  )
}
