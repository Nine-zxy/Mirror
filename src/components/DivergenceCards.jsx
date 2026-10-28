// ─────────────────────────────────────────────────────────────
//  DivergenceCards — Version B Phase: divergence
//
//  NEW LOGIC (corrected):
//  Each card compares TWO things for a given person's inner state:
//    ① 自己确认的内心 (selfConfirm) — "我真正在想的"
//    ② 对方认为我在想的 (partner's dispute/edit) — "对方眼中的我"
//
//  NOT showing AI original — users don't care what AI guessed.
//  The divergence is between "what I was actually thinking"
//  and "what my partner thinks I was thinking."
//
//  Perspective switch: toggle between "我的视角" and "对方的视角"
//    我的视角: shows divergence about MY inner state
//    对方的视角: shows divergence about PARTNER's inner state
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import { downloadLog } from '../utils/behaviorLog'

const EMOTION_LABELS = {
  anxious: 'Anxious', defensive: 'Defensive', angry: 'Angry', hurt: 'Hurt',
  withdrawn: 'Withdrawn', warm: 'Warm', reflective: 'Reflective', surprised: 'Surprised', neutral: 'Calm',
}

function EmotionTag({ emotion, color }) {
  const label = EMOTION_LABELS[emotion] || emotion
  // Use the persona's color for the tag
  const c = color || '#7ab0e8'
  return (
    <span className="font-mono text-[12px] px-1.5 py-0.5 rounded inline-block mt-1"
      style={{ background: `${c}18`, color: c, border: `1px solid ${c}40` }}>
      {label}
    </span>
  )
}

// ── Compute divergence for a specific person's inner state ────
// viewingRole: whose inner state are we looking at?
// disputes: the edits made during solo_viewing
// selfConfirms: the self-confirmations
function computeDivergenceForPerson(beat, viewingRole, disputes, selfConfirms) {
  const thought = beat.thoughts?.[viewingRole]
  if (!thought) return null

  const selfKey = `${viewingRole}-${beat.id}`
  const selfConfirm = selfConfirms[selfKey]
  const partnerEdit = disputes[selfKey]  // partner edited this person's thought

  // The self-confirmed version (or AI original if not confirmed)
  const selfText = selfConfirm?.text || thought.text
  const selfEmotion = selfConfirm?.emotion || thought.emotion

  // The partner's edit of this person's thought (or AI original if not edited)
  const partnerText = partnerEdit?.text || thought.text
  const partnerEmotion = partnerEdit?.emotion || thought.emotion

  // Compute divergence score
  let score = 0
  if (selfText !== partnerText) score += 2
  if (selfEmotion !== partnerEmotion) score += 1
  if (partnerEdit && (partnerEdit.status === 'edited' || partnerEdit.status === 'disputed')) score += 1
  if (selfConfirm && selfConfirm.status === 'edited') score += 1

  return {
    beat,
    viewingRole,
    score,
    selfText,
    selfEmotion,
    partnerText,
    partnerEmotion,
    aiOriginalText: thought.text,
    aiOriginalEmotion: thought.emotion,
    hasDivergence: selfText !== partnerText || selfEmotion !== partnerEmotion,
  }
}

// ── Gap indicator bar ──────────────────────────────────────────
function GapBar({ level }) {
  const colors = ['#3a3a3a', '#6882d8', '#c8922a', '#d05030', '#d02020']
  const labels = ['Aligned', 'Minor gap', 'Moderate gap', 'Clear gap', 'Major gap']
  const clampedLevel = Math.min(Math.max(level, 0), 4)
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="w-3 h-1.5 rounded-sm transition-all"
            style={{ background: i <= clampedLevel ? colors[clampedLevel] : 'rgba(255,255,255,0.06)' }} />
        ))}
      </div>
      <span className="font-mono text-[12px]" style={{ color: colors[clampedLevel] }}>
        {labels[clampedLevel]}
      </span>
    </div>
  )
}

