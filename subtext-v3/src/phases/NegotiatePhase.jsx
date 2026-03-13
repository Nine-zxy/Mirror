import { useState, useEffect } from 'react'
import { C } from '../theme'
import { saveNegotiateBeat } from '../utils/session'
import TopBar from '../components/TopBar'

// Structured per-divergence negotiation.
// Both people contribute on their own devices.
// A writes first → B responds → shared insight.

export default function NegotiatePhase({ script, personas, myRole, sessionData, sessionCode, onNext }) {
  const [localNeg, setLocalNeg] = useState(sessionData?.negotiate || {})
  const [current, setCurrent]   = useState(0)

  // Keep local state in sync with live session data
  useEffect(() => {
    if (sessionData?.negotiate) setLocalNeg(sessionData.negotiate)
  }, [sessionData])

  const partnerRole   = myRole === 'A' ? 'B' : 'A'
  const myInnerKey    = myRole === 'A' ? 'innerA' : 'innerB'
  const partnerInnerKey = myRole === 'A' ? 'innerB' : 'innerA'
  const myName        = personas?.[myRole]?.name || (myRole === 'A' ? '她' : '他')
  const partnerName   = personas?.[partnerRole]?.name || (partnerRole === 'A' ? '她' : '他')
  const myColor       = myRole === 'A' ? C.a : C.b

  // Divergent beats
  const partnerAnnotationsOfMe = sessionData?.annotations?.[partnerRole] || {}
  const myAnnotationsOfPartner = sessionData?.annotations?.[myRole] || {}
  const divergences = script.filter(line => {
    const a = partnerAnnotationsOfMe[line.id]?.val
    const b = myAnnotationsOfPartner[line.id]?.val
    return a === 'x' || a === 'q' || b === 'x' || b === 'q'
  })

  if (divergences.length === 0) {
    return (
      <div style={centered}>
        <div style={{ textAlign: 'center' }} className="fade">
          <p style={{ fontSize: 18, fontFamily: 'Cormorant Garamond, serif', color: C.tx }}>你们的理解出奇地一致</p>
          <p style={{ marginTop: 12, fontSize: 13, color: C.mu }}>没有发现明显分歧点。</p>
          <button onClick={onNext} style={{ marginTop: 24, padding: '12px 32px', borderRadius: 24, border: 'none', background: C.gr, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>完成 →</button>
        </div>
      </div>
    )
  }

  const line    = divergences[current]
  const isLast  = current === divergences.length - 1
  const neg     = localNeg[line?.id] || {}

  const myReplyKey      = myRole === 'A' ? 'aReply' : 'bReply'
  const partnerReplyKey = myRole === 'A' ? 'bReply' : 'aReply'

  const myReply      = neg[myReplyKey] || ''
  const partnerReply = neg[partnerReplyKey] || ''
  const insight      = neg.insight || ''

  const allInsights  = divergences.every(l => localNeg[l.id]?.insight?.trim())

  const setMyReply = async (val) => {
    const updated = { ...neg, [myReplyKey]: val }
    setLocalNeg(prev => ({ ...prev, [line.id]: updated }))
    await saveNegotiateBeat(sessionCode, line.id, updated)
  }

  const setInsight = async (val) => {
    const updated = { ...neg, insight: val }
    setLocalNeg(prev => ({ ...prev, [line.id]: updated }))
    await saveNegotiateBeat(sessionCode, line.id, updated)
  }

  if (!line) return null

  return (
    <div style={{ minHeight: '100vh' }}>
      <TopBar
        label="协商"
        labelColor={C.div}
        progress={`${current + 1} / ${divergences.length}`}
        done={allInsights}
        onNext={onNext}
        nextLabel="完成 →"
      />

      <div style={{ maxWidth: 660, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 36 }}>
          {divergences.map((_, i) => (
            <div key={i} onClick={() => setCurrent(i)}
              style={{ width: i === current ? 24 : 8, height: 8, borderRadius: 4, background: localNeg[divergences[i].id]?.insight ? C.gr : i === current ? C.div : C.dim, cursor: 'pointer', transition: 'all .3s' }}
            />
          ))}
        </div>

        {/* The moment */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{ margin: '0 0 6px', fontSize: 9, color: C.div, fontFamily: 'DM Mono, monospace', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            分歧点 {current + 1}
          </p>
          <div style={{ display: 'inline-block', padding: '10px 20px', background: C.card, border: `1px solid ${C.div}33`, borderRadius: 10 }}>
            <p style={{ margin: 0, fontSize: 15, color: C.mu, fontFamily: 'Cormorant Garamond, serif', fontStyle: line.speaker === 'action' ? 'italic' : 'normal', lineHeight: 1.5 }}>
              {line.speaker === 'action' ? `[ ${line.text} ]` : line.text}
            </p>
          </div>
        </div>

        {/* My turn */}
        <ReplyBlock
          name={myName}
          color={myColor}
          bg={myRole === 'A' ? C.aBg : C.bBg}
          bd={myRole === 'A' ? C.aBd : C.bBd}
          innerText={sessionData?.corrections?.[myRole]?.[line.id]?.text || line[myInnerKey]?.replace(/\\n/g, '\n')}
          reply={myReply}
          setReply={setMyReply}
          prompt={`知道对方是这样理解这一刻的——你想说什么？`}
          placeholder="我想说……"
          editable={true}
        />

        {/* Partner's turn — show when they have replied, otherwise show waiting */}
        {partnerReply ? (
          <ReplyBlock
            name={partnerName}
            color={myRole === 'A' ? C.b : C.a}
            bg={myRole === 'A' ? C.bBg : C.aBg}
            bd={myRole === 'A' ? C.bBd : C.aBd}
            innerText={sessionData?.corrections?.[partnerRole]?.[line.id]?.text || line[partnerInnerKey]?.replace(/\\n/g, '\n')}
            reply={partnerReply}
            prompt={`对方的回应`}
            editable={false}
          />
        ) : (
          <div style={{ marginBottom: 20, padding: '16px 20px', background: C.card, border: `1px solid ${C.bd}`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: C.mu, animation: `blink 1.6s ${i * 0.25}s infinite` }} />
              ))}
            </div>
            <span style={{ fontSize: 12, color: C.mu, fontFamily: 'DM Mono, monospace' }}>等待{partnerName}回应…</span>
          </div>
        )}

        {/* Shared insight — unlocked when both have replied */}
        {myReply && partnerReply && (
          <div className="drift" style={{ marginBottom: 24 }}>
            <div style={{ padding: '16px 18px', background: C.div + '0C', border: `1px solid ${C.div}33`, borderRadius: 12, marginBottom: 16 }}>
              <p style={{ margin: '0 0 8px', fontSize: 10, color: C.div, fontFamily: 'DM Mono, monospace', letterSpacing: '0.12em' }}>你们刚才说的</p>
              <p style={{ margin: '0 0 4px', fontSize: 13, color: myColor + 'CC', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', lineHeight: 1.7 }}>
                {myName}说：{myReply}
              </p>
              <div style={{ height: 1, background: C.div + '22', margin: '10px 0' }} />
              <p style={{ margin: 0, fontSize: 13, color: (myRole === 'A' ? C.b : C.a) + 'CC', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', lineHeight: 1.7 }}>
                {partnerName}说：{partnerReply}
              </p>
            </div>

            <p style={{ margin: '0 0 8px', fontSize: 12, color: C.mu, lineHeight: 1.7 }}>
              <span style={{ color: C.tx }}>看完这个，你们对那一刻有什么新的理解？</span>（任何一方都可以写）
            </p>
            <textarea
              value={insight}
              onChange={e => setInsight(e.target.value)}
              placeholder="现在我觉得……"
              style={{ width: '100%', padding: '12px 16px', background: C.stage, border: `1.5px solid ${C.div}44`, borderRadius: 10, color: C.tx, fontSize: 14, outline: 'none', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', resize: 'none', minHeight: 70, lineHeight: 1.8 }}
              onFocus={e => e.target.style.borderColor = C.div + '88'}
              onBlur={e => e.target.style.borderColor = C.div + '44'}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <button
                onClick={() => { if (!isLast) { setCurrent(c => c + 1) } else if (allInsights) { onNext() } }}
                disabled={!insight.trim()}
                style={{ padding: '10px 28px', borderRadius: 24, border: 'none', background: insight.trim() ? (isLast ? C.gr : C.div) : C.dim, color: insight.trim() ? '#fff' : C.mu, fontSize: 13, fontWeight: 600, cursor: insight.trim() ? 'pointer' : 'default', transition: 'all .25s' }}
              >
                {isLast ? '完成 →' : '下一个分歧 →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ReplyBlock({ name, color, bg, bd, innerText, reply, setReply, prompt, placeholder, editable }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
        <p style={{ margin: 0, fontSize: 11, color, fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em' }}>{name}</p>
      </div>
      {innerText && (
        <div style={{ padding: '12px 16px', background: bg, border: `1px solid ${bd}`, borderRadius: 10, marginBottom: 10 }}>
          <p style={{ margin: '0 0 2px', fontSize: 10, color: color + '88', fontFamily: 'DM Mono, monospace' }}>内心（确认版本）</p>
          <p style={{ margin: 0, fontSize: 14, color: color + 'BB', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{innerText}</p>
        </div>
      )}
      <p style={{ margin: '0 0 8px', fontSize: 12, color: C.mu, lineHeight: 1.7 }}>
        <span style={{ color: C.tx }}>{prompt}</span>
      </p>
      {editable ? (
        <textarea
          value={reply}
          onChange={e => setReply(e.target.value)}
          placeholder={placeholder}
          style={{ width: '100%', padding: '12px 16px', background: C.stage, border: `1.5px solid ${color}55`, borderRadius: 10, color: C.tx, fontSize: 14, outline: 'none', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', resize: 'none', minHeight: 80, lineHeight: 1.8, transition: 'all .25s' }}
          onFocus={e => e.target.style.borderColor = color + '99'}
          onBlur={e => e.target.style.borderColor = color + '55'}
        />
      ) : (
        <div style={{ padding: '12px 16px', background: C.card, border: `1px solid ${bd}`, borderRadius: 10 }}>
          <p style={{ margin: 0, fontSize: 14, color: color + 'BB', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', lineHeight: 1.7 }}>{reply}</p>
        </div>
      )}
    </div>
  )
}

const centered = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }
