import { C } from '../theme'

export default function DonePhase({ sessionData, personas, myRole, onReset }) {
  const divergences = (sessionData?.script || []).filter(line => {
    const pA = sessionData?.annotations?.B?.[line.id]?.val
    const pB = sessionData?.annotations?.A?.[line.id]?.val
    return pA === 'x' || pA === 'q' || pB === 'x' || pB === 'q'
  })

  const insightCount = divergences.filter(l => sessionData?.negotiate?.[l.id]?.insight?.trim()).length
  const nameA = personas?.A?.name || '她'
  const nameB = personas?.B?.name || '他'

  const handleExport = () => {
    const data = {
      sessionCode: sessionData?.code,
      personas,
      exportedAt: new Date().toISOString(),
      script: sessionData?.script,
      annotations: sessionData?.annotations,
      corrections: sessionData?.corrections,
      negotiate: sessionData?.negotiate,
      summary: {
        divergenceCount: divergences.length,
        insightsReached: insightCount,
      },
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `subtext_${sessionData?.code}_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{ maxWidth: 480, textAlign: 'center' }} className="fade">
        <p style={{ margin: '0 0 20px', fontSize: 28, color: C.tx }}>◎</p>
        <h2 style={{ margin: '0 0 12px', fontSize: 34, fontWeight: 300, fontFamily: 'Cormorant Garamond, serif', lineHeight: 1.25, letterSpacing: '-.01em' }}>
          这次复盘结束了。
        </h2>
        <p style={{ margin: '0 0 32px', fontSize: 14, color: C.mu, lineHeight: 2 }}>
          找到了 <span style={{ color: C.div }}>{divergences.length}</span> 处分歧。<br />
          形成了 <span style={{ color: C.gr }}>{insightCount}</span> 条共同理解。<br />
          {nameA} 和 {nameB} 各自说出了理由。
        </p>

        {/* Insight summary */}
        {insightCount > 0 && (
          <div style={{ background: C.card, border: `1px solid ${C.bd}`, borderRadius: 12, padding: '16px 20px', marginBottom: 24, textAlign: 'left' }}>
            <p style={{ margin: '0 0 12px', fontSize: 10, color: C.div, fontFamily: 'DM Mono, monospace', letterSpacing: '0.15em', textTransform: 'uppercase' }}>共同理解</p>
            {divergences.map(line => {
              const ins = sessionData?.negotiate?.[line.id]?.insight
              if (!ins?.trim()) return null
              return (
                <div key={line.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${C.bd}` }}>
                  <p style={{ margin: '0 0 4px', fontSize: 11, color: C.mu, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
                    {line.speaker === 'action' ? `[ ${line.text} ]` : line.text}
                  </p>
                  <p style={{ margin: 0, fontSize: 13, color: C.tx, fontFamily: 'Cormorant Garamond, serif', lineHeight: 1.7 }}>
                    {ins}
                  </p>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={onReset}
            style={{ padding: '11px 24px', borderRadius: 24, border: `1px solid ${C.bd2}`, background: 'transparent', color: C.mu, fontSize: 13, cursor: 'pointer' }}>
            重新体验
          </button>
          <button onClick={handleExport}
            style={{ padding: '11px 28px', borderRadius: 24, border: 'none', background: C.tx, color: C.bg, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            导出记录 ↓
          </button>
        </div>
      </div>
    </div>
  )
}
