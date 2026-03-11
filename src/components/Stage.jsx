import { useEffect, useState } from 'react'

// ─── Pixel art character (SVG, 16×24 grid units → rendered 64×96px) ───────────
function PixelCharacter({ side, isActive, isSpeaking }) {
  const isA = side === 'A'
  const hair    = isA ? '#1e2e52' : '#3d1a0a'
  const shirt   = isA ? '#2a5fd4' : '#c43c3c'
  const pants   = isA ? '#1a2f6a' : '#7a1c1c'
  const skin    = '#f0c8a0'
  const shoe    = '#1a1a1a'
  const mouth   = isSpeaking ? '#c0392b' : '#8a6a50'

  return (
    <div
      className={`transition-all duration-300 ${isActive ? (isA ? 'char-glow-A animate-bob' : 'char-glow-B animate-bob') : 'opacity-70'}`}
      style={{ imageRendering: 'pixelated' }}
    >
      <svg
        width="72"
        height="108"
        viewBox="0 0 18 27"
        style={{ imageRendering: 'pixelated', display: 'block' }}
      >
        {/* ── Hair ── */}
        <rect x="4"  y="0" width="10" height="3" fill={hair} />
        <rect x="3"  y="1" width="12" height="2" fill={hair} />
        {/* ── Head ── */}
        <rect x="4"  y="2" width="10" height="7" fill={skin} />
        {/* ── Eyes ── */}
        <rect x="5"  y="5" width="3"  height="1" fill="#2c2c2c" />
        <rect x="10" y="5" width="3"  height="1" fill="#2c2c2c" />
        {/* ── Mouth ── */}
        <rect x="6"  y="8" width="6"  height="1" fill={mouth} />
        {/* ── Neck ── */}
        <rect x="7"  y="9" width="4"  height="2" fill={skin} />
        {/* ── Shirt / torso ── */}
        <rect x="3"  y="11" width="12" height="7" fill={shirt} />
        {/* ── Arms ── */}
        <rect x="1"  y="11" width="2"  height="6" fill={shirt} />
        <rect x="15" y="11" width="2"  height="6" fill={shirt} />
        {/* ── Hands ── */}
        <rect x="1"  y="17" width="2"  height="2" fill={skin} />
        <rect x="15" y="17" width="2"  height="2" fill={skin} />
        {/* ── Pants ── */}
        <rect x="4"  y="18" width="4"  height="6" fill={pants} />
        <rect x="10" y="18" width="4"  height="6" fill={pants} />
        {/* ── Belt ── */}
        <rect x="3"  y="18" width="12" height="1" fill="#111" />
        {/* ── Shoes ── */}
        <rect x="3"  y="24" width="5"  height="3" fill={shoe} />
        <rect x="10" y="24" width="5"  height="3" fill={shoe} />
      </svg>
    </div>
  )
}

// ─── Thought bubble (cloud style) ─────────────────────────────────────────────
function ThoughtBubble({ text, user, side, visible }) {
  return (
    <div
      className={`thought-cloud thought-cloud-${side} flex-1 p-3.5 transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-25'}`}
      style={{
        border: `1.5px solid ${user.borderColor}`,
        background: user.dimColor,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '14px',
      }}
    >
      {/* Label */}
      <div
        className="text-[9px] font-pixel tracking-widest mb-2"
        style={{ color: user.color, opacity: 0.85 }}
      >
        {side === 'A' ? 'A THINKS' : 'B THINKS'}
      </div>
      {/* Text */}
      <p className="text-xs leading-relaxed text-[#C9D1D9]">{text}</p>
      {/* Cloud tail dots */}
      <CloudDots color={user.color} side={side} />
    </div>
  )
}

function CloudDots({ color, side }) {
  const pos = side === 'A' ? { left: '28px' } : { right: '28px' }
  return (
    <div className="absolute flex gap-[3px] items-end" style={{ bottom: '-20px', ...pos }}>
      <div className="w-[9px] h-[9px] rounded-full"   style={{ background: `${color}35`, border: `1.5px solid ${color}55` }} />
      <div className="w-[6px] h-[6px] rounded-full"   style={{ background: `${color}28`, border: `1.5px solid ${color}45` }} />
      <div className="w-[4px] h-[4px] rounded-full"   style={{ background: `${color}20`, border: `1.5px solid ${color}38` }} />
    </div>
  )
}