// ── Single divergence card ─────────────────────────────────────
function DivergenceCard({ data, personas, myRole, viewPerspective, index }) {
  const { beat, viewingRole, selfText, selfEmotion, partnerText, partnerEmotion } = data
  const persona = personas[viewingRole]  // the person whose inner state we're looking at
  const partnerId = myRole === 'A' ? 'B' : 'A'
  const editorPersona = personas[viewingRole === myRole ? partnerId : myRole]  // the person who edited
  const isMyInnerState = viewingRole === myRole

  // Colors: self-confirmed uses the viewed person's color, partner edit uses editor's color
  const selfColor = persona?.color || '#7ab0e8'
  const editorColor = editorPersona?.color || '#e87a7a'

  // Labels depend on whose perspective we're viewing FROM
  const selfLabel = isMyInnerState ? 'What I was really thinking' : `What ${persona?.name || 'partner'} confirmed`
  const partnerLabel = isMyInnerState ? `What ${editorPersona?.name || 'partner'} thinks I was thinking` : `What I think ${persona?.name || 'partner'} was thinking`

  return (
    <div className="rounded-xl overflow-hidden anim-fadeIn"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(122,176,232,0.15)',
        animationDelay: `${index * 0.12}s`,
      }}>

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <span className="font-mono text-[16px]" style={{ color: '#7ab0e8' }}>#{index + 1}</span>
        <span className="font-mono text-[14px] text-white/30">Beat {beat.id + 1}</span>
        <div className="w-1.5 h-1.5 rounded-full ml-1" style={{ background: persona?.color }} />
        <span className="font-mono text-[14px]" style={{ color: persona?.color }}>
          {persona?.name}'s inner state
        </span>
        <div className="flex-1" />
      </div>

      {/* Dialogue context */}
      {beat.dialogue && (
        <div className="px-4 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: personas[beat.dialogue.speaker]?.color }} />
            <span className="font-mono text-[14px]" style={{ color: personas[beat.dialogue.speaker]?.color }}>
              {personas[beat.dialogue.speaker]?.name}
            </span>
          </div>
          <p className="text-[18px] text-white/40 mt-1 leading-relaxed"
            style={{ fontFamily: 'var(--font-ui)' }}>
            "{beat.dialogue.text}"
          </p>
        </div>
      )}

      {/* Comparison: self-confirmed vs partner's understanding */}
      <div className="px-4 py-3">
        <div className="flex flex-col gap-3">

          {/* Self-confirmed truth — uses the viewed person's color */}
          <div className="rounded-lg px-3 py-2.5" style={{
            background: `${selfColor}10`,
            border: `1px solid ${selfColor}33`,
          }}>
            <p className="font-mono text-[12px] tracking-wider mb-1.5" style={{ color: selfColor }}>
              {selfLabel}
            </p>
            <p className="text-[19px] leading-relaxed"
              style={{ color: `${selfColor}dd`, fontFamily: 'var(--font-ui)' }}>
              {selfText}
            </p>
            <EmotionTag emotion={selfEmotion} color={selfColor} />
          </div>

          {/* VS divider */}
          <div className="flex items-center gap-2 px-2">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="font-mono text-[14px] text-white/20">VS</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Partner's understanding — uses the editor's color */}
          <div className="rounded-lg px-3 py-2.5" style={{
            background: `${editorColor}10`,
            border: `1px solid ${editorColor}33`,
          }}>
            <p className="font-mono text-[12px] tracking-wider mb-1.5" style={{ color: editorColor }}>
              {partnerLabel}
            </p>
            <p className="text-[19px] leading-relaxed"
              style={{ color: `${editorColor}dd`, fontFamily: 'var(--font-ui)' }}>
              {partnerText}
            </p>
            <EmotionTag emotion={partnerEmotion} color={editorColor} />
          </div>
        </div>
      </div>

      {/* spacer */}
      <div className="h-1" />
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
  onArchive,
}) {
  const partnerId = myRole === 'A' ? 'B' : 'A'
  const [viewPerspective, setViewPerspective] = useState('mine') // 'mine' | 'partner'

  // Compute divergence based on current perspective
  const viewingRole = viewPerspective === 'mine' ? myRole : partnerId

  // Show all beats where either side made any edit (selfConfirm or dispute)
  const allDivergences = beats
    .map(beat => {
      const d = computeDivergenceForPerson(beat, viewingRole, disputes, selfConfirms)
      if (!d) return null
      // Show if there's any edit: selfConfirm changed or partner edited
      const selfKey = `${viewingRole}-${beat.id}`
      const hasAnyEdit = selfConfirms[selfKey] || disputes[selfKey]
      return hasAnyEdit ? d : null
    })
    .filter(Boolean)

  // Stats
  const totalDivergences = allDivergences.length
  const emotionMismatches = allDivergences.filter(d => d.selfEmotion !== d.partnerEmotion).length

  return (
    <div className="absolute inset-0 flex flex-col items-center z-50 overflow-y-auto anim-fadeIn"
      style={{ background: 'rgba(6,8,16,0.95)', backdropFilter: 'blur(4px)' }}>

      <div className="w-full max-w-2xl px-6 py-8 flex flex-col gap-5">

        {/* Header */}
        <div className="text-center flex flex-col items-center gap-2">
          <span className="font-pixel text-[16px] tracking-[0.35em]" style={{ color: '#7ab0e8' }}>
            DIVERGENCE
          </span>
          <div className="w-12 h-px" style={{ background: 'linear-gradient(90deg, transparent, #7ab0e8, transparent)' }} />
          <p className="text-[21px] text-white/50 leading-relaxed mt-1"
            style={{ fontFamily: 'var(--font-ui)' }}>
            {viewPerspective === 'mine'
              ? `How ${personas[partnerId]?.name || 'your partner'} sees you vs. who you really are`
              : `How you see ${personas[partnerId]?.name || 'your partner'} vs. who ${personas[partnerId]?.name || 'your partner'} really is`}
          </p>
        </div>

        {/* Perspective toggle */}
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setViewPerspective('mine')}
            className="font-mono text-[16px] px-4 py-1.5 rounded-lg border transition-all"
            style={{
              color: viewPerspective === 'mine' ? '#90e8a8' : 'rgba(255,255,255,0.3)',
              borderColor: viewPerspective === 'mine' ? 'rgba(144,232,168,0.4)' : 'rgba(255,255,255,0.08)',
              background: viewPerspective === 'mine' ? 'rgba(144,232,168,0.08)' : 'transparent',
            }}>
            My perspective
          </button>
          <button
            onClick={() => setViewPerspective('partner')}
            className="font-mono text-[16px] px-4 py-1.5 rounded-lg border transition-all"
            style={{
              color: viewPerspective === 'partner' ? '#e8a87a' : 'rgba(255,255,255,0.3)',
              borderColor: viewPerspective === 'partner' ? 'rgba(232,168,122,0.4)' : 'rgba(255,255,255,0.08)',
              background: viewPerspective === 'partner' ? 'rgba(232,168,122,0.08)' : 'transparent',
            }}>
            {personas[partnerId]?.name || "Partner"}'s perspective
          </button>
        </div>

        {/* Stats bar */}
        <div className="rounded-xl px-6 py-3 flex justify-center gap-8"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Stat label="Perception gaps" value={totalDivergences} color="#7ab0e8" />
          <Stat label="Emotion mismatches" value={emotionMismatches} color="#e87a7a" />
        </div>

        {/* Divergence cards */}
        {allDivergences.length > 0 ? (
          <div className="flex flex-col gap-4">
            {allDivergences.map((div, i) => (
              <DivergenceCard
                key={`${div.beat.id}-${viewPerspective}`}
                data={div}
                personas={personas}
                myRole={myRole}
                viewPerspective={viewPerspective}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-[21px] text-white/30" style={{ fontFamily: 'var(--font-ui)' }}>
              {viewPerspective === 'mine'
                ? `${personas[partnerId]?.name || 'Your partner'}'s understanding aligns well with your actual feelings.`
                : `Your understanding aligns well with ${personas[partnerId]?.name || 'your partner'}'s actual feelings.`}
            </p>
          </div>
        )}

        {/* Summary */}
        <div className="rounded-xl px-5 py-4 text-center" style={{
          background: 'rgba(122,176,232,0.05)',
          border: '1px solid rgba(122,176,232,0.15)',
        }}>
          <p className="text-[21px] leading-relaxed" style={{
            color: 'rgba(122,176,232,0.7)',
            fontFamily: 'var(--font-ui)',
          }}>
            {allDivergences.length > 0
              ? <>{allDivergences.length} perception gap{allDivergences.length > 1 ? 's' : ''} found.<br />
                <span className="text-[18px]" style={{ color: 'rgba(122,176,232,0.4)' }}>
                  Gaps aren't problems — discovering them is where conversation begins.
                </span></>
              : <>Your understanding of each other is remarkably aligned.</>
            }
          </p>
        </div>

        {/* Guided reflection prompts */}
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="w-full flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(122,176,232,0.25))' }} />
            <span style={{ color: '#7ab0e8', fontSize: '9px', opacity: 0.4 }}>&#9670;</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(-90deg, transparent, rgba(122,176,232,0.25))' }} />
          </div>
          <div className="w-full max-w-lg px-4">
            <p className="text-[18px] leading-relaxed mb-3" style={{
              color: 'rgba(122,176,232,0.55)',
              fontFamily: 'var(--font-ui)',
            }}>
              Before you discuss further, consider:
            </p>
            <div className="flex flex-col gap-2.5 pl-1">
              <p className="text-[18px] leading-relaxed" style={{
                color: 'rgba(122,176,232,0.45)',
                fontFamily: 'var(--font-ui)',
              }}>
                1. &ldquo;Was there a moment that gave you a new understanding of your partner?&rdquo;
              </p>
              <p className="text-[18px] leading-relaxed" style={{
                color: 'rgba(122,176,232,0.45)',
                fontFamily: 'var(--font-ui)',
              }}>
                2. &ldquo;How does seeing yourself through your partner's eyes differ from your own experience?&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center py-2">
          <ActionBtn onClick={onReplay} label="Replay" />
          {onArchive && <ActionBtn onClick={onArchive} label="View archive" accent />}
          <ActionBtn onClick={onExport} label="Export log" highlight />
        </div>
      </div>
    </div>
  )
}

// ── Helper components ─────────────────────────────────────────

function Stat({ label, value, color }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="font-mono text-[27px]" style={{ color: color || 'rgba(255,255,255,0.7)' }}>
        {value}
      </span>
      <span className="font-mono text-[14px] tracking-widest" style={{ color: color ? `${color}88` : 'rgba(255,255,255,0.28)' }}>
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
      className="font-mono text-[18px] px-6 py-2.5 rounded-lg border transition-all hover:opacity-80"
      style={base}
    >
      {label}
    </button>
  )
}
