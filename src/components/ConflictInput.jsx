// ─────────────────────────────────────────────────────────────
//  ConflictInput — "冲突来源" phase
//
//  First screen after intro.  User describes or pastes the
//  conflict that will be simulated.
//
//  Two input modes:
//    chat   — paste WeChat / iMessage style logs
//    story  — free description of what happened
//
//  On submit: calls generateScenario() → RSL scenario object,
//  then passes result up via onScenarioReady(scenario, rawInput).
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import { generateScenario, API_KEY_AVAILABLE } from '../utils/generateScenario'

// ── Input mode tabs ───────────────────────────────────────────
const MODES = [
  {
    id:          'chat',
    label:       '聊天记录',
    sublabel:    'Chat Log',
    icon:        '💬',
    placeholder: `粘贴聊天记录，例如：

小明 10:32
你今天为什么不回我消息？

小红 10:35
我当时在忙啊

小明 10:36
忙？发一条消息要多少时间？

小红 10:38
我说了我在忙！你能不能别总这样！`,
  },
  {
    id:          'story',
    label:       '自由描述',
    sublabel:    'Free Description',
    icon:        '✍️',
    placeholder: `用自己的话描述这次冲突……

可以包括：
• 事情的起因（什么触发了这次争吵）
• 双方说了什么
• 各自的感受
• 冲突是怎么升级的

不需要格式，想到什么写什么。`,
  },
]

// ── Processing steps display ──────────────────────────────────
const STEPS = [
  { label: '解析冲突结构',  sub: 'Parsing conflict structure' },
  { label: '提取对话节点',  sub: 'Extracting dialogue beats' },
  { label: '建模内心世界',  sub: 'Modelling inner states' },
  { label: '生成模拟场景',  sub: 'Generating simulation' },
]

