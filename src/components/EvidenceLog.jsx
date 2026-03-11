import { MessageSquare } from 'lucide-react'

export default function EvidenceLog({ turns, currentTurnIndex, onSelectTurn, userA, userB }) {
  return (
    <aside className="w-[220px] flex-shrink-0 flex flex-col border-r border-[#21262D] bg-[#0D1117]">

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#21262D]">
        <MessageSquare size={12} className="text-[#6E7681]" />
        <span className="font-pixel text-[8px] text-[#6E7681] tracking-widest">
          EVIDENCE LOG
        </span>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {turns.map((turn, idx) => {
          const user      = turn.speaker === 'A' ? userA : userB
          const isCurrent = idx === currentTurnIndex
          const isPast    = idx < currentTurnIndex

          return (
            <button
              key={turn.id}
              onClick={() => onSelectTurn(idx)}
              className={`
                w-full text-left rounded-lg p-3 border transition-all duration-200 group
                ${isCurrent
                  ? 'border-opacity-60 bg-opacity-10'
                  : isPast
                    ? 'border-[#21262D] bg-[#161B22] opacity-70 hover:opacity-100'
                    : 'border-[#21262D] bg-[#0D1117] opacity-35 hover:opacity-60'
                }
              `}
              style={isCurrent
                ? { borderColor: user.borderColor, background: user.dimColor }
                : undefined
              }
            >
              {/* Speaker tag */}
              <div
                className="font-pixel text-[7px] mb-1.5 tracking-wider"
                style={{ color: user.color }}
              >
                {user.label}
              </div>

              {/* Dialogue */}
              <p className={`text-xs leading-snug ${isCurrent ? 'text-[#E6EDF3]' : 'text-[#8B949E]'}`}>
                {turn.dialogue}
              </p>

              {/* Divergence pip */}
              <div className="flex items-center gap-1.5 mt-2">
                <div className="flex-1 h-1 rounded-full bg-[#21262D] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width:      `${turn.divergence}%`,
                      background: divergenceGradient(turn.divergence),
                    }}
                  />
                </div>
                <span className="font-mono text-[9px] text-[#6E7681]">
                  {turn.divergence}%
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer legend */}
      <div className="px-4 py-3 border-t border-[#21262D] space-y-1.5">
        <p className="font-pixel text-[7px] text-[#6E7681] tracking-widest mb-2">MISMATCH</p>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1.5 rounded-full bg-[#3FB950]" />
          <span className="font-mono text-[9px] text-[#6E7681]">&lt;65% aligned</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1.5 rounded-full bg-[#F0A500]" />
          <span className="font-mono text-[9px] text-[#6E7681]">65–84% drifting</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1.5 rounded-full bg-[#FF6B6B]" />
          <span className="font-mono text-[9px] text-[#6E7681]">≥85% critical</span>
        </div>
      </div>
    </aside>
  )
}

function divergenceGradient(d) {
  if (d >= 85) return 'linear-gradient(90deg, #F0A500, #FF6B6B)'
  if (d >= 65) return 'linear-gradient(90deg, #3FB950, #F0A500)'
  return '#3FB950'
}
