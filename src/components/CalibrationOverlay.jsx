// ─────────────────────────────────────────────────────────────
//  CalibrationOverlay — Layer 2 behavioral calibration
//
//  After LLM reads the chat log, it infers 2-3 behavioral patterns
//  per partner. Users confirm or adjust each inference before the
//  full scene generation runs.
//
//  This implements the "inter-subjective calibration" step, where
//  the system proposes its understanding and the user corrects it
//  (ref: Drama Machine, arXiv 2024).
//
//  Props:
//    personaA    — { name, color }
//    personaB    — { name, color }
//    inferences  — { inferA: [{text}], inferB: [{text}] }
//    onConfirm   — (confirmed: { inferA, inferB }) => void
//    onBack      — () => void
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'

function InferenceItem({ text, personaColor, onChange }) {
  const [status, setStatus] = useState('confirmed')   // 'confirmed' | 'adjusting' | 'adjusted'
  const [editValue, setEditValue] = useState(text)
  const [savedText, setSavedText] = useState(text)

  const handleAdjustClick = () => {
    setEditValue(savedText)
    setStatus('adjusting')
  }

  const handleSave = () => {
    setSavedText(editValue)
    setStatus('adjusted')
    onChange({ text: savedText, confirmed: true, adjusted: editValue })
  }

  const handleConfirmToggle = () => {
    if (status === 'confirmed' || status === 'adjusted') {
      onChange({ text: savedText, confirmed: true, adjusted: status === 'adjusted' ? savedText : undefined })
    }
  }

  // Sync upward on initial mount
  useEffect(() => {
    onChange({ text, confirmed: true })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className="mb-3 rounded-lg overflow-hidden transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${status === 'adjusted' ? personaColor + '60' : 'rgba(255,255,255,0.08)'}`,
      }}
    >
      {/* Main row */}
      <div className="flex items-start gap-3 px-4 py-3">
        <span
          className="shrink-0 mt-0.5 text-xs"
          style={{ color: personaColor, opacity: 0.8 }}
        >・</span>

        {status === 'adjusting' ? (
          <div className="flex-1">
            <textarea
              className="w-full text-sm resize-none rounded px-2 py-1.5 outline-none"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: '#e8e8e8',
                border: `1px solid ${personaColor}80`,
                minHeight: '60px',
                fontFamily: 'inherit',
              }}
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSave}
                className="text-xs px-3 py-1 rounded font-medium transition-opacity"
                style={{ background: personaColor + '30', color: personaColor, border: `1px solid ${personaColor}50` }}
              >
                保存修改
              </button>
              <button
                onClick={() => setStatus('confirmed')}
                className="text-xs px-3 py-1 rounded text-gray-400 transition-opacity hover:text-gray-300"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <>
            <span
              className="flex-1 text-sm leading-relaxed"
              style={{
                color: status === 'adjusted' ? '#e8e8e8' : '#c4c4c4',
                textDecoration: 'none',
              }}
            >
              {status === 'adjusted' ? editValue : savedText}
              {status === 'adjusted' && (
                <span
                  className="ml-2 text-xs px-1.5 py-0.5 rounded"
                  style={{ background: personaColor + '20', color: personaColor, border: `1px solid ${personaColor}40` }}
                >
                  已调整
                </span>
              )}
            </span>

            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <button
                onClick={handleAdjustClick}
                className="text-xs px-2.5 py-1 rounded transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: '#888',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                title="调整这条推断"
              >
                ✎ 调整
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function PersonaSection({ persona, inferences, onUpdate }) {
  const items = inferences || []
  const [confirmed, setConfirmed] = useState(
    items.map(item => ({ text: item.text, confirmed: true }))
  )

  const handleItemChange = (idx, data) => {
    const updated = [...confirmed]
    updated[idx] = data
    setConfirmed(updated)
    onUpdate(updated)
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: persona.color }}
        />
        <span
          className="text-xs font-medium tracking-wider uppercase"
          style={{ color: persona.color }}
        >
          关于 {persona.name}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500 italic px-4">无特别推断</p>
      ) : (
        items.map((item, idx) => (
          <InferenceItem
            key={idx}
            text={item.text}
            personaColor={persona.color}
            onChange={data => handleItemChange(idx, data)}
          />
        ))
      )}
    </div>
  )
}

export default function CalibrationOverlay({
  personaA,
  personaB,
  inferences,
  onConfirm,
  onBack,
}) {
  const [confirmedA, setConfirmedA] = useState([])
  const [confirmedB, setConfirmedB] = useState([])

  const handleConfirm = () => {
    onConfirm({ inferA: confirmedA, inferB: confirmedB })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(5, 8, 18, 0.92)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-lg mx-4 rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(14, 18, 32, 0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          className="px-6 pt-6 pb-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: '#6a9fd8', letterSpacing: '0.15em' }}
            >
              CALIBRATION
            </span>
          </div>
          <h2 className="text-white text-lg font-medium">
            根据你们的对话，系统推断：
          </h2>
          <p className="text-xs mt-1" style={{ color: '#666' }}>
            这些推断用于重构场景角色行为，不会被对方直接看到。请确认或调整。
          </p>
        </div>

        {/* Inferences */}
        <div className="px-6 pt-5">
          <PersonaSection
            persona={personaA}
            inferences={inferences?.inferA || []}
            onUpdate={setConfirmedA}
          />
          <PersonaSection
            persona={personaB}
            inferences={inferences?.inferB || []}
            onUpdate={setConfirmedB}
          />
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button
            onClick={onBack}
            className="text-sm px-4 py-2 rounded-lg transition-all"
            style={{
              color: '#666',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            ← 返回修改
          </button>

          <button
            onClick={handleConfirm}
            className="text-sm font-semibold px-6 py-2.5 rounded-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, #1e4a8a 0%, #2a6acc 100%)',
              color: '#e8f0ff',
              border: '1px solid #3a7ae0',
              boxShadow: '0 4px 16px rgba(42, 106, 204, 0.3)',
              letterSpacing: '0.02em',
            }}
          >
            确认，开始生成场景 →
          </button>
        </div>
      </div>
    </div>
  )
}
