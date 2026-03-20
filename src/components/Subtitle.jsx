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
  const isA = dialogue.speaker === 'A'
  // Use pixel dialogue box assets — blue box for A, red box for B
  const dialogueBoxImg = isA
    ? '/assets/ui/dialogue/blue box.png'
    : '/assets/ui/dialogue/red box.png'

  return (
    <div className="relative flex-shrink-0 flex items-center justify-center" style={{
      height: '130px',
      background: 'transparent',
    }}>
      {/* Pixel dialogue box as background frame — 9-slice style stretch */}
      <div className="absolute inset-x-4 inset-y-1 pointer-events-none" style={{
        backgroundImage: `url("${dialogueBoxImg}")`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        opacity: 0.85,
      }} />

      {/* Speaker name tab — sits on top-left of the box */}
      <div className="absolute top-0 left-8 -translate-y-1/2 z-[2]">
        <div className="px-3 py-1 font-mono text-[13px] tracking-[0.15em]" style={{
          background: '#060810',
          border: `2px solid ${speakerColor}`,
          borderRadius: '4px',
          color: speakerColor,
          imageRendering: 'pixelated',
        }}>
          {persona?.name || '???'}
        </div>
      </div>

      {/* Dialogue content — centered over the box */}
      <div className="h-full flex flex-col items-center justify-center px-12 py-4 relative z-[1]">
        <p className="text-[20px] leading-[1.75] tracking-wide text-center" style={{
          color: 'rgba(255,255,255,0.93)',
          fontFamily: '"PingFang SC","Inter","Microsoft YaHei",sans-serif',
          textShadow: '0 1px 8px rgba(0,0,0,0.5)',
        }}>
          {displayText}
          {!isComplete && (
            <span className="inline-block w-[2px] h-[18px] ml-0.5 align-middle" style={{
              background: speakerColor,
              animation: 'blink 0.8s step-end infinite',
            }} />
          )}
        </p>

        {/* Continue indicator */}
        {isComplete && (
          <div className="absolute bottom-4 right-10 font-mono text-[12px] tracking-wider anim-fadeIn" style={{
            color: 'rgba(255,255,255,0.25)',
            animation: 'blink 1.5s ease-in-out infinite',
          }}>
            ▼
          </div>
        )}
      </div>
    </div>
  )
}
