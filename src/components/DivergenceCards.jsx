// ─────────────────────────────────────────────────────────────
//  DivergenceCards — Version B Phase: divergence
//
//  Shows 3-5 "divergence cards" for beats with the biggest gap:
//    Layer 1: AI original inference
//    Layer 2: Partner's edit (disputes from solo_viewing)
//    Layer 3: Self-confirm (selfConfirms)
//
//  Divergence = beats where editing occurred (status='edited'/'disputed')
//  Sorted by number of edits (most edited first).
//
//  Each card shows:
//    - The dialogue line
//    - AI original version
//    - Partner's version (or user's edit in solo mode)
//    - Gap indicator
//
//  Optional "want to talk about this moment?" prompt
//  Final summary at bottom
// ─────────────────────────────────────────────────────────────

import { downloadLog } from '../utils/behaviorLog'

const EMOTION_LABELS = {
  anxious: '焦虑', defensive: '防备', angry: '愤怒', hurt: '受伤',
  withdrawn: '退缩', warm: '温暖', reflective: '反思', surprised: '惊讶', neutral: '平静',
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

// ── Compute divergence score for a beat ────────────────────────
function computeBeatDivergence(beat, disputes, selfConfirms, myRole) {
  let score = 0
  const layers = []
  const partnerId = myRole === 'A' ? 'B' : 'A'

  // Layer 1 vs Layer 2: AI original vs partner's edit of this persona
  // In solo_viewing, user edits partner's thoughts
  // So disputes["{partnerId}-{beatId}"] = user's edit of partner's thought
  // And disputes["{myRole}-{beatId}"] = (should not exist in solo_viewing, partner edits my thoughts)

  for (const personaId of ['A', 'B']) {
    const thought = beat.thoughts?.[personaId]
    if (!thought) continue

    const disputeKey = `${personaId}-${beat.id}`
    const selfKey = `${personaId}-${beat.id}`
    const dispute = disputes[disputeKey]
    const selfConfirm = selfConfirms[selfKey]

    // Score: dispute exists and was edited/disputed
    if (dispute && (dispute.status === 'edited' || dispute.status === 'disputed')) {
      score += 2
    }
    // Score: selfConfirm was edited
    if (selfConfirm && selfConfirm.status === 'edited') {
      score += 1
    }
    // Score: dispute vs selfConfirm differ
    if (dispute && selfConfirm && dispute.text !== selfConfirm.text) {
      score += 1
    }

    layers.push({ personaId, thought, dispute, selfConfirm })
  }

  return { beat, score, layers }
}

// ── Gap indicator bar ──────────────────────────────────────────
function GapBar({ level }) {
  // level: 0-4
  const colors = ['#3a3a3a', '#6882d8', '#c8922a', '#d05030', '#d02020']
  const labels = ['一致', '微小差异', '中等差异', '明显差异', '显著差异']
  const clampedLevel = Math.min(Math.max(level, 0), 4)

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="w-3 h-1.5 rounded-sm transition-all"
            style={{ background: i <= clampedLevel ? colors[clampedLevel] : 'rgba(255,255,255,0.06)' }} />
        ))}
      </div>
      <span className="font-mono text-[7px]" style={{ color: colors[clampedLevel] }}>
        {labels[clampedLevel]}
      </span>
    </div>
  )
}

