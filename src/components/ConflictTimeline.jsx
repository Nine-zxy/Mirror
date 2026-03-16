import { useRef, useEffect, useState } from 'react'

// ─────────────────────────────────────────────────────────────
//  ConflictTimeline
//
//  New: tag pins rendered above beat markers on SVG
//    • Each tag = { id, beatIndex, emoji }
//    • Multiple tags per beat stack vertically
// ─────────────────────────────────────────────────────────────

function buildSmoothPath(points) {
  if (points.length < 2) return ''
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const p0  = points[i - 1]
    const p1  = points[i]
    const cpx = (p0.x + p1.x) / 2
    d += ` C ${cpx} ${p0.y}, ${cpx} ${p1.y}, ${p1.x} ${p1.y}`
  }
  return d
}

function intensityColor(v) {
  if (v < 0.3) return '#5882d0'
  if (v < 0.6) return '#c8922a'
  if (v < 0.8) return '#d05030'
  return '#d02020'
}

// ── Quick emoji picker ─────────────────────────────────────────
// (used by Theater's FloatingMark, exposed here as a constant)
export const MARK_EMOJIS = ['⚡', '🔴', '💭', '⭐']

export default function ConflictTimeline({
  beats, beatIndex, isPlaying, phase, onPlayPause, onSelectBeat,
  tags = [],    // [{ id, beatIndex, emoji }]
  playReady = false, partnerPlayReady = false, // Together mode ready-to-play gate
}) {
  const svgRef = useRef(null)
  const [svgW, setSvgW] = useState(800)

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setSvgW(e.contentRect.width))
    if (svgRef.current) ro.observe(svgRef.current)
    return () => ro.disconnect()
  }, [])

  const H     = 48
  const PAD_X = 32
  const usableW = Math.max(svgW - PAD_X * 2, 100)
  const n = beats.length

  const beatX = beats.map((_, i) => PAD_X + (i / (n - 1)) * usableW)

  const curvePoints = beats.map((b, i) => ({
    x: beatX[i],
    y: H - 12 - b.intensity * (H - 22),
  }))

  const curvePath = buildSmoothPath(curvePoints)
  const fillPath  = curvePath + ` L ${beatX[n-1]} ${H} L ${beatX[0]} ${H} Z`
  const currentX  = beatX[beatIndex] ?? PAD_X

  // Group tags by beatIndex
  const tagsByBeat = {}
  tags.forEach(t => {
    if (!tagsByBeat[t.beatIndex]) tagsByBeat[t.beatIndex] = []
    tagsByBeat[t.beatIndex].push(t)
  })

  const disabled = phase === 'reflection' || phase === 'intro'

  return (
    <div
      className="flex items-center gap-3 px-4 border-t border-white/5 bg-black flex-shrink-0"
      style={{ height: '68px' }}
    >
      {/* Play/Pause — with ready-to-play gate indicator */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ minWidth: '36px' }}>
        <button
          onClick={onPlayPause}
          disabled={disabled}
          className="w-9 h-9 flex items-center justify-center rounded transition-all"
          style={{
            color: disabled ? '#333' : playReady ? '#50d080' : '#7ab0e8',
            opacity: disabled ? 0.4 : 1,
            background: playReady ? 'rgba(80,208,128,0.12)' : 'transparent',
            border: playReady ? '1px solid rgba(80,208,128,0.3)' : '1px solid transparent',
          }}
          title={playReady ? '等待对方准备… 再次点击取消' : undefined}
        >
          {isPlaying ? (
            <svg width="14" height="16" viewBox="0 0 11 13" fill="currentColor">
              <rect x="0.5" y="1" width="3" height="11" rx="1" />
              <rect x="6.5" y="1" width="3" height="11" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="16" viewBox="0 0 11 13" fill="currentColor">
              <polygon points="1,1 10,6.5 1,12" />
            </svg>
          )}
        </button>
        {/* Ready-to-play status dots */}
        {playReady && (
          <div className="flex gap-1 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#50d080' }} title="你已准备" />
            <div className="w-1.5 h-1.5 rounded-full" style={{
              background: partnerPlayReady ? '#50d080' : 'rgba(255,255,255,0.15)',
              animation: partnerPlayReady ? 'none' : 'pulse 1.5s ease-in-out infinite',
            }} title={partnerPlayReady ? '对方已准备' : '等待对方'} />
          </div>
        )}
      </div>

      {/* SVG timeline */}
      <div ref={svgRef} className="flex-1 relative" style={{ height: `${H}px` }}>
        <svg width="100%" height={H} style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              {beats.map((b, i) => (
                <stop key={i}
                  offset={`${(i / (n-1)) * 100}%`}
                  stopColor={intensityColor(b.intensity)}
                  stopOpacity="0.25"
                />
              ))}
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Fill + curve */}
          <path d={fillPath} fill="url(#curveGrad)" />
          <path d={curvePath} fill="none" stroke="rgba(255,255,255,0.2)"
            strokeWidth="1.5" strokeLinecap="round" />

          {/* Playhead */}
          <line x1={currentX} y1={4} x2={currentX} y2={H - 4}
            stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeDasharray="3 3" />

          {/* Beat markers */}
          {beats.map((beat, i) => {
            const x      = beatX[i]
            const cy     = curvePoints[i].y
            const col    = intensityColor(beat.intensity)
            const isCurr = i === beatIndex
            const isPast = i < beatIndex
            const beatTags = tagsByBeat[i] || []

            return (
              <g key={beat.id} style={{ cursor: 'pointer' }} onClick={() => onSelectBeat(i)}>
                {/* Hit area */}
                <circle cx={x} cy={cy} r={12} fill="transparent" />

                {/* Pause point ring */}
                {beat.isPausePoint && (
                  <circle cx={x} cy={cy} r={10}
                    fill="none" stroke="#e87a7a" strokeWidth="1"
                    strokeDasharray="3 2" opacity="0.5" />
                )}

                {/* Beat dot */}
                <circle
                  cx={x} cy={cy}
                  r={isCurr ? 6 : 4}
                  fill={isCurr ? '#fff' : isPast ? col : 'rgba(255,255,255,0.25)'}
                  filter={isCurr ? 'url(#glow)' : undefined}
                  style={{ transition: 'r 0.25s, fill 0.35s' }}
                />

                {/* Tag pins — stacked above the beat dot */}
                {beatTags.map((tag, ti) => (
                  <text
                    key={tag.id}
                    x={x}
                    y={cy - 12 - ti * 14}
                    textAnchor="middle"
                    fontSize="10"
                    style={{ userSelect: 'none', pointerEvents: 'none' }}
                  >
                    {tag.emoji}
                  </text>
                ))}

                {/* Dialogue label on current */}
                {isCurr && beat.dialogue && (
                  <text x={x} y={H + 2} textAnchor="middle"
                    fontSize="8" fill="rgba(255,255,255,0.35)"
                    fontFamily="JetBrains Mono, monospace">
                    {beat.dialogue.text.slice(0, 12)}{beat.dialogue.text.length > 12 ? '…' : ''}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Readout */}
      <div className="flex flex-col items-end gap-0.5 flex-shrink-0 min-w-[52px]">
        <span className="font-mono text-[9px] text-white/25">
          {beatIndex + 1} / {beats.length}
        </span>
        <span className="font-mono text-[9px] tabular-nums"
          style={{ color: intensityColor(beats[beatIndex]?.intensity ?? 0) }}>
          {Math.round((beats[beatIndex]?.intensity ?? 0) * 100)}%
        </span>
        {tags.length > 0 && (
          <span className="font-mono text-[7px] text-white/20">
            🏷 {tags.length}
          </span>
        )}
      </div>
    </div>
  )
}