// ─── Speech bubble ─────────────────────────────────────────────────────────────
function SpeechBubble({ text, speaker, userA, userB }) {
  const user   = speaker === 'A' ? userA : userB
  const isLeft = speaker === 'A'

  return (
    <div
      className="relative px-4 py-3 rounded-xl max-w-[210px] text-center animate-fadeIn"
      style={{
        border: `2px solid ${user.color}`,
        background: `${user.color}18`,
      }}
    >
      <p className="text-sm font-medium text-white leading-snug">
        &ldquo;{text}&rdquo;
      </p>
      {/* Tail */}
      <div
        className="absolute bottom-[-10px] w-0 h-0"
        style={{
          [isLeft ? 'left' : 'right']: '28px',
          borderLeft:  '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop:   `10px solid ${user.color}`,
        }}
      />
    </div>
  )
}

// ─── Simple pixel furniture: couch in the middle ───────────────────────────────
function PixelCouch() {
  return (
    <svg
      width="96" height="48"
      viewBox="0 0 24 12"
      style={{ imageRendering: 'pixelated', opacity: 0.55 }}
    >
      {/* seat */}
      <rect x="2" y="4" width="20" height="6" fill="#4a3728" />
      {/* back */}
      <rect x="2" y="1" width="20" height="3" fill="#5a4535" />
      {/* arms */}
      <rect x="0" y="3" width="2"  height="7" fill="#5a4535" />
      <rect x="22" y="3" width="2" height="7" fill="#5a4535" />
      {/* legs */}
      <rect x="3"  y="10" width="2" height="2" fill="#2c1d12" />
      <rect x="19" y="10" width="2" height="2" fill="#2c1d12" />
    </svg>
  )
}

// ─── Main Stage component ──────────────────────────────────────────────────────
export default function Stage({ currentTurn, userA, userB }) {
  const [display, setDisplay]       = useState(currentTurn)
  const [fading,  setFading]        = useState(false)

  useEffect(() => {
    setFading(true)
    const t = setTimeout(() => {
      setDisplay(currentTurn)
      setFading(false)
    }, 180)
    return () => clearTimeout(t)
  }, [currentTurn])

  const isASpeaking = display.speaker === 'A'
  const isBSpeaking = display.speaker === 'B'

  return (
    <div className="relative flex-1 flex flex-col overflow-hidden">

      {/* ── Wall section (top 38%) ─────────────────────── */}
      <div className="stage-wall absolute inset-x-0 top-0" style={{ height: '38%' }} />

      {/* ── Floor section (bottom 62%) ────────────────── */}
      <div className="stage-floor absolute inset-x-0 bottom-0" style={{ height: '62%' }} />

      {/* ── Floor / wall divider ────────────────────────── */}
      <div
        className="absolute inset-x-0"
        style={{ top: '38%', height: '3px', background: 'linear-gradient(90deg, transparent, rgba(120,80,40,0.6), transparent)' }}
      />

      {/* ── Content (on top of bg) ─────────────────────── */}
      <div
        className={`relative flex flex-col h-full transition-opacity duration-200 ${fading ? 'opacity-0' : 'opacity-100'}`}
      >

        {/* ── Thought bubbles row (always both visible) ─── */}
        <div className="flex gap-5 p-4 pb-0 flex-shrink-0" style={{ paddingBottom: '28px' }}>
          <ThoughtBubble
            text={display.subtextA}
            user={userA}
            side="A"
            visible={true}
          />
          <ThoughtBubble
            text={display.subtextB}
            user={userB}
            side="B"
            visible={true}
          />
        </div>

        {/* ── Characters + dialogue ─────────────────────── */}
        <div className="flex items-end justify-between flex-1 px-10 pb-5">

          {/* User A */}
          <div className="flex flex-col items-center gap-1">
            <PixelCharacter side="A" isActive={isASpeaking} isSpeaking={isASpeaking} />
            <span className="font-pixel text-[8px]" style={{ color: userA.color }}>
              {userA.label}
            </span>
          </div>

          {/* Center: speech bubble + couch */}
          <div className="flex flex-col items-center gap-3 pb-2">
            <SpeechBubble
              text={display.dialogue}
              speaker={display.speaker}
              userA={userA}
              userB={userB}
            />
            <PixelCouch />
          </div>

          {/* User B */}
          <div className="flex flex-col items-center gap-1">
            <PixelCharacter side="B" isActive={isBSpeaking} isSpeaking={isBSpeaking} />
            <span className="font-pixel text-[8px]" style={{ color: userB.color }}>
              {userB.label}
            </span>
          </div>

        </div>
      </div>
    </div>
  )
}