// ── Single divergence card ─────────────────────────────────────
function DivergenceCard({ beat, layers, personas, myRole, index }) {
  const partnerId = myRole === 'A' ? 'B' : 'A'

  // Find the most interesting layer (one with edits)
  const editedLayers = layers.filter(l => l.dispute?.status === 'edited' || l.dispute?.status === 'disputed' || l.selfConfirm?.status === 'edited')

  // Compute gap level
  let gapLevel = 0
  for (const layer of layers) {
    if (layer.dispute?.status === 'edited') gapLevel += 1
    if (layer.dispute?.status === 'disputed') gapLevel += 2
    if (layer.selfConfirm?.status === 'edited') gapLevel += 1
  }
  gapLevel = Math.min(gapLevel, 4)

  return (
    <div className="rounded-xl overflow-hidden anim-fadeIn"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(240,192,96,0.15)',
        animationDelay: `${index * 0.15}s`,
      }}>

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <span className="font-mono text-[10px]" style={{ color: '#f0c060' }}>#{index + 1}</span>
        <span className="font-mono text-[8px] text-white/30">第 {beat.id + 1} 幕</span>
        <div className="flex-1" />
        <GapBar level={gapLevel} />
      </div>

      {/* Dialogue context */}
      {beat.dialogue && (
        <div className="px-4 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: personas[beat.dialogue.speaker]?.color }} />
            <span className="font-mono text-[8px]" style={{ color: personas[beat.dialogue.speaker]?.color }}>
              {personas[beat.dialogue.speaker]?.name}
            </span>
          </div>
          <p className="text-[11px] text-white/40 mt-1 leading-relaxed"
            style={{ fontFamily: '"PingFang SC","Inter",sans-serif' }}>
            "{beat.dialogue.text}"
          </p>
        </div>
      )}

      {/* Layer comparisons */}
      {layers.map(({ personaId, thought, dispute, selfConfirm }) => {
        if (!thought) return null
        const persona = personas[personaId]
        const hasDispute = dispute && (dispute.status === 'edited' || dispute.status === 'disputed')
        const hasSelfEdit = selfConfirm && selfConfirm.status === 'edited'

        // Skip if nothing interesting happened
        if (!hasDispute && !hasSelfEdit) return null

        return (
          <div key={personaId} className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: persona?.color }} />
              <span className="font-mono text-[8px]" style={{ color: persona?.color }}>
                {persona?.name} 的内心
              </span>
              <span className="font-mono text-[7px] text-white/15">
                {personaId === myRole ? '(你)' : '(对方)'}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {/* Layer 1: AI Original */}
              <div className="rounded-lg px-3 py-2" style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <p className="font-mono text-[7px] text-white/22 tracking-wider mb-1">AI 原始推断</p>
                <p className="text-[11px] text-white/35 leading-relaxed"
                  style={{ fontFamily: '"PingFang SC","Inter",sans-serif' }}>
                  {thought.text}
                </p>
                <EmotionTag emotion={thought.emotion} faded />
              </div>

              {/* Layer 2: Partner's edit (dispute) */}
              {hasDispute && (
                <div className="flex items-start gap-2">
                  <span className="text-white/15 text-[12px] mt-2">→</span>
                  <div className="flex-1 rounded-lg px-3 py-2" style={{
                    background: dispute.status === 'disputed' ? 'rgba(232,122,122,0.06)' : 'rgba(122,176,232,0.06)',
                    border: `1px solid ${dispute.status === 'disputed' ? 'rgba(232,122,122,0.2)' : 'rgba(122,176,232,0.2)'}`,
                  }}>
                    <p className="font-mono text-[7px] tracking-wider mb-1"
                      style={{ color: dispute.status === 'disputed' ? '#e87a7a' : '#7ab0e8' }}>
                      {personaId === myRole ? '对方认为你在想' : '你认为对方在想'}
                    </p>
                    <p className="text-[11px] leading-relaxed"
                      style={{
                        color: dispute.status === 'disputed' ? 'rgba(232,122,122,0.7)' : 'rgba(122,176,232,0.7)',
                        fontFamily: '"PingFang SC","Inter",sans-serif',
                        textDecoration: dispute.status === 'disputed' ? 'line-through' : 'none',
                      }}>
                      {dispute.text}
                    </p>
                    {dispute.emotion && <EmotionTag emotion={dispute.emotion} />}
                  </div>
                </div>
              )}

              {/* Layer 3: Self-confirm edit */}
              {hasSelfEdit && (
                <div className="flex items-start gap-2">
                  <span className="text-white/15 text-[12px] mt-2">→</span>
                  <div className="flex-1 rounded-lg px-3 py-2" style={{
                    background: 'rgba(144,232,168,0.06)',
                    border: '1px solid rgba(144,232,168,0.2)',
                  }}>
                    <p className="font-mono text-[7px] tracking-wider mb-1" style={{ color: '#90e8a8' }}>
                      {personaId === myRole ? '你自己确认' : '对方自己确认'}
                    </p>
                    <p className="text-[11px] leading-relaxed"
                      style={{ color: 'rgba(144,232,168,0.8)', fontFamily: '"PingFang SC","Inter",sans-serif' }}>
                      {selfConfirm.text}
                    </p>
                    {selfConfirm.emotion && selfConfirm.emotion !== thought.emotion && (
                      <EmotionTag emotion={selfConfirm.emotion} />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Discussion prompt */}
      <div className="px-4 py-2.5">
        <p className="font-mono text-[9px] text-center"
          style={{ color: 'rgba(240,192,96,0.5)' }}>
          想聊聊这个时刻吗？
        </p>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────
export default function DivergenceCards({
  beats,
  personas,
  disputes,
  selfConfirms,
  myRole,
  onReplay,
  onReconfigure,
  onExport,
}) {
  const partnerId = myRole === 'A' ? 'B' : 'A'

  // Compute divergence for all beats, filter and sort
  const allDivergences = beats
    .map(beat => computeBeatDivergence(beat, disputes, selfConfirms, myRole))
    .filter(d => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  // Stats
  const totalEdits = Object.values(disputes).filter(d => d.status === 'edited' || d.status === 'disputed').length
  const totalSelfEdits = Object.values(selfConfirms).filter(d => d.status === 'edited').length
  const totalDisputes = Object.values(disputes).filter(d => d.status === 'disputed').length

  return (
    <div className="absolute inset-0 bg-black/90 flex flex-col items-center z-50 overflow-y-auto anim-fadeIn"
      style={{ backdropFilter: 'blur(4px)' }}>

      <div className="w-full max-w-2xl px-6 py-8 flex flex-col gap-6">

        {/* Header */}
        <div className="text-center flex flex-col items-center gap-2">
          <span className="font-pixel text-[10px] tracking-[0.35em]" style={{ color: '#f0c060' }}>
            DIVERGENCE
          </span>
          <div className="w-12 h-px" style={{ background: 'linear-gradient(90deg, transparent, #f0c060, transparent)' }} />
          <p className="font-mono text-[9px] tracking-[0.2em] text-white/30">
            THREE-LAYER COMPARISON
          </p>
          <p className="text-[13px] text-white/50 leading-relaxed mt-1"
            style={{ fontFamily: '"PingFang SC","Inter",sans-serif' }}>
            AI 的推断、对方的理解、你自己的确认——三层认知的差异
          </p>
        </div>

        {/* Stats bar */}
        <div className="glass rounded-xl px-6 py-3 flex justify-center gap-6">
          <Stat label="认知差异" value={allDivergences.length} color="#f0c060" />
          <Stat label="对方修改" value={totalEdits} color="#7ab0e8" />
          <Stat label="自我修正" value={totalSelfEdits} color="#90e8a8" />
          {totalDisputes > 0 && <Stat label="被质疑" value={totalDisputes} color="#e87a7a" />}
        </div>

        {/* Divergence cards */}
        {allDivergences.length > 0 ? (
          <div className="flex flex-col gap-4">
            {allDivergences.map((div, i) => (
              <DivergenceCard
                key={div.beat.id}
                beat={div.beat}
                layers={div.layers}
                personas={personas}
                myRole={myRole}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-[14px] text-white/30" style={{ fontFamily: '"PingFang SC","Inter",sans-serif' }}>
              没有发现明显的认知差异。你们的理解很一致。
            </p>
          </div>
        )}

        {/* Summary */}
        <div className="rounded-xl px-5 py-4 text-center" style={{
          background: 'rgba(240,192,96,0.05)',
          border: '1px solid rgba(240,192,96,0.15)',
        }}>
          <p className="text-[14px] leading-relaxed" style={{
            color: 'rgba(240,192,96,0.7)',
            fontFamily: '"PingFang SC","Inter",sans-serif',
          }}>
            {allDivergences.length > 0
              ? <>发现 {allDivergences.length} 处认知差异。<br />
                <span className="text-[12px]" style={{ color: 'rgba(240,192,96,0.4)' }}>
                  每个人都在用自己的方式理解对方——差异本身就是对话的起点。
                </span></>
              : <>你们的理解非常一致。<br />
                <span className="text-[12px]" style={{ color: 'rgba(240,192,96,0.4)' }}>
                  这说明你们对彼此的内心世界有相似的感知。
                </span></>
            }
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center py-2">
          <ActionBtn onClick={onReplay} label="重新播放" />
          <ActionBtn onClick={onReconfigure} label="新的冲突" accent />
          <ActionBtn onClick={onExport} label="导出日志" highlight />
        </div>
      </div>
    </div>
  )
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
