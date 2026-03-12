import { useRef, useEffect, useState } from 'react'

// Smooth bezier curve path through N points
function buildSmoothPath(points) {
  if (points.length < 2) return ''
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1]
    const p1 = points[i]
    const cpx = (p0.x + p1.x) / 2
    d += ` C ${cpx} ${p0.y}, ${cpx} ${p1.y}, ${p1.x} ${p1.y}`
  }
  return d
}

// Intensity → color
function intensityColor(v) {
  if (v < 0.3) return '#5882d0'
  if (v < 0.6) return '#c8922a'
  if (v < 0.8) return '#d05030'
  return '#d02020'
}

export default function ConflictTimeline({
  beats, beatIndex, isPlaying, phase, onPlayPause, onSelectBeat,
}) {
  const svgRef  = useRef(null)
  const [svgW, setSvgW] = useState(800)

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setSvgW(e.contentRect.width))
    if (svgRef.current) ro.observe(svgRef.current)
    return () => ro.disconnect()
  }, [])

  const H = 48
  const PAD_X = 32
  const usableW = Math.max(svgW - PAD_X * 2, 100)
  const n = beats.length

  // Beat X positions
  const beatX = beats.map((_, i) => PAD_X + (i / (n - 1)) * usableW)

  // Curve points (Y = high intensity → LOW on screen, so inverted)
  const curvePoints = beats.map((b, i) => ({
    x: beatX[i],
    y: H - 12 - b.intensity * (H - 22),
  }))

  const curvePath    = buildSmoothPath(curvePoints)
  const fillPath     = curvePath + ` L ${beatX[n-1]} ${H} L ${beatX[0]} ${H} Z`

  // Current beat indicator X
  const currentX = beatX[beatIndex] ?? PAD_X

  const disabled = phase === 'reflection' || phase === 'intro'

  return (
    <div className="flex items-center gap-3 px-4 border-t border-white/5 bg-black flex-shrink-0" style={{ height: '68px' }}>

      {/* Play/Pause */}
      <button
        onClick={onPlayPause}
        disabled={disabled}
        className="w-7 h-7 flex items-center justify-center rounded flex-shrink-0 transition-all"
        style={{ color: disabled ? '#333' : '#7ab0e8', opacity: disabled ? 0.4 : 1 }}
      >
        {isPlaying ? (
          <svg width="11" height="13" viewBox="0 0 11 13" fill="currentColor">
            <rect x="0.5" y="1" width="3" height="11" rx="1" />
            <rect x="6.5" y="1" width="3" height="11" rx="1" />
          </svg>
        ) : (
          <svg width="11" height="13" viewBox="0 0 11 13" fill="currentColor">
            <polygon points="1,1 10,6.5 1,12" />
          </svg>
        )}
      </button>

      {/* SVG timeline */}
      <div ref={svgRef} className="flex-1 relative" style={{ height: `${H}px` }}>
        <svg width="100%" height={H} style={{ overflow: 'visible' }}>
          <defs>
            {/* Gradient fill under curve */}
            <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              {beats.map((b, i) => (
                <stop key={i}
                  offset={`${(i / (n-1)) * 100}%`}
                  stopColor={intensityColor(b.intensity)}
                  stopOpacity="0.25"
                />
              ))}
            </linearGradient>
            {/* Current beat glow */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Fill under curve */}
          <path d={fillPath} fill="url(#curveGrad)" />

          {/* Curve line */}
          <path
            d={curvePath}
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Playhead vertical line */}
          <line
            x1={currentX} y1={4} x2={currentX} y2={H - 4}
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Beat markers */}
          {beats.map((beat, i) => {
            const x   = beatX[i]
            const cy  = curvePoints[i].y
            const col = intensityColor(beat.intensity)
            const isCurr = i === beatIndex
            const isPast = i < beatIndex
            return (
              <g key={beat.id} style={{ cursor: 'pointer' }} onClick={() => onSelectBeat(i)}>
                {/* Hit area */}
                <circle cx={x} cy={cy} r={12} fill="transparent" />

                {/* Pause point indicator */}
                {beat.isPausePoint && (
                  <circle cx={x} cy={cy} r={10}
                    fill="none" stroke="#e87a7a" strokeWidth="1" strokeDasharray="3 2" opacity="0.5" />
                )}

                {/* Dot */}
                <circle
                  cx={x} cy={cy}
                  r={isCurr ? 6 : 4}
                  fill={isCurr ? '#fff' : isPast ? col : 'rgba(255,255,255,0.25)'}
                  filter={isCurr ? 'url(#glow)' : undefined}
                  style={{ transition: 'r 0.25s, fill 0.35s' }}
                />

                {/* Dialogue label (only current) */}
                {isCurr && beat.dialogue && (
                  <text
                    x={x}
                    y={H + 2}
                    textAnchor="middle"
                    fontSize="8"
                    fill="rgba(255,255,255,0.35)"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {beat.dialogue.text.slice(0, 12)}{beat.dialogue.text.length > 12 ? '…' : ''}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Beat / intensity readout */}
      <div className="flex flex-col items-end gap-0.5 flex-shrink-0 min-w-[52px]">
        <span className="font-mono text-[9px] text-white/25">
          {beatIndex + 1} / {beats.length}
        </span>
        <span
          className="font-mono text-[9px] tabular-nums"
          style={{ color: intensityColor(beats[beatIndex]?.intensity ?? 0) }}
        >
          {Math.round((beats[beatIndex]?.intensity ?? 0) * 100)}%
        </span>
      </div>

    </div>
  )
}
