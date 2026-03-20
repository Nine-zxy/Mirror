// ─────────────────────────────────────────────────────────────
//  Aside Sync Protocol — Message type constants
// ─────────────────────────────────────────────────────────────

export const MSG = {
  // Room lifecycle
  ROOM_CREATE:              'room:create',
  ROOM_CREATED:             'room:created',
  ROOM_JOIN:                'room:join',
  ROOM_JOINED:              'room:joined',
  ROOM_ERROR:               'room:error',
  ROOM_PARTNER_CONNECTED:   'room:partner_connected',
  ROOM_PARTNER_DISCONNECTED:'room:partner_disconnected',

  // Input phase (dual independent)
  INPUT_SUBMIT:             'input:submit',
  INPUT_PARTNER_READY:      'input:partner_ready',
  INPUT_BOTH_READY:         'input:both_ready',

  // Scenario
  SCENARIO_GENERATED:       'scenario:generated',
  SCENARIO_READY:           'scenario:ready',

  // Playback sync (relay)
  SYNC_PHASE:               'sync:phase',
  SYNC_BEAT:                'sync:beat',
  SYNC_PERSONA:             'sync:persona',
  SYNC_SCENE:               'sync:scene',

  // Ready-to-play gate (both must press play before playback starts)
  SYNC_PLAY_READY:          'sync:play_ready',    // client → server: "I pressed play"
  SYNC_PLAY_CANCEL:         'sync:play_cancel',   // client → server: "I cancelled"
  SYNC_PLAY_PARTNER_READY:  'sync:play_partner_ready', // server → client: partner is ready
  SYNC_PLAY_GO:             'sync:play_go',        // server → both: start now!

  // Annotations (private until reveal)
  ANNOTATION_UPDATE:        'annotation:update',
  ANNOTATION_SELF_CONFIRMS: 'annotation:self_confirms',
  ANNOTATION_REVEAL:        'annotation:reveal',
  ANNOTATION_REQUEST_REVEAL:'annotation:request_reveal',

  // Behavior log sync
  LOG_EVENT:                'log:event',
  LOG_EXPORT:               'log:export',
  LOG_EXPORT_RESULT:        'log:export_result',

  // Heartbeat
  PING:                     'ping',
  PONG:                     'pong',
}

// Relay types — server forwards to partner without storing
export const RELAY_TYPES = new Set([
  MSG.SYNC_PHASE,
  MSG.SYNC_BEAT,
  MSG.SYNC_PERSONA,
  MSG.SYNC_SCENE,
  MSG.SCENARIO_GENERATED,
])

export function validateMessage(raw) {
  try {
    const msg = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!msg || typeof msg.type !== 'string') return null
    return msg
  } catch {
    return null
  }
}
