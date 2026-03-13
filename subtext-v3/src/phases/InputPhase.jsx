import { useState, useRef } from 'react'
import { C } from '../theme'
import { parseChatLog, FORMAT_LABELS } from '../utils/parseChatLog'
import { generateScenario, API_KEY_AVAILABLE } from '../utils/generateScenario'
import { createSession } from '../utils/session'

const STEPS = ['解析聊天记录', '提取冲突结构', '推断内心独白', '生成剧本']

export default function InputPhase({ onReady }) {
  const [raw, setRaw]         = useState('')
  const [parsed, setParsed]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep]       = useState(-1)
  const [error, setError]     = useState(null)
  const fileRef               = useRef()

  const handleText = (val) => {
    setRaw(val)
    if (val.trim()) setParsed(parseChatLog(val))
    else setParsed(null)
  }

  const handleFile = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => handleText(e.target.result)
    reader.readAsText(file, 'utf-8')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleGenerate = async () => {
    if (!parsed?.text) return
    setLoading(true)
    setError(null)
    try {
      // Animate steps
      for (let i = 0; i < STEPS.length; i++) {
        setStep(i)
        await new Promise(r => setTimeout(r, 700 + i * 300))
      }

      const { script, source } = await generateScenario(parsed.text)
      console.log('[Subtext] Script generated:', source, script)

      // Create session (role A is always the creator)
      const code = await createSession(script.script, script.personas)

      onReady({
        code,
        role: 'A',
        scriptData: script,
        source,
      })
    } catch (err) {
      setError(err.message)
      setLoading(false)
      setStep(-1)
    }
  }

  const canGenerate = parsed?.text && parsed.format !== 'empty' && !loading

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{ maxWidth: 600, width: '100%' }} className="fade">
        {/* Header */}
        <p style={{ margin: '0 0 6px', fontSize: 9, letterSpacing: '0.4em', color: C.mu, fontFamily: 'DM Mono, monospace', textTransform: 'uppercase' }}>
          SUBTEXT
        </p>
        <h1 style={{ margin: '0 0 8px', fontSize: 38, fontWeight: 300, fontFamily: 'Cormorant Garamond, serif', lineHeight: 1.2 }}>
          输入你们的对话
        </h1>
        <p style={{ margin: '0 0 28px', fontSize: 13, color: C.mu, lineHeight: 2 }}>
          粘贴聊天记录，或拖入 .txt / .html 文件。<br />
          AI 会重建那场冲突，并为每一刻补上内心独白。
        </p>

        {/* Drop zone + textarea */}
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          style={{
            background: C.card,
            border: `1.5px dashed ${raw ? C.bd2 : C.bd}`,
            borderRadius: 12,
            padding: 2,
            marginBottom: 12,
            transition: 'border-color .2s',
          }}
        >
          <textarea
            value={raw}
            onChange={e => handleText(e.target.value)}
            placeholder="在此粘贴聊天记录，或把文件拖到这里……&#10;&#10;也可以用文字描述冲突经过。"
            disabled={loading}
            style={{
              width: '100%', minHeight: 220, padding: '16px 18px',
              background: 'transparent', border: 'none', outline: 'none',
              color: C.tx, fontSize: 13, fontFamily: 'DM Mono, monospace',
              lineHeight: 1.8, resize: 'vertical', opacity: loading ? 0.5 : 1,
            }}
          />
        </div>

        {/* Format badge */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            style={{ padding: '7px 16px', borderRadius: 8, border: `1px solid ${C.bd2}`, background: C.dim, color: C.mu, fontSize: 11, cursor: 'pointer', fontFamily: 'DM Mono, monospace' }}
          >
            ↑ 上传文件
          </button>
          <input ref={fileRef} type="file" accept=".txt,.html,.htm" style={{ display: 'none' }} onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />

          {parsed && parsed.format !== 'empty' && (
            <span style={{
              padding: '4px 10px', borderRadius: 6,
              background: parsed.format === 'freetext' ? C.yw + '18' : C.gr + '18',
              color: parsed.format === 'freetext' ? C.yw : C.gr,
              fontSize: 10, fontFamily: 'DM Mono, monospace',
            }}>
              {FORMAT_LABELS[parsed.format]}
              {parsed.messageCount > 0 && ` · ${parsed.messageCount} 条`}
            </span>
          )}

          {!API_KEY_AVAILABLE && (
            <span style={{ fontSize: 10, color: C.mu, fontFamily: 'DM Mono, monospace' }}>
              ⚠ 无 API Key — 使用内置剧本
            </span>
          )}
        </div>

        {/* Generate button / loading */}
        {loading ? (
          <div style={{ background: C.card, border: `1px solid ${C.bd}`, borderRadius: 12, padding: '20px 24px' }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < STEPS.length - 1 ? 10 : 0 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                  background: i < step ? C.gr : i === step ? 'transparent' : C.dim,
                  border: i === step ? `2px solid ${C.a}` : 'none',
                  animation: i === step ? 'spin 1s linear infinite' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: C.gr,
                }}>
                  {i < step ? '✓' : ''}
                </div>
                <span style={{ fontSize: 12, color: i <= step ? C.tx : C.mu, fontFamily: 'DM Mono, monospace', transition: 'color .3s' }}>
                  {s}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            style={{
              width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
              background: canGenerate ? C.tx : C.dim,
              color: canGenerate ? C.bg : C.mu,
              fontSize: 14, fontWeight: 600, cursor: canGenerate ? 'pointer' : 'default',
              letterSpacing: '.02em', transition: 'all .25s',
            }}
          >
            生成剧本并创建会话 →
          </button>
        )}

        {error && (
          <p style={{ marginTop: 12, fontSize: 12, color: C.re, fontFamily: 'DM Mono, monospace' }}>
            错误：{error}
          </p>
        )}
      </div>
    </div>
  )
}
