// ─────────────────────────────────────────────────────────────
//  ConflictInput — "冲突来源" phase
//
//  Accepts conflict material in multiple ways:
//    • 文件拖入 / 点击上传  (.html .htm .txt from WeChat export)
//    • 粘贴文本             (WeChat copy, any format)
//    • 自由描述             (plain text description)
//
//  Auto-detects and parses:
//    wechat-html-native  微信PC合并转发HTML
//    wechat-html-tool    第三方工具导出HTML
//    wechat-txt          微信TXT导出（[名字][时间]格式）
//    wechat-copy         微信选中复制格式（名字 时间\n内容）
//    simple-colon        名字: 内容 格式
//    freetext            自由描述直接传递
//
//  On submit: parseChatLog → generateScenario → RSL scenario
// ─────────────────────────────────────────────────────────────

import { useState, useCallback, useRef } from 'react'
import { generateScenario, API_KEY_AVAILABLE } from '../utils/generateScenario'
import { parseChatLog, FORMAT_LABELS }         from '../utils/parseChatLog'

// ── Processing steps ──────────────────────────────────────────
const STEPS = [
  { label: '解析聊天格式',  sub: 'Parsing chat format' },
  { label: '提取对话节点',  sub: 'Extracting dialogue beats' },
  { label: '建模内心世界',  sub: 'Modelling inner states' },
  { label: '生成模拟场景',  sub: 'Generating simulation' },
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

// ── How-to guide (collapsible) ────────────────────────────────
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
    title: '微信Mac端',
    steps: [
      '在对话中右键 → 导出聊天记录',
      '保存为 HTML 后拖入左侧区域',
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
  {
    title: '第三方工具',
    steps: [
      'WechatExporter (Mac/Win) 或 Memotrace (留痕) 导出HTML',
      '将导出的 HTML 文件拖入左侧区域',
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
      {source && (
        <div className="font-mono text-[8px] px-3 py-1 rounded-full anim-fadeIn" style={{
          background: source === 'ai' ? 'rgba(122,176,232,0.12)' : 'rgba(255,255,255,0.06)',
          border:     `1px solid ${source === 'ai' ? 'rgba(122,176,232,0.3)' : 'rgba(255,255,255,0.1)'}`,
          color:      source === 'ai' ? '#7ab0e8' : 'rgba(255,255,255,0.35)',
        }}>
          {source === 'ai' ? '✦ Claude AI 分析' : '模板重建'}
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
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] tracking-widest">如何导出微信聊天记录？</span>
        </div>
        <span className="font-mono text-[10px]" style={{
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.25s',
          display: 'inline-block',
        }}>▾</span>
      </button>
      {open && (
        <div className="px-4 pb-4 flex flex-col gap-4 anim-fadeIn">
          {HOW_TO.map((section, si) => (
            <div key={si}>
              <div className="font-mono text-[9px] mb-1.5" style={{ color: '#7ab0e8' }}>
                {section.title}
              </div>
              <ol className="flex flex-col gap-1">
                {section.steps.map((step, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-mono text-[8px] text-white/28 flex-shrink-0 mt-0.5">
                      {i + 1}.
                    </span>
                    <span className="font-mono text-[9px] text-white/45 leading-snug">
                      {step}
                    </span>
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

// ── File drop zone ────────────────────────────────────────────
function FileDropZone({ onFile, isDragging, setIsDragging }) {
  const inputRef = useRef(null)

  const handleFiles = (files) => {
    const file = files[0]
    if (!file) return
    const ext  = file.name.split('.').pop().toLowerCase()
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
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = () => setIsDragging(false)

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className="flex flex-col items-center justify-center gap-3 rounded-xl cursor-pointer transition-all"
      style={{
        height:     '130px',
        background: isDragging ? 'rgba(122,176,232,0.1)' : 'rgba(255,255,255,0.025)',
        border:     `1.5px dashed ${isDragging ? 'rgba(122,176,232,0.6)' : 'rgba(255,255,255,0.12)'}`,
        transition: 'all 0.2s',
      }}
    >
      <div className="text-[28px]" style={{ opacity: isDragging ? 1 : 0.5 }}>
        {isDragging ? '📂' : '📁'}
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="font-mono text-[10px]" style={{
          color: isDragging ? '#7ab0e8' : 'rgba(255,255,255,0.4)',
        }}>
          拖入聊天记录文件
        </span>
        <span className="font-mono text-[8px] text-white/22">
          支持 .html · .htm · .txt（微信导出格式）
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".html,.htm,.txt"
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  Main export
// ─────────────────────────────────────────────────────────────
export default function ConflictInput({ onScenarioReady }) {
  const [rawText,    setRawText]    = useState('')        // original user input
  const [parsedText, setParsedText] = useState('')        // after parseChatLog
  const [detectedFmt, setDetectedFmt] = useState(null)   // format label
  const [fileName,   setFileName]   = useState(null)      // if from file
  const [isDragging, setIsDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [step,       setStep]       = useState(0)
  const [source,     setSource]     = useState(null)
  const [error,      setError]      = useState(null)

  // ── Parse whenever rawText changes ───────────────────────
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

  // ── File loaded ───────────────────────────────────────────
  const handleFile = (content, name) => {
    setFileName(name)
    handleTextChange(content)
  }

  // ── Animate processing steps ──────────────────────────────
  const animateSteps = () => {
    let s = 0
    const iv = setInterval(() => {
      s += 1
      setStep(s)
      if (s >= STEPS.length - 1) clearInterval(iv)
    }, 420)
    return () => clearInterval(iv)
  }

  // ── Submit ────────────────────────────────────────────────
  const canSubmit = (parsedText || rawText).trim().length > 20

  const handleSubmit = async () => {
    if (!canSubmit || processing) return
    setProcessing(true)
    setError(null)
    setStep(0)

    const clearAnim = animateSteps()
    const textForAI = parsedText.trim() || rawText.trim()

    try {
      const { scenario, source: src } = await generateScenario(textForAI)
      clearAnim()
      setSource(src)
      setStep(STEPS.length)
      await new Promise(r => setTimeout(r, 600))
      onScenarioReady(scenario, textForAI)
    } catch (err) {
      clearAnim()
      setProcessing(false)
      setStep(0)
      setError('分析失败，请检查输入后重试。')
      console.error('[Mirror] generateScenario error:', err)
    }
  }

  // ── Format badge ──────────────────────────────────────────
  const fmtColor = detectedFmt ? (FORMAT_COLORS[detectedFmt.format] ?? '#888') : null

  return (
    <div className="relative flex min-h-screen bg-black overflow-hidden">

      {/* Subtle grid */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: [
          'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
        ].join(','),
        backgroundSize: '44px 44px',
      }} />

      {/* ── Left panel: file drop + guide ── */}
      <div className="relative flex flex-col gap-4 p-8 border-r border-white/5 flex-shrink-0"
        style={{ width: '280px' }}>

        {/* Logo */}
        <div className="flex flex-col gap-0.5 mb-2">
          <span className="font-pixel text-[8px] tracking-[0.35em]" style={{ color: '#7ab0e8' }}>
            MIRROR
          </span>
          <div className="w-8 h-px" style={{
            background: 'linear-gradient(90deg, rgba(122,176,232,0.5), transparent)',
          }} />
          <p className="font-mono text-[8px] text-white/22 tracking-[0.15em] mt-1">
            INPUT CONFLICT
          </p>
        </div>

        {/* File drop zone */}
        <FileDropZone
          onFile={handleFile}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
        />

        {/* Loaded file badge */}
        {fileName && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg anim-fadeIn" style={{
            background: 'rgba(88,200,120,0.08)',
            border:     '1px solid rgba(88,200,120,0.2)',
          }}>
            <span className="text-[10px]">✓</span>
            <div className="min-w-0">
              <div className="font-mono text-[9px] text-white/60 truncate">{fileName}</div>
              {detectedFmt && (
                <div className="font-mono text-[7px] mt-0.5" style={{ color: fmtColor }}>
                  {FORMAT_LABELS[detectedFmt.format]}
                  {detectedFmt.messageCount > 0 && ` · ${detectedFmt.messageCount} 条消息`}
                </div>
              )}
            </div>
            <button
              onClick={() => { setFileName(null); setRawText(''); setParsedText(''); setDetectedFmt(null) }}
              className="font-mono text-[10px] text-white/25 hover:text-white/55 ml-auto flex-shrink-0"
            >✕</button>
          </div>
        )}

        {/* API status */}
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg" style={{
          background: API_KEY_AVAILABLE ? 'rgba(122,176,232,0.07)' : 'rgba(255,255,255,0.03)',
          border:     `1px solid ${API_KEY_AVAILABLE ? 'rgba(122,176,232,0.2)' : 'rgba(255,255,255,0.07)'}`,
        }}>
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{
            background: API_KEY_AVAILABLE ? '#7ab0e8' : '#444',
            boxShadow:  API_KEY_AVAILABLE ? '0 0 5px #7ab0e8' : 'none',
          }} />
          <span className="font-mono text-[8px]" style={{
            color: API_KEY_AVAILABLE ? '#7ab0e8' : 'rgba(255,255,255,0.22)',
          }}>
            {API_KEY_AVAILABLE ? 'Claude AI 已连接' : '模板模式 · 配置 .env.local'}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* How-to guide */}
        <HowToGuide />
      </div>

      {/* ── Right panel: text input ── */}
      <div className="relative flex flex-col flex-1 p-8 gap-4 anim-fadeIn">

        {/* Header */}
        <div className="flex flex-col gap-1">
          <p className="font-mono text-[10px] text-white/30 tracking-[0.2em]">
            冲突描述 / CONFLICT INPUT
          </p>
          <p className="text-sm" style={{
            color: 'rgba(255,255,255,0.38)',
            fontFamily: '"PingFang SC","Inter",sans-serif',
          }}>
            粘贴聊天记录，或用自己的话描述冲突经过
          </p>
        </div>

        {/* Format detection badge */}
        {detectedFmt && detectedFmt.format !== 'freetext' && (
          <div className="flex items-center gap-2 anim-fadeIn">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: fmtColor }} />
            <span className="font-mono text-[9px]" style={{ color: fmtColor }}>
              识别格式：{FORMAT_LABELS[detectedFmt.format]}
            </span>
            {detectedFmt.messageCount > 0 && (
              <span className="font-mono text-[8px] text-white/30">
                · 解析出 {detectedFmt.messageCount} 条消息
              </span>
            )}
          </div>
        )}

        {/* Textarea */}
        <div className="relative flex-1 min-h-0">
          <textarea
            value={rawText}
            onChange={e => handleTextChange(e.target.value)}
            placeholder={`粘贴微信聊天记录，或自由描述冲突……

支持格式：
• 微信PC「合并转发」→ HTML文件（拖入左侧）
• 微信「手机复制」格式（长按→更多→复制）
• 名字：消息内容 格式
• 自由描述（想到什么写什么）

示例：
小美：你为什么不回我消息？
小凯：我当时在忙啊
小美：忙？发一条消息要多少时间？`}
            className="w-full h-full rounded-xl px-4 py-3.5 text-sm resize-none focus:outline-none"
            style={{
              background:  'rgba(255,255,255,0.04)',
              border:      `1px solid ${rawText.length > 20 ? 'rgba(122,176,232,0.22)' : 'rgba(255,255,255,0.08)'}`,
              color:       'rgba(255,255,255,0.78)',
              fontFamily:  '"PingFang SC","JetBrains Mono","Inter",monospace',
              fontSize:    '13px',
              lineHeight:  '1.65',
              caretColor:  '#7ab0e8',
              transition:  'border-color 0.2s',
              minHeight:   '260px',
            }}
          />
          {/* Char count bottom-right */}
          <div className="absolute bottom-3 right-4 font-mono text-[8px]" style={{
            color: rawText.length > 20 ? 'rgba(122,176,232,0.45)' : 'rgba(255,255,255,0.15)',
          }}>
            {rawText.length} 字
          </div>
        </div>

        {/* Parsed preview (if different from raw) */}
        {parsedText && parsedText !== rawText && parsedText.trim().length > 0 && (
          <details className="rounded-xl overflow-hidden" style={{
            background: 'rgba(255,255,255,0.02)',
            border:     '1px solid rgba(255,255,255,0.06)',
          }}>
            <summary className="font-mono text-[9px] text-white/30 px-4 py-2 cursor-pointer select-none">
              已解析内容预览（将发送给 AI 分析）
            </summary>
            <pre className="px-4 pb-3 font-mono text-[10px] text-white/40 whitespace-pre-wrap leading-relaxed overflow-auto"
              style={{ maxHeight: '120px' }}>
              {parsedText}
            </pre>
          </details>
        )}

        {/* Error */}
        {error && (
          <div className="font-mono text-[10px] text-center py-2 rounded-lg anim-fadeIn" style={{
            color:      '#e87a7a',
            background: 'rgba(232,122,122,0.08)',
            border:     '1px solid rgba(232,122,122,0.18)',
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[8px] text-white/18">
            至少 20 字 · 内容仅在本地处理
          </span>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || processing}
            className="font-mono text-[12px] tracking-[0.15em] px-8 py-3 rounded-xl border transition-all duration-300"
            style={{
              color:       canSubmit ? '#7ab0e8' : 'rgba(255,255,255,0.2)',
              borderColor: canSubmit ? 'rgba(122,176,232,0.4)' : 'rgba(255,255,255,0.07)',
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
      </div>

      {/* Processing overlay */}
      {processing && <ProcessingOverlay step={step} source={source} />}
    </div>
  )
}
