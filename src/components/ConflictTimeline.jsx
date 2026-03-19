import { useRef, useEffect, useState } from 'react'

// ─────────────────────────────────────────────────────────────
//  ConflictTimeline — Flat timeline (no intensity curve)
//
//  Simplified per advisor feedback (3.18 meeting):
//    苏老师: "坡度会给人暗示，但没有表达额外信息"
//    Stephy: "感觉是不用"
//
//  Now: flat horizontal bar with evenly-spaced beat dots
//  Tag pins still rendered above beat markers
// ─────────────────────────────────────────────────────────────

// ── Quick emoji picker ─────────────────────────────────────────
export const MARK_EMOJIS = ['⚡', '🔴', '💭', '⭐']

export default function ConflictTimeline({
  beats, beatIndex, isPlaying, phase, onPlayPause, onSelectBeat,
  tags = [],
  onFinishAnnotation = null,
}) {
  const svgRef = useRef(null)
  const [svgW, setSvgW] = useState(800)

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setSvgW(e.contentRect.width))
    if (svgRef.current) ro.observe(svgRef.current)
    return () => ro.disconnect()
  }, [])

  const H     = 36
  const PAD_X = 32
  const TRACK_Y = H / 2
  const usableW = Math.max(svgW - PAD_X * 2, 100)
  const n = beats.length

  const beatX = beats.map((_, i) => PAD_X + (i / Math.max(n - 1, 1)) * usableW)
  const currentX = beatX[beatIndex] ?? PAD_X

  // Progress fill width
  const progressW = beatIndex > 0 ? beatX[beatIndex] - beatX[0] : 0

  // Group tags by beatIndex
  const tagsByBeat = {}
  tags.forEach(t => {
    if (!tagsByBeat[t.beatIndex]) tagsByBeat[t.beatIndex] = []
    tagsByBeat[t.beatIndex].push(t)
  })

  const disabled = phase === 'reflection' || phase === 'intro' || phase === 'self_confirm' || phase === 'divergence'

  return (
    <div
      className="flex items-center gap-3 px-4 border-t border-white/5 bg-black flex-shrink-0"
      style={{ height: '56px' }}
    >
      {/* Play/Pause */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ minWidth: '36px' }}>
        <button
          onClick={onPlayPause}
          disabled={disabled}
          className="w-9 h-9 flex items-center justify-center rounded transition-all"
          style={{
            color: disabled ? '#333' : '#d4a852',
            opacity: disabled ? 0.4 : 1,
          }}
        >
          {isPlaying ? (
            <img src="/assets/ui/icons/pause.png" alt="pause"
              style={{width:'16px',height:'16px',imageRendering:'pixelated'}} />
          ) : (
            <img src="/assets/ui/icons/play.png" alt="play"
              style={{width:'16px',height:'16px',imageRendering:'pixelated'}} />
          )}
        </button>
      </div>

      {/* SVG timeline — flat bar */}
      <div ref={svgRef} className="flex-1 relative" style={{ height: `${H}px` }}>
        <svg width="100%" height={H} style={{ overflow: 'visible' }}>
          {/* Track background line */}
          <line
            x1={beatX[0]} y1={TRACK_Y}
            x2={beatX[n-1] || beatX[0]} y2={TRACK_Y}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Progress fill */}
          {progressW > 0 && (
            <line
              x1={beatX[0]} y1={TRACK_Y}
              x2={beatX[beatIndex]} y2={TRACK_Y}
              stroke="rgba(212,168,82,0.35)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}

          {/* Beat markers */}
          {beats.map((beat, i) => {
            const x = beatX[i]
            const isCurr = i === beatIndex
            const isPast = i < beatIndex
            const beatTags = tagsByBeat[i] || []

            return (
              <g key={beat.id} style={{ cursor: 'pointer' }} onClick={() => onSelectBeat(i)}>
                {/* Hit area */}
                <circle cx={x} cy={TRACK_Y} r={14} fill="transparent" />

                {/* Pause point indicator */}
                {beat.isPausePoint && (
                  <circle cx={x} cy={TRACK_Y} r={9}
                    fill="none" stroke="rgba(212,168,82,0.3)" strokeWidth="1"
                    strokeDasharray="2 2" />
                )}

                {/* Beat dot */}
                <circle
                  cx={x} cy={TRACK_Y}
                  r={isCurr ? 5 : 3.5}
                  fill={isCurr ? '#d4a852' : isPast ? 'rgba(212,168,82,0.6)' : 'rgba(255,255,255,0.18)'}
                  style={{ transition: 'r 0.25s, fill 0.3s' }}
                />

                {/* Current beat glow */}
                {isCurr && (
                  <circle cx={x} cy={TRACK_Y} r={8}
                    fill="none" stroke="rgba(212,168,82,0.25)" strokeWidth="1" />
                )}

                {/* Tag pins above */}
                {beatTags.map((tag, ti) => (
                  <text
                    key={tag.id}
                    x={x}
                    y={TRACK_Y - 12 - ti * 14}
                    textAnchor="middle"
                    fontSize="10"
                    style={{ userSelect: 'none', pointerEvents: 'none' }}
                  >
                    {tag.emoji}
                  </text>
                ))}

                {/* Dialogue label on current */}
                {isCurr && beat.dialogue && (
                  <text x={x} y={TRACK_Y + 16} textAnchor="middle"
                    fontSize="7" fill="rgba(255,255,255,0.25)"
                    fontFamily="'JetBrains Mono', monospace">
                    {beat.dialogue.text.slice(0, 14)}{beat.dialogue.text.length > 14 ? '…' : ''}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Readout */}
      <div className="flex flex-col items-end gap-0.5 flex-shrink-0 min-w-[44px]">
        <span className="font-mono text-[9px] text-white/30">
          {beatIndex + 1} / {beats.length}
        </span>
      </div>

      {/* Version B: Finish Annotation button */}
      {onFinishAnnotation && phase === 'solo_viewing' && beatIndex >= beats.length - 1 && !isPlaying && (
        <button
          onClick={onFinishAnnotation}
          className="font-mono text-[10px] px-4 py-1.5 rounded-lg border transition-all hover:scale-105 flex-shrink-0 anim-fadeIn"
          style={{
            color: '#d4a852',
            borderColor: 'rgba(212,168,82,0.35)',
            background: 'rgba(212,168,82,0.07)',
          }}
        >
          完成标注 →
        </button>
      )}
    </div>
  )
}
