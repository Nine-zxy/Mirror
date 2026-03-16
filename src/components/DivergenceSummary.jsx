// ─────────────────────────────────────────────────────────────
//  DivergenceSummary — Post-simulation Assumption Review
//
//  Shows a structured summary of all assumption annotations:
//    • Stats breakdown: confirmed / disputed / edited
//    • Per-annotation cards with status-aware rendering
//    • Emotion re-tag diffs
//    • Discussion prompts + Replay / Export actions
// ─────────────────────────────────────────────────────────────

const EMOTION_LABELS = {
  anxious: '焦虑', defensive: '防备', angry: '愤怒', hurt: '受伤',
  withdrawn: '退缩', warm: '温暖', reflective: '反思', surprised: '惊讶', neutral: '平静',
}

const STATUS_CONFIG = {
  confirmed: { color: '#60c880', label: '像TA', icon: '👍', bg: 'rgba(96,200,128,0.08)', border: 'rgba(96,200,128,0.25)' },
  disputed:  { color: '#e87a7a', label: '不像',  icon: '👎', bg: 'rgba(232,122,122,0.08)', border: 'rgba(232,122,122,0.25)' },
  edited:    { color: '#90e8a8', label: '已修正', icon: '✎',  bg: 'rgba(144,232,168,0.08)', border: 'rgba(144,232,168,0.25)' },
}

