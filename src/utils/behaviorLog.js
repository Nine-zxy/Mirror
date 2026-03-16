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
//    tag_mark             Emoji tag added
//    thought_dispute      Thought bubble text edited
//    reflection_write     Reflection text updated (length only, not content)
//    reflection_reveal    User revealed partner thoughts
//    archetype_set        Relationship type + communication styles selected
//    calibration_shown    Behavioral inferences shown for confirmation
//    calibration_confirm  User confirmed/adjusted inferences
//    appearance_set       Final appearance config recorded
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
  state.sessionId = `asd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
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
    mode:         state.meta.mode ?? 'solo',
    role:         state.meta.role ?? null,
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

  const disputes    = ev.filter(e => e.type === 'thought_dispute')
  const tags        = ev.filter(e => e.type === 'tag_mark')
  const seeks       = ev.filter(e => e.type === 'beat_seek')
  const phases      = ev.filter(e => e.type === 'phase_change')
  const archetypeEv = ev.find(e  => e.type === 'archetype_set')
  const calibConfEv = ev.find(e  => e.type === 'calibration_confirm')

  // v2 assumption editing stats
  const confirms    = ev.filter(e => e.type === 'assumption_confirm')
  const aDisputes   = ev.filter(e => e.type === 'assumption_dispute')
  const edits       = ev.filter(e => e.type === 'assumption_edit')
  const clears      = ev.filter(e => e.type === 'assumption_clear')

  return {
    eventCountByType: byType,
    totalTags:        tags.length,
    totalDisputes:    disputes.length,
    manualSeeks:      seeks.length,
    phaseFlow:        phases.map(p => p.to).join(' → '),
    archetypeUsed:    archetypeEv ? {
      relationshipType: archetypeEv.relationshipType,
      stylesA: archetypeEv.stylesA,
      stylesB: archetypeEv.stylesB,
    } : null,
    calibrationAdjusted: calibConfEv?.adjustedCount ?? 0,
    disputedBeats:    disputes.map(d => `${d.personaId}-beat${d.beatId}`),
    tagsByEmoji:      tags.reduce((acc, t) => {
      acc[t.emoji] = (acc[t.emoji] ?? 0) + 1; return acc
    }, {}),
    // v2 assumption editing breakdown
    assumptionEditing: {
      confirmed: confirms.length,
      disputed:  aDisputes.length,
      edited:    edits.length,
      cleared:   clears.length,
      emotionChanges: edits.filter(e => e.emotionChanged).length,
    },
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
  const roleSuffix = state.meta.role ? `-${state.meta.role}` : ''
  a.download = `aside-${state.sessionId}${roleSuffix}.json`
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

// ── v2 assumption editing events (confirm / dispute / edit) ─────
export const logAssumptionConfirm = (pId, bId) =>
  log('assumption_confirm', { personaId: pId, beatId: bId })

export const logAssumptionDispute = (pId, bId) =>
  log('assumption_dispute', { personaId: pId, beatId: bId })

export const logAssumptionEdit = (pId, bId, { originalLen, editedLen, emotionChanged, newEmotion }) =>
  log('assumption_edit', { personaId: pId, beatId: bId, originalLen, editedLen, emotionChanged, newEmotion })

export const logAssumptionClear = (pId, bId) =>
  log('assumption_clear', { personaId: pId, beatId: bId })
export const logToggle    = (what, val) => log(`${what}_toggle`, { visible: val })
export const logReflect   = (len)        => log('reflection_write', { textLength: len })

// ── v2 archetype + calibration events ────────────────────────
export const logArchetype  = (relType, stylesA, stylesB) =>
  log('archetype_set', { relationshipType: relType, stylesA, stylesB })

export const logCalibrationShown = (inferCountA, inferCountB) =>
  log('calibration_shown', { inferCountA, inferCountB })

export const logCalibration = (confirmedA, confirmedB) => {
  const adjustedCount = [
    ...(confirmedA || []),
    ...(confirmedB || []),
  ].filter(item => item.adjusted).length
  log('calibration_confirm', {
    totalInferences: (confirmedA?.length ?? 0) + (confirmedB?.length ?? 0),
    adjustedCount,
  })
}

export const logAppearanceSet = (config) =>
  log('appearance_set', { hairA: config?.A?.hairStyle, hairB: config?.B?.hairStyle,
    outfitA: config?.A?.outfitStyle, outfitB: config?.B?.outfitStyle })

// ── v3 sync events ─────────────────────────────────────────────
export const logRoomCreate       = (code, proximity)  => log('room_create',       { code, proximity })
export const logRoomJoin         = (code, role)        => log('room_join',         { code, role })
export const logPartnerConnected = ()                  => log('partner_connected')
export const logPartnerDisconnected = ()               => log('partner_disconnected')
export const logInputSubmitted   = (role)              => log('input_submitted_self', { role })
export const logInputPartnerReady = ()                 => log('input_partner_ready')
export const logInputsMerged     = ()                  => log('inputs_merged')
export const logScenarioReceived = (source)            => log('scenario_received', { source })
