import { Play, Pause, RotateCcw, SkipBack, SkipForward } from 'lucide-react'

const W = 600   // SVG viewBox width (responsive via preserveAspectRatio)
const H = 64    // SVG viewBox height
const PAD_X = 28
const PAD_Y = 10
const INNER_W = W - PAD_X * 2
const INNER_H = H - PAD_Y * 2

// Map a turn index + emotion value → SVG coordinates
function toPoint(index, total, emotion) {
  const x = PAD_X + (index / Math.max(total - 1, 1)) * INNER_W
  const y = PAD_Y + INNER_H - emotion * INNER_H
  return [x, y]
}

function buildPath(turns, field) {
  return turns
    .map((t, i) => {
      const [x, y] = toPoint(i, turns.length, t[field])
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

export default function Timeline({ turns, currentTurnIndex, onSelectTurn, isPlaying, onPlayPause, userA, userB }) {
  const total = turns.length
  const [curX] = toPoint(currentTurnIndex, total, 0)  // x of current turn

  const pathA = buildPath(turns, 'emotionA')
  const pathB = buildPath(turns, 'emotionB')

  const canBack    = currentTurnIndex > 0
  const canForward = currentTurnIndex < total - 1

  return (
    <div
      className="flex-shrink-0 border-t border-[#21262D] bg-[#0D1117]"
      style={{ height: '120px' }}
    >
      <div className="flex items-stretch h-full">

        {/* ── Playback controls ─────────────────────────── */}
        <div className="flex items-center gap-2 px-4 border-r border-[#21262D] flex-shrink-0">
          <button
            onClick={() => { onSelectTurn(0) }}
            className="text-[#6E7681] hover:text-[#C9D1D9] transition-colors"
            title="Restart"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={() => canBack && onSelectTurn(currentTurnIndex - 1)}
            className={`transition-colors ${canBack ? 'text-[#6E7681] hover:text-[#C9D1D9]' : 'text-[#30363D]'}`}
            disabled={!canBack}
          >
            <SkipBack size={16} />
          </button>
          <button
            onClick={onPlayPause}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all text-white"
            style={{ background: isPlaying ? '#30363D' : '#1F6FEB' }}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} className="translate-x-[1px]" />}
          </button>
          <button
            onClick={() => canForward && onSelectTurn(currentTurnIndex + 1)}
            className={`transition-colors ${canForward ? 'text-[#6E7681] hover:text-[#C9D1D9]' : 'text-[#30363D]'}`}
            disabled={!canForward}
          >
            <SkipForward size={16} />
          </button>
        </div>

        {/* ── SVG emotion timeline ─────────────────────── */}
        <div className="flex-1 relative px-2 py-3">

          {/* Legend */}
          <div className="absolute top-3 right-4 flex items-center gap-4 z-10">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-0.5 rounded" style={{ background: userA.color }} />
              <span className="font-mono text-[9px] text-[#6E7681]">{userA.label} emotion</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-0.5 rounded" style={{ background: userB.color }} />
              <span className="font-mono text-[9px] text-[#6E7681]">{userB.label} emotion</span>
            </div>
          </div>

          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full"
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const relX  = ((e.clientX - rect.left) / rect.width) * W
              const closest = turns.reduce((best, _, i) => {
                const [x] = toPoint(i, total, 0)
                return Math.abs(x - relX) < Math.abs(toPoint(best, total, 0)[0] - relX) ? i : best
              }, 0)
              onSelectTurn(closest)
            }}
          >
            {/* ── Grid lines ── */}
            {[0.25, 0.5, 0.75].map(t => (
              <line
                key={t}
                x1={PAD_X} y1={PAD_Y + INNER_H - t * INNER_H}
                x2={W - PAD_X} y2={PAD_Y + INNER_H - t * INNER_H}
                stroke="#21262D" strokeWidth="1" strokeDasharray="3 3"
              />
            ))}

            {/* ── Area fills (subtle) ── */}
            <path
              d={`${pathA} L ${(PAD_X + INNER_W).toFixed(1)} ${(PAD_Y + INNER_H).toFixed(1)} L ${PAD_X} ${(PAD_Y + INNER_H).toFixed(1)} Z`}
              fill={`${userA.color}12`}
            />
            <path
              d={`${pathB} L ${(PAD_X + INNER_W).toFixed(1)} ${(PAD_Y + INNER_H).toFixed(1)} L ${PAD_X} ${(PAD_Y + INNER_H).toFixed(1)} Z`}
              fill={`${userB.color}12`}
            />

            {/* ── Emotion lines ── */}
            <path d={pathA} fill="none" stroke={userA.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            <path d={pathB} fill="none" stroke={userB.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

            {/* ── Data point dots ── */}
            {turns.map((t, i) => {
              const [xA, yA] = toPoint(i, total, t.emotionA)
              const [xB, yB] = toPoint(i, total, t.emotionB)
              const active   = i === currentTurnIndex
              return (
                <g key={i}>
                  <circle cx={xA} cy={yA} r={active ? 5 : 3.5} fill={userA.color} opacity={active ? 1 : 0.6} />
                  <circle cx={xB} cy={yB} r={active ? 5 : 3.5} fill={userB.color} opacity={active ? 1 : 0.6} />
                  {/* Inner white dot for active */}
                  {active && (
                    <>
                      <circle cx={xA} cy={yA} r={2} fill="white" />
                      <circle cx={xB} cy={yB} r={2} fill="white" />
                    </>
                  )}
                </g>
              )
            })}

            {/* ── Current turn vertical line ── */}
            <line
              x1={curX} y1={PAD_Y - 2}
              x2={curX} y2={PAD_Y + INNER_H + 2}
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />

            {/* ── Turn labels (TURN 1, 2 …) ── */}
            {turns.map((_, i) => {
              const [x] = toPoint(i, total, 0)
              return (
                <text
                  key={i}
                  x={x} y={H - 1}
                  textAnchor="middle"
                  fontSize="7"
                  fill={i === currentTurnIndex ? '#C9D1D9' : '#6E7681'}
                  fontFamily="JetBrains Mono, monospace"
                >
                  T{i + 1}
                </text>
              )
            })}
          </svg>
        </div>

        {/* ── Right: current divergence readout ─────────── */}
        <div className="flex flex-col justify-center items-center px-5 border-l border-[#21262D] gap-1 flex-shrink-0 w-[100px]">
          <span className="font-pixel text-[7px] text-[#6E7681] tracking-widest text-center leading-loose">
            EMOTIONAL<br/>INTENSITY
          </span>
          <div className="flex gap-2 mt-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-3 rounded-sm transition-all duration-500"
                style={{
                  height: `${turns[currentTurnIndex].emotionA * 36}px`,
                  background: userA.color,
                  minHeight: '4px',
                }}
              />
              <span className="font-mono text-[8px]" style={{ color: userA.color }}>A</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-3 rounded-sm transition-all duration-500"
                style={{
                  height: `${turns[currentTurnIndex].emotionB * 36}px`,
                  background: userB.color,
                  minHeight: '4px',
                }}
              />
              <span className="font-mono text-[8px]" style={{ color: userB.color }}>B</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