export default function DivergenceSummary({
  beats,
  personas,
  disputes,
  partnerDisputes,    // Together mode: partner's annotations (null in solo)
  tags,
  annotation,
  onReplay,
  onReconfigure,
  onExport,
}) {
  const hasDual = partnerDisputes && Object.keys(partnerDisputes).length > 0
  const disputeEntries = Object.entries(disputes)

  // Count by status — mine
  const confirmed = disputeEntries.filter(([, d]) => d.status === 'confirmed').length
  const disputed  = disputeEntries.filter(([, d]) => d.status === 'disputed').length
  const edited    = disputeEntries.filter(([, d]) => d.status === 'edited').length
  const totalAnnotated = disputeEntries.length

  // Partner counts
  const partnerEntries = hasDual ? Object.entries(partnerDisputes) : []
  const partnerConfirmed = partnerEntries.filter(([, d]) => d.status === 'confirmed').length
  const partnerDisputed  = partnerEntries.filter(([, d]) => d.status === 'disputed').length
  const partnerEdited    = partnerEntries.filter(([, d]) => d.status === 'edited').length

  // Group by status for structured display (mine)
  const editedEntries   = disputeEntries.filter(([, d]) => d.status === 'edited')
  const disputedEntries = disputeEntries.filter(([, d]) => d.status === 'disputed')
  const confirmedEntries = disputeEntries.filter(([, d]) => d.status === 'confirmed')

  // ── Together mode: compute divergences per beat ──────────
  // A "divergence" = same beat+persona key where one confirmed but other disputed/edited
  const divergences = hasDual ? computeDivergences(disputes, partnerDisputes) : []

  return (
    <div className="absolute inset-0 bg-black/90 flex flex-col items-center z-50 overflow-y-auto anim-fadeIn"
      style={{ backdropFilter: 'blur(4px)' }}>

      <div className="w-full max-w-2xl px-6 py-8 flex flex-col gap-6">

        {/* Header */}
        <div className="text-center flex flex-col items-center gap-2">
          <span className="font-pixel text-[10px] tracking-[0.35em]" style={{ color: '#7ab0e8' }}>
            ASIDE
          </span>
          <div className="w-12 h-px" style={{ background: 'linear-gradient(90deg, transparent, #7ab0e8, transparent)' }} />
          <p className="font-mono text-[9px] tracking-[0.2em] text-white/30">
            {hasDual ? 'DUAL ASSUMPTION REVIEW' : 'ASSUMPTION REVIEW'}
          </p>
        </div>

        {/* Stats bar — status breakdown */}
        <div className="glass rounded-xl px-6 py-3 flex justify-center gap-6">
          {hasDual ? (
            <>
              <Stat label="你的标注" value={totalAnnotated} />
              <Stat label="对方标注" value={partnerEntries.length} />
              <Stat label="认知差异" value={divergences.length} color="#f0c060" />
              <Stat label="标记时刻" value={tags.length} />
            </>
          ) : (
            <>
              <Stat label="标注总数" value={totalAnnotated} />
              {confirmed > 0 && <Stat label="像TA" value={confirmed} color="#60c880" />}
              {disputed > 0  && <Stat label="不像" value={disputed} color="#e87a7a" />}
              {edited > 0    && <Stat label="已修正" value={edited} color="#90e8a8" />}
              <Stat label="标记时刻" value={tags.length} />
            </>
          )}
        </div>

        {/* ── Together mode: dual-column divergence display ── */}
        {hasDual && divergences.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] tracking-widest text-white/35 uppercase">认知差异</span>
              <span className="font-mono text-[7px] text-white/18">你和对方对同一幕的不同标注</span>
              <div className="flex-1 h-px bg-white/8" />
              <span className="font-mono text-[8px]" style={{ color: '#f0c060' }}>{divergences.length}</span>
            </div>
            {divergences.map(div => {
              const persona = personas[div.personaId]
              const beat = beats.find(b => String(b.id) === div.beatId)
              return (
                <div key={div.key} className="glass rounded-xl overflow-hidden">
                  <CardHeader persona={persona} beat={beat} status={null} divergent />
                  <div className="flex gap-0">
                    {/* My annotation */}
                    <div className="flex-1 p-3 border-r border-white/6">
                      <p className="font-mono text-[7px] tracking-wider mb-1.5" style={{ color: '#7ab0e8' }}>你的标注</p>
                      <AnnotationMini dispute={div.mine} />
                    </div>
                    {/* Partner annotation */}
                    <div className="flex-1 p-3">
                      <p className="font-mono text-[7px] tracking-wider mb-1.5" style={{ color: '#e87a7a' }}>对方的标注</p>
                      <AnnotationMini dispute={div.partner} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Together mode: aligned annotations (no divergence) ── */}
        {hasDual && (() => {
          const allKeys = new Set([...Object.keys(disputes), ...Object.keys(partnerDisputes)])
          const divergentKeys = new Set(divergences.map(d => d.key))
          const alignedKeys = [...allKeys].filter(k => !divergentKeys.has(k))
          if (alignedKeys.length === 0) return null
          return (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] tracking-widest text-white/35 uppercase">一致标注</span>
                <span className="font-mono text-[7px] text-white/18">你和对方的相近标注</span>
                <div className="flex-1 h-px bg-white/8" />
                <span className="font-mono text-[8px] text-white/20">{alignedKeys.length}</span>
              </div>
              {alignedKeys.map(key => {
                const [personaId, beatId] = key.split('-')
                const persona = personas[personaId]
                const beat = beats.find(b => String(b.id) === beatId)
                const mine = disputes[key]
                const theirs = partnerDisputes[key]
                return (
                  <div key={key} className="glass rounded-xl overflow-hidden">
                    <CardHeader persona={persona} beat={beat} status={mine?.status || theirs?.status} />
                    <div className="flex gap-0">
                      <div className="flex-1 p-3 border-r border-white/6">
                        <p className="font-mono text-[7px] tracking-wider mb-1.5" style={{ color: '#7ab0e8' }}>你</p>
                        {mine ? <AnnotationMini dispute={mine} /> : <p className="text-[10px] text-white/20 font-mono">未标注</p>}
                      </div>
                      <div className="flex-1 p-3">
                        <p className="font-mono text-[7px] tracking-wider mb-1.5" style={{ color: '#e87a7a' }}>对方</p>
                        {theirs ? <AnnotationMini dispute={theirs} /> : <p className="text-[10px] text-white/20 font-mono">未标注</p>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })()}

        {/* ── Solo mode: original grouped display ── */}
        {!hasDual && editedEntries.length > 0 && (
          <AnnotationSection
            title="修正的假设"
            subtitle="你重写了这些推断"
            entries={editedEntries}
            beats={beats}
            personas={personas}
            renderCard={(key, dispute, persona, beat) => (
              <div key={key} className="glass rounded-xl overflow-hidden">
                <CardHeader persona={persona} beat={beat} status="edited" />
                <div className="flex gap-3 p-4">
                  {/* Original */}
                  <div className="flex-1 rounded-lg px-3 py-2" style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <p className="font-mono text-[7px] text-white/25 mb-1 tracking-wider">原始推断</p>
                    <p className="text-[12px] text-white/35 leading-relaxed line-through"
                      style={{ fontFamily: '"PingFang SC","Inter",sans-serif' }}>
                      {dispute.original}
                    </p>
                    {dispute.originalEmotion && (
                      <EmotionTag emotion={dispute.originalEmotion} faded />
                    )}
                  </div>
                  <div className="flex items-center text-white/15 text-[14px]">→</div>
                  {/* User corrected */}
                  <div className="flex-1 rounded-lg px-3 py-2" style={{
                    background: 'rgba(144,232,168,0.06)',
                    border: '1px solid rgba(144,232,168,0.2)',
                  }}>
                    <p className="font-mono text-[7px] tracking-wider mb-1" style={{ color: '#90e8a8' }}>你的修正</p>
                    <p className="text-[12px] leading-relaxed"
                      style={{ color: 'rgba(144,232,168,0.8)', fontFamily: '"PingFang SC","Inter",sans-serif' }}>
                      {dispute.text}
                    </p>
                    {dispute.emotion && dispute.emotion !== dispute.originalEmotion && (
                      <EmotionTag emotion={dispute.emotion} />
                    )}
                  </div>
                </div>
              </div>
            )}
          />
        )}

        {!hasDual && disputedEntries.length > 0 && (
          <AnnotationSection
            title="质疑的假设"
            subtitle="你认为这些推断不准确"
            entries={disputedEntries}
            beats={beats}
            personas={personas}
            renderCard={(key, dispute, persona, beat) => (
              <div key={key} className="glass rounded-xl overflow-hidden">
                <CardHeader persona={persona} beat={beat} status="disputed" />
                <div className="p-4">
                  <p className="text-[12px] text-white/35 leading-relaxed line-through"
                    style={{ fontFamily: '"PingFang SC","Inter",sans-serif' }}>
                    {dispute.original}
                  </p>
                  <p className="font-mono text-[8px] mt-2" style={{ color: '#e87a7a88' }}>
                    标记为"不像TA"
                  </p>
                </div>
              </div>
            )}
          />
        )}

        {!hasDual && confirmedEntries.length > 0 && (
          <AnnotationSection
            title="确认的推断"
            subtitle="你认为这些推断像TA"
            entries={confirmedEntries}
            beats={beats}
            personas={personas}
            renderCard={(key, dispute, persona, beat) => (
              <div key={key} className="glass rounded-xl overflow-hidden">
                <CardHeader persona={persona} beat={beat} status="confirmed" />
                <div className="p-4">
                  <p className="text-[12px] leading-relaxed"
                    style={{ color: 'rgba(96,200,128,0.65)', fontFamily: '"PingFang SC","Inter",sans-serif' }}>
                    {dispute.text}
                  </p>
                </div>
              </div>
            )}
          />
        )}

        {/* Reflection text */}
        {annotation?.trim() && (
          <div className="glass rounded-xl px-5 py-4">
            <p className="font-mono text-[8px] text-white/25 mb-2 tracking-widest">你的反思</p>
            <p className="text-[13px] text-white/55 leading-relaxed"
              style={{ fontFamily: '"PingFang SC","Inter",sans-serif' }}>
              {annotation}
            </p>
          </div>
        )}

        {/* Tag summary */}
        {tags.length > 0 && (
          <div className="glass rounded-xl px-5 py-3">
            <p className="font-mono text-[8px] text-white/25 mb-2 tracking-widest">标记的时刻</p>
            <div className="flex flex-wrap gap-2">
              {tags.map(t => (
                <span key={t.id} className="font-mono text-[10px] text-white/45 px-2 py-0.5 rounded"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {t.emoji} 第 {t.beatIndex + 1} 幕
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Discussion prompt */}
        <div className="rounded-xl px-5 py-4 text-center" style={{
          background: 'rgba(122,176,232,0.05)',
          border: '1px solid rgba(122,176,232,0.15)',
        }}>
          <p className="text-[14px] leading-relaxed" style={{
            color: 'rgba(122,176,232,0.7)',
            fontFamily: '"PingFang SC","Inter",sans-serif',
          }}>
            {hasDual
              ? <>你们有 {divergences.length} 处认知差异。<br />
                <span className="text-[12px]" style={{ color: 'rgba(122,176,232,0.4)' }}>
                  这些差异揭示了你们对彼此内心的不同理解——这正是对话的起点。
                </span></>
              : totalAnnotated > 0
                ? <>你标注了 {totalAnnotated} 处假设，其中 {edited + disputed} 处与推断不同。<br />
                  <span className="text-[12px]" style={{ color: 'rgba(122,176,232,0.4)' }}>
                    这些差异可以作为和对方讨论的起点。
                  </span></>
                : <>看完这些差异，什么让你们感到意外？<br />
                  <span className="text-[12px]" style={{ color: 'rgba(122,176,232,0.4)' }}>
                    可以和对方分享你标注的内心想法
                  </span></>
            }
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center py-2">
          <ActionBtn onClick={onReplay}       label="重新播放" />
          <ActionBtn onClick={onReconfigure}  label="新的冲突" accent />
          <ActionBtn onClick={onExport}       label="导出日志" highlight />
        </div>
      </div>
    </div>
  )
}

// ── Divergence computation ────────────────────────────────────
function computeDivergences(mine, theirs) {
  const allKeys = new Set([...Object.keys(mine), ...Object.keys(theirs)])
  const result = []
  for (const key of allKeys) {
    const m = mine[key]
    const t = theirs[key]
    if (!m || !t) continue // only one side annotated — not a divergence, just different coverage
    // Divergence = different status, or both edited but different text
    const isDivergent = m.status !== t.status
      || (m.status === 'edited' && t.status === 'edited' && m.text !== t.text)
    if (isDivergent) {
      const [personaId, beatId] = key.split('-')
      result.push({ key, personaId, beatId, mine: m, partner: t })
    }
  }
  return result
}

// ── Helper components ─────────────────────────────────────────

function Stat({ label, value, color }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="font-mono text-[16px]" style={{ color: color || 'rgba(255,255,255,0.7)' }}>
        {value}
      </span>
      <span className="font-mono text-[8px] tracking-widest" style={{ color: color ? `${color}88` : 'rgba(255,255,255,0.28)' }}>
        {label}
      </span>
    </div>
  )
}

function CardHeader({ persona, beat, status, divergent = false }) {
  const sc = status ? STATUS_CONFIG[status] : null
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-white/6">
      <div className="w-2 h-2 rounded-full" style={{ background: persona?.color, boxShadow: `0 0 5px ${persona?.color}` }} />
      <span className="font-mono text-[9px]" style={{ color: persona?.color }}>
        {persona?.name}
      </span>
      <span className="font-mono text-[8px] text-white/20">
        · 第 {(beat?.id ?? 0) + 1} 幕
      </span>
      {divergent && (
        <span className="font-mono text-[7px] px-1.5 py-0.5 rounded ml-auto"
          style={{ background: 'rgba(240,192,96,0.1)', color: '#f0c060', border: '1px solid rgba(240,192,96,0.3)' }}>
          ⚡ 差异
        </span>
      )}
      {sc && !divergent && (
        <span className="font-mono text-[7px] px-1.5 py-0.5 rounded ml-auto"
          style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
          {sc.icon} {sc.label}
        </span>
      )}
    </div>
  )
}

function EmotionTag({ emotion, faded = false }) {
  const label = EMOTION_LABELS[emotion] || emotion
  return (
    <span className="font-mono text-[7px] px-1.5 py-0.5 rounded inline-block mt-1"
      style={{
        background: faded ? 'rgba(255,255,255,0.04)' : 'rgba(144,232,168,0.1)',
        color: faded ? 'rgba(255,255,255,0.25)' : '#90e8a8',
        border: `1px solid ${faded ? 'rgba(255,255,255,0.08)' : 'rgba(144,232,168,0.25)'}`,
        textDecoration: faded ? 'line-through' : 'none',
      }}>
      {label}
    </span>
  )
}

// Mini annotation card for dual-column display
function AnnotationMini({ dispute }) {
  if (!dispute) return <p className="text-[10px] text-white/20 font-mono">未标注</p>
  const sc = STATUS_CONFIG[dispute.status]
  return (
    <div>
      {sc && (
        <span className="font-mono text-[7px] px-1.5 py-0.5 rounded inline-block mb-1.5"
          style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
          {sc.icon} {sc.label}
        </span>
      )}
      {dispute.status === 'edited' && dispute.original && (
        <p className="text-[10px] text-white/25 line-through mb-1 leading-snug"
          style={{ fontFamily: '"PingFang SC","Inter",sans-serif' }}>
          {dispute.original}
        </p>
      )}
      <p className="text-[11px] leading-snug"
        style={{
          color: dispute.status === 'disputed' ? 'rgba(232,122,122,0.6)' :
                 dispute.status === 'edited'   ? 'rgba(144,232,168,0.75)' :
                 'rgba(96,200,128,0.6)',
          fontFamily: '"PingFang SC","Inter",sans-serif',
          textDecoration: dispute.status === 'disputed' ? 'line-through' : 'none',
        }}>
        {dispute.text || dispute.original}
      </p>
      {dispute.emotion && <EmotionTag emotion={dispute.emotion} />}
    </div>
  )
}

function AnnotationSection({ title, subtitle, entries, beats, personas, renderCard }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[9px] tracking-widest text-white/35 uppercase">{title}</span>
        <span className="font-mono text-[7px] text-white/18">{subtitle}</span>
        <div className="flex-1 h-px bg-white/8" />
        <span className="font-mono text-[8px] text-white/20">{entries.length}</span>
      </div>
      {entries.map(([key, dispute]) => {
        const [personaId, beatId] = key.split('-')
        const persona = personas[personaId]
        const beat = beats.find(b => String(b.id) === beatId)
        return renderCard(key, dispute, persona, beat)
      })}
    </div>
  )
}

function ActionBtn({ onClick, label, accent = false, highlight = false }) {
  const base = accent
    ? { color: '#7ab0e8', borderColor: 'rgba(122,176,232,0.35)', background: 'rgba(122,176,232,0.07)' }
    : highlight
    ? { color: '#58c878', borderColor: 'rgba(88,200,120,0.35)', background: 'rgba(88,200,120,0.07)' }
    : { color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.12)', background: 'transparent' }

  return (
    <button
      onClick={onClick}
      className="font-mono text-xs px-6 py-2.5 rounded-lg border transition-all hover:opacity-80"
      style={base}
    >
      {label}
    </button>
  )
}