function ProcessingOverlay({ step, source }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 anim-fadeIn"
      style={{ background: 'rgba(0,0,0,0.92)' }}>

      {/* Animated dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: '#7ab0e8',
            animation: `blink 1.1s ${i * 0.28}s ease-in-out infinite`,
          }} />
        ))}
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-2 w-64">
        {STEPS.map((s, i) => {
          const done    = i < step
          const active  = i === step
          return (
            <div key={i} className="flex items-center gap-3 transition-all duration-500" style={{
              opacity: done ? 0.4 : active ? 1 : 0.2,
            }}>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                background: done ? '#58c878' : active ? '#7ab0e8' : 'rgba(255,255,255,0.2)',
                boxShadow:  active ? '0 0 8px #7ab0e8' : 'none',
                transition: 'all 0.4s',
              }} />
              <div>
                <div className="font-mono text-[10px]" style={{
                  color: active ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)',
                }}>
                  {s.label}
                </div>
                <div className="font-mono text-[7px] text-white/22">{s.sub}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Source badge */}
      {source && (
        <div className="font-mono text-[8px] px-3 py-1 rounded-full anim-fadeIn" style={{
          background: source === 'ai'
            ? 'rgba(122,176,232,0.12)'
            : 'rgba(255,255,255,0.06)',
          border: `1px solid ${source === 'ai' ? 'rgba(122,176,232,0.3)' : 'rgba(255,255,255,0.1)'}`,
          color: source === 'ai' ? '#7ab0e8' : 'rgba(255,255,255,0.35)',
        }}>
          {source === 'ai' ? '✦ Claude AI 分析' : '模板重建'}
        </div>
      )}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────
export default function ConflictInput({ onScenarioReady }) {
  const [mode, setMode]       = useState('chat')
  const [text, setText]       = useState('')
  const [processing, setProcessing] = useState(false)
  const [step, setStep]       = useState(0)
  const [source, setSource]   = useState(null)
  const [error, setError]     = useState(null)

  const currentMode = MODES.find(m => m.id === mode)
  const canSubmit   = text.trim().length > 20

  // Animate through steps while waiting
  const animateSteps = () => {
    let s = 0
    const interval = setInterval(() => {
      s += 1
      setStep(s)
      if (s >= STEPS.length - 1) clearInterval(interval)
    }, 420)
    return () => clearInterval(interval)
  }

  const handleSubmit = async () => {
    if (!canSubmit || processing) return
    setProcessing(true)
    setError(null)
    setStep(0)

    const clearAnim = animateSteps()

    try {
      const { scenario, source: src } = await generateScenario(text)
      clearAnim()
      setSource(src)
      setStep(STEPS.length)                // all done

      // brief pause so user sees completion
      await new Promise(r => setTimeout(r, 600))
      onScenarioReady(scenario, text)
    } catch (err) {
      clearAnim()
      setProcessing(false)
      setStep(0)
      setError('分析失败，请检查输入后重试。')
      console.error('[Mirror] generateScenario error:', err)
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-black overflow-auto py-8 px-6">

      {/* Subtle grid */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: [
          'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
        ].join(','),
        backgroundSize: '44px 44px',
      }} />

      <div className="relative w-full max-w-xl flex flex-col gap-5 anim-fadeIn">

        {/* Header */}
        <div className="text-center flex flex-col gap-1">
          <span className="font-pixel text-[8px] tracking-[0.35em]" style={{ color: '#7ab0e8' }}>
            MIRROR
          </span>
          <div className="w-12 h-px mx-auto my-1" style={{
            background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)',
          }} />
          <p className="font-mono text-[10px] text-white/30 tracking-[0.2em]">
            输入冲突 / INPUT CONFLICT
          </p>
          <p className="text-sm mt-1" style={{
            color: 'rgba(255,255,255,0.38)',
            fontFamily: '"PingFang SC","Inter",sans-serif',
          }}>
            描述或粘贴你们的冲突 — AI 将重建这段对话的轨迹。
          </p>

          {/* API mode badge */}
          <div className="flex justify-center mt-1">
            <span className="font-mono text-[8px] px-2 py-0.5 rounded-full" style={{
              background: API_KEY_AVAILABLE
                ? 'rgba(122,176,232,0.1)'
                : 'rgba(255,255,255,0.05)',
              border: `1px solid ${API_KEY_AVAILABLE ? 'rgba(122,176,232,0.25)' : 'rgba(255,255,255,0.1)'}`,
              color: API_KEY_AVAILABLE ? '#7ab0e8' : 'rgba(255,255,255,0.25)',
            }}>
              {API_KEY_AVAILABLE ? '✦ Claude AI 已连接' : '模板模式 · 配置 .env.local 启用 AI'}
            </span>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-2">
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id); setError(null) }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all"
              style={{
                background:  mode === m.id ? 'rgba(122,176,232,0.1)' : 'rgba(255,255,255,0.03)',
                border:      `1px solid ${mode === m.id ? 'rgba(122,176,232,0.35)' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              <span className="text-[12px]">{m.icon}</span>
              <div className="text-left">
                <div className="font-mono text-[10px]" style={{
                  color: mode === m.id ? '#7ab0e8' : 'rgba(255,255,255,0.4)',
                }}>
                  {m.label}
                </div>
                <div className="font-mono text-[7px] text-white/22">{m.sublabel}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Text input area */}
        <div className="relative">
          <textarea
            value={text}
            onChange={e => { setText(e.target.value); setError(null) }}
            placeholder={currentMode.placeholder}
            rows={12}
            className="w-full rounded-xl px-4 py-3.5 text-sm resize-none focus:outline-none transition-colors"
            style={{
              background:   'rgba(255,255,255,0.04)',
              border:       `1px solid ${text.length > 20 ? 'rgba(122,176,232,0.25)' : 'rgba(255,255,255,0.1)'}`,
              color:        'rgba(255,255,255,0.78)',
              fontFamily:   '"PingFang SC","JetBrains Mono","Inter",monospace',
              fontSize:     '13px',
              lineHeight:   '1.65',
              caretColor:   '#7ab0e8',
              transition:   'border-color 0.2s',
            }}
          />
          {/* Char count */}
          <div className="absolute bottom-3 right-4 font-mono text-[8px]" style={{
            color: text.length > 20 ? 'rgba(122,176,232,0.5)' : 'rgba(255,255,255,0.18)',
          }}>
            {text.length} 字
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="font-mono text-[10px] text-center py-2 rounded-lg anim-fadeIn" style={{
            color:      '#e87a7a',
            background: 'rgba(232,122,122,0.08)',
            border:     '1px solid rgba(232,122,122,0.2)',
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || processing}
            className="font-mono text-[12px] tracking-[0.2em] px-10 py-3.5 rounded-xl border transition-all duration-300"
            style={{
              color:       canSubmit ? '#7ab0e8' : 'rgba(255,255,255,0.2)',
              borderColor: canSubmit ? 'rgba(122,176,232,0.4)' : 'rgba(255,255,255,0.08)',
              background:  canSubmit ? 'rgba(122,176,232,0.07)' : 'transparent',
              cursor:      canSubmit ? 'pointer' : 'not-allowed',
            }}
            onMouseEnter={e => {
              if (!canSubmit) return
              e.currentTarget.style.background  = 'rgba(122,176,232,0.15)'
              e.currentTarget.style.borderColor = 'rgba(122,176,232,0.7)'
            }}
            onMouseLeave={e => {
              if (!canSubmit) return
              e.currentTarget.style.background  = 'rgba(122,176,232,0.07)'
              e.currentTarget.style.borderColor = 'rgba(122,176,232,0.4)'
            }}
          >
            {processing ? '分析中…' : '开始分析 / ANALYSE'}
          </button>
        </div>

        {/* Hint */}
        <p className="text-center font-mono text-[8px] text-white/18">
          输入至少 20 字 · 支持中英文 · 内容仅用于本地分析
        </p>

      </div>

      {/* Processing overlay */}
      {processing && (
        <ProcessingOverlay step={step} source={source} />
      )}

    </div>
  )
}
