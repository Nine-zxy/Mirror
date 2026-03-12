// ─────────────────────────────────────────────────────────────
//  ReflectionOverlay — Pause point reflection UI
//
//  Two-step flow:
//    Step 1 "write"  → user writes private annotation
//    Step 2 "reveal" → system reveals both characters' hidden
//                      thoughts, making the subtext visible as
//                      the core "mirror" insight
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'

function ThoughtCard({ thought, persona }) {
  if (!thought) return null
  return (
    <div
      className="rounded-xl px-4 py-3 flex-1"
      style={{
        background:  persona.thoughtBg,
        border:      `1px solid ${persona.thoughtBorder}50`,
      }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: persona.color }} />
        <span className="font-mono text-[8px] tracking-widest" style={{ color: persona.color }}>
          {persona.name} · 内心
        </span>
      </div>
      <p
        className="text-[13px] leading-relaxed whitespace-pre-line"
        style={{
          color: 'rgba(255,255,255,0.65)',
          fontFamily: '"PingFang SC","Inter",sans-serif',
        }}
      >
        {thought.text}
      </p>
    </div>
  )
}

export default function ReflectionOverlay({
  beat, personas, annotation, onAnnotationChange, onContinue,
}) {
  const [step, setStep] = useState('write')

  const thoughtA = beat?.thoughts?.A
  const thoughtB = beat?.thoughts?.B
  const hasThoughts = thoughtA || thoughtB

  return (
    <div
      className="absolute inset-0 flex items-end justify-center z-40 anim-fadeIn"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
    >
      <div className="w-full max-w-2xl mb-8 mx-4">
        <div className="glass rounded-2xl overflow-hidden">

          {/* Header */}
          <div className="px-6 pt-5 pb-3 border-b border-white/8">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulseSoft" />
              <span className="font-mono text-[9px] tracking-[0.25em] text-white/35 uppercase">
                Reflection Point · {step === 'write' ? '01 反思' : '02 揭示'}
              </span>
            </div>
            <p
              className="text-white/65 text-[14px] leading-snug"
              style={{ fontFamily: '"PingFang SC","Inter",sans-serif' }}
            >
              {step === 'write'
                ? (beat?.reflectionPrompt || '此刻模拟暂停。在写下反思之前，你看到了什么？')
                : 'AI 推断此刻的双方内心——这是对话背后真正发生的事。'}
            </p>
          </div>

          {step === 'write' ? (
            /* ── Step 1: Write ──────────────────────────── */
            <div className="px-6 py-4 flex flex-col gap-3">
              <p className="font-mono text-[10px] text-white/30 tracking-wider">
                你的反思（暂不与对方共享）
              </p>
              <textarea
                value={annotation}
                onChange={e => onAnnotationChange(e.target.value)}
                placeholder="写下此刻你注意到的、感受到的…"
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white/80 placeholder-white/20 resize-none focus:outline-none focus:border-white/25 transition-colors"
                style={{ fontFamily: '"PingFang SC","Inter",sans-serif' }}
                autoFocus
              />
              <div className="flex justify-end">
                <button
                  onClick={() => setStep('reveal')}
                  className="font-mono text-[11px] px-5 py-2 rounded-lg border transition-all"
                  style={{
                    color:       '#7ab0e8',
                    borderColor: 'rgba(122,176,232,0.4)',
                    background:  'rgba(122,176,232,0.08)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(122,176,232,0.18)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(122,176,232,0.08)' }}
                >
                  查看内心 →
                </button>
              </div>
            </div>
          ) : (
            /* ── Step 2: Reveal hidden thoughts ─────────── */
            <div className="px-6 py-4 flex flex-col gap-4 anim-fadeIn">

              {/* User annotation */}
              {annotation.trim() && (
                <div className="rounded-lg border border-white/10 bg-white/4 px-4 py-3">
                  <p className="font-mono text-[8px] text-white/25 mb-1 tracking-widest">你的反思</p>
                  <p
                    className="text-[13px] text-white/55 leading-snug"
                    style={{ fontFamily: '"PingFang SC","Inter",sans-serif' }}
                  >
                    {annotation}
                  </p>
                </div>
              )}

              {/* Dual thought cards */}
              {hasThoughts && (
                <div>
                  <p className="font-mono text-[8px] text-white/25 tracking-widest mb-2">
                    此刻双方的内心 · AI 推断
                  </p>
                  <div className="flex gap-3">
                    {thoughtA && <ThoughtCard thought={thoughtA} persona={personas.A} />}
                    {thoughtB && <ThoughtCard thought={thoughtB} persona={personas.B} />}
                  </div>
                  <p
                    className="text-[11px] text-white/30 mt-2 leading-snug"
                    style={{ fontFamily: '"PingFang SC","Inter",sans-serif' }}
                  >
                    同一个冲突时刻，两个人经历了完全不同的内心世界。
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={onContinue}
                  className="font-mono text-[11px] px-6 py-2.5 rounded-lg border transition-all"
                  style={{
                    color:       '#90e8a8',
                    borderColor: 'rgba(144,232,168,0.35)',
                    background:  'rgba(144,232,168,0.07)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(144,232,168,0.16)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(144,232,168,0.07)' }}
                >
                  结束模拟 →
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
