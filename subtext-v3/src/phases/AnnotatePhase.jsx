import { useState } from 'react'
import { C } from '../theme'
import { saveAnnotations, markAnnotateDone } from '../utils/session'
import TopBar from '../components/TopBar'

// Role A annotates B's inner thoughts (innerB) — "does the narrator's portrayal of B match what I know of B?"
// Role B annotates A's inner thoughts (innerA) — "does the narrator's portrayal of A match what I know of A?"

export default function AnnotatePhase({ script, personas, myRole, sessionCode, onDone }) {
  const [annotations, setAnnotations] = useState({}) // { [beatId]: { val: 'v'|'x'|'q', note: '' } }
  const [saving, setSaving]           = useState(false)
  const [waiting, setWaiting]         = useState(false)

  // Role-based display
  const targetRole  = myRole === 'A' ? 'B' : 'A'
  const innerKey    = myRole === 'A' ? 'innerB' : 'innerA'
  const targetName  = personas?.[targetRole]?.name || (targetRole === 'A' ? '她' : '他')
  const targetColor = targetRole === 'A' ? C.a : C.b

  // Only beats that have an inner thought for the target role
  const annotatable = script.filter(line => line[innerKey])

  const set = (id, val, note = '') => {
    setAnnotations(prev => ({ ...prev, [id]: { val, note: note ?? prev[id]?.note ?? '' } }))
  }
  const setNote = (id, note) => {
    setAnnotations(prev => ({ ...prev, [id]: { ...prev[id], note } }))
  }

  const allDone = annotatable.every(l => annotations[l.id]?.val)

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await saveAnnotations(sessionCode, myRole, annotations)
      await markAnnotateDone(sessionCode, myRole)
      setWaiting(true)
      onDone(annotations)
    } catch (err) {
      console.error(err)
      setSaving(false)
    }
  }

  if (waiting) {
    return (
      <div style={centered}>
        <div style={{ textAlign: 'center' }} className="fade">
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: C.mu, animation: `blink 1.8s ${i * 0.3}s infinite` }} />
            ))}
          </div>
          <p style={{ fontSize: 13, color: C.mu, fontFamily: 'DM Mono, monospace' }}>等待对方完成标注…</p>
          <p style={{ marginTop: 8, fontSize: 11, color: C.mu }}>完成后将自动进入下一阶段</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <TopBar
        label={`标注${targetName}的内心`}
        labelColor={targetColor}
        progress={`${Object.keys(annotations).filter(k => annotations[k]?.val).length} / ${annotatable.length}`}
        done={allDone}
        onNext={handleSubmit}
        nextLabel={saving ? '保存中…' : '提交标注 →'}
      />

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px 80px' }}>
        <div style={{ marginBottom: 28 }}>
          <p style={{ margin: '0 0 4px', fontSize: 10, color: targetColor, fontFamily: 'DM Mono, monospace', letterSpacing: '0.15em', textTransform: 'uppercase' }}>你在标注的是</p>
          <h2 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 300, fontFamily: 'Cormorant Garamond, serif', lineHeight: 1.3 }}>
            旁白对{targetName}内心的猜想，符合你对{targetName}的了解吗？
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: C.mu, lineHeight: 1.8 }}>
            不是评判{targetName}对不对，而是：旁白描绘的{targetName}，像不像你认识的那个人。
          </p>
        </div>

        {annotatable.map((line, idx) => {
          const ann     = annotations[line.id]
          const annVal  = ann?.val
          const annCol  = { v: C.gr, x: C.re, q: C.yw }[annVal] || C.mu
          const speakerName = line.speaker === 'A'
            ? (personas?.A?.name || '她')
            : (personas?.B?.name || '他')

          return (
            <div key={line.id} className="rise" style={{ marginBottom: 12, animationDelay: `${idx * 0.06}s`, background: C.card, border: `1.5px solid ${annVal ? annCol + '44' : C.bd}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color .25s' }}>
              {/* Context line */}
              <div style={{ padding: '11px 18px', borderBottom: `1px solid ${C.bd}`, display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 3, height: 3, borderRadius: '50%', background: line.speaker === 'A' ? C.a : line.speaker === 'B' ? C.b : C.mu, flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: 12, color: C.mu, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', lineHeight: 1.5 }}>
                  {line.speaker === 'action'
                    ? `[ ${line.text} ]`
                    : `${speakerName} 说：${line.text}`}
                </p>
              </div>

              {/* Narrator's inferred inner */}
              <div style={{ padding: '14px 18px' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 4px', fontSize: 9, color: targetColor, fontFamily: 'DM Mono, monospace', letterSpacing: '0.12em' }}>旁白猜{targetName}的内心</p>
                    <p style={{ margin: 0, fontSize: 15, color: targetColor + 'BB', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                      {line[innerKey]?.replace(/\\n/g, '\n')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                    {[
                      { v: 'v', l: `✓ 像${targetName}`, c: C.gr },
                      { v: 'x', l: `✗ 不像`, c: C.re },
                      { v: 'q', l: `? 不确定`, c: C.yw },
                    ].map(({ v, l, c }) => (
                      <button key={v} onClick={() => set(line.id, v)}
                        style={{ padding: '6px 11px', borderRadius: 8, border: `1.5px solid ${annVal === v ? c : C.bd2}`, background: annVal === v ? c + '18' : C.dim, color: annVal === v ? c : C.mu, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Mono, monospace', transition: 'all .2s', whiteSpace: 'nowrap' }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {annVal === 'x' && (
                  <div style={{ marginTop: 12 }} className="rise">
                    <p style={{ margin: '0 0 5px', fontSize: 10, color: C.re, fontFamily: 'DM Mono, monospace' }}>
                      {targetName}为什么不会这样想？
                    </p>
                    <input
                      value={ann?.note || ''}
                      onChange={e => setNote(line.id, e.target.value)}
                      placeholder={`因为${targetName}……`}
                      style={{ width: '100%', padding: '10px 14px', background: C.stage, border: `1.5px solid ${C.re}44`, borderRadius: 9, color: C.tx, fontSize: 13, outline: 'none', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}
                      onFocus={e => e.target.style.borderColor = C.re + '99'}
                      onBlur={e => e.target.style.borderColor = C.re + '44'}
                    />
                    <p style={{ margin: '5px 0 0', fontSize: 10, color: C.mu }}>这里的分歧是整个过程最核心的素材。</p>
                  </div>
                )}
                {annVal === 'q' && (
                  <div style={{ marginTop: 12 }} className="rise">
                    <input
                      value={ann?.note || ''}
                      onChange={e => setNote(line.id, e.target.value)}
                      placeholder="我不确定，因为……（可选）"
                      style={{ width: '100%', padding: '10px 14px', background: C.stage, border: `1.5px solid ${C.yw}33`, borderRadius: 9, color: C.tx, fontSize: 13, outline: 'none', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}
                    />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const centered = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }
