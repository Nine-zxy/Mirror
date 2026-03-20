// ─────────────────────────────────────────────────────────────
//  PrepareScreen — Researcher pre-load mode
//
//  Accessed via ?mode=prepare
//  Allows researcher to:
//  1. Input chat logs and generate scenarios (reuses ConflictInput flow)
//  2. Preview generated scenarios (beats, characters, scene)
//  3. Save scenarios to server and get shareable study links
//  4. View list of all saved scenarios for this session
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react'
import { generateScenario, callGeminiCalibration, API_KEY_AVAILABLE } from '../utils/generateScenario'
import { parseChatLog, FORMAT_LABELS } from '../utils/parseChatLog'
import { RELATIONSHIP_TYPES, COMM_STYLES } from '../data/dramaElements'
import CalibrationOverlay from './CalibrationOverlay'
import { useSyncContext } from '../sync/SyncContext'

// ── Processing steps (same as ConflictInput) ──────────────
const STEPS = [
  { label: '解析对话',    sub: 'Parsing dialogue' },
  { label: '校准行为',    sub: 'Calibrating behavior patterns' },
  { label: '提取脉络',    sub: 'Extracting narrative arc' },
  { label: '重构内心',    sub: 'Reconstructing inner states' },
  { label: '生成场景',    sub: 'Building scene' },
]

// ── Helpers ──────────────────────────────────────────────────
function extractNames(text) {
  const lines = text.split('\n').filter(l => l.includes('：'))
  const names = []
  for (const line of lines) {
    const name = line.split('：')[0].trim()
    if (name && name.length < 10 && !names.includes(name)) names.push(name)
    if (names.length >= 2) break
  }
  return { nameA: names[0] || 'A', nameB: names[1] || 'B' }
}

function getBaseUrl() {
  return `${window.location.protocol}//${window.location.host}`
}

// ── Emotion label mapping ────────────────────────────────────
const EMOTION_LABELS = {
  frustrated: '沮丧', angry: '愤怒', sad: '悲伤', anxious: '焦虑',
  hurt: '受伤', confused: '困惑', lonely: '孤独', guilty: '内疚',
  defensive: '防御', resigned: '无奈', hopeful: '希望', warm: '温暖',
  neutral: '平静',
}

// ── BubbleType label ─────────────────────────────────────────
const BUBBLE_LABELS = {
  cloud: '云朵', aggressive: '尖锐', hesitation: '犹豫', warm: '温暖',
}

// ═══════════════════════════════════════════════════════════════
//  Sub-components
// ═══════════════════════════════════════════════════════════════

