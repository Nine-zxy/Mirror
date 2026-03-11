import { useState } from 'react'
import { Edit3, Check, X, AlertTriangle, Tag } from 'lucide-react'

// ─── Single assumption card ────────────────────────────────────────────────────
function AssumptionCard({ label, text, user, field, turnId, onEdit }) {
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState(text)

  const handleSave = () => {
    onEdit(turnId, field, draft)
    setEditing(false)
  }

  const handleCancel = () => {
    setDraft(text)
    setEditing(false)
  }

  return (
    <div
      className="rounded-xl p-3.5 transition-all duration-300"
      style={{
        border:     `1.5px solid ${user.borderColor}`,
        background: user.dimColor,
      }}
    >
      {/* Card header */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="font-pixel text-[8px] tracking-widest"
          style={{ color: user.color }}
        >
          {label}
        </span>
        {!editing && (
          <button
            onClick={() => { setDraft(text); setEditing(true) }}
            className="flex items-center gap-1 text-[10px] text-[#6E7681] hover:text-[#C9D1D9] transition-colors px-1.5 py-0.5 rounded hover:bg-white/5"
          >
            <Edit3 size={10} />
            <span className="font-mono">edit</span>
          </button>
        )}
      </div>

      {/* Content */}
      {editing ? (
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={3}
            className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg p-2.5 text-xs text-[#E6EDF3] leading-relaxed resize-none focus:outline-none focus:border-[#4F8EF7] transition-colors"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1 flex-1 justify-center py-1.5 rounded-lg text-[11px] font-medium bg-[#1F6FEB] hover:bg-[#388BFD] transition-colors text-white"
            >
              <Check size={11} />
              Save & Replay
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] text-[#8B949E] hover:text-white bg-[#21262D] hover:bg-[#30363D] transition-colors"
            >
              <X size={11} />
            </button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-[#C9D1D9] leading-relaxed italic">
          &ldquo;{text}&rdquo;
        </p>
      )}
    </div>
  )
}

// ─── Divergence meter ──────────────────────────────────────────────────────────
function DivergenceMeter({ value }) {
  const color =
    value >= 85 ? '#FF6B6B' :
    value >= 65 ? '#F0A500' : '#3FB950'

  const label =
    value >= 85 ? 'CRITICAL MISMATCH' :
    value >= 65 ? 'INTERPRETATION DRIFT' : 'ALIGNED'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-pixel text-[7px] text-[#6E7681] tracking-widest">
          DYADIC DIVERGENCE
        </span>
        <span className="font-mono text-[11px] font-semibold" style={{ color }}>
          {value}%
        </span>
      </div>

      {/* Bar */}
      <div className="w-full h-2 bg-[#21262D] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, #3FB950, ${color})`,
          }}
        />
      </div>

      {/* Label */}
      <div className="flex items-center gap-1.5">
        {value >= 65 && <AlertTriangle size={11} style={{ color }} />}
        <span className="font-mono text-[10px]" style={{ color, opacity: 0.85 }}>
          {label}
        </span>
      </div>
    </div>
  )
}

// ─── Tag system ────────────────────────────────────────────────────────────────
const TAG_OPTIONS = ['Assumption', 'Escalation', 'Withdrawal', 'Misread', 'Pivot point']

function TagPanel({ tags, turnId, onEdit }) {
  const toggle = (tag) => {
    const next = tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]
    onEdit(turnId, 'tags', next)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Tag size={10} className="text-[#6E7681]" />
        <span className="font-pixel text-[7px] text-[#6E7681] tracking-widest">
          ANNOTATE
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TAG_OPTIONS.map(tag => (
          <button
            key={tag}
            onClick={() => toggle(tag)}
            className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
              tags.includes(tag)
                ? 'bg-[#1F6FEB] border-[#388BFD] text-white'
                : 'bg-transparent border-[#30363D] text-[#6E7681] hover:border-[#6E7681] hover:text-[#C9D1D9]'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Main Console ──────────────────────────────────────────────────────────────
export default function Console({ currentTurn, onEditSubtext, userA, userB }) {
  const handleEdit = (turnId, field, value) => {
    onEditSubtext(turnId, field, value)
  }

  return (
    <aside className="w-[260px] flex-shrink-0 flex flex-col border-l border-[#21262D] bg-[#0D1117] overflow-y-auto">

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#21262D] flex-shrink-0">
        <Edit3 size={12} className="text-[#6E7681]" />
        <span className="font-pixel text-[8px] text-[#6E7681] tracking-widest">
          REFLECTION CONSOLE
        </span>
      </div>

      <div className="flex flex-col gap-4 p-4">

        {/* ── Assumption cards ──────────────────────────── */}
        <AssumptionCard
          label={`${userA.label} · Internal State`}
          text={currentTurn.subtextA}
          user={userA}
          field="subtextA"
          turnId={currentTurn.id}
          onEdit={handleEdit}
        />

        <AssumptionCard
          label={`${userB.label} · Internal State`}
          text={currentTurn.subtextB}
          user={userB}
          field="subtextB"
          turnId={currentTurn.id}
          onEdit={handleEdit}
        />

        {/* ── Divider ───────────────────────────────────── */}
        <div className="h-px bg-[#21262D]" />

        {/* ── Divergence meter ─────────────────────────── */}
        <DivergenceMeter value={currentTurn.divergence} />

        {/* ── Divider ───────────────────────────────────── */}
        <div className="h-px bg-[#21262D]" />

        {/* ── Tags ─────────────────────────────────────── */}
        <TagPanel
          tags={currentTurn.tags || []}
          turnId={currentTurn.id}
          onEdit={handleEdit}
        />

        {/* ── Divider ───────────────────────────────────── */}
        <div className="h-px bg-[#21262D]" />

        {/* ── Counterfactual hint ───────────────────────── */}
        <div className="rounded-xl p-3.5 border border-[#30363D] bg-[#161B22]">
          <p className="font-pixel text-[7px] text-[#6E7681] tracking-widest mb-2">
            COUNTERFACTUAL
          </p>
          <p className="text-xs text-[#8B949E] leading-relaxed mb-3">
            Edit an assumption above, then press Save to regenerate the simulation from this moment.
          </p>
          <div className="flex items-center gap-1.5 text-[#4F8EF7]">
            <span className="font-mono text-[10px]">→ Branch will appear in timeline</span>
          </div>
        </div>

      </div>
    </aside>
  )
}
