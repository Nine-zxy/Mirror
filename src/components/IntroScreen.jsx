import { useState } from 'react'

// ─────────────────────────────────────────────────────────────
//  IntroScreen — Theater entrance aesthetic
//
//  Three-section vertical layout:
//    Top (40%):  Stage / curtain visual with spotlight + ASIDE title
//    Mid (35%):  Playbill — show info, cast list, premise
//    Bot (25%):  Enter button + mode selection
//
//  Palette: deep wine red #5a1a2a, gold #d4a852, dark brown #2a1a12
//  Typography: pixel font for ASIDE, serif for body text (theater playbill)
// ─────────────────────────────────────────────────────────────

const GOLD     = '#d4a852'
const GOLD_DIM = 'rgba(212,168,82,0.35)'
const WINE     = '#5a1a2a'
const WINE_DEEP = '#2a0e16'
const CREAM    = '#e8dcc8'

export default function IntroScreen({ scenario, onBegin }) {
  const [showModeSelect, setShowModeSelect] = useState(false)

  const handleSolo = () => onBegin('solo')
  const handleTogether = (proximity) => onBegin('together', proximity)

  return (
    <div className="flex flex-col h-screen overflow-hidden select-none"
      style={{ background: `linear-gradient(180deg, ${WINE_DEEP} 0%, #0a0608 40%, #0a0608 100%)` }}>

      {/* ══════════ TOP: Stage & Curtain ══════════ */}
      <div className="relative flex-[4] flex items-center justify-center overflow-hidden">

        {/* Ambient glow — warm spotlight from above */}
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse 50% 70% at 50% 20%, rgba(212,168,82,0.12) 0%, transparent 70%)`,
        }} />

        {/* Left curtain */}
        <div className="absolute left-0 top-0 bottom-0 w-[15%]" style={{
          background: `linear-gradient(90deg, ${WINE} 0%, ${WINE_DEEP} 60%, transparent 100%)`,
          borderRight: `1px solid rgba(212,168,82,0.08)`,
        }}>
          {/* Curtain fold lines */}
          <div className="absolute inset-0 opacity-20" style={{
            background: `repeating-linear-gradient(90deg, transparent, transparent 12px, rgba(0,0,0,0.3) 12px, rgba(0,0,0,0.3) 14px)`,
          }} />
          {/* Gold trim */}
          <div className="absolute right-0 top-0 bottom-0 w-px" style={{
            background: `linear-gradient(180deg, ${GOLD}40, ${GOLD}15, transparent)`,
          }} />
        </div>

        {/* Right curtain */}
        <div className="absolute right-0 top-0 bottom-0 w-[15%]" style={{
          background: `linear-gradient(-90deg, ${WINE} 0%, ${WINE_DEEP} 60%, transparent 100%)`,
          borderLeft: `1px solid rgba(212,168,82,0.08)`,
        }}>
          <div className="absolute inset-0 opacity-20" style={{
            background: `repeating-linear-gradient(90deg, transparent, transparent 12px, rgba(0,0,0,0.3) 12px, rgba(0,0,0,0.3) 14px)`,
          }} />
          <div className="absolute left-0 top-0 bottom-0 w-px" style={{
            background: `linear-gradient(180deg, ${GOLD}40, ${GOLD}15, transparent)`,
          }} />
        </div>

        {/* Top valance / pelmet */}
        <div className="absolute top-0 left-0 right-0 h-6" style={{
          background: `linear-gradient(180deg, ${WINE} 0%, transparent 100%)`,
          borderBottom: `1px solid ${GOLD}20`,
        }} />

        {/* Spotlight cone (subtle) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2" style={{
          width: '2px', height: '20px',
          background: `linear-gradient(180deg, ${GOLD}60, transparent)`,
        }} />

        {/* Center content: ASIDE title in spotlight */}
        <div className="relative flex flex-col items-center gap-3 anim-fadeIn" style={{ animationDuration: '1.5s' }}>
          <span className="font-pixel tracking-[0.5em]"
            style={{
              fontSize: '28px',
              color: GOLD,
              textShadow: `0 0 40px rgba(212,168,82,0.4), 0 0 80px rgba(212,168,82,0.15)`,
            }}>
            ASIDE
          </span>

          {/* Gold ornamental divider */}
          <div className="flex items-center gap-2">
            <div className="w-12 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}60)` }} />
            <span style={{ color: GOLD, fontSize: '8px', opacity: 0.5 }}>◆</span>
            <div className="w-12 h-px" style={{ background: `linear-gradient(-90deg, transparent, ${GOLD}60)` }} />
          </div>

          <span className="font-mono text-[10px] tracking-[0.25em]"
            style={{ color: `${GOLD}88` }}>
            DYADIC REFLECTION THEATER
          </span>
        </div>
      </div>

      {/* ══════════ MID: Playbill ══════════ */}
      <div className="relative flex-[3.5] flex flex-col items-center justify-center px-6">

        {/* Playbill card */}
        <div className="w-full max-w-md flex flex-col items-center gap-5 anim-fadeIn"
          style={{ animationDelay: '0.3s', animationDuration: '1.2s' }}>

          {/* Top gold rule */}
          <div className="w-full flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}30)` }} />
            <span className="font-mono text-[7px] tracking-[0.3em]" style={{ color: `${GOLD}55` }}>
              本场演出
            </span>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(-90deg, transparent, ${GOLD}30)` }} />
          </div>

          {/* Show title */}
          <div className="text-center">
            <p className="text-xl leading-snug" style={{
              color: CREAM,
              fontFamily: '"Noto Serif SC", "Source Han Serif CN", "PingFang SC", serif',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}>
              {scenario.title}
            </p>
            <p className="text-[12px] mt-1.5 italic" style={{
              color: `${GOLD}70`,
              fontFamily: '"Noto Serif SC", "PingFang SC", serif',
            }}>
              {scenario.subtitle}
            </p>
          </div>

          {/* Cast list */}
          <div className="flex justify-center gap-8 mt-1">
            {Object.values(scenario.personas).map(p => (
              <div key={p.id} className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full border flex items-center justify-center"
                  style={{
                    borderColor: `${p.color}50`,
                    background: `${p.color}10`,
                  }}>
                  <img
                    src={`/sprites/${p.spriteType || (p.id === 'A' ? 'female' : 'male')}/neutral.png`}
                    alt={p.name}
                    className="w-7 h-7 object-contain"
                    style={{ imageRendering: 'pixelated' }}
                    onError={e => { e.target.style.display = 'none' }}
                  />
                </div>
                <span className="text-[12px]" style={{
                  color: p.color,
                  fontFamily: '"Noto Serif SC", "PingFang SC", serif',
                }}>
                  {p.name}
                </span>
                <span className="font-mono text-[8px]" style={{ color: `${p.color}60` }}>
                  {p.label}
                </span>
              </div>
            ))}
          </div>

          {/* Premise — serif, warm, theatrical */}
          <p className="text-center text-[14px] leading-[1.9]" style={{
            color: 'rgba(232,220,200,0.55)',
            fontFamily: '"Noto Serif SC", "Source Han Serif CN", "PingFang SC", serif',
            maxWidth: '320px',
          }}>
            今晚，你们将以观众的身份<br/>
            重新目睹那段对话。
          </p>

          {/* Bottom gold rule */}
          <div className="w-full flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}20)` }} />
            <span style={{ color: GOLD, fontSize: '6px', opacity: 0.3 }}>◆</span>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(-90deg, transparent, ${GOLD}20)` }} />
          </div>
        </div>
      </div>

      {/* ══════════ BOT: Enter ══════════ */}
      <div className="relative flex-[2.5] flex flex-col items-center justify-center gap-4 pb-8">

        {!showModeSelect ? (
          <button
            onClick={() => setShowModeSelect(true)}
            className="anim-fadeIn tracking-[0.25em] px-12 py-4 rounded-sm border transition-all duration-500 cursor-pointer"
            style={{
              animationDelay: '0.6s',
              color: GOLD,
              borderColor: GOLD_DIM,
              background: 'rgba(212,168,82,0.04)',
              fontFamily: '"Noto Serif SC", "PingFang SC", serif',
              fontSize: '15px',
              letterSpacing: '0.3em',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(212,168,82,0.12)'
              e.currentTarget.style.borderColor = 'rgba(212,168,82,0.6)'
              e.currentTarget.style.boxShadow = '0 0 30px rgba(212,168,82,0.1)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(212,168,82,0.04)'
              e.currentTarget.style.borderColor = GOLD_DIM
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            入场 / ENTER
          </button>
        ) : (
          <div className="flex flex-col items-center gap-4 anim-fadeIn">
            <p className="text-[11px] tracking-[0.15em]" style={{
              color: `${GOLD}70`,
              fontFamily: '"Noto Serif SC", "PingFang SC", serif',
            }}>
              选择入场方式
            </p>
            <div className="flex gap-3">
              <ModeButton
                label="独自入场"
                sublabel="SOLO"
                desc="一台设备"
                color={GOLD}
                onClick={handleSolo}
              />
              <ModeButton
                label="双人入场"
                sublabel="同处一室"
                desc="各持设备，同一空间"
                color="#c8a878"
                onClick={() => handleTogether('colocated')}
              />
              <ModeButton
                label="双人入场"
                sublabel="远程连线"
                desc="不同地点，实时同步"
                color="#a89078"
                onClick={() => handleTogether('remote')}
              />
            </div>
            <button
              onClick={() => setShowModeSelect(false)}
              className="font-mono text-[8px] transition-colors mt-1"
              style={{ color: `${GOLD}40` }}
              onMouseEnter={e => e.currentTarget.style.color = `${GOLD}80`}
              onMouseLeave={e => e.currentTarget.style.color = `${GOLD}40`}
            >
              ← 返回
            </button>
          </div>
        )}

        {/* Controls hint — very subtle */}
        <div className="flex gap-5 font-mono text-[8px] tracking-wider" style={{ color: 'rgba(212,168,82,0.18)' }}>
          <span>SPACE 播放</span>
          <span>→ 下一幕</span>
          <span>T 切换旁白</span>
        </div>
      </div>
    </div>
  )
}

function ModeButton({ label, sublabel, desc, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 px-5 py-3.5 rounded-sm border transition-all duration-200 min-w-[120px]"
      style={{
        borderColor: `${color}25`,
        background: `${color}06`,
        fontFamily: '"Noto Serif SC", "PingFang SC", serif',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `${color}14`
        e.currentTarget.style.borderColor = `${color}50`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = `${color}06`
        e.currentTarget.style.borderColor = `${color}25`
      }}
    >
      <span className="text-[13px] tracking-wider" style={{ color }}>{label}</span>
      <span className="font-mono text-[8px] tracking-[0.15em]" style={{ color: `${color}80` }}>{sublabel}</span>
      <span className="font-mono text-[7px] mt-0.5" style={{ color: `${color}35` }}>{desc}</span>
    </button>
  )
}
