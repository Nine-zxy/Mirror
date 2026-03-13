import { useState } from 'react'
import { C } from '../theme'
import { saveCorrections, markSelfCorrectDone } from '../utils/session'
import TopBar from '../components/TopBar'

// Each person corrects the narrator's inference of their OWN inner state.
// Role A corrects innerA. Role B corrects innerB.

export default function SelfCorrectPhase({ script, personas, myRole, sessionCode, onDone }) {
  const [corrections, setCorrections] = useState({}) // { [beatId]: { status: 'v'|'edited', text: '' } }
  const [editing, setEditing]         = useState(null)
  const [draft, setDraft]             = useState('')
  const [saving, setSaving]           = useState(false)
  const [waiting, setWaiting]         = useState(false)

  const innerKey = myRole === 'A' ? 'innerA' : 'innerB'
  const myName   = personas?.[myRole]?.name || (myRole === 'A' ? '她' : '他')
  const myColor  = myRole === 'A' ? C.a : C.b

  const correctable = script.filter(line => line[innerKey])

  const allDone = correctable.every(l => corrections[l.id]?.status === 'v' || corrections[l.id]?.status === 'edited')

  const saveEdit = (id) => {
    setCorrections(prev => ({ ...prev, [id]: { status: 'edited', text: draft } }))
    setEditing(null)
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await saveCorrections(sessionCode, myRole, corrections)
      await markSelfCorrectDone(sessionCode, myRole)
      setWaiting(true)
      onDone(corrections)
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
          <p style={{ fontSize: 13, color: C.mu, fontFamily: 'DM Mono, monospace' }}>等待对方完成修正…</p>
          <p style={{ marginTop: 8, fontSize: 11, color: C.mu }}>完成后将进入对比阶段</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <TopBar
        label="修正你自己的内心"
        labelColor={myColor}
        progress={`${Object.keys(corrections).filter(k => corrections[k]?.status).length} / ${correctable.length}`}
        done={allDone}
        onNext={handleSubmit}
        nextLabel={saving ? '保存中…' : '提交修正 →'}
      />

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px 80px' }}>
        <div style={{ marginBottom: 28 }}>
          <p style={{ margin: '0 0 4px', fontSize: 10, color: myColor, fontFamily: 'DM Mono, monospace', letterSpacing: '0.15em', textTransform: 'uppercase' }}>换到你自己</p>
          <h2 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 300, fontFamily: 'Cormorant Garamond, serif', lineHeight: 1.3 }}>
            旁白对你内心的猜想，准确吗？
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: C.mu, lineHeight: 1.8 }}>
            如果不准确，写下你当时真正在想的——这会成为对比的依据。
          </p>
        </div>

        {correctable.map((line, idx) => {
          const corr    = corrections[line.id]
          const corrStatus = corr?.status
          const corrCol = { v: C.gr, edited: myColor }[corrStatus] || C.mu
          const speakerName = line.speaker === 'A'
            ? (personas?.A?.name || '她')
            : (personas?.B?.name || '他')

          return (
            <div key={line.id} className="rise" style={{ marginBottom: 10, animationDelay: `${idx * 0.06}s`, background: C.card, border: `1.5px solid ${corrStatus ? corrCol + '44' : C.bd}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color .25s' }}>
              {/* Context */}
              <div style={{ padding: '10px 16px', borderBottom: `1px solid ${C.bd}` }}>
                <p style={{ margin: 0, fontSize: 12, color: C.mu, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
                  {line.speaker === 'action'
                    ? `[ ${line.text} ]`
                    : `${speakerName} 说：${line.text}`}
                </p>
              </div>

              {/* Inner state */}
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 3px', fontSize: 9, color: myColor, fontFamily: 'DM Mono, monospace', letterSpacing: '0.12em' }}>
                      {corrStatus === 'edited' ? '你说实际上是' : '旁白猜你的内心'}
                    </p>
                    <p style={{ margin: 0, fontSize: 15, color: corrStatus === 'edited' ? myColor : myColor + '88', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {corrStatus === 'edited' ? corr.text : line[innerKey]?.replace(/\\n/g, '\n')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                    <button onClick={() => setCorrections(prev => ({ ...prev, [line.id]: { status: 'v', text: line[innerKey] } }))}
                      style={{ padding: '6px 11px', borderRadius: 8, border: `1.5px solid ${corrStatus === 'v' ? C.gr : C.bd2}`, background: corrStatus === 'v' ? C.gr + '18' : C.dim, color: corrStatus === 'v' ? C.gr : C.mu, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Mono, monospace', transition: 'all .2s' }}>
                      ✓ 准确
                    </button>
                    <button onClick={() => { setCorrections(prev => ({ ...prev, [line.id]: { status: 'editing', text: '' } })); setEditing(line.id); setDraft('') }}
                      style={{ padding: '6px 11px', borderRadius: 8, border: `1.5px solid ${corrStatus === 'edited' ? myColor : C.bd2}`, background: corrStatus === 'edited' ? myColor + '18' : C.dim, color: corrStatus === 'edited' ? myColor : C.mu, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Mono, monospace', transition: 'all .2s' }}>
                      ✎ 修正
                    </button>
                  </div>
                </div>

                {editing === line.id && (
                  <div style={{ marginTop: 12 }} className="rise">
                    <textarea
                      autoFocus
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      placeholder="我当时实际上在想…"
                      style={{ width: '100%', padding: '10px 14px', background: C.stage, border: `1.5px solid ${myColor}55`, borderRadius: 9, color: C.tx, fontSize: 13, outline: 'none', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', resize: 'none', minHeight: 64, lineHeight: 1.7 }}
                      onFocus={e => e.target.style.borderColor = myColor + '99'}
                      onBlur={e => e.target.style.borderColor = myColor + '55'}
                    />
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      <button onClick={() => setEditing(null)} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${C.bd2}`, background: 'transparent', color: C.mu, fontSize: 11, cursor: 'pointer' }}>取消</button>
                      <button onClick={() => saveEdit(line.id)} disabled={!draft.trim()} style={{ padding: '6px 18px', borderRadius: 8, border: 'none', background: draft.trim() ? myColor : C.dim, color: draft.trim() ? '#fff' : C.mu, fontSize: 11, fontWeight: 600, cursor: draft.trim() ? 'pointer' : 'default' }}>保存</button>
                    </div>
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
