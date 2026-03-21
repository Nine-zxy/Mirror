// ─────────────────────────────────────────────────────────────
//  ConflictInput — conflict input + archetype selection
//
//  Phase flow handled here:
//    1. User enters chat log + concerns + context
//    2. User selects relationship type + communication styles (archetype)
//    3. Optional: appearance micro-customization
//    4. Submit → callGeminiCalibration() → show CalibrationOverlay
//    5. Calibration confirmed → generateScenario() → onScenarioReady
//
//  Input formats supported:
//    wechat-html-native / wechat-html-tool / wechat-txt / wechat-copy
//    simple-colon / freetext
// ─────────────────────────────────────────────────────────────

import { useState, useCallback, useRef, useEffect } from 'react'
import { generateScenario, callGeminiCalibration, API_KEY_AVAILABLE } from '../utils/generateScenario'
import { parseChatLog, FORMAT_LABELS } from '../utils/parseChatLog'
import { RELATIONSHIP_TYPES, COMM_STYLES, APPEARANCE_OPTIONS, DEFAULT_APPEARANCE } from '../data/dramaElements'
import CalibrationOverlay from './CalibrationOverlay'
import { useSyncContext } from '../sync/SyncContext'

// ── Processing steps ─────────────────────────────────────────
const STEPS = [
  { label: '解析对话',    sub: 'Parsing dialogue' },
  { label: '校准行为',    sub: 'Calibrating behavior patterns' },
  { label: '提取脉络',    sub: 'Extracting narrative arc' },
  { label: '重构内心',    sub: 'Reconstructing inner states' },
  { label: '生成场景',    sub: 'Building scene' },
]

// ── Format badge colours ──────────────────────────────────────
const FORMAT_COLORS = {
  'wechat-html-native': '#60c878',
  'wechat-html-tool':   '#60c878',
  'wechat-txt':         '#7ab0e8',
  'wechat-copy':        '#7ab0e8',
  'simple-colon':       '#c080e8',
  'freetext':           '#888',
  'empty':              '#555',
}

// ── How-to guide ─────────────────────────────────────────────
const HOW_TO = [
  {
    title: '微信PC端（推荐）',
    steps: [
      '打开对话，按住 Ctrl 点击多条消息（或全选后 Ctrl+A）',
      '右键 → 合并转发 → 发给「文件传输助手」',
      '在文件传输助手中右键合并消息 → 另存为 → 保存 HTML 文件',
      '将 HTML 文件拖入左侧区域',
    ],
  },
  {
    title: '微信PC端（TXT方式）',
    steps: [
      '菜单 → 设置 → 通用 → 聊天记录 → 备份与恢复 → 迁移',
      '或在聊天窗口右上角「…」→ 查找聊天内容 → 多选 → 复制',
      '直接粘贴到右侧文本框',
    ],
  },
  {
    title: '手机端',
    steps: [
      '长按任意消息 → 点击「更多」',
      '勾选需要的多条消息',
      '点击「复制」',
      '粘贴到右侧文本框',
    ],
  },
]

// ─────────────────────────────────────────────────────────────
//  Sub-components
// ─────────────────────────────────────────────────────────────

function ProcessingOverlay({ step, source }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 anim-fadeIn z-50"
      style={{ background: 'rgba(0,0,0,0.94)' }}>
      <div className="flex gap-2">
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: '#7ab0e8',
            animation: `blink 1.1s ${i * 0.28}s ease-in-out infinite`,
          }} />
        ))}
      </div>
      <div className="flex flex-col gap-2 w-64">
        {STEPS.map((s, i) => {
          const done   = i < step
          const active = i === step
          return (
            <div key={i} className="flex items-center gap-3 transition-all duration-500"
              style={{ opacity: done ? 0.4 : active ? 1 : 0.2 }}>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                background:  done ? '#58c878' : active ? '#7ab0e8' : 'rgba(255,255,255,0.15)',
                boxShadow:   active ? '0 0 8px #7ab0e8' : 'none',
                transition:  'all 0.4s',
              }} />
              <div>
                <div className="font-mono text-[15px]" style={{
                  color: active ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)',
                }}>
                  {s.label}
                </div>
                <div className="font-mono text-[11px] text-white/22">{s.sub}</div>
              </div>
            </div>
          )
        })}
      </div>
      {source && (
        <div className="font-mono text-[12px] px-3 py-1 rounded-full anim-fadeIn" style={{
          background: source === 'ai' ? 'rgba(122,176,232,0.12)' : 'rgba(255,255,255,0.06)',
          border:     `1px solid ${source === 'ai' ? 'rgba(122,176,232,0.3)' : 'rgba(255,255,255,0.1)'}`,
          color:      source === 'ai' ? '#7ab0e8' : 'rgba(255,255,255,0.35)',
        }}>
          {source === 'ai' ? '✦ 场景重构完成' : '模板重建'}
        </div>
      )}
    </div>
  )
}

