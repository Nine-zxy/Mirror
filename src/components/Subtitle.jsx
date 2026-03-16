import { useEffect, useState, useRef } from 'react'

// ─────────────────────────────────────────────────────────────
//  Subtitle — RPG-style bottom dialogue box
//
//  ┌─ 小美 ──────────────────────────────────────┐
//  │                                              │
//  │  你为什么不回我消息？我等了一整天。             │
//  │                                              │
//  │                          ▼ 点击继续           │
//  └──────────────────────────────────────────────┘
//
//  Features:
//    • Fixed at bottom, ~140px height
//    • Dark translucent background + thin bright border
//    • Speaker name colored badge (A=blue, B=red)
//    • Typewriter text reveal (40ms/char for Chinese)
//    • Blinking "▼" continue indicator
// ─────────────────────────────────────────────────────────────

export default function Subtitle({ dialogue, personas }) {
  const [displayText, setDisplayText] = useState('')
  const [isComplete, setIsComplete]   = useState(false)
  const prevTextRef = useRef('')

  useEffect(() => {
    if (!dialogue?.text) {
      setDisplayText('')
      setIsComplete(false)
      prevTextRef.current = ''
      return
    }

    // Same text — skip animation
    if (dialogue.text === prevTextRef.current) return
    prevTextRef.current = dialogue.text

    // Typewriter effect
    setDisplayText('')
    setIsComplete(false)
    let i = 0
    const iv = setInterval(() => {
      i++
      setDisplayText(dialogue.text.slice(0, i))
      if (i >= dialogue.text.length) {
        clearInterval(iv)
        setIsComplete(true)
      }
    }, 40)
    return () => clearInterval(iv)
  }, [dialogue?.text])

  if (!dialogue) {
    return <div style={{ height: '110px', flexShrink: 0 }} />
  }

  const persona = personas[dialogue.speaker]
  const speakerColor = persona?.color || '#7ab0e8'

  return (
    <div className="relative flex-shrink-0" style={{
      height: '110px',
      background: 'rgba(8,10,20,0.88)',
      backdropFilter: 'blur(12px)',
      borderTop: `1px solid rgba(255,255,255,0.12)`,
    }}>
      {/* Subtle top glow line */}
      <div className="absolute top-0 left-[15%] right-[15%] h-px" style={{
        background: `linear-gradient(90deg, transparent, ${speakerColor}30, transparent)`,
      }} />

      {/* Speaker name tab */}
      <div className="absolute top-0 left-6 -translate-y-full">
        <div className="px-3 py-1 rounded-t-md font-mono text-[10px] tracking-[0.15em]" style={{
          background: 'rgba(8,10,20,0.92)',
          borderTop: `1.5px solid ${speakerColor}80`,
          borderLeft: `1.5px solid ${speakerColor}80`,
          borderRight: `1.5px solid ${speakerColor}80`,
          color: speakerColor,
          textShadow: `0 0 12px ${speakerColor}, 0 0 4px ${speakerColor}80`,
        }}>
          {persona?.name || '???'}
        </div>
      </div>

      {/* Dialogue content */}
      <div className="h-full flex flex-col justify-center px-8 py-4">
        <p className="text-[18px] leading-[1.75] tracking-wide" style={{
          color: 'rgba(255,255,255,0.93)',
          fontFamily: '"PingFang SC","Inter","Microsoft YaHei",sans-serif',
          textShadow: '0 1px 8px rgba(0,0,0,0.5)',
        }}>
          {displayText}
          {!isComplete && (
            <span className="inline-block w-[2px] h-[16px] ml-0.5 align-middle" style={{
              background: speakerColor,
              animation: 'blink 0.8s step-end infinite',
            }} />
          )}
        </p>

        {/* Continue indicator */}
        {isComplete && (
          <div className="absolute bottom-3 right-6 font-mono text-[10px] tracking-wider anim-fadeIn" style={{
            color: 'rgba(255,255,255,0.25)',
            animation: 'blink 1.5s ease-in-out infinite',
          }}>
            ▼
          </div>
        )}
      </div>

      {/* Corner decorations */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t border-l" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <div className="absolute top-2 right-2 w-3 h-3 border-t border-r" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
    </div>
  )
}
