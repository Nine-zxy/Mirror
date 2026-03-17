// ─────────────────────────────────────────────────────────────
//  SelfConfirmScreen — Version B Phase: self_confirm
//
//  A calm card/list interface (NOT theatrical playback).
//  Shows AI's original inference about the user's OWN thoughts,
//  beat by beat. User can confirm (checkmark) or edit each one.
//  When done, transitions to together_viewing.
//
//  Data stored in: selfConfirms["{myRole}-{beatId}"]
// ─────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react'

const EMOTION_LABELS = {
  anxious: '焦虑', defensive: '防备', angry: '愤怒', hurt: '受伤',
  withdrawn: '退缩', warm: '温暖', reflective: '反思', surprised: '惊讶', neutral: '平静',
}

const EMOTION_STYLE = {
  anxious:    { bg: 'rgba(70,110,200,0.10)',  border: '#6882d8', text: '#b8cff8', icon: '~', label: '焦虑' },
  defensive:  { bg: 'rgba(200,140,50,0.10)',  border: '#d8a040', text: '#f8d898', icon: '◈', label: '防备' },
  angry:      { bg: 'rgba(210,55,55,0.14)',   border: '#e04040', text: '#f8a0a0', icon: '■', label: '愤怒' },
  hurt:       { bg: 'rgba(90,80,170,0.10)',   border: '#7060c0', text: '#c0b8f0', icon: '▽', label: '受伤' },
  withdrawn:  { bg: 'rgba(70,80,100,0.09)',   border: '#6a7090', text: '#98a8c0', icon: '◁', label: '退缩' },
  warm:       { bg: 'rgba(70,190,110,0.09)',  border: '#58d880', text: '#98f0b0', icon: '◉', label: '温暖' },
  reflective: { bg: 'rgba(130,110,200,0.10)', border: '#a890d8', text: '#d8c8f8', icon: '✦', label: '反思' },
  surprised:  { bg: 'rgba(200,160,55,0.10)',  border: '#d8b040', text: '#f8e8a0', icon: '◎', label: '惊讶' },
  neutral:    { bg: 'rgba(90,90,90,0.09)',    border: '#7a7a7a', text: '#c0c0c0', icon: '○', label: '平静' },
}

const EMOTION_OPTIONS = ['anxious', 'defensive', 'angry', 'hurt', 'withdrawn', 'warm', 'reflective', 'neutral']

