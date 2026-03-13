import { useState, useEffect, useRef, useCallback } from 'react'
import { C } from '../theme'
import { saveWatchTags } from '../utils/session'

// Emoji palette for beat tagging — blind per role, stored for Compare
const EMOJI_OPTIONS = [
  { e: '😮', label: '意外' },
  { e: '🥺', label: '心疼' },
  { e: '🤔', label: '困惑' },
  { e: '😤', label: '委屈' },
  { e: '😢', label: '难过' },
  { e: '❤️', label: '触动' },
]

const TICK_MS = 2800

export default function WatchPhase({ script, personas, myRole, sessionCode, onNext }) {
  const TOTAL_TICKS = script.length * 2
  const [tick, setTick]       = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [tags, setTags]       = useState({})   // { [beatId]: emoji }
  const [saving, setSaving]   = useState(false)
  const timerRef              = useRef(null)
  const bottomRef             = useRef(null)

  const advance = useCallback(() => {
    setTick(t => {
      if (t >= TOTAL_TICKS - 1) { setPlaying(false); return t }
      return t + 1
    })
  }, [TOTAL_TICKS])

  useEffect(() => {
    if (playing) timerRef.current = setInterval(advance, TICK_MS)
    else clearInterval(timerRef.current)
    return () => clearInterval(timerRef.current)
  }, [playing, advance])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [tick])

  const started  = tick >= 0
  const finished = tick >= TOTAL_TICKS - 1
  const pct      = started ? Math.round(((tick + 1) / TOTAL_TICKS) * 100) : 0

  const nameA = personas?.A?.name || '她'
  const nameB = personas?.B?.name || '他'

  const toggleTag = (beatId, emoji) => {
    setTags(prev => ({
      ...prev,
      [beatId]: prev[beatId] === emoji ? undefined : emoji,
    }))
  }

  const handleNext = async () => {
    setSaving(true)
    try {
      if (sessionCode && myRole) {
        await saveWatchTags(sessionCode, myRole, tags)
      }
    } catch (err) {
      console.error('saveWatchTags error:', err)
    }
    onNext(tags)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={label()}>SUBTEXT</span>
          <span style={{ width: 1, height: 14, background: C.bd }}/>
          <span style={label({ color: C.mu })}>
            {!started ? '准备就绪' : finished ? '演出结束' : `第 ${Math.floor(tick / 2) + 1} 幕 / ${script.length}`}
          </span>
        </div>
        {finished && (
          <button
            onClick={handleNext}
            disabled={saving}
            style={pillBtn(C.a)}
          >
            {saving ? '保存中…' : '开始标注 →'}
          </button>
        )}
      </div>

      {/* Stage */}
      <div style={{ flex: 1, maxWidth: 700, width: '100%', margin: '0 auto', padding: '48px 24px 160px' }}>
        {!started && (
          <div style={{ textAlign: 'center', padding: '80px 0 0' }} className="fade">
            <p style={label({ color: C.mu, fontSize: 10, marginBottom: 8, letterSpacing: '0.2em' })}>一段发生过的对话</p>
            <p style={{ margin: '0 0 12px', fontSize: 18, color: C.mu, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
              你不在其中。你只是旁观。
            </p>
            <p style={{ margin: '0 0 40px', fontSize: 11, color: C.mu, lineHeight: 1.7 }}>
              内心活动出现时，可以用 emoji 标记第一反应——<br />
              标记只有你自己能看到。
            </p>
            <button
              onClick={() => { setTick(0); setPlaying(true) }}
              style={{ padding: '14px 44px', borderRadius: 40, border: `1px solid ${C.bd2}`, background: C.card, color: C.tx, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
            >
              ▶ 开始放映
            </button>
          </div>
        )}

        <div>
          {script.map((line, idx) => {
            const showLine  = tick >= idx * 2
            const showInner = tick >= idx * 2 + 1
            if (!showLine) return null
            return (
              <ScriptBeat
                key={line.id}
                line={line}
                showInner={showInner}
                nameA={nameA}
                nameB={nameB}
                isLatest={Math.floor(tick / 2) === idx && !showInner}
                currentTag={tags[line.id]}
                onTag={(emoji) => toggleTag(line.id, emoji)}
              />
            )
          })}
        </div>

        {started && !finished && tick % 2 === 0 && (
          <div style={{ display: 'flex', gap: 5, justifyContent: 'center', padding: '32px 0 0' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: C.mu, animation: `blink 1.6s ${i * 0.28}s infinite` }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Director controls */}
      {started && (
        <div style={controlBar}>
          {/* Scrubber */}
          <div style={{ marginBottom: 14, position: 'relative' }}>
            <div style={{ height: 2, background: C.dim, borderRadius: 1, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: C.mu, width: `${pct}%`, transition: 'width .4s ease' }} />
            </div>
            <div style={{ position: 'absolute', top: -2, left: 0, right: 0, height: 6, display: 'flex' }}>
              {script.map((_, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: 1, height: 6, background: tick >= i * 2 ? C.mu : C.dim }} />
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap' }}>
              {script.map((line, i) => {
                const active  = Math.floor(tick / 2) === i
                const done    = tick >= i * 2 + 1
                const hasTag  = Boolean(tags[line.id])
                return (
                  <button key={i} onClick={() => { setTick(i * 2); setPlaying(false) }}
                    style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${active ? C.mu : C.dim}`, background: active ? C.card : C.bg, color: active ? C.tx : C.mu, fontSize: 10, cursor: 'pointer', fontFamily: 'DM Mono, monospace', opacity: done ? 0.85 : active ? 1 : 0.5, position: 'relative' }}>
                    幕{i + 1}
                    {hasTag && <span style={{ position: 'absolute', top: -4, right: -4, fontSize: 9 }}>{tags[line.id]}</span>}
                  </button>
                )
              })}
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <CtrlBtn onClick={() => { setTick(Math.max(0, tick - 2)); setPlaying(false) }} label="⏮" />
              <CtrlBtn onClick={() => { setTick(t => Math.max(0, t - 1)); setPlaying(false) }} label="◀" />
              <button
                onClick={() => { if (finished) { setTick(0); setPlaying(true) } else setPlaying(p => !p) }}
                style={{ width: 48, height: 48, borderRadius: '50%', border: 'none', background: finished ? C.gr : playing ? C.re : C.tx, color: C.bg, cursor: 'pointer', fontSize: 16, fontWeight: 700, transition: 'background .25s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {finished ? '↺' : playing ? '⏸' : '▶'}
              </button>
              <CtrlBtn onClick={() => { setTick(t => Math.min(TOTAL_TICKS - 1, t + 1)); setPlaying(false) }} label="▶" disabled={finished} />
              <CtrlBtn onClick={() => { setTick(TOTAL_TICKS - 1); setPlaying(false) }} label="⏭" disabled={finished} />
            </div>

            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 10, color: C.mu, fontFamily: 'DM Mono, monospace' }}>
                {playing ? '▶ 放映中' : finished ? '演出结束' : '⏸ 已暂停'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Script beat ───────────────────────────────────────────────
function ScriptBeat({ line, showInner, nameA, nameB, isLatest, currentTag, onTag }) {
  const isAction = line.speaker === 'action'
  const isA      = line.speaker === 'A'

  return (
    <div className="rise" style={{ marginBottom: 48 }}>
      {isAction ? (
        <div style={{ textAlign: 'center', marginBottom: showInner ? 20 : 0 }}>
          <p style={{ margin: 0, fontSize: 13, color: C.mu, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', lineHeight: 1.8 }}>
            [ {line.text} ]
          </p>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginBottom: showInner ? 20 : 0 }}>
          <p style={{ margin: '0 0 10px', fontSize: 10, letterSpacing: '0.3em', color: isA ? C.a : C.b, fontFamily: 'DM Mono, monospace', textTransform: 'uppercase' }}>
            {isA ? nameA : nameB}
          </p>
          <p style={{ margin: 0, fontSize: 26, fontWeight: 300, color: C.tx, fontFamily: 'Cormorant Garamond, serif', lineHeight: 1.5 }}>
            {line.text}
          </p>
        </div>
      )}

      {showInner && (line.innerA || line.innerB) && (
        <div className="drift" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 4 }}>
          <div style={{ textAlign: 'right', padding: '0 20px 0 0', borderRight: `1px solid ${C.aBd}` }}>
            <p style={{ margin: '0 0 4px', fontSize: 9, color: C.a + '88', fontFamily: 'DM Mono, monospace', letterSpacing: '0.12em' }}>{nameA}的内心</p>
            <p style={{ margin: 0, fontSize: 14, color: line.innerA ? C.a + 'BB' : C.mu2, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', lineHeight: 1.8 }}>
              {line.innerA ? line.innerA.replace(/\\n/g, '\n') : '——'}
            </p>
          </div>
          <div style={{ padding: '0 0 0 20px', borderLeft: `1px solid ${C.bBd}` }}>
            <p style={{ margin: '0 0 4px', fontSize: 9, color: C.b + '88', fontFamily: 'DM Mono, monospace', letterSpacing: '0.12em' }}>{nameB}的内心</p>
            <p style={{ margin: 0, fontSize: 14, color: line.innerB ? C.b + 'BB' : C.mu2, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', lineHeight: 1.8 }}>
              {line.innerB ? line.innerB.replace(/\\n/g, '\n') : '——'}
            </p>
          </div>
        </div>
      )}

      {/* Emoji tag strip — appears after inner thoughts, blind per role */}
      {showInner && (
        <div className="drift" style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
          {EMOJI_OPTIONS.map(({ e, label: lbl }) => {
            const active = currentTag === e
            return (
              <button
                key={e}
                onClick={() => onTag(e)}
                title={lbl}
                style={{
                  padding: '5px 9px', borderRadius: 20,
                  border: `1.5px solid ${active ? C.mu + '88' : C.bd}`,
                  background: active ? C.card : 'transparent',
                  fontSize: 15, cursor: 'pointer', lineHeight: 1,
                  transition: 'all .18s',
                  transform: active ? 'scale(1.15)' : 'scale(1)',
                  opacity: currentTag && !active ? 0.35 : 1,
                }}
              >
                {e}
              </button>
            )
          })}
          {currentTag && (
            <button
              onClick={() => onTag(currentTag)}
              style={{ padding: '5px 9px', borderRadius: 20, border: `1px solid ${C.dim}`, background: 'transparent', fontSize: 10, color: C.mu, cursor: 'pointer', fontFamily: 'DM Mono, monospace' }}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {showInner && (
        <div style={{ marginTop: 24, height: 1, background: `linear-gradient(to right, transparent, ${C.bd}, transparent)` }} />
      )}
    </div>
  )
}

// ── Shared sub-components ─────────────────────────────────────
function CtrlBtn({ onClick, label, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${C.bd2}`, background: C.card, color: disabled ? C.dim : C.mu, cursor: disabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
      {label}
    </button>
  )
}

const topBar = {
  position: 'sticky', top: 0, zIndex: 50,
  background: '#07070DF0', backdropFilter: 'blur(16px)',
  borderBottom: `1px solid ${C.bd}`, padding: '10px 24px',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
}
const controlBar = {
  position: 'fixed', bottom: 0, left: 0, right: 0,
  background: '#07070DF8', backdropFilter: 'blur(20px)',
  borderTop: `1px solid ${C.bd}`, padding: '14px 28px 18px', zIndex: 100,
}
const label = (extra = {}) => ({ fontSize: 9, letterSpacing: '0.4em', color: C.mu, fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', ...extra })
const pillBtn = (bg) => ({ padding: '6px 20px', borderRadius: 20, border: 'none', background: bg, color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' })
