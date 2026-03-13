import { useState } from 'react'
import { C } from '../theme'
import TopBar from '../components/TopBar'

// A beat is divergent if:
//   - The OTHER person marked the AI's portrayal as 'x' or 'q'
//   So: beat[i] diverges if annOther[i].val === 'x' or 'q'
//       where annOther = the partner's annotations of MY inner state.
//
// For role A:  annOther = sessionData.annotations.B (B's view of A's innerA)
//              myCorr   = sessionData.corrections.A  (A's truth about innerA)
// For role B:  annOther = sessionData.annotations.A (A's view of B's innerB)
//              myCorr   = sessionData.corrections.B  (B's truth about innerB)

export default function ComparePhase({ script, personas, myRole, sessionData, onNext }) {
  const [expanded, setExpanded] = useState(new Set())

  const partnerRole = myRole === 'A' ? 'B' : 'A'
  const myInnerKey  = myRole === 'A' ? 'innerA' : 'innerB'

  // Partner's annotations of MY inner states
  const partnerAnnotationsOfMe = sessionData?.annotations?.[partnerRole] || {}
  // My corrections of my own inner states
  const myCorrections          = sessionData?.corrections?.[myRole] || {}
  // My annotations of PARTNER's inner states
  const myAnnotationsOfPartner = sessionData?.annotations?.[myRole] || {}
  // Partner's corrections
  const partnerCorrections     = sessionData?.corrections?.[partnerRole] || {}

  const myName      = personas?.[myRole]?.name || (myRole === 'A' ? '她' : '他')
  const partnerName = personas?.[partnerRole]?.name || (partnerRole === 'A' ? '她' : '他')
  const myColor     = myRole === 'A' ? C.a : C.b
  const partnerColor = partnerRole === 'A' ? C.a : C.b
  const myBg        = myRole === 'A' ? C.aBg : C.bBg
  const myBd        = myRole === 'A' ? C.aBd : C.bBd

  // Collect ALL divergent beats (from either perspective)
  const divergences = script.filter(line => {
    const partnerSawMe    = partnerAnnotationsOfMe[line.id]?.val
    const iSawPartner     = myAnnotationsOfPartner[line.id]?.val
    const hasDivFromMe    = iSawPartner === 'x' || iSawPartner === 'q'
    const hasDivFromPartner = partnerSawMe === 'x' || partnerSawMe === 'q'
    return hasDivFromMe || hasDivFromPartner
  })

  const toggle = (id) => setExpanded(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  return (
    <div style={{ minHeight: '100vh' }}>
      <TopBar
        label={`⚡ ${divergences.length} 处分歧`}
        labelColor={C.div}
        done={true}
        onNext={onNext}
        nextLabel="开始协商 →"
      />

      <div style={{ maxWidth: 740, margin: '0 auto', padding: '32px 24px 80px' }}>
        <div style={{ marginBottom: 28 }}>
          <p style={{ margin: '0 0 4px', fontSize: 10, color: C.div, fontFamily: 'DM Mono, monospace', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            双方都完成了标注
          </p>
          <h2 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 300, fontFamily: 'Cormorant Garamond, serif', lineHeight: 1.3 }}>
            你们看同一场戏，在不同的地方产生了疑问。
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: C.mu, lineHeight: 1.8 }}>
            ⚡ 标记的是分歧点——你或对方对 AI 的推断提出了质疑。点击展开。
          </p>
        </div>

        {script.map((line, idx) => {
          const partnerSawMe    = partnerAnnotationsOfMe[line.id]
          const iSawPartner     = myAnnotationsOfPartner[line.id]
          const partnerInnerKey = myRole === 'A' ? 'innerB' : 'innerA'

          const hasDivFromMe      = iSawPartner?.val === 'x' || iSawPartner?.val === 'q'
          const hasDivFromPartner = partnerSawMe?.val === 'x' || partnerSawMe?.val === 'q'
          const isDiv             = hasDivFromMe || hasDivFromPartner
          const open              = expanded.has(line.id)

          // Resolve what each party says was the truth
          const myTruth      = myCorrections[line.id]?.status === 'edited'
            ? myCorrections[line.id]?.text
            : (line[myInnerKey]?.replace(/\\n/g, '\n') || null)

          const partnerTruth = partnerCorrections[line.id]?.status === 'edited'
            ? partnerCorrections[line.id]?.text
            : (line[partnerInnerKey]?.replace(/\\n/g, '\n') || null)

          return (
            <div key={line.id} className="rise" style={{ animationDelay: `${idx * 0.04}s` }}>
              {/* Line row */}
              <div
                onClick={() => isDiv && toggle(line.id)}
                style={{
                  padding: '16px 20px', cursor: isDiv ? 'pointer' : 'default',
                  display: 'flex', gap: 14, alignItems: 'center',
                  borderLeft: `3px solid ${isDiv ? (open ? C.div : C.div + '66') : C.bd}`,
                  marginBottom: 1, background: open ? C.card + '88' : 'transparent',
                  borderRadius: open ? '8px 8px 0 0' : 0, transition: 'all .2s',
                }}
              >
                <span style={{ fontSize: 13, flexShrink: 0, opacity: isDiv ? 1 : 0.3 }}>
                  {isDiv ? '⚡' : '·'}
                </span>
                <div style={{ flex: 1 }}>
                  {line.speaker !== 'action' && (
                    <p style={{ margin: '0 0 2px', fontSize: 9, letterSpacing: '0.2em', color: line.speaker === 'A' ? C.a : C.b, fontFamily: 'DM Mono, monospace', textTransform: 'uppercase' }}>
                      {line.speaker === 'A' ? personas?.A?.name || '她' : personas?.B?.name || '他'}
                    </p>
                  )}
                  <p style={{ margin: 0, fontSize: 15, color: isDiv ? C.tx : C.mu, fontFamily: 'Cormorant Garamond, serif', fontStyle: line.speaker === 'action' ? 'italic' : 'normal', lineHeight: 1.5 }}>
                    {line.speaker === 'action' ? `[ ${line.text} ]` : line.text}
                  </p>
                </div>
                {isDiv && <span style={{ fontSize: 10, color: C.mu }}>{open ? '▲' : '▼'}</span>}
              </div>

              {/* Expanded divergence detail */}
              {open && isDiv && (
                <div className="drift" style={{ padding: '16px 20px 20px', background: C.card, borderLeft: `3px solid ${C.div}`, borderRadius: '0 0 8px 8px', marginBottom: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>

                    {/* My side */}
                    {myTruth && (
                      <div style={{ padding: '12px 14px', background: myBg, border: `1px solid ${myBd}`, borderRadius: 10 }}>
                        <p style={{ margin: '0 0 4px', fontSize: 9, color: myColor, fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em' }}>
                          {myName}（你）{myCorrections[line.id]?.status === 'edited' ? '说实际上在想' : '的内心（AI 推断，你认同）'}
                        </p>
                        <p style={{ margin: 0, fontSize: 14, color: myColor + 'CC', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', lineHeight: 1.7 }}>
                          {myTruth}
                        </p>
                        {partnerSawMe && (
                          <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${myBd}` }}>
                            <span style={{ fontSize: 9, color: partnerColor, fontFamily: 'DM Mono, monospace' }}>
                              {partnerName}说：{partnerSawMe.val === 'v' ? '✓ 认为 AI 推断准确' : partnerSawMe.val === 'x' ? '✗ 不认同 AI 推断' : '? 不确定'}
                            </span>
                            {partnerSawMe.note && (
                              <p style={{ margin: '4px 0 0', fontSize: 12, color: partnerColor + 'AA', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
                                「{partnerSawMe.note}」
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Partner side */}
                    {partnerTruth && (
                      <div style={{ padding: '12px 14px', background: partnerRole === 'A' ? C.aBg : C.bBg, border: `1px solid ${partnerRole === 'A' ? C.aBd : C.bBd}`, borderRadius: 10 }}>
                        <p style={{ margin: '0 0 4px', fontSize: 9, color: partnerColor, fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em' }}>
                          {partnerName}{partnerCorrections[line.id]?.status === 'edited' ? '说实际上在想' : '的内心（AI 推断）'}
                        </p>
                        <p style={{ margin: 0, fontSize: 14, color: partnerColor + 'CC', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', lineHeight: 1.7 }}>
                          {partnerTruth}
                        </p>
                        {iSawPartner && (
                          <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${partnerRole === 'A' ? C.aBd : C.bBd}` }}>
                            <span style={{ fontSize: 9, color: myColor, fontFamily: 'DM Mono, monospace' }}>
                              {myName}说：{iSawPartner.val === 'v' ? '✓ 认为 AI 推断准确' : iSawPartner.val === 'x' ? '✗ 不认同 AI 推断' : '? 不确定'}
                            </span>
                            {iSawPartner.note && (
                              <p style={{ margin: '4px 0 0', fontSize: 12, color: myColor + 'AA', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
                                「{iSawPartner.note}」
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '10px 14px', background: C.div + '0A', border: `1px solid ${C.div}22`, borderRadius: 8 }}>
                    <p style={{ margin: 0, fontSize: 12, color: C.div }}>这个地方，你们的理解不一样。下一步你们会各自说说为什么。</p>
                  </div>
                </div>
              )}

              {!open && <div style={{ height: 1, background: C.bd, marginBottom: 1 }} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
