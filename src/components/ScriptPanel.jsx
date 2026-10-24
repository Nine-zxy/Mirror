// ─────────────────────────────────────────────────────────────
//  ScriptPanel — collapsible "幕后剧本" sidebar
//
//  Goffman framing: this is the "backstage record" —
//  the script document that makes the simulation navigable,
//  annotatable, and discussable between partners.
//
//  Features:
//    • Click any beat row → seek to that beat
//    • Current beat highlighted
//    • Shows thought bubble text (small, per-persona color)
//    • Shows tag pins for that beat
//    • Shows dispute badges (AI original vs user modified)
// ─────────────────────────────────────────────────────────────

const EMOTION_ICONS = {
  anxious: '〜', defensive: '◈', angry: '■',
  hurt: '▽', withdrawn: '◁', warm: '◉',
  reflective: '✦', surprised: '◎', neutral: '○',
}

const DISPUTE_BADGE = {
  confirmed: { label: '像TA', color: '#60c880', bg: 'rgba(96,200,128,0.12)', border: 'rgba(96,200,128,0.3)' },
  disputed:  { label: '不像',  color: '#e87a7a', bg: 'rgba(232,122,122,0.12)', border: 'rgba(232,122,122,0.3)' },
  edited:    { label: '已修正', color: '#90e8a8', bg: 'rgba(144,232,168,0.12)', border: 'rgba(144,232,168,0.3)' },
}

function BeatRow({ beat, index, isCurrent, personas, tags, disputes, onSeek }) {
  const beatTags     = tags.filter(t => t.beatIndex === index)
  const thoughtA     = beat.thoughts?.A
  const thoughtB     = beat.thoughts?.B
  const disputeA     = disputes[`A-${beat.id}`]
  const disputeB     = disputes[`B-${beat.id}`]
  const speaker      = beat.dialogue?.speaker
  const speakerColor = speaker ? personas[speaker]?.color : 'rgba(255,255,255,0.3)'

  return (
    <div
      onClick={() => onSeek(index)}
      className="px-3 py-2.5 cursor-pointer border-b transition-all"
      style={{
        borderColor:  'rgba(255,255,255,0.05)',
        background:   isCurrent ? 'rgba(255,255,255,0.05)' : 'transparent',
        borderLeft:   isCurrent ? `2px solid ${speakerColor || '#7ab0e8'}` : '2px solid transparent',
      }}
    >
      {/* Beat index + type */}
      <div className="flex items-center gap-1.5 mb-1">
        <span className="font-mono text-[7px] text-white/20 w-4 flex-shrink-0">
          {String(index).padStart(2, '0')}
        </span>
        {beat.isPausePoint && (
          <span className="font-mono text-[6px] px-1 py-0.5 rounded"
            style={{ background: 'rgba(232,122,122,0.15)', color: '#e87a7a', border: '1px solid rgba(232,122,122,0.3)' }}>
            ⏸ 暂停点
          </span>
        )}
        {beatTags.map(t => (
          <span key={t.id} className="text-[10px]">{t.emoji}</span>
        ))}
      </div>

      {/* Narrator */}
      {beat.narrator && (
        <p className="text-[12px] text-white/28 leading-snug italic mb-1"
          style={{ fontFamily: '"PingFang SC","Inter",sans-serif' }}>
          {beat.narrator}
        </p>
      )}

      {/* Dialogue */}
      {beat.dialogue && (
        <div className="flex items-start gap-1.5 mb-1">
          <span className="font-mono text-[8px] flex-shrink-0 mt-0.5 font-bold"
            style={{ color: speakerColor }}>
            {personas[speaker]?.name}
          </span>
          <p className="text-[12px] text-white/60 leading-snug"
            style={{ fontFamily: '"PingFang SC","Inter",sans-serif' }}>
            {beat.dialogue.text}
          </p>
        </div>
      )}

      {/* Thoughts */}
      {['A','B'].map(id => {
        const thought  = beat.thoughts?.[id]
        const dispute  = disputes[`${id}-${beat.id}`]
        if (!thought && !dispute) return null
        const color    = personas[id]?.color || '#888'
        const emotion  = dispute?.emotion || thought?.emotion
        const icon     = EMOTION_ICONS[emotion] || '○'
        const text     = dispute?.text || thought?.text || ''
        const badge    = dispute ? DISPUTE_BADGE[dispute.status] : null
        const isEdited = dispute?.status === 'edited' && dispute.text !== dispute.original
        const isDisputed = dispute?.status === 'disputed'
        return (
          <div key={id} className="flex items-start gap-1 mt-0.5">
            <span className="font-mono text-[7px] flex-shrink-0 mt-0.5 opacity-60"
              style={{ color }}>
              {icon}
            </span>
            <div className="flex-1 min-w-0">
              {/* Show original struck-through if edited/disputed */}
              {(isEdited || isDisputed) && (
                <p className="text-[8px] leading-snug line-through mb-0.5"
                  style={{ color: 'rgba(255,255,255,0.2)', fontFamily: '"PingFang SC","Inter",sans-serif' }}>
                  {dispute.original}
                </p>
              )}
              <p className="text-[12px] leading-snug" style={{
                color: badge ? badge.color + 'cc' : `${color}99`,
                fontFamily: '"PingFang SC","Inter",sans-serif',
              }}>
                {isEdited ? text : (isDisputed ? '' : text)}
              </p>
            </div>
            {badge && (
              <span className="font-mono text-[6px] px-1 py-0.5 rounded flex-shrink-0"
                style={{ background: badge.bg, color: badge.color,
                  border: `1px solid ${badge.border}`, marginLeft: '2px' }}>
                {badge.label}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function ScriptPanel({
  beats, beatIndex, personas, tags = [], disputes = {}, onSeek,
}) {
  return (
    <div
      className="flex flex-col border-l border-white/8 overflow-hidden flex-shrink-0"
      style={{ background: '#060810', width: '240px' }}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-white/8 flex-shrink-0 flex items-center gap-2">
        <span className="font-mono text-[11px] tracking-[0.2em]" style={{ color: '#7ab0e8aa' }}>剧本 / SCRIPT</span>
        <div className="flex-1" />
        {tags.length > 0 && (
          <span className="font-mono text-[7px] text-white/20">🏷 {tags.length}</span>
        )}
      </div>

      {/* Beat list */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
        {beats.map((beat, i) => (
          <BeatRow
            key={beat.id}
            beat={beat}
            index={i}
            isCurrent={i === beatIndex}
            personas={personas}
            tags={tags}
            disputes={disputes}
            onSeek={onSeek}
          />
        ))}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-2 border-t border-white/5 flex-shrink-0">
        <p className="font-mono text-[7px] text-white/15 leading-snug">
          点击任意行跳转到该时刻
        </p>
      </div>
    </div>
  )
}
