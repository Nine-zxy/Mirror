import { useEffect, useState } from 'react'

// ── Subtitle Bar ──────────────────────────────────────────────
// Renders dialogue as centered movie-style subtitles.
// Speaker badge + text appear as a single pill, centered horizontally.

export default function Subtitle({ dialogue, personas }) {
  const [key, setKey] = useState(0)

  useEffect(() => {
    setKey(k => k + 1)
  }, [dialogue?.text])

  if (!dialogue) return <div className="h-14" />

  const persona = personas[dialogue.speaker]

  return (
    <div
      key={key}
      className="animate-subtitleIn w-full flex justify-center items-center px-6 pb-3 pt-1"
    >
      <div
        className="flex items-center gap-3 rounded-xl px-5 py-2.5"
        style={{
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.07)',
          maxWidth: '560px',
        }}
      >
        {/* Speaker badge */}
        <span
          className="font-mono text-[9px] tracking-[0.15em] px-2 py-0.5 rounded flex-shrink-0"
          style={{
            color:      persona.color,
            background: `${persona.color}1a`,
            border:     `1px solid ${persona.color}45`,
            textShadow: `0 0 8px ${persona.color}`,
          }}
        >
          {persona.name}
        </span>

        {/* Dialogue text */}
        <span
          className="text-white/88 text-[15px] leading-snug tracking-wide"
          style={{ fontFamily: '"Inter","PingFang SC","Microsoft YaHei",sans-serif' }}
        >
          {dialogue.text}
        </span>
      </div>
    </div>
  )
}