function ScenarioPreview({ scenario }) {
  if (!scenario) return null
  const { beats, personas, scene, title, subtitle } = scenario

  return (
    <div className="flex flex-col gap-4">
      {/* Title */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-[11px] text-white/70">{title}</span>
        {subtitle && <span className="font-mono text-[9px] text-white/30">{subtitle}</span>}
        <span className="font-mono text-[8px] px-2 py-0.5 rounded" style={{
          background: 'rgba(122,176,232,0.1)',
          border: '1px solid rgba(122,176,232,0.2)',
          color: '#7ab0e8',
        }}>{scene}</span>
      </div>

      {/* Characters */}
      <div className="flex gap-4">
        {Object.values(personas).map(p => (
          <div key={p.id} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{
            background: `${p.color}10`,
            border: `1px solid ${p.color}30`,
          }}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
            <span className="font-mono text-[10px]" style={{ color: p.color }}>{p.name}</span>
            <span className="font-mono text-[8px] text-white/25">({p.label})</span>
          </div>
        ))}
      </div>

      {/* Beats */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[8px] text-white/30 tracking-widest">
          BEATS ({beats.length})
        </span>
        {beats.map((beat, i) => (
          <div key={beat.id || i} className="rounded-lg px-4 py-3" style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[8px] text-white/25">#{i + 1}</span>
              <span className="font-mono text-[9px] text-white/50">
                {beat.speaker === 'A' ? personas.A?.name : personas.B?.name}
              </span>
              {beat.intensity !== undefined && (
                <span className="font-mono text-[7px] text-white/20">
                  intensity: {beat.intensity}
                </span>
              )}
              {beat.duration && (
                <span className="font-mono text-[7px] text-white/15">
                  {(beat.duration / 1000).toFixed(1)}s
                </span>
              )}
            </div>
            {/* Dialogue */}
            {beat.dialogue && (
              <div className="font-mono text-[10px] text-white/65 mb-1.5 pl-3" style={{
                borderLeft: `2px solid ${beat.speaker === 'A' ? personas.A?.color : personas.B?.color}40`,
              }}>
                {beat.dialogue}
              </div>
            )}
            {/* Thoughts */}
            <div className="flex gap-3 pl-3">
              {beat.thoughts?.A && (
                <div className="flex-1 font-mono text-[9px] px-2 py-1.5 rounded" style={{
                  background: 'rgba(122,176,232,0.06)',
                  border: '1px solid rgba(122,176,232,0.15)',
                  color: 'rgba(122,176,232,0.6)',
                }}>
                  <span className="text-[7px] text-white/20">A: </span>
                  {beat.thoughts.A.text}
                  {beat.thoughts.A.emotion && (
                    <span className="ml-1 text-[7px] text-white/25">
                      [{EMOTION_LABELS[beat.thoughts.A.emotion] || beat.thoughts.A.emotion}]
                    </span>
                  )}
                </div>
              )}
              {beat.thoughts?.B && (
                <div className="flex-1 font-mono text-[9px] px-2 py-1.5 rounded" style={{
                  background: 'rgba(232,122,122,0.06)',
                  border: '1px solid rgba(232,122,122,0.15)',
                  color: 'rgba(232,122,122,0.6)',
                }}>
                  <span className="text-[7px] text-white/20">B: </span>
                  {beat.thoughts.B.text}
                  {beat.thoughts.B.emotion && (
                    <span className="ml-1 text-[7px] text-white/25">
                      [{EMOTION_LABELS[beat.thoughts.B.emotion] || beat.thoughts.B.emotion}]
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SavedScenarioCard({ item, baseUrl }) {
  const [copiedA, setCopiedA] = useState(false)
  const [copiedB, setCopiedB] = useState(false)

  const linkA = `${baseUrl}/?study=${item.scenarioId}&role=A`
  const linkB = `${baseUrl}/?study=${item.scenarioId}&role=B`

  const copy = async (text, setter) => {
    try {
      await navigator.clipboard.writeText(text)
      setter(true)
      setTimeout(() => setter(false), 2000)
    } catch { /* ignore */ }
  }

  return (
    <div className="rounded-lg px-4 py-3" style={{
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div className="flex items-center gap-3 mb-2">
        <span className="font-mono text-[11px] font-bold" style={{ color: '#7ab0e8' }}>
          {item.scenarioId}
        </span>
        <span className="font-mono text-[10px] text-white/50">{item.title}</span>
        <span className="font-mono text-[8px] text-white/20">
          {new Date(item.createdAt).toLocaleTimeString()}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[8px] w-10 flex-shrink-0" style={{ color: '#7ab0e8' }}>
            被试 A:
          </span>
          <code className="font-mono text-[9px] text-white/40 flex-1 truncate">{linkA}</code>
          <button
            onClick={() => copy(linkA, setCopiedA)}
            className="font-mono text-[8px] px-2 py-0.5 rounded border transition-all flex-shrink-0"
            style={{
              color: copiedA ? '#58c878' : '#7ab0e8',
              borderColor: copiedA ? 'rgba(88,200,120,0.3)' : 'rgba(122,176,232,0.3)',
              background: copiedA ? 'rgba(88,200,120,0.08)' : 'rgba(122,176,232,0.06)',
            }}
          >
            {copiedA ? '已复制' : '复制'}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[8px] w-10 flex-shrink-0" style={{ color: '#e87a7a' }}>
            被试 B:
          </span>
          <code className="font-mono text-[9px] text-white/40 flex-1 truncate">{linkB}</code>
          <button
            onClick={() => copy(linkB, setCopiedB)}
            className="font-mono text-[8px] px-2 py-0.5 rounded border transition-all flex-shrink-0"
            style={{
              color: copiedB ? '#58c878' : '#e87a7a',
              borderColor: copiedB ? 'rgba(88,200,120,0.3)' : 'rgba(232,122,122,0.3)',
              background: copiedB ? 'rgba(88,200,120,0.08)' : 'rgba(232,122,122,0.06)',
            }}
          >
            {copiedB ? '已复制' : '复制'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Main PrepareScreen
// ═══════════════════════════════════════════════════════════════

export default function PrepareScreen() {
  const sync = useSyncContext()

  // Input state
  const [rawText, setRawText]         = useState('')
  const [parsedText, setParsedText]   = useState('')
  const [detectedFmt, setDetectedFmt] = useState(null)
  const [concernA, setConcernA]       = useState('')
  const [concernB, setConcernB]       = useState('')
  const [feeling, setFeeling]         = useState('')
  const [feelingB, setFeelingB]       = useState('')
  const [context, setContext]         = useState('')
  const [relationshipType, setRelationshipType] = useState(null)
  const [styleA, setStyleA]           = useState([])
  const [styleB, setStyleB]           = useState([])

  // Flow state
  const [processing, setProcessing]   = useState(false)
  const [step, setStep]               = useState(0)
  const [error, setError]             = useState(null)
  const [scenario, setScenario]       = useState(null)

  // Calibration
  const [showCalibration, setShowCalibration]   = useState(false)
  const [calibrationData, setCalibrationData]   = useState(null)
  const [pendingInput, setPendingInput]         = useState(null)

  // Saved scenarios
  const [savedScenarios, setSavedScenarios] = useState([])
  const [saving, setSaving]                 = useState(false)
  const [saveError, setSaveError]           = useState(null)

  // Saved input configs
  const [savedInputConfigs, setSavedInputConfigs] = useState([])
  const [inputLabel, setInputLabel]               = useState('')
  const [savingInput, setSavingInput]             = useState(false)
  const [saveInputError, setSaveInputError]       = useState(null)
  const [loadingInput, setLoadingInput]           = useState(null) // configId being loaded

  const baseUrl = getBaseUrl()

  // Ensure WebSocket is connected for scenario storage
  useEffect(() => {
    if (sync.mode !== 'together') {
      sync.setMode('together')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Load saved scenarios + input configs list on connect
  useEffect(() => {
    if (!sync.connected) return
    sync.listScenarios().then(list => {
      setSavedScenarios(list)
    }).catch(() => {})
    sync.listInputConfigs().then(list => {
      setSavedInputConfigs(list)
    }).catch(() => {})
  }, [sync.connected]) // eslint-disable-line react-hooks/exhaustive-deps

  // Parse text
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

  const handleFile = useCallback((e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => handleTextChange(ev.target.result)
    reader.readAsText(file, 'utf-8')
  }, [])

  // Names
  const chatForNames = parsedText.trim() || rawText.trim()
  const { nameA, nameB } = extractNames(chatForNames)

  const canSubmit = (parsedText || rawText).trim().length > 20
    && relationshipType !== null
    && styleA.length > 0
    && styleB.length > 0

  // Animate processing steps
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

  // ── Input config save/load ──────────────────────────────
  const handleSaveInputConfig = async () => {
    if (savingInput || !sync.connected) return
    setSavingInput(true)
    setSaveInputError(null)
    try {
      const config = {
        chatLog: rawText,
        concernA: concernA.trim(),
        feelingA: feeling.trim(),
        concernB: concernB.trim(),
        feelingB: feelingB.trim(),
        context: context.trim(),
        relationshipType,
        styleA,
        styleB,
        personaAName: nameA,
        personaBName: nameB,
      }
      await sync.saveInputConfig(inputLabel.trim() || '(未命名)', config)
      const list = await sync.listInputConfigs()
      setSavedInputConfigs(list)
      setInputLabel('')
      setSavingInput(false)
    } catch (err) {
      setSavingInput(false)
      setSaveInputError('保存失败: ' + err.message)
    }
  }

  const handleLoadInputConfig = async (configId) => {
    if (loadingInput) return
    setLoadingInput(configId)
    try {
      const { config } = await sync.loadInputConfig(configId)
      // Populate form fields
      if (config.chatLog != null) handleTextChange(config.chatLog)
      if (config.concernA != null) setConcernA(config.concernA)
      if (config.feelingA != null) setFeeling(config.feelingA)
      if (config.concernB != null) setConcernB(config.concernB)
      if (config.feelingB != null) setFeelingB(config.feelingB)
      if (config.context != null) setContext(config.context)
      if (config.relationshipType != null) setRelationshipType(config.relationshipType)
      if (config.styleA != null) setStyleA(config.styleA)
      if (config.styleB != null) setStyleB(config.styleB)
      setLoadingInput(null)
    } catch (err) {
      setLoadingInput(null)
      setError('加载输入配置失败: ' + err.message)
    }
  }

  // Submit: calibration → generate
  const handleSubmit = async () => {
    if (!canSubmit || processing) return

    const chatLog = parsedText.trim() || rawText.trim()
    const archetype = { relationshipType, styleA, styleB }
    const input = {
      chatLog,
      concernA: concernA.trim(),
      concernB: concernB.trim(),
      feeling: feeling.trim(),
      feelingB: feelingB.trim(),
      context: context.trim(),
      archetype,
    }

    setProcessing(true)
    setError(null)
    setStep(0)

    try {
      setStep(1)
      const inferences = await callGeminiCalibration(chatLog, archetype)
      setProcessing(false)
      setPendingInput(input)
      setCalibrationData(inferences)
      setShowCalibration(true)
    } catch (err) {
      setProcessing(false)
      setStep(0)
      setError('校准失败: ' + err.message)
    }
  }

  const handleCalibrationConfirm = async (confirmedCalibration) => {
    setShowCalibration(false)
    setProcessing(true)
    setStep(2)
    const clearAnim = animateStepsFrom(2)

    try {
      const { scenario: gen } = await generateScenario({
        ...pendingInput,
        calibration: confirmedCalibration,
      })
      clearAnim()
      setScenario(gen)
      setProcessing(false)
    } catch (err) {
      clearAnim()
      setProcessing(false)
      setError('场景生成失败: ' + err.message)
    }
  }

  const handleCalibrationBack = () => {
    setShowCalibration(false)
    setCalibrationData(null)
    setPendingInput(null)
  }

  // Save scenario to server
  const handleSave = async () => {
    if (!scenario || saving) return
    setSaving(true)
    setSaveError(null)

    try {
      const metadata = {
        concernA: concernA.trim(),
        concernB: concernB.trim(),
        feelingA: feeling.trim(),
        feelingB: feelingB.trim(),
        context: context.trim(),
        createdBy: 'researcher',
      }
      const scenarioId = await sync.saveScenario(scenario, metadata)
      // Refresh list
      const list = await sync.listScenarios()
      setSavedScenarios(list)
      setSaving(false)
    } catch (err) {
      setSaving(false)
      setSaveError('保存失败: ' + err.message)
    }
  }

  // Reset for new scenario
  const handleReset = () => {
    setScenario(null)
    setPendingInput(null)
    setCalibrationData(null)
    setError(null)
  }

  const toggleStyle = (setter, current, id) => {
    setter(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: '#060810' }}>
      {/* Subtle grid bg */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: [
          'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
        ].join(','),
        backgroundSize: '44px 44px',
      }} />

      <div className="relative max-w-5xl mx-auto px-8 py-6 flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="font-pixel text-[8px] tracking-[0.35em]" style={{ color: '#7ab0e8' }}>ASIDE</span>
          <div className="w-8 h-px" style={{ background: 'linear-gradient(90deg, rgba(122,176,232,0.5), transparent)' }} />
          <span className="font-mono text-[10px] text-white/30 tracking-[0.2em]">
            研究员预设模式 / RESEARCHER PREPARE
          </span>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{
              background: sync.connected ? '#58c878' : '#e87a7a',
              boxShadow: sync.connected ? '0 0 5px rgba(88,200,120,0.5)' : 'none',
            }} />
            <span className="font-mono text-[8px]" style={{
              color: sync.connected ? '#58c878' : '#e87a7a',
            }}>
              {sync.connected ? '服务器已连接' : '服务器未连接'}
            </span>
          </div>
        </div>

        {/* ── If scenario generated: show preview + save ── */}
        {scenario ? (
          <div className="flex flex-col gap-5 anim-fadeIn">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-white/60">场景预览</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <button
                onClick={handleReset}
                className="font-mono text-[9px] px-3 py-1 rounded border transition-all"
                style={{
                  color: 'rgba(255,255,255,0.4)',
                  borderColor: 'rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                重新生成
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !sync.connected}
                className="font-mono text-[10px] px-4 py-1.5 rounded border transition-all"
                style={{
                  color: saving ? 'rgba(255,255,255,0.3)' : '#58c878',
                  borderColor: saving ? 'rgba(255,255,255,0.1)' : 'rgba(88,200,120,0.4)',
                  background: saving ? 'transparent' : 'rgba(88,200,120,0.08)',
                  cursor: saving || !sync.connected ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? '保存中...' : '保存场景'}
              </button>
            </div>

            {saveError && (
              <div className="font-mono text-[10px] px-3 py-2 rounded-lg" style={{
                color: '#e87a7a', background: 'rgba(232,122,122,0.08)',
                border: '1px solid rgba(232,122,122,0.18)',
              }}>{saveError}</div>
            )}

            <ScenarioPreview scenario={scenario} />
          </div>
        ) : (
          /* ── Input form ── */
          <div className="flex flex-col gap-4 anim-fadeIn">

            {/* ── Saved input configs panel ── */}
            <div className="rounded-xl px-4 py-3" style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-[9px] text-white/30 tracking-widest">
                  已保存的输入
                </span>
                <span className="font-mono text-[8px] text-white/20">
                  ({savedInputConfigs.length}个)
                </span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
              </div>

              {/* List of saved configs */}
              {savedInputConfigs.length > 0 && (
                <div className="flex flex-col gap-1.5 mb-3">
                  {savedInputConfigs.map(item => (
                    <div key={item.configId} className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}>
                      <span className="font-mono text-[10px] font-bold" style={{ color: '#7ab0e8' }}>
                        {item.configId}
                      </span>
                      <span className="font-mono text-[10px] text-white/50 flex-1 truncate">
                        {item.label}
                      </span>
                      <span className="font-mono text-[8px] text-white/20">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleLoadInputConfig(item.configId)}
                        disabled={!!loadingInput}
                        className="font-mono text-[9px] px-2.5 py-0.5 rounded border transition-all"
                        style={{
                          color: loadingInput === item.configId ? 'rgba(255,255,255,0.3)' : '#7ab0e8',
                          borderColor: loadingInput === item.configId ? 'rgba(255,255,255,0.1)' : 'rgba(122,176,232,0.3)',
                          background: loadingInput === item.configId ? 'transparent' : 'rgba(122,176,232,0.06)',
                          cursor: loadingInput ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {loadingInput === item.configId ? '加载中...' : '加载'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Save current input */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveInputConfig}
                  disabled={savingInput || !sync.connected}
                  className="font-mono text-[9px] px-3 py-1 rounded border transition-all flex-shrink-0"
                  style={{
                    color: savingInput ? 'rgba(255,255,255,0.3)' : '#58c878',
                    borderColor: savingInput ? 'rgba(255,255,255,0.1)' : 'rgba(88,200,120,0.3)',
                    background: savingInput ? 'transparent' : 'rgba(88,200,120,0.06)',
                    cursor: savingInput || !sync.connected ? 'not-allowed' : 'pointer',
                  }}
                >
                  {savingInput ? '保存中...' : '保存当前输入'}
                </button>
                <span className="font-mono text-[8px] text-white/25">标签:</span>
                <input
                  value={inputLabel}
                  onChange={e => setInputLabel(e.target.value)}
                  placeholder="P3-小美小凯-异地争吵"
                  className="flex-1 rounded-lg px-2 py-1 text-[11px] text-white/70 placeholder-white/18 focus:outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    fontFamily: '"PingFang SC","Inter",sans-serif',
                  }}
                />
              </div>

              {saveInputError && (
                <div className="font-mono text-[9px] mt-1.5" style={{ color: '#e87a7a' }}>
                  {saveInputError}
                </div>
              )}
            </div>

            {/* Chat log input */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] text-white/30 tracking-widest">聊天记录 *</span>
                <input type="file" accept=".html,.htm,.txt" onChange={handleFile}
                  className="font-mono text-[8px] text-white/30" />
              </div>
              <textarea
                value={rawText}
                onChange={e => handleTextChange(e.target.value)}
                placeholder={'粘贴微信聊天记录...\n\n示例：\n小美：你为什么不回我消息？\n小凯：我当时在忙啊'}
                className="w-full rounded-xl px-4 py-3.5 text-sm resize-none focus:outline-none"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${rawText.length > 20 ? 'rgba(122,176,232,0.22)' : 'rgba(255,255,255,0.08)'}`,
                  color: 'rgba(255,255,255,0.78)',
                  fontFamily: '"PingFang SC","JetBrains Mono","Inter",monospace',
                  fontSize: '13px', lineHeight: '1.65', caretColor: '#7ab0e8',
                  minHeight: '140px',
                }}
              />
              {detectedFmt && (
                <span className="font-mono text-[8px] text-white/30">
                  {FORMAT_LABELS[detectedFmt.format]} {detectedFmt.messageCount > 0 && `(${detectedFmt.messageCount} 条)`}
                </span>
              )}
            </div>

            {/* Concerns (researcher fills both sides) */}
            {(parsedText || rawText).trim().length > 20 && (
              <div className="flex gap-4 anim-fadeIn">
                <div className="flex-1 flex flex-col gap-3">
                  <span className="font-mono text-[8px]" style={{ color: '#7ab0e8' }}>
                    {nameA} (A) 的视角
                  </span>
                  <input value={concernA} onChange={e => setConcernA(e.target.value)}
                    maxLength={80} placeholder="A 最想让对方理解的是什么？"
                    className="w-full rounded-lg px-3 py-2 text-[12px] text-white/80 placeholder-white/20 focus:outline-none"
                    style={{ background: 'rgba(122,176,232,0.06)', border: '1px solid rgba(122,176,232,0.15)',
                      fontFamily: '"PingFang SC","Inter",sans-serif' }} />
                  <input value={feeling} onChange={e => setFeeling(e.target.value)}
                    maxLength={80} placeholder="A 当时最强烈的感受"
                    className="w-full rounded-lg px-3 py-2 text-[12px] text-white/80 placeholder-white/20 focus:outline-none"
                    style={{ background: 'rgba(122,176,232,0.06)', border: '1px solid rgba(122,176,232,0.15)',
                      fontFamily: '"PingFang SC","Inter",sans-serif' }} />
                </div>
                <div className="w-px self-stretch" style={{ background: 'rgba(255,255,255,0.05)' }} />
                <div className="flex-1 flex flex-col gap-3">
                  <span className="font-mono text-[8px]" style={{ color: '#e87a7a' }}>
                    {nameB} (B) 的视角
                  </span>
                  <input value={concernB} onChange={e => setConcernB(e.target.value)}
                    maxLength={80} placeholder="B 最想让对方理解的是什么？"
                    className="w-full rounded-lg px-3 py-2 text-[12px] text-white/80 placeholder-white/20 focus:outline-none"
                    style={{ background: 'rgba(232,122,122,0.06)', border: '1px solid rgba(232,122,122,0.15)',
                      fontFamily: '"PingFang SC","Inter",sans-serif' }} />
                  <input value={feelingB} onChange={e => setFeelingB(e.target.value)}
                    maxLength={80} placeholder="B 当时最强烈的感受"
                    className="w-full rounded-lg px-3 py-2 text-[12px] text-white/80 placeholder-white/20 focus:outline-none"
                    style={{ background: 'rgba(232,122,122,0.06)', border: '1px solid rgba(232,122,122,0.15)',
                      fontFamily: '"PingFang SC","Inter",sans-serif' }} />
                </div>
              </div>
            )}

            {/* Context */}
            <input value={context} onChange={e => setContext(e.target.value)}
              maxLength={100} placeholder="一句话背景（例：异地恋半年，最近沟通越来越少）"
              className="w-full rounded-lg px-3 py-2 text-[12px] text-white/70 placeholder-white/18 focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                fontFamily: '"PingFang SC","Inter",sans-serif' }} />

            {/* Relationship type */}
            <div className="flex flex-col gap-2" style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px', padding: '16px',
            }}>
              <span className="font-mono text-[9px] text-white/30 tracking-[0.15em]">关系设定 *</span>
              <div className="flex gap-2">
                {RELATIONSHIP_TYPES.map(type => (
                  <button key={type.id} onClick={() => setRelationshipType(type.id)}
                    className="flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all"
                    style={{
                      background: relationshipType === type.id ? 'rgba(122,176,232,0.12)' : 'rgba(255,255,255,0.03)',
                      border: `1.5px solid ${relationshipType === type.id ? 'rgba(122,176,232,0.5)' : 'rgba(255,255,255,0.07)'}`,
                      cursor: 'pointer',
                    }}>
                    <span style={{ fontSize: '18px' }}>{type.icon}</span>
                    <span className="font-mono text-[9px]" style={{
                      color: relationshipType === type.id ? '#7ab0e8' : 'rgba(255,255,255,0.45)',
                    }}>{type.label}</span>
                  </button>
                ))}
              </div>

              {/* Communication styles — dual column */}
              <div className="flex gap-3 mt-2">
                <div className="flex-1">
                  <div className="font-mono text-[8px] mb-2" style={{ color: '#7ab0e8' }}>
                    {nameA || 'A'} 更像
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {COMM_STYLES.map(s => (
                      <button key={s.id} onClick={() => toggleStyle(setStyleA, styleA, s.id)}
                        className="w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-left transition-all"
                        style={{
                          background: styleA.includes(s.id) ? 'rgba(122,176,232,0.08)' : 'rgba(255,255,255,0.025)',
                          border: `1px solid ${styleA.includes(s.id) ? 'rgba(122,176,232,0.3)' : 'rgba(255,255,255,0.07)'}`,
                          cursor: 'pointer',
                        }}>
                        <div className="flex-shrink-0 w-3 h-3 rounded mt-0.5 flex items-center justify-center" style={{
                          background: styleA.includes(s.id) ? '#7ab0e8' : 'transparent',
                          border: `1.5px solid ${styleA.includes(s.id) ? '#7ab0e8' : 'rgba(255,255,255,0.2)'}`,
                        }}>
                          {styleA.includes(s.id) && <svg width="8" height="6" viewBox="0 0 8 6"><path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>}
                        </div>
                        <div>
                          <div className="text-[11px]" style={{ color: styleA.includes(s.id) ? '#e8e8e8' : 'rgba(255,255,255,0.55)' }}>{s.label}</div>
                          <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="w-px self-stretch" style={{ background: 'rgba(255,255,255,0.05)' }} />
                <div className="flex-1">
                  <div className="font-mono text-[8px] mb-2" style={{ color: '#e87a7a' }}>
                    {nameB || 'B'} 更像
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {COMM_STYLES.map(s => (
                      <button key={s.id} onClick={() => toggleStyle(setStyleB, styleB, s.id)}
                        className="w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-left transition-all"
                        style={{
                          background: styleB.includes(s.id) ? 'rgba(232,122,122,0.08)' : 'rgba(255,255,255,0.025)',
                          border: `1px solid ${styleB.includes(s.id) ? 'rgba(232,122,122,0.3)' : 'rgba(255,255,255,0.07)'}`,
                          cursor: 'pointer',
                        }}>
                        <div className="flex-shrink-0 w-3 h-3 rounded mt-0.5 flex items-center justify-center" style={{
                          background: styleB.includes(s.id) ? '#e87a7a' : 'transparent',
                          border: `1.5px solid ${styleB.includes(s.id) ? '#e87a7a' : 'rgba(255,255,255,0.2)'}`,
                        }}>
                          {styleB.includes(s.id) && <svg width="8" height="6" viewBox="0 0 8 6"><path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>}
                        </div>
                        <div>
                          <div className="text-[11px]" style={{ color: styleB.includes(s.id) ? '#e8e8e8' : 'rgba(255,255,255,0.55)' }}>{s.label}</div>
                          <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="font-mono text-[10px] text-center py-2 rounded-lg" style={{
                color: '#e87a7a', background: 'rgba(232,122,122,0.08)',
                border: '1px solid rgba(232,122,122,0.18)',
              }}>{error}</div>
            )}

            {/* Engine + submit */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg" style={{
                background: API_KEY_AVAILABLE ? 'rgba(122,176,232,0.07)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${API_KEY_AVAILABLE ? 'rgba(122,176,232,0.2)' : 'rgba(255,255,255,0.07)'}`,
              }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{
                  background: API_KEY_AVAILABLE ? '#7ab0e8' : '#444',
                  boxShadow: API_KEY_AVAILABLE ? '0 0 5px #7ab0e8' : 'none',
                }} />
                <span className="font-mono text-[8px]" style={{
                  color: API_KEY_AVAILABLE ? '#7ab0e8' : 'rgba(255,255,255,0.22)',
                }}>
                  {API_KEY_AVAILABLE ? '引擎就绪' : '离线模式'}
                </span>
              </div>
              <div className="flex-1" />
              <button onClick={handleSubmit} disabled={!canSubmit || processing}
                className="font-mono text-[12px] tracking-[0.15em] px-8 py-3 rounded-xl border transition-all"
                style={{
                  color: canSubmit ? '#7ab0e8' : 'rgba(255,255,255,0.2)',
                  borderColor: canSubmit ? 'rgba(122,176,232,0.4)' : 'rgba(255,255,255,0.07)',
                  background: canSubmit ? 'rgba(122,176,232,0.07)' : 'transparent',
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                }}>
                {processing ? '生成中...' : '生成场景 / GENERATE'}
              </button>
            </div>
          </div>
        )}

        {/* ── Processing overlay ── */}
        {processing && (
          <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 z-50"
            style={{ background: 'rgba(0,0,0,0.94)' }}>
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: '8px', height: '8px', borderRadius: '50%', background: '#7ab0e8',
                  animation: `blink 1.1s ${i * 0.28}s ease-in-out infinite`,
                }} />
              ))}
            </div>
            <div className="flex flex-col gap-2 w-64">
              {STEPS.map((s, i) => (
                <div key={i} className="flex items-center gap-3 transition-all duration-500"
                  style={{ opacity: i < step ? 0.4 : i === step ? 1 : 0.2 }}>
                  <div style={{
                    width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                    background: i < step ? '#58c878' : i === step ? '#7ab0e8' : 'rgba(255,255,255,0.15)',
                    boxShadow: i === step ? '0 0 8px #7ab0e8' : 'none',
                  }} />
                  <div>
                    <div className="font-mono text-[10px]" style={{
                      color: i === step ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)',
                    }}>{s.label}</div>
                    <div className="font-mono text-[7px] text-white/22">{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Saved scenarios list ── */}
        {savedScenarios.length > 0 && (
          <div className="flex flex-col gap-3 mt-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] text-white/30 tracking-widest">已保存场景</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <span className="font-mono text-[8px] text-white/20">{savedScenarios.length} 个</span>
            </div>
            {savedScenarios.map(item => (
              <SavedScenarioCard key={item.scenarioId} item={item} baseUrl={baseUrl} />
            ))}
          </div>
        )}

      </div>

      {/* Calibration overlay */}
      {showCalibration && calibrationData && pendingInput && (
        <CalibrationOverlay
          personaA={{ name: nameA, color: '#7ab0e8' }}
          personaB={{ name: nameB, color: '#e87a7a' }}
          inferences={calibrationData}
          onConfirm={handleCalibrationConfirm}
          onBack={handleCalibrationBack}
        />
      )}
    </div>
  )
}