function HowToGuide() {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl overflow-hidden" style={{
      background: 'rgba(255,255,255,0.025)',
      border:     '1px solid rgba(255,255,255,0.06)',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 transition-all"
        style={{ color: 'rgba(255,255,255,0.4)' }}
      >
        <span className="font-mono text-[14px] tracking-widest">如何导出微信聊天记录？</span>
        <span className="font-mono text-[15px]" style={{
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.25s',
          display: 'inline-block',
        }}>▾</span>
      </button>
      {open && (
        <div className="px-4 pb-4 flex flex-col gap-4 anim-fadeIn">
          {HOW_TO.map((section, si) => (
            <div key={si}>
              <div className="font-mono text-[14px] mb-1.5" style={{ color: '#7ab0e8' }}>
                {section.title}
              </div>
              <ol className="flex flex-col gap-1">
                {section.steps.map((step, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-mono text-[12px] text-white/28 flex-shrink-0 mt-0.5">{i + 1}.</span>
                    <span className="font-mono text-[14px] text-white/45 leading-snug">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FileDropZone({ onFile, isDragging, setIsDragging }) {
  const inputRef = useRef(null)

  const handleFiles = (files) => {
    const file = files[0]
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['html', 'htm', 'txt'].includes(ext)) {
      alert('请上传 .html / .htm / .txt 格式的文件')
      return
    }
    const reader = new FileReader()
    reader.onload = e => onFile(e.target.result, file.name)
    reader.readAsText(file, 'utf-8')
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }, []) // eslint-disable-line

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDrop={onDrop}
      onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      className="flex flex-col items-center justify-center gap-3 rounded-xl cursor-pointer"
      style={{
        height: '130px',
        background: isDragging ? 'rgba(122,176,232,0.1)' : 'rgba(255,255,255,0.025)',
        border: `1.5px dashed ${isDragging ? 'rgba(122,176,232,0.6)' : 'rgba(255,255,255,0.12)'}`,
        transition: 'all 0.2s',
      }}
    >
      <div className="text-[28px]" style={{ opacity: isDragging ? 1 : 0.5 }}>
        {isDragging ? '📂' : '📁'}
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="font-mono text-[15px]" style={{ color: isDragging ? '#7ab0e8' : 'rgba(255,255,255,0.4)' }}>
          拖入聊天记录文件
        </span>
        <span className="font-mono text-[12px] text-white/22">
          支持 .html · .htm · .txt（微信导出格式）
        </span>
      </div>
      <input ref={inputRef} type="file" accept=".html,.htm,.txt" className="hidden"
        onChange={e => handleFiles(e.target.files)} />
    </div>
  )
}

// ── Relationship type card ───────────────────────────────────
function RelTypeCard({ type, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(type.id)}
      className="flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all"
      style={{
        background: selected ? 'rgba(122,176,232,0.12)' : 'rgba(255,255,255,0.03)',
        border: `1.5px solid ${selected ? 'rgba(122,176,232,0.5)' : 'rgba(255,255,255,0.07)'}`,
        transform: selected ? 'scale(1.03)' : 'scale(1)',
        cursor: 'pointer',
      }}
    >
      <span style={{ fontSize: '18px' }}>{type.icon}</span>
      <span className="font-mono text-[14px]" style={{
        color: selected ? '#7ab0e8' : 'rgba(255,255,255,0.45)',
      }}>
        {type.label}
      </span>
    </button>
  )
}

// ── Communication style checkbox ─────────────────────────────
function StyleCheckbox({ style, selected, onToggle, accentColor }) {
  return (
    <button
      onClick={() => onToggle(style.id)}
      className="w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all"
      style={{
        background: selected ? `${accentColor}12` : 'rgba(255,255,255,0.025)',
        border: `1px solid ${selected ? accentColor + '50' : 'rgba(255,255,255,0.07)'}`,
        cursor: 'pointer',
      }}
    >
      {/* Checkbox indicator */}
      <div className="flex-shrink-0 w-3.5 h-3.5 rounded mt-0.5 flex items-center justify-center"
        style={{
          background: selected ? accentColor : 'transparent',
          border: `1.5px solid ${selected ? accentColor : 'rgba(255,255,255,0.2)'}`,
          transition: 'all 0.15s',
        }}
      >
        {selected && (
          <svg width="8" height="6" viewBox="0 0 8 6">
            <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </svg>
        )}
      </div>
      <div className="min-w-0">
        <div className="text-[16px] font-medium" style={{ color: selected ? '#e8e8e8' : 'rgba(255,255,255,0.55)' }}>
          {style.label}
        </div>
        <div className="text-[15px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {style.desc}
        </div>
      </div>
    </button>
  )
}

// ── Archetype section ─────────────────────────────────────────
// singleColumn: in Together mode, each person only picks their OWN style
function ArchetypeSection({ relationshipType, setRelationshipType, styleA, setStyleA, styleB, setStyleB, nameA, nameB, singleColumn = false }) {
  const A_COLOR = '#7ab0e8'
  const B_COLOR = '#e87a7a'

  const toggleStyle = (setter, current, id) => {
    setter(prev => prev.includes(id)
      ? prev.filter(s => s !== id)
      : [...prev, id]
    )
  }

  return (
    <div className="flex flex-col gap-4" style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '12px',
      padding: '16px',
    }}>
      {/* Section header */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[14px] tracking-[0.15em] text-white/30">关系设定 *</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <span className="font-mono text-[12px]" style={{ color: 'rgba(255,255,255,0.18)' }}>ARCHETYPE</span>
      </div>

      {/* Relationship type */}
      <div>
        <p className="font-mono text-[12px] text-white/25 mb-2">你们是：</p>
        <div className="flex gap-2">
          {RELATIONSHIP_TYPES.map(type => (
            <RelTypeCard
              key={type.id}
              type={type}
              selected={relationshipType === type.id}
              onSelect={setRelationshipType}
            />
          ))}
        </div>
      </div>

      {/* Communication styles */}
      <div>
        <p className="font-mono text-[12px] text-white/25 mb-2">
          {singleColumn ? '你的沟通风格（选 1-2 个）：' : '沟通风格投票（各选 1-2 个）：'}
        </p>

        {singleColumn ? (
          /* Together mode: single column for own style */
          <div>
            <div className="font-mono text-[12px] mb-2" style={{ color: A_COLOR }}>
              我更像
            </div>
            <div className="flex flex-col gap-1.5">
              {COMM_STYLES.map(s => (
                <StyleCheckbox
                  key={s.id}
                  style={s}
                  selected={styleA.includes(s.id)}
                  onToggle={(id) => toggleStyle(setStyleA, styleA, id)}
                  accentColor={A_COLOR}
                />
              ))}
            </div>
            <p className="font-mono text-[12px] text-white/18 mt-2">
              * 对方正在另一台设备上选择 TA 自己的风格。
            </p>
          </div>
        ) : (
          /* Solo mode: dual columns */
          <div className="flex gap-3">
            {/* A column */}
            <div className="flex-1">
              <div className="font-mono text-[12px] mb-2" style={{ color: A_COLOR }}>
                {nameA || 'TA（A）'} 更像
              </div>
              <div className="flex flex-col gap-1.5">
                {COMM_STYLES.map(s => (
                  <StyleCheckbox
                    key={s.id}
                    style={s}
                    selected={styleA.includes(s.id)}
                    onToggle={(id) => toggleStyle(setStyleA, styleA, id)}
                    accentColor={A_COLOR}
                  />
                ))}
              </div>
            </div>
            {/* Divider */}
            <div className="w-px self-stretch" style={{ background: 'rgba(255,255,255,0.05)' }} />
            {/* B column */}
            <div className="flex-1">
              <div className="font-mono text-[12px] mb-2" style={{ color: B_COLOR }}>
                {nameB || 'TA（B）'} 更像
              </div>
              <div className="flex flex-col gap-1.5">
                {COMM_STYLES.map(s => (
                  <StyleCheckbox
                    key={s.id}
                    style={s}
                    selected={styleB.includes(s.id)}
                    onToggle={(id) => toggleStyle(setStyleB, styleB, id)}
                    accentColor={B_COLOR}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {!singleColumn && (
          <p className="font-mono text-[12px] text-white/18 mt-2">
            * 这不是性格测试，而是场景重构的角色锚点，也是你对对方的第一次「标注」。
          </p>
        )}
      </div>
    </div>
  )
}

// ── Together-mode waiting overlay ─────────────────────────────
function WaitingOverlay({ partnerReady, generating, role }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 anim-fadeIn z-50"
      style={{ background: 'rgba(0,0,0,0.92)' }}>
      <div className="flex flex-col items-center gap-3">
        {/* Status dots */}
        <div className="flex gap-4 items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{
              background: '#58c878',
              boxShadow: '0 0 8px rgba(88,200,120,0.5)',
            }} />
            <span className="font-mono text-[12px] text-white/40">你</span>
          </div>
          <div className="w-8 h-px" style={{
            background: partnerReady
              ? 'linear-gradient(90deg, rgba(88,200,120,0.5), rgba(88,200,120,0.5))'
              : 'linear-gradient(90deg, rgba(88,200,120,0.5), rgba(255,255,255,0.1))',
          }} />
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{
              background: partnerReady ? '#58c878' : 'rgba(255,255,255,0.15)',
              boxShadow: partnerReady ? '0 0 8px rgba(88,200,120,0.5)' : 'none',
              animation: partnerReady ? 'none' : 'pulse 2s ease-in-out infinite',
            }} />
            <span className="font-mono text-[12px] text-white/40">对方</span>
          </div>
        </div>

        {/* Status text */}
        <div className="font-mono text-[16px] text-white/60 mt-2">
          {generating
            ? (role === 'A' ? '正在合并生成场景…' : '对方正在生成场景…')
            : partnerReady
              ? '双方就绪，即将开始…'
              : '等待对方完成输入…'}
        </div>
        <div className="font-mono text-[12px] text-white/25">
          {generating
            ? 'GENERATING SCENARIO'
            : partnerReady
              ? 'BOTH READY'
              : 'WAITING FOR PARTNER'}
        </div>

        {/* Loading animation */}
        {(!partnerReady || generating) && (
          <div className="flex gap-2 mt-2">
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: generating ? '#7ab0e8' : 'rgba(255,255,255,0.3)',
                animation: `blink 1.1s ${i * 0.28}s ease-in-out infinite`,
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  Main export
// ─────────────────────────────────────────────────────────────
export default function ConflictInput({ onScenarioReady, syncMode, skipGeneration = false }) {
  const sync = useSyncContext()
  const isTogether = syncMode === 'together'
  const [rawText,     setRawText]     = useState('')
  const [parsedText,  setParsedText]  = useState('')
  const [detectedFmt, setDetectedFmt] = useState(null)
  const [fileName,    setFileName]    = useState(null)
  const [isDragging,  setIsDragging]  = useState(false)
  const [processing,  setProcessing]  = useState(false)
  const [step,        setStep]        = useState(0)
  const [source,      setSource]      = useState(null)
  const [error,       setError]       = useState(null)

  // Core concerns + context
  const [concernA,   setConcernA]   = useState('')   // "你最想让对方理解的是什么？"
  const [feeling,    setFeeling]    = useState('')   // "你当时最强烈的感受是什么？"
  const [context,    setContext]     = useState('')

  // Role identification (which person in the chat log is the user)
  const [userRole,   setUserRole]   = useState(null) // 'A' or 'B' (mapped to detected names)

  // Archetype selections
  const [relationshipType, setRelationshipType] = useState(null)
  const [styleA,   setStyleA]   = useState([])
  const [styleB,   setStyleB]   = useState([])

  // Together mode state
  const [submitted,      setSubmitted]      = useState(false)   // own input submitted
  const [partnerReady,   setPartnerReady]   = useState(false)   // partner has submitted
  const [generating,     setGenerating]     = useState(false)   // merged → generating scenario

  // Calibration overlay state
  const [showCalibration,  setShowCalibration]  = useState(false)
  const [calibrationData,  setCalibrationData]  = useState(null)
  const [pendingInput,     setPendingInput]      = useState(null)   // stored while calibrating

  // ── Together mode: listen for partner input + merged input ──
  useEffect(() => {
    if (!isTogether) return
    const unsubs = []

    unsubs.push(sync.onMessage('input:partner_ready', () => {
      setPartnerReady(true)
    }))

    unsubs.push(sync.onMessage('input:both_ready', async (msg) => {
      if (sync.role === 'A' && msg.mergedInput) {
        // Role A: generate scenario from merged input
        setGenerating(true)
        try {
          // Run calibration with merged input
          const mergedArchetype = msg.mergedInput.archetype
          const chatLog = msg.mergedInput.chatLog
          const inferences = await callGeminiCalibration(chatLog, mergedArchetype)

          // Auto-confirm calibration in Together mode for now
          // (calibration overlay would need more complex sync)
          const { scenario, source: src } = await generateScenario({
            ...msg.mergedInput,
            calibration: inferences,
          })
          onScenarioReady(scenario, chatLog)
        } catch (err) {
          console.error('[Aside] Together-mode generation error:', err)
          setGenerating(false)
          setError('场景生成失败，请重试。')
        }
      } else {
        // Role B: just wait for scenario:ready (handled in App.jsx)
        setGenerating(true)
      }
    }))

    return () => unsubs.forEach(fn => fn())
  }, [isTogether, sync, onScenarioReady]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Parse whenever rawText changes ──────────────────────
  const handleTextChange = (val) => {
    setRawText(val)
    setError(null)
    if (val.trim().length > 10) {
      const { text, format, messageCount } = parseChatLog(val)
      setParsedText(text)
      setDetectedFmt({ format, messageCount })
    } else {
      setParsedText(val)
      setDetectedFmt(null)
    }
  }

  const handleFile = (content, name) => {
    setFileName(name)
    handleTextChange(content)
  }

  // ── Animate processing steps ─────────────────────────────
  const animateStepsFrom = (start) => {
    let s = start
    setStep(s)
    const iv = setInterval(() => {
      s += 1
      setStep(s)
      if (s >= STEPS.length - 1) clearInterval(iv)
    }, 420)
    return () => clearInterval(iv)
  }

  // ── Extract partner names from parsed text ───────────────
  const extractNames = (text) => {
    const lines = text.split('\n').filter(l => l.includes('：'))
    const names = []
    for (const line of lines) {
      const name = line.split('：')[0].trim()
      if (name && name.length < 10 && !names.includes(name)) names.push(name)
      if (names.length >= 2) break
    }
    return { nameA: names[0] || 'A', nameB: names[1] || 'B' }
  }

  // ── Submit: step 1 — calibration ────────────────────────
  // Both modes need: chat log + role identification + concern + feeling + context + archetype
  const canSubmit = isTogether
    ? (parsedText || rawText).trim().length > 20
      && userRole !== null
      && concernA.trim().length > 0
      && feeling.trim().length > 0
      && context.trim().length > 0
      && relationshipType !== null
      && styleA.length > 0
    : (parsedText || rawText).trim().length > 20
      && userRole !== null
      && concernA.trim().length > 0
      && feeling.trim().length > 0
      && context.trim().length > 0
      && relationshipType !== null
      && styleA.length > 0
      && styleB.length > 0

  const handleSubmit = async () => {
    if (!canSubmit || processing || submitted) return

    const chatLog = parsedText.trim() || rawText.trim()

    // ── Skip generation mode: collect input data but don't call API ──
    if (skipGeneration) {
      onScenarioReady(null, chatLog)
      return
    }

    // ── Together mode: submit own input to server ──────────
    if (isTogether) {
      const input = {
        chatLog,
        userRole,
        concern: concernA.trim(),         // "你最想让对方理解的是什么？"
        feeling: feeling.trim(),          // "你当时最强烈的感受是什么？"
        context: context.trim(),
        archetype: {
          relationshipType,
          styles: styleA,                  // own style only
        },
      }
      sync.send('input:submit', { input })
      setSubmitted(true)
      return
    }

    // ── Solo mode: existing flow (calibration → generate) ──
    setProcessing(true)
    setError(null)
    setStep(0)

    const archetype = { relationshipType, styleA, styleB }

    const input = {
      chatLog,
      userRole,
      userName: userRole === 'A' ? (nameA || '伴侣A') : (nameB || '伴侣B'),
      concernA: concernA.trim(),     // "你最想让对方理解的是什么？"
      feeling:  feeling.trim(),      // "你当时最强烈的感受是什么？"
      context:  context.trim(),
      archetype,
    }

    try {
      // Step 0: parse (shown briefly)
      setStep(0)

      // Step 1: calibration — quick LLM call for behavior inferences
      setStep(1)
      const inferences = await callGeminiCalibration(chatLog, archetype)

      // Store pending input and show calibration overlay
      setProcessing(false)
      setPendingInput(input)
      setCalibrationData(inferences)
      setShowCalibration(true)

    } catch (err) {
      setProcessing(false)
      setStep(0)
      setError('校准失败，请检查输入后重试。')
      console.error('[Aside] calibration error:', err)
    }
  }

  // ── Submit: step 2 — after calibration confirmed ─────────
  const handleCalibrationConfirm = async (confirmedCalibration) => {
    setShowCalibration(false)
    setProcessing(true)
    setStep(2)

    const clearAnim = animateStepsFrom(2)

    try {
      const { scenario, source: src } = await generateScenario({
        ...pendingInput,
        calibration: confirmedCalibration,
      })
      clearAnim()
      setSource(src)
      setStep(STEPS.length)
      await new Promise(r => setTimeout(r, 600))
      onScenarioReady(scenario, pendingInput.chatLog)
    } catch (err) {
      clearAnim()
      setProcessing(false)
      setStep(0)
      setError('场景重构失败，请检查输入后重试。')
      console.error('[Aside] generateScenario error:', err)
    }
  }

  const handleCalibrationBack = () => {
    setShowCalibration(false)
    setCalibrationData(null)
    setPendingInput(null)
  }

  // ── Extract names for archetype labels ───────────────────
  const chatForNames = parsedText.trim() || rawText.trim()
  const { nameA, nameB } = extractNames(chatForNames)

  const fmtColor = detectedFmt ? (FORMAT_COLORS[detectedFmt.format] ?? '#888') : null

  return (
    <div className="absolute inset-0 overflow-y-auto" style={{ background: '#060810' }}>

      {/* Subtle grid */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: [
          'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
        ].join(','),
        backgroundSize: '44px 44px',
      }} />

      {/* ── Single panel ── */}
      <div className="relative px-8 py-6 gap-4 anim-fadeIn max-w-4xl mx-auto w-full flex flex-col" style={{ paddingBottom: '80px' }}>

        {/* ── Top area: title + together hint ── */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="font-pixel text-[12px] tracking-[0.35em]" style={{ color: '#7ab0e8' }}>ASIDE</span>
            <div className="w-8 h-px" style={{ background: 'linear-gradient(90deg, rgba(122,176,232,0.5), transparent)' }} />
            <p className="font-mono text-[15px] text-white/30 tracking-[0.2em]">
              冲突描述 / CONFLICT INPUT
            </p>
            {isTogether && (
              <span className="font-mono text-[12px] px-2 py-0.5 rounded-full" style={{
                background: 'rgba(88,200,120,0.1)',
                border: '1px solid rgba(88,200,120,0.25)',
                color: '#58c878',
              }}>
                TOGETHER · 你是 {sync.role || new URLSearchParams(window.location.search).get('role')?.toUpperCase() || 'A'}
              </span>
            )}
          </div>
          <p className="text-[21px]" style={{ color: 'rgba(255,255,255,0.38)', fontFamily: '"PingFang SC","Inter",sans-serif' }}>
            {isTogether
              ? '粘贴聊天记录，描述你的感受和沟通风格'
              : '粘贴聊天记录，或用自己的话描述冲突经过'}
          </p>
        </div>

        {/* Together mode sync hint */}
        {isTogether && (
          <div className="rounded-lg px-4 py-3 anim-fadeIn" style={{
            background: 'rgba(122,176,232,0.06)',
            border: '1px solid rgba(122,176,232,0.18)',
          }}>
            <p className="text-[16px] leading-relaxed" style={{
              color: 'rgba(122,176,232,0.75)',
              fontFamily: '"PingFang SC","Inter",sans-serif',
            }}>
              对方此刻正在独立完成同样的描述。你们的回答将在不知道对方写了什么的情况下，分别驱动 AI 对彼此内心的推断。
            </p>
          </div>
        )}

        {/* ── Upload + Paste row: side by side ── */}
        <div className="flex gap-4" style={{ minHeight: '180px' }}>
          {/* Left half: file drag-drop zone */}
          <div className="flex-1 flex flex-col gap-2">
            <FileDropZone onFile={handleFile} isDragging={isDragging} setIsDragging={setIsDragging} />
            {fileName && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg anim-fadeIn" style={{
                background: 'rgba(88,200,120,0.08)',
                border:     '1px solid rgba(88,200,120,0.2)',
              }}>
                <span className="text-[15px]">✓</span>
                <div className="min-w-0">
                  <div className="font-mono text-[14px] text-white/60 truncate">{fileName}</div>
                  {detectedFmt && (
                    <div className="font-mono text-[11px] mt-0.5" style={{ color: fmtColor }}>
                      {FORMAT_LABELS[detectedFmt.format]}
                      {detectedFmt.messageCount > 0 && ` · ${detectedFmt.messageCount} 条消息`}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => { setFileName(null); setRawText(''); setParsedText(''); setDetectedFmt(null) }}
                  className="font-mono text-[15px] text-white/25 hover:text-white/55 ml-auto flex-shrink-0"
                >✕</button>
              </div>
            )}
            <HowToGuide />
          </div>

          {/* Right half: text paste area */}
          <div className="flex-1 flex flex-col relative">
            {/* Format badge */}
            {detectedFmt && detectedFmt.format !== 'freetext' && (
              <div className="flex items-center gap-2 mb-1 anim-fadeIn">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: fmtColor }} />
                <span className="font-mono text-[14px]" style={{ color: fmtColor }}>
                  {FORMAT_LABELS[detectedFmt.format]}
                </span>
                {detectedFmt.messageCount > 0 && (
                  <span className="font-mono text-[12px] text-white/30">
                    · {detectedFmt.messageCount} 条
                  </span>
                )}
              </div>
            )}
            <textarea
              value={rawText}
              onChange={e => handleTextChange(e.target.value)}
              placeholder={'粘贴微信聊天记录，或自由描述冲突……\n\n示例：\n小美：你为什么不回我消息？\n小凯：我当时在忙啊\n小美：忙？发一条消息要多少时间？'}
              className="w-full flex-1 rounded-xl px-4 py-3.5 text-[21px] resize-none focus:outline-none"
              style={{
                background:  'rgba(255,255,255,0.04)',
                border:      `1px solid ${rawText.length > 20 ? 'rgba(122,176,232,0.22)' : 'rgba(255,255,255,0.08)'}`,
                color:       'rgba(255,255,255,0.78)',
                fontFamily:  '"PingFang SC","JetBrains Mono","Inter",monospace',
                fontSize:    '19px',
                lineHeight:  '1.65',
                caretColor:  '#7ab0e8',
                transition:  'border-color 0.2s',
                minHeight:   '160px',
              }}
            />
            <div className="absolute bottom-3 right-4 font-mono text-[12px]" style={{
              color: rawText.length > 20 ? 'rgba(122,176,232,0.45)' : 'rgba(255,255,255,0.15)',
            }}>
              {rawText.length} 字
            </div>
          </div>
        </div>

        {/* Parsed preview */}
        {parsedText && parsedText !== rawText && parsedText.trim().length > 0 && (
          <details className="rounded-xl overflow-hidden" style={{
            background: 'rgba(255,255,255,0.02)',
            border:     '1px solid rgba(255,255,255,0.06)',
          }}>
            <summary className="font-mono text-[14px] text-white/30 px-4 py-2 cursor-pointer select-none">
              ▶ 已解析内容预览（将用于场景重构）
            </summary>
            <pre className="px-4 pb-3 font-mono text-[15px] text-white/40 whitespace-pre-wrap leading-relaxed overflow-auto"
              style={{ maxHeight: '120px' }}>
              {parsedText}
            </pre>
          </details>
        )}

        {/* ── Concerns row: side by side ── */}
        {(parsedText || rawText).trim().length > 20 && (
          <div className="flex gap-4 anim-fadeIn">
            {/* Left: concern */}
            <div className="flex-1">
              <label className="font-mono text-[12px] mb-1 block" style={{ color: '#7ab0e8' }}>
                你最想让对方理解的是什么？ *
              </label>
              <input
                value={concernA}
                onChange={e => setConcernA(e.target.value)}
                maxLength={80}
                placeholder="例：我不是在无理取闹，我只是需要被回应"
                className="w-full rounded-lg px-3 py-2 text-[18px] text-white/80 placeholder-white/20 focus:outline-none"
                style={{
                  background: 'rgba(122,176,232,0.06)',
                  border: `1px solid ${concernA ? 'rgba(122,176,232,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  fontFamily: '"PingFang SC","Inter",sans-serif',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>
            {/* Right: feeling */}
            <div className="flex-1">
              <label className="font-mono text-[12px] mb-1 block" style={{ color: '#7ab0e8' }}>
                你当时最强烈的感受是什么？ *
              </label>
              <input
                value={feeling}
                onChange={e => setFeeling(e.target.value)}
                maxLength={80}
                placeholder="例：觉得不被重视"
                className="w-full rounded-lg px-3 py-2 text-[18px] text-white/80 placeholder-white/20 focus:outline-none"
                style={{
                  background: 'rgba(122,176,232,0.06)',
                  border: `1px solid ${feeling ? 'rgba(122,176,232,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  fontFamily: '"PingFang SC","Inter",sans-serif',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>
          </div>
        )}

        {isTogether && (parsedText || rawText).trim().length > 20 && (
          <p className="font-mono text-[12px] text-white/18">
            对方正在另一台设备上独立描述 TA 的感受。
          </p>
        )}

        {/* Background — single input, full width */}
        <div className="flex flex-col gap-1">
          <p className="font-mono text-[12px] tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            背景信息 · 一句话背景 *
          </p>
          <input
            value={context}
            onChange={e => setContext(e.target.value)}
            maxLength={100}
            placeholder="例：异地恋半年，最近沟通越来越少"
            className="w-full rounded-lg px-3 py-2 text-[18px] text-white/70 placeholder-white/18 focus:outline-none"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${context.trim() ? 'rgba(122,176,232,0.3)' : 'rgba(255,255,255,0.07)'}`,
              fontFamily: '"PingFang SC","Inter",sans-serif',
              transition: 'border-color 0.2s',
            }}
          />
        </div>

        {/* Role selection — full width */}
        {(parsedText || rawText).trim().length > 20 && (
          <div className="flex flex-col gap-2 anim-fadeIn">
            <p className="font-mono text-[14px] tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              你是对话中的哪一位？ *
            </p>
            <div className="flex gap-3">
              {[
                { key: 'A', label: nameA || 'A' },
                { key: 'B', label: nameB || 'B' },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setUserRole(opt.key)}
                  className="flex-1 py-2.5 px-4 rounded-lg font-mono text-[18px] transition-all"
                  style={{
                    background: userRole === opt.key ? 'rgba(122,176,232,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${userRole === opt.key ? 'rgba(122,176,232,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    color: userRole === opt.key ? '#7ab0e8' : 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                  }}
                >
                  {opt.label === opt.key ? `角色 ${opt.key}` : opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Archetype section ── */}
        <ArchetypeSection
          relationshipType={relationshipType}
          setRelationshipType={setRelationshipType}
          styleA={styleA}
          setStyleA={setStyleA}
          styleB={styleB}
          setStyleB={setStyleB}
          nameA={nameA !== 'A' ? nameA : ''}
          nameB={nameB !== 'B' ? nameB : ''}
          singleColumn={isTogether}
        />

        {/* Error */}
        {error && (
          <div className="font-mono text-[15px] text-center py-2 rounded-lg anim-fadeIn" style={{
            color:      '#e87a7a',
            background: 'rgba(232,122,122,0.08)',
            border:     '1px solid rgba(232,122,122,0.18)',
          }}>
            {error}
          </div>
        )}

        {/* Engine status */}
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg" style={{
          background: API_KEY_AVAILABLE ? 'rgba(122,176,232,0.07)' : 'rgba(255,255,255,0.03)',
          border:     `1px solid ${API_KEY_AVAILABLE ? 'rgba(122,176,232,0.2)' : 'rgba(255,255,255,0.07)'}`,
        }}>
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{
            background: API_KEY_AVAILABLE ? '#7ab0e8' : '#444',
            boxShadow:  API_KEY_AVAILABLE ? '0 0 5px #7ab0e8' : 'none',
          }} />
          <span className="font-mono text-[12px]" style={{ color: API_KEY_AVAILABLE ? '#7ab0e8' : 'rgba(255,255,255,0.22)' }}>
            {API_KEY_AVAILABLE ? '引擎就绪' : '离线模式 · 配置 .env.local'}
          </span>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pb-4">
          <span className="font-mono text-[12px] text-white/18">
            {isTogether
              ? '至少 20 字 + 角色 + 感受 + 背景 + 关系设定'
              : '至少 20 字 + 角色 + 感受 + 背景 + 关系设定 · 内容仅在本地处理'}
          </span>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || processing || submitted}
            className="font-mono text-[18px] tracking-[0.15em] px-8 py-3 rounded-xl border transition-all duration-300"
            style={{
              color:       (canSubmit && !submitted) ? '#7ab0e8' : 'rgba(255,255,255,0.2)',
              borderColor: (canSubmit && !submitted) ? 'rgba(122,176,232,0.4)' : 'rgba(255,255,255,0.07)',
              background:  (canSubmit && !submitted) ? 'rgba(122,176,232,0.07)' : 'transparent',
              cursor:      (canSubmit && !submitted) ? 'pointer' : 'not-allowed',
            }}
            onMouseEnter={e => {
              if (!canSubmit || submitted) return
              e.currentTarget.style.background  = 'rgba(122,176,232,0.15)'
              e.currentTarget.style.borderColor = 'rgba(122,176,232,0.7)'
            }}
            onMouseLeave={e => {
              if (!canSubmit || submitted) return
              e.currentTarget.style.background  = 'rgba(122,176,232,0.07)'
              e.currentTarget.style.borderColor = 'rgba(122,176,232,0.4)'
            }}
          >
            {processing ? '重构中…' : submitted ? '已提交 ✓' : isTogether ? '提交我的输入 / SUBMIT' : '进入剧场 / ENTER'}
          </button>
        </div>
      </div>

      {/* Processing overlay (solo mode) */}
      {processing && !isTogether && <ProcessingOverlay step={step} source={source} />}

      {/* Waiting overlay (together mode) */}
      {isTogether && submitted && <WaitingOverlay partnerReady={partnerReady} generating={generating} role={sync.role} />}

      {/* Calibration overlay */}
      {showCalibration && calibrationData && pendingInput && (
        <CalibrationOverlay
          personaA={{
            name:  extractNames(pendingInput.chatLog).nameA,
            color: '#7ab0e8',
          }}
          personaB={{
            name:  extractNames(pendingInput.chatLog).nameB,
            color: '#e87a7a',
          }}
          inferences={calibrationData}
          onConfirm={handleCalibrationConfirm}
          onBack={handleCalibrationBack}
        />
      )}
    </div>
  )
}
