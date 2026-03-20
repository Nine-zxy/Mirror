import { useState } from 'react'

// ─────────────────────────────────────────────────────────────
//  IntroScreen — Deep blue theater entrance (v3)
//
//  Single centered column, deep blue gradient full page.
//  No character avatars. No show title. ASIDE IS the show.
//  Typography: ASIDE large pixel font, blue glow.
//  Serif Chinese prompt. Blue ornamental divider.
//  Side curtain panels: dark blue edge gradients.
// ─────────────────────────────────────────────────────────────

const BLUE     = '#7ab0e8'
const BLUE_DIM = 'rgba(122,176,232,0.35)'
const CREAM    = '#e8dcc8'

export default function IntroScreen({ scenario, onBegin }) {
  const [showModeSelect, setShowModeSelect] = useState(false)

  const handleSolo = () => onBegin('solo')
  const handleTogether = (proximity) => onBegin('together', proximity)

  return (
    <div className="relative h-screen overflow-y-auto select-none"
      style={{ background: 'linear-gradient(180deg, #0a1628 0%, #060d18 50%, #040810 100%)' }}>

      {/* ══════════ Full-height curtain panels ══════════ */}
      {/* Left curtain */}
      <div className="fixed left-0 top-0 bottom-0 w-[13%] z-0 pointer-events-none" style={{
        background: 'linear-gradient(90deg, #0d1a30 0%, transparent 100%)',
      }} />

      {/* Right curtain */}
      <div className="fixed right-0 top-0 bottom-0 w-[13%] z-0 pointer-events-none" style={{
        background: 'linear-gradient(-90deg, #0d1a30 0%, transparent 100%)',
      }} />

      {/* ══════════ Content — single scrollable column ══════════ */}
      <div className="relative z-[1] flex flex-col items-center px-6 pt-16 pb-10 min-h-screen justify-center gap-8">

        {/* ── ASIDE logo with spotlight ── */}
        <div className="relative flex flex-col items-center gap-3 anim-fadeIn" style={{ animationDuration: '1.5s' }}>

          {/* Radial spotlight cone behind logo — blue tint */}
          <div className="absolute inset-0 -top-24 -bottom-20 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 140px 180px at 50% 40%, rgba(122,176,232,0.15) 0%, rgba(122,176,232,0.04) 40%, transparent 70%)',
          }} />

          <span className="font-pixel tracking-[0.5em] relative"
            style={{
              fontSize: '28px',
              color: BLUE,
              textShadow: '0 0 40px rgba(122,176,232,0.4), 0 0 80px rgba(122,176,232,0.15)',
            }}>
            ASIDE
          </span>

          <span className="font-mono text-[10px] tracking-[0.25em]"
            style={{ color: 'rgba(122,176,232,0.50)' }}>
            DYADIC REFLECTION THEATER
          </span>
        </div>

        {/* ── Thin blue ornamental divider ── */}
        <div className="flex items-center gap-2 anim-fadeIn" style={{ animationDelay: '0.2s', animationDuration: '1.2s' }}>
          <div className="w-16 h-px" style={{ background: `linear-gradient(90deg, transparent, ${BLUE}50)` }} />
          <span style={{ color: BLUE, fontSize: '6px', opacity: 0.4 }}>&#9670;</span>
          <div className="w-16 h-px" style={{ background: `linear-gradient(-90deg, transparent, ${BLUE}50)` }} />
        </div>

        {/* ── Serif Chinese prompt ── */}
        <div className="text-center anim-fadeIn" style={{ animationDelay: '0.35s', animationDuration: '1.2s' }}>
          <p className="text-[15px] leading-[2.0]" style={{
            color: CREAM,
            fontFamily: '"Noto Serif SC", "Source Han Serif CN", "PingFang SC", serif',
            fontWeight: 400,
            letterSpacing: '0.08em',
          }}>
            今晚，你们将以观众的身份<br/>
            重新目睹那段对话。
          </p>
        </div>

        {/* ── Enter / Mode selection ── */}
        <div className="flex flex-col items-center gap-4">

          {!showModeSelect ? (
            <button
              onClick={() => setShowModeSelect(true)}
              className="anim-fadeIn tracking-[0.25em] px-12 py-4 rounded-sm border transition-all duration-500 cursor-pointer"
              style={{
                animationDelay: '0.6s',
                color: BLUE,
                borderColor: BLUE_DIM,
                background: 'rgba(122,176,232,0.04)',
                fontFamily: '"Noto Serif SC", "PingFang SC", serif',
                fontSize: '15px',
                letterSpacing: '0.3em',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(122,176,232,0.12)'
                e.currentTarget.style.borderColor = 'rgba(122,176,232,0.6)'
                e.currentTarget.style.boxShadow = '0 0 30px rgba(122,176,232,0.1)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(122,176,232,0.04)'
                e.currentTarget.style.borderColor = BLUE_DIM
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              入场 / ENTER
            </button>
          ) : (
            <div className="flex flex-col items-center gap-4 anim-fadeIn">
              <p className="text-[11px] tracking-[0.15em]" style={{
                color: `${BLUE}70`,
                fontFamily: '"Noto Serif SC", "PingFang SC", serif',
              }}>
                选择入场方式
              </p>
              <div className="flex gap-3">
                <ModeButton
                  label="独自入场"
                  sublabel="SOLO"
                  desc="一台设备"
                  color={BLUE}
                  onClick={handleSolo}
                />
                <ModeButton
                  label="双人入场"
                  sublabel="同处一室"
                  desc="各持设备，同一空间"
                  color="#88b8e8"
                  onClick={() => handleTogether('colocated')}
                />
                <ModeButton
                  label="双人入场"
                  sublabel="远程连线"
                  desc="不同地点，实时同步"
                  color="#6898c8"
                  onClick={() => handleTogether('remote')}
                />
              </div>
              <button
                onClick={() => setShowModeSelect(false)}
                className="font-mono text-[8px] transition-colors mt-1"
                style={{ color: `${BLUE}40` }}
                onMouseEnter={e => e.currentTarget.style.color = `${BLUE}80`}
                onMouseLeave={e => e.currentTarget.style.color = `${BLUE}40`}
              >
                ← 返回
              </button>
            </div>
          )}

          {/* Controls hint — very subtle */}
          <div className="flex gap-5 font-mono text-[8px] tracking-wider" style={{ color: 'rgba(122,176,232,0.18)' }}>
            <span>SPACE 播放</span>
            <span>→ 下一幕</span>
            <span>T 切换旁白</span>
          </div>
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
