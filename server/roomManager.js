// ─────────────────────────────────────────────────────────────
//  RoomManager — In-memory room lifecycle for Aside sync
//
//  Rooms are ephemeral (no persistence). Each room holds two
//  clients (role A = creator, role B = joiner) and stores
//  input data + annotations for the session.
// ─────────────────────────────────────────────────────────────

import { MSG, RELAY_TYPES, validateMessage } from './protocol.js'

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I to avoid confusion
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export class RoomManager {
  constructor() {
    this.rooms = new Map()       // code → Room
    this.clientRoom = new Map()  // ws → { code, role }
  }

  // ── Room creation ────────────────────────────────────────
  createRoom(ws, payload = {}) {
    let code
    do { code = generateCode() } while (this.rooms.has(code))

    const room = {
      code,
      mode: payload.mode || 'together',
      proximity: payload.proximity || 'colocated',
      clients: new Map([['A', ws]]),
      inputA: null,
      inputB: null,
      disputesA: {},
      disputesB: {},
      scenario: null,
      playReadyA: false,
      playReadyB: false,
      createdAt: Date.now(),
    }

    this.rooms.set(code, room)
    this.clientRoom.set(ws, { code, role: 'A' })

    this.send(ws, { type: MSG.ROOM_CREATED, code, role: 'A' })
    console.log(`[Room] Created ${code} (${room.proximity})`)
    return room
  }

  // ── Room joining ─────────────────────────────────────────
  joinRoom(ws, payload) {
    const code = (payload.code || '').toUpperCase().trim()
    const room = this.rooms.get(code)

    if (!room) {
      this.send(ws, { type: MSG.ROOM_ERROR, message: '房间不存在' })
      return
    }
    if (room.clients.size >= 2) {
      this.send(ws, { type: MSG.ROOM_ERROR, message: '房间已满' })
      return
    }

    room.clients.set('B', ws)
    this.clientRoom.set(ws, { code, role: 'B' })

    // Notify both
    this.send(ws, { type: MSG.ROOM_JOINED, role: 'B', code })
    const partnerWs = room.clients.get('A')
    if (partnerWs) {
      this.send(partnerWs, { type: MSG.ROOM_PARTNER_CONNECTED })
    }

    console.log(`[Room] ${code}: B joined`)
  }

  // ── Message dispatch ─────────────────────────────────────
  handleMessage(ws, raw) {
    const msg = validateMessage(raw)
    if (!msg) return

    // Heartbeat
    if (msg.type === MSG.PING) {
      this.send(ws, { type: MSG.PONG })
      return
    }

    // Room creation/joining (no room context needed)
    if (msg.type === MSG.ROOM_CREATE) return this.createRoom(ws, msg)
    if (msg.type === MSG.ROOM_JOIN)   return this.joinRoom(ws, msg)

    // All other messages require room context
    const ctx = this.clientRoom.get(ws)
    if (!ctx) return
    const room = this.rooms.get(ctx.code)
    if (!room) return
    const { role } = ctx

    // ── Relay types (forward to partner as-is) ────────────
    if (RELAY_TYPES.has(msg.type)) {
      // Special: scenario:generated → broadcast as scenario:ready
      if (msg.type === MSG.SCENARIO_GENERATED) {
        room.scenario = msg.scenario
        this.broadcastToOther(room, ws, {
          type: MSG.SCENARIO_READY,
          scenario: msg.scenario,
          source: role,
        })
        return
      }
      this.broadcastToOther(room, ws, msg)
      return
    }

    // ── Input submission ──────────────────────────────────
    if (msg.type === MSG.INPUT_SUBMIT) {
      if (role === 'A') room.inputA = msg.input
      else              room.inputB = msg.input

      // Notify partner
      this.broadcastToOther(room, ws, { type: MSG.INPUT_PARTNER_READY })

      // Check if both ready
      if (room.inputA && room.inputB) {
        // Send merged payload to role A (who generates the scenario)
        const merged = this.mergeInputs(room)
        const roleAWs = room.clients.get('A')
        if (roleAWs) {
          this.send(roleAWs, { type: MSG.INPUT_BOTH_READY, mergedInput: merged })
        }
        // Also notify B that merge happened
        const roleBWs = room.clients.get('B')
        if (roleBWs) {
          this.send(roleBWs, { type: MSG.INPUT_BOTH_READY, mergedInput: null, generating: true })
        }
      }
      return
    }

    // ── Ready-to-play gate ─────────────────────────────────
    if (msg.type === MSG.SYNC_PLAY_READY) {
      if (role === 'A') room.playReadyA = true
      else              room.playReadyB = true

      // Notify partner that this side is ready
      this.broadcastToOther(room, ws, { type: MSG.SYNC_PLAY_PARTNER_READY, role })

      // If both ready → broadcast GO to both, then reset flags
      if (room.playReadyA && room.playReadyB) {
        const beatIndex = msg.beatIndex ?? 0
        for (const [, clientWs] of room.clients) {
          this.send(clientWs, { type: MSG.SYNC_PLAY_GO, beatIndex })
        }
        room.playReadyA = false
        room.playReadyB = false
        console.log(`[Room] ${ctx.code}: both ready → play!`)
      }
      return
    }

    if (msg.type === MSG.SYNC_PLAY_CANCEL) {
      if (role === 'A') room.playReadyA = false
      else              room.playReadyB = false
      this.broadcastToOther(room, ws, { type: MSG.SYNC_PLAY_CANCEL, role })
      return
    }

    // ── Annotation updates (store, don't forward) ─────────
    if (msg.type === MSG.ANNOTATION_UPDATE) {
      const store = role === 'A' ? 'disputesA' : 'disputesB'
      if (msg.dispute === null) {
        delete room[store][msg.key]
      } else {
        room[store][msg.key] = msg.dispute
      }
      return // NOT forwarded — privacy until reveal
    }

    // ── Annotation reveal request ─────────────────────────
    if (msg.type === MSG.ANNOTATION_REQUEST_REVEAL) {
      const partnerStore = role === 'A' ? 'disputesB' : 'disputesA'
      this.send(ws, {
        type: MSG.ANNOTATION_REVEAL,
        partnerDisputes: room[partnerStore],
      })
      return
    }
  }

  // ── Disconnect handling ──────────────────────────────────
  handleDisconnect(ws) {
    const ctx = this.clientRoom.get(ws)
    if (!ctx) return
    const room = this.rooms.get(ctx.code)
    if (!room) return

    room.clients.delete(ctx.role)
    this.clientRoom.delete(ws)

    // Notify remaining partner
    for (const [, partnerWs] of room.clients) {
      this.send(partnerWs, { type: MSG.ROOM_PARTNER_DISCONNECTED })
    }

    console.log(`[Room] ${ctx.code}: ${ctx.role} disconnected`)

    // Cleanup empty rooms after 60s
    if (room.clients.size === 0) {
      setTimeout(() => {
        if (this.rooms.has(ctx.code) && this.rooms.get(ctx.code).clients.size === 0) {
          this.rooms.delete(ctx.code)
          console.log(`[Room] ${ctx.code}: cleaned up`)
        }
      }, 60000)
    }
  }

  // ── Reconnect (rejoin with same code) ────────────────────
  // Handled naturally by joinRoom — if role A disconnected and
  // reconnects, they create a new room. For simplicity, we don't
  // support transparent reconnection in v1.

  // ── Helpers ──────────────────────────────────────────────
  send(ws, msg) {
    if (ws.readyState === 1) ws.send(JSON.stringify(msg))
  }

  broadcastToOther(room, senderWs, msg) {
    for (const [, clientWs] of room.clients) {
      if (clientWs !== senderWs) this.send(clientWs, msg)
    }
  }

  mergeInputs(room) {
    const a = room.inputA
    const b = room.inputB
    return {
      // Take longer chat log (should be same conversation)
      chatLog: (a.chatLog?.length || 0) >= (b.chatLog?.length || 0) ? a.chatLog : b.chatLog,
      concernA: a.concern || '',
      concernB: b.concern || '',
      context: a.context || b.context || '',
      archetype: {
        relationshipType: a.archetype?.relationshipType || b.archetype?.relationshipType || 'romantic',
        styleA: a.archetype?.styles || [],   // A's self-selected style
        styleB: b.archetype?.styles || [],   // B's self-selected style
      },
      calibrationA: a.calibration || null,
      calibrationB: b.calibration || null,
    }
  }

  // Stats for console
  get stats() {
    return { rooms: this.rooms.size, clients: this.clientRoom.size }
  }
}
