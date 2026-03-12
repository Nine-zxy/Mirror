// ─────────────────────────────────────────────────────────────
//  behaviorLog — lightweight session event recorder
//
//  Tracks every meaningful user action with timestamp and
//  context.  Exported as a structured JSON file at session end.
//
//  Usage:
//    import { log, initSession, downloadLog } from './behaviorLog'
//    initSession({ scenario: 'unread_message' })
//    log('beat_advance', { beatIndex: 2, trigger: 'auto' })
//    downloadLog()
//
//  Event types:
//    session_start        Session initialised
//    phase_change         Phase transition
//    conflict_input       Raw conflict text submitted
//    scenario_generated   RSL scenario produced (source: ai | fallback)
//    beat_advance         Beat advanced (trigger: auto | keyboard | click)
//    beat_seek            User jumped to specific beat
//    thought_toggle       Subtext shown/hidden
//    script_toggle        Script panel opened/closed
//    tag_mark             Emoji tag added
//    thought_dispute      Thought bubble text edited
//    profile_set          Conflict profile configured
//    reflection_write     Reflection text updated (length only, not content)
//    reflection_reveal    User revealed partner thoughts
//    session_export       Log exported by user
// ─────────────────────────────────────────────────────────────

const state = {
  sessionId:   null,
  startedAt:   null,
  meta:        {},
  events:      [],
}

// ── Init ──────────────────────────────────────────────────────
export function initSession(meta = {}) {
  state.sessionId = `mir_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
  state.startedAt = Date.now()
  state.meta      = meta
  state.events    = []
  log('session_start', meta)
  return state.sessionId
}

// ── Append one event ─────────────────────────────────────────
export function log(type, data = {}) {
  const entry = {
    seq:     state.events.length,
    t:       Date.now(),
    elapsed: state.startedAt ? Date.now() - state.startedAt : 0,
    type,
    ...data,
  }
  state.events.push(entry)
  return entry
}

// ── Build export object ───────────────────────────────────────
export function buildLog() {
  return {
    sessionId:    state.sessionId,
    scenario:     state.meta.scenarioId ?? 'unknown',
    startedAt:    new Date(state.startedAt).toISOString(),
    exportedAt:   new Date().toISOString(),
    durationMs:   Date.now() - state.startedAt,
    eventCount:   state.events.length,
    summary:      buildSummary(),
    events:       state.events,
  }
}

// ── Summary statistics ────────────────────────────────────────
function buildSummary() {
  const ev = state.events
  const byType = {}
  ev.forEach(e => { byType[e.type] = (byType[e.type] ?? 0) + 1 })

  const disputes   = ev.filter(e => e.type === 'thought_dispute')
  const tags       = ev.filter(e => e.type === 'tag_mark')
  const seeks      = ev.filter(e => e.type === 'beat_seek')
  const phases     = ev.filter(e => e.type === 'phase_change')
  const profileSet = ev.find(e  => e.type === 'profile_set')

  return {
    eventCountByType: byType,
    totalTags:        tags.length,
    totalDisputes:    disputes.length,
    manualSeeks:      seeks.length,
    phaseFlow:        phases.map(p => p.to).join(' → '),
    profileUsed:      profileSet ? profileSet.profile : null,
    disputedBeats:    disputes.map(d => `${d.personaId}-beat${d.beatId}`),
    tagsByEmoji:      tags.reduce((acc, t) => {
      acc[t.emoji] = (acc[t.emoji] ?? 0) + 1; return acc
    }, {}),
  }
}

// ── Download as JSON file ─────────────────────────────────────
export function downloadLog() {
  const payload = buildLog()
  log('session_export', { eventCount: payload.eventCount })

  const blob = new Blob(
    [JSON.stringify(payload, null, 2)],
    { type: 'application/json' },
  )
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `mirror-${state.sessionId}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  return payload
}

// ── Convenience wrappers ──────────────────────────────────────
export const logPhase     = (from, to)  => log('phase_change', { from, to })
export const logBeat      = (i, trigger) => log('beat_advance', { beatIndex: i, trigger })
export const logSeek      = (i)          => log('beat_seek', { beatIndex: i })
export const logTag       = (emoji, bi)  => log('tag_mark', { emoji, beatIndex: bi })
export const logDispute   = (pId, bId, original, edited) =>
  log('thought_dispute', { personaId: pId, beatId: bId, originalLength: original?.length ?? 0, editedLength: edited?.length ?? 0 })
export const logProfile   = (profile)   => log('profile_set', { profile })
export const logToggle    = (what, val) => log(`${what}_toggle`, { visible: val })
export const logReflect   = (len)        => log('reflection_write', { textLength: len })