// ── Single beat card ──────────────────────────────────────────
function BeatCard({ beat, myRole, persona, selfConfirm, onConfirm }) {
  const thought = beat.thoughts?.[myRole]
  if (!thought) return null

  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(selfConfirm?.text || thought.text)
  const [emotion, setEmotion] = useState(selfConfirm?.emotion || thought.emotion)
  const inputRef = useRef(null)

  const status = selfConfirm?.status || 'pending'
  const es = EMOTION_STYLE[emotion] || EMOTION_STYLE.neutral

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const handleConfirmOriginal = () => {
    onConfirm(myRole, beat.id, {
      status: 'confirmed',
      text: thought.text,
      original: thought.text,
      emotion: thought.emotion,
    })
  }

  const handleSaveEdit = () => {
    const isChanged = text !== thought.text || emotion !== thought.emotion
    onConfirm(myRole, beat.id, {
      status: isChanged ? 'edited' : 'confirmed',
      text: text,
      original: thought.text,
      emotion: emotion,
      originalEmotion: thought.emotion,
    })
    setEditing(false)
  }

  const statusStyles = {
    pending:   { color: 'rgba(255,255,255,0.25)', bg: 'transparent', border: 'rgba(255,255,255,0.08)', label: '待确认' },
    confirmed: { color: '#60c880', bg: 'rgba(96,200,128,0.08)', border: 'rgba(96,200,128,0.25)', label: '已确认' },
    edited:    { color: '#90e8a8', bg: 'rgba(144,232,168,0.08)', border: 'rgba(144,232,168,0.25)', label: '已修正' },
  }
  const ss = statusStyles[status] || statusStyles.pending

  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${ss.border}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <span className="font-mono text-[8px] text-white/30">
          第 {beat.id + 1} 幕
        </span>
        {beat.dialogue && (
          <span className="font-mono text-[9px] text-white/20 truncate flex-1">
            {beat.dialogue.speaker === myRole ? '你说：' : '对方说：'}
            "{beat.dialogue.text}"
          </span>
        )}
        <span
          className="font-mono text-[7px] px-1.5 py-0.5 rounded ml-auto flex-shrink-0"
          style={{ color: ss.color, background: ss.bg, border: `1px solid ${ss.border}` }}
        >
          {ss.label}
        </span>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        {/* AI's inference about YOUR thought */}
        <div className="flex items-start gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: persona?.color }} />
          <div className="flex-1">
            <p className="font-mono text-[7px] text-white/22 tracking-wider mb-1">
              AI 推断你此刻的内心
            </p>
            {!editing ? (
              <p
                className="text-[12px] leading-relaxed whitespace-pre-line"
                style={{
                  color: status === 'edited' ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.60)',
                  fontFamily: '"PingFang SC","Inter",sans-serif',
                  textDecoration: status === 'edited' ? 'line-through' : 'none',
                }}
              >
                {thought.text}
              </p>
            ) : (
              <p
                className="text-[10px] leading-relaxed whitespace-pre-line text-white/20 line-through"
                style={{ fontFamily: '"PingFang SC","Inter",sans-serif' }}
              >
                {thought.text}
              </p>
            )}
            {/* Emotion tag */}
            {!editing && (
              <span
                className="font-mono text-[7px] px-1.5 py-0.5 rounded inline-block mt-1.5"
                style={{
                  color: es.text,
                  background: es.bg,
                  border: `1px solid ${es.border}40`,
                  opacity: status === 'edited' ? 0.4 : 0.7,
                }}
              >
                {es.icon} {es.label}
              </span>
            )}
          </div>
        </div>

        {/* Show edited version if confirmed with edits */}
        {status === 'edited' && !editing && selfConfirm && (
          <div className="mt-2 rounded-lg px-3 py-2" style={{
            background: 'rgba(144,232,168,0.06)',
            border: '1px solid rgba(144,232,168,0.2)',
          }}>
            <p className="font-mono text-[7px] tracking-wider mb-1" style={{ color: '#90e8a8' }}>你的修正</p>
            <p className="text-[12px] leading-relaxed whitespace-pre-line"
              style={{ color: 'rgba(144,232,168,0.8)', fontFamily: '"PingFang SC","Inter",sans-serif' }}>
              {selfConfirm.text}
            </p>
            {selfConfirm.emotion !== thought.emotion && (
              <span className="font-mono text-[7px] px-1.5 py-0.5 rounded inline-block mt-1"
                style={{ color: (EMOTION_STYLE[selfConfirm.emotion] || EMOTION_STYLE.neutral).text,
                  background: (EMOTION_STYLE[selfConfirm.emotion] || EMOTION_STYLE.neutral).bg,
                  border: `1px solid ${(EMOTION_STYLE[selfConfirm.emotion] || EMOTION_STYLE.neutral).border}40` }}>
                {(EMOTION_STYLE[selfConfirm.emotion] || EMOTION_STYLE.neutral).icon}{' '}
                {(EMOTION_STYLE[selfConfirm.emotion] || EMOTION_STYLE.neutral).label}
              </span>
            )}
          </div>
        )}

        {/* Edit panel */}
        {editing && (
          <div className="mt-2 rounded-lg overflow-hidden anim-fadeIn"
            style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.4)' }}>
            <div className="px-3 py-2 flex flex-col gap-2">
              <p className="font-mono text-[7px] text-white/25 tracking-wider">你认为自己当时真正在想什么？</p>
              <textarea
                ref={inputRef}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="写出你当时真正的想法..."
                rows={2}
                className="w-full bg-white/6 rounded px-2 py-1.5 text-[11px] text-white/80 placeholder-white/18 resize-none focus:outline-none border border-white/10 focus:border-white/25"
                style={{ fontFamily: '"PingFang SC","Inter",sans-serif' }}
              />
              <div>
                <p className="font-mono text-[7px] text-white/22 tracking-wider mb-1">情绪标签</p>
                <div className="flex flex-wrap gap-1">
                  {EMOTION_OPTIONS.map(emo => {
                    const ems = EMOTION_STYLE[emo] || EMOTION_STYLE.neutral
                    const active = emotion === emo
                    return (
                      <button key={emo} onClick={() => setEmotion(emo)}
                        className="font-mono text-[8px] px-1.5 py-0.5 rounded transition-all"
                        style={{
                          color: active ? ems.text : 'rgba(255,255,255,0.25)',
                          background: active ? ems.bg : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${active ? ems.border + '60' : 'rgba(255,255,255,0.06)'}`,
                        }}>
                        {ems.icon} {ems.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-1.5">
                <button onClick={() => { setEditing(false); setText(selfConfirm?.text || thought.text); setEmotion(selfConfirm?.emotion || thought.emotion) }}
                  className="font-mono text-[8px] px-2 py-1 rounded text-white/30 hover:text-white/50 transition-colors">
                  取消
                </button>
                <button onClick={handleSaveEdit}
                  className="font-mono text-[8px] px-2.5 py-1 rounded transition-all"
                  style={{ background: 'rgba(144,232,168,0.12)', color: '#90e8a8', border: '1px solid rgba(144,232,168,0.3)' }}>
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {!editing && (
          <div className="flex gap-2 mt-3">
            {status === 'pending' ? (
              <>
                <button onClick={handleConfirmOriginal}
                  className="font-mono text-[9px] px-3 py-1.5 rounded transition-all hover:scale-105"
                  style={{ background: 'rgba(96,200,128,0.12)', color: '#60c880', border: '1px solid rgba(96,200,128,0.25)' }}>
                  ✓ 没错，就是这样
                </button>
                <button onClick={() => setEditing(true)}
                  className="font-mono text-[9px] px-3 py-1.5 rounded transition-all hover:scale-105"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  ✎ 不太对，我来改
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)}
                className="font-mono text-[8px] px-2 py-1 rounded transition-all hover:scale-105"
                style={{ color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                重新编辑
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────
export default function SelfConfirmScreen({
  beats,
  personas,
  myRole,
  selfConfirms,
  onSelfConfirm,
  onDone,
}) {
  // Filter beats that have thoughts for myRole
  const relevantBeats = beats.filter(b => b.thoughts?.[myRole])
  const persona = personas[myRole]

  // Count confirmed/edited
  const totalRelevant = relevantBeats.length
  const doneCount = relevantBeats.filter(b => {
    const key = `${myRole}-${b.id}`
    return selfConfirms[key]
  }).length

  const allDone = doneCount >= totalRelevant

  return (
    <div className="absolute inset-0 bg-black flex flex-col items-center z-50 overflow-y-auto"
      style={{ backdropFilter: 'blur(4px)' }}>

      <div className="w-full max-w-2xl px-6 py-8 flex flex-col gap-5">

        {/* Header */}
        <div className="text-center flex flex-col items-center gap-2">
          <span className="font-pixel text-[10px] tracking-[0.35em]" style={{ color: '#7ab0e8' }}>
            ASIDE
          </span>
          <div className="w-12 h-px" style={{ background: 'linear-gradient(90deg, transparent, #7ab0e8, transparent)' }} />
          <p className="font-mono text-[9px] tracking-[0.2em] text-white/30">
            SELF-CONFIRM
          </p>
          <p className="text-[13px] text-white/55 leading-relaxed mt-1"
            style={{ fontFamily: '"PingFang SC","Inter",sans-serif' }}>
            以下是 AI 对你内心想法的推断。请确认或修正每一条。
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 px-2">
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${totalRelevant > 0 ? (doneCount / totalRelevant) * 100 : 0}%`,
                background: allDone ? '#60c880' : '#7ab0e8',
              }}
            />
          </div>
          <span className="font-mono text-[9px] text-white/30">
            {doneCount} / {totalRelevant}
          </span>
        </div>

        {/* Beat cards */}
        <div className="flex flex-col gap-3">
          {relevantBeats.map(beat => {
            const key = `${myRole}-${beat.id}`
            return (
              <BeatCard
                key={key}
                beat={beat}
                myRole={myRole}
                persona={persona}
                selfConfirm={selfConfirms[key]}
                onConfirm={onSelfConfirm}
              />
            )
          })}
        </div>

        {/* Done button */}
        <div className="flex justify-center py-4">
          <button
            onClick={onDone}
            disabled={!allDone}
            className="font-mono text-[11px] px-8 py-3 rounded-lg border transition-all"
            style={{
              color: allDone ? '#90e8a8' : 'rgba(255,255,255,0.2)',
              borderColor: allDone ? 'rgba(144,232,168,0.35)' : 'rgba(255,255,255,0.08)',
              background: allDone ? 'rgba(144,232,168,0.07)' : 'transparent',
              cursor: allDone ? 'pointer' : 'not-allowed',
              opacity: allDone ? 1 : 0.5,
            }}
          >
            {allDone ? '确认完毕，查看对方视角 →' : `请完成所有确认 (${doneCount}/${totalRelevant})`}
          </button>
        </div>
      </div>
    </div>
  )
}
