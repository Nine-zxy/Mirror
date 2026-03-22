// ─────────────────────────────────────────────────────────────
//  RoomManager — In-memory room lifecycle for Aside sync
//
//  Rooms are ephemeral (no persistence). Each room holds two
//  clients (role A = creator, role B = joiner) and stores
//  input data + annotations for the session.
//  Log events are persisted to disk as JSONL files.
// ─────────────────────────────────────────────────────────────

import { MSG, RELAY_TYPES, validateMessage } from './protocol.js'
import { existsSync, mkdirSync, appendFileSync, writeFileSync, readdirSync, readFileSync, statSync } from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const LOGS_DIR = resolve(__dirname, 'logs')

// Ensure logs directory exists
if (!existsSync(LOGS_DIR)) {
  mkdirSync(LOGS_DIR, { recursive: true })
  console.log(`[Logs] Created directory: ${LOGS_DIR}`)
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I to avoid confusion
  let code = ''
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export class RoomManager {
  constructor() {
    this.rooms = new Map()        // code → Room
    this.clientRoom = new Map()   // ws → { code, role }
    this.scenarios = new Map()    // scenarioId → { scenario, metadata, createdAt }
    this.inputConfigs = new Map() // configId → { label, config, createdAt }
    this.studyLogs = new Map()    // roomCode → [log entries]
    this.logSubscribers = new Map() // roomCode → Set<ws>
    this.logFiles = new Map()     // roomCode → filename for JSONL append
  }

  // ── Room creation ────────────────────────────────────────
  createRoom(ws, payload = {}) {
    // Allow specifying a room code (e.g., for preloaded scenario auto-join)
    let code
    if (payload.code) {
      code = payload.code.toUpperCase().trim()
      // If room already exists with this code, join it instead
      if (this.rooms.has(code)) {
        return this.joinRoom(ws, { code })
      }
    } else {
      do { code = generateCode() } while (this.rooms.has(code))
    }

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
      phaseReadyA: null,  // target phase that A is ready for (e.g. 'solo_viewing')
      phaseReadyB: null,  // target phase that B is ready for
      logs: [],           // per-room behavior log events from both clients
      createdAt: Date.now(),
    }

    this.rooms.set(code, room)
    this.clientRoom.set(ws, { code, role: 'A' })

    // Initialize log storage and file
    this.studyLogs.set(code, [])
    const logFilename = `${code}_${new Date().toISOString().replace(/[:.]/g, '-')}.jsonl`
    this.logFiles.set(code, logFilename)
    console.log(`[Logs] Log file for room ${code}: ${logFilename}`)

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

    // Clean up any previous room this client was in (e.g. auto-created room)
    const prevCtx = this.clientRoom.get(ws)
    if (prevCtx) {
      const prevRoom = this.rooms.get(prevCtx.code)
      if (prevRoom && prevCtx.code !== code) {
        prevRoom.clients.delete(prevCtx.role)
        if (prevRoom.clients.size === 0) {
          this.rooms.delete(prevCtx.code)
          console.log(`[Room] ${prevCtx.code}: cleaned up (client moved to ${code})`)
        }
      }
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

    // Scenario storage (no room context needed)
    if (msg.type === MSG.SCENARIO_SAVE)  return this.saveScenario(ws, msg)
    if (msg.type === MSG.SCENARIO_LOAD)  return this.loadScenario(ws, msg)
    if (msg.type === MSG.SCENARIO_LIST)  return this.listScenarios(ws)

    // Input config storage (no room context needed)
    if (msg.type === MSG.INPUT_SAVE)  return this.saveInputConfig(ws, msg)
    if (msg.type === MSG.INPUT_LOAD)  return this.loadInputConfig(ws, msg)
    if (msg.type === MSG.INPUT_LIST)  return this.listInputConfigs(ws)

    // Room creation/joining (no room context needed)
    if (msg.type === MSG.ROOM_CREATE) return this.createRoom(ws, msg)
    if (msg.type === MSG.ROOM_JOIN)   return this.joinRoom(ws, msg)

    // Log subscribe (researcher monitor — no room membership needed)
    if (msg.type === MSG.LOG_SUBSCRIBE) return this.handleLogSubscribe(ws, msg)
    if (msg.type === MSG.LOG_REQUEST)  return this.handleLogRequest(ws, msg)

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

    // ── Phase-ready gate (synchronized phase transitions) ────
    if (msg.type === MSG.SYNC_PHASE_READY) {
      const targetPhase = msg.phase
      if (role === 'A') room.phaseReadyA = targetPhase
      else              room.phaseReadyB = targetPhase

      // Notify partner that this side is ready
      this.broadcastToOther(room, ws, { type: MSG.SYNC_PHASE_PARTNER_READY, role, phase: targetPhase })

      // If both ready for the SAME phase → broadcast GO to both, then reset
      if (room.phaseReadyA && room.phaseReadyB && room.phaseReadyA === room.phaseReadyB) {
        for (const [, clientWs] of room.clients) {
          this.send(clientWs, { type: MSG.SYNC_PHASE_GO, phase: targetPhase })
        }
        room.phaseReadyA = null
        room.phaseReadyB = null
        console.log(`[Room] ${ctx.code}: both ready → phase ${targetPhase}!`)
      }
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

    // ── Behavior log sync ─────────────────────────────────
    if (msg.type === MSG.LOG_EVENT) {
      if (msg.entry) {
        const enriched = {
          timestamp: new Date().toISOString(),
          role,
          event: msg.entry.type || 'unknown',
          data: msg.entry,
          phase: msg.entry.phase || null,
          scenarioId: room.code,
        }
        room.logs.push(enriched)

        // Store in studyLogs
        const logs = this.studyLogs.get(ctx.code)
        if (logs) logs.push(enriched)

        // Persist to disk (append JSONL — never lose data)
        this.appendLogToDisk(ctx.code, enriched)

        // Forward to subscribed researcher monitors
        this.forwardLogToSubscribers(ctx.code, enriched)
      }
      return
    }

    if (msg.type === MSG.LOG_EXPORT) {
      this.send(ws, {
        type: MSG.LOG_EXPORT_RESULT,
        logs: room.logs,
        roomCode: room.code,
        exportedAt: new Date().toISOString(),
      })
      return
    }

    // ── Annotation reveal: client sends their edits to be forwarded to partner ──
    if (msg.type === MSG.ANNOTATION_REVEAL) {
      // Store the disputes on the room for later access
      if (role === 'A') room.disputesA = msg.partnerDisputes || {}
      else              room.disputesB = msg.partnerDisputes || {}
      // Forward directly to partner so they receive the edits
      this.broadcastToOther(room, ws, {
        type: MSG.ANNOTATION_REVEAL,
        partnerDisputes: msg.partnerDisputes || {},
        partnerSelfConfirms: msg.partnerSelfConfirms || {},
      })
      console.log(`[Room] ${room.code}: ${role} sent annotation:reveal to partner (${Object.keys(msg.partnerDisputes || {}).length} disputes)`)
      return
    }

    // ── Annotation reveal request (legacy) ─────────────────
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

    // Also remove from log subscribers
    const subs = this.logSubscribers.get(ctx.code)
    if (subs) subs.delete(ws)

    // Notify subscriber monitors about disconnect
    this.forwardLogToSubscribers(ctx.code, {
      timestamp: new Date().toISOString(),
      role: ctx.role,
      event: 'client_disconnected',
      data: { role: ctx.role },
      phase: null,
      scenarioId: ctx.code,
    })

    // When both disconnected → save full dump
    if (room.clients.size === 0) {
      this.saveFullLogDump(ctx.code, room)

      // Cleanup empty rooms after 60s
      setTimeout(() => {
        if (this.rooms.has(ctx.code) && this.rooms.get(ctx.code).clients.size === 0) {
          this.rooms.delete(ctx.code)
          this.studyLogs.delete(ctx.code)
          this.logFiles.delete(ctx.code)
          this.logSubscribers.delete(ctx.code)
          console.log(`[Room] ${ctx.code}: cleaned up`)
        }
      }, 60000)
    }
  }

  // ── Reconnect (rejoin with same code) ────────────────────
  // Handled naturally by joinRoom — if role A disconnected and
  // reconnects, they create a new room. For simplicity, we don't
  // support transparent reconnection in v1.

  // ── Scenario storage (researcher pre-load) ─────────────
  saveScenario(ws, msg) {
    const { scenario, metadata } = msg
    if (!scenario) {
      this.send(ws, { type: MSG.ROOM_ERROR, message: '缺少场景数据' })
      return
    }

    let id
    do { id = generateCode() } while (this.scenarios.has(id))

    this.scenarios.set(id, {
      scenario,
      metadata: metadata || {},
      createdAt: Date.now(),
    })

    this.send(ws, { type: MSG.SCENARIO_SAVED, scenarioId: id })
    console.log(`[Scenario] Saved ${id} (${this.scenarios.size} total)`)
  }

  loadScenario(ws, msg) {
    const id = (msg.scenarioId || '').toUpperCase().trim()
    const entry = this.scenarios.get(id)
    if (!entry) {
      this.send(ws, { type: MSG.ROOM_ERROR, message: '场景不存在' })
      return
    }
    this.send(ws, {
      type: MSG.SCENARIO_LOADED,
      scenarioId: id,
      scenario: entry.scenario,
      metadata: entry.metadata,
    })
    console.log(`[Scenario] Loaded ${id}`)
  }

  listScenarios(ws) {
    const list = []
    for (const [id, entry] of this.scenarios) {
      list.push({
        scenarioId: id,
        title: entry.scenario?.title || '(无标题)',
        createdAt: entry.createdAt,
        metadata: entry.metadata,
      })
    }
    this.send(ws, { type: MSG.SCENARIO_LIST_RESULT, scenarios: list })
  }

  // ── Input config storage (researcher pre-load) ────────
  saveInputConfig(ws, msg) {
    const { label, config } = msg
    if (!config) {
      this.send(ws, { type: MSG.ROOM_ERROR, message: '缺少输入配置数据' })
      return
    }

    let id
    do { id = generateCode() } while (this.inputConfigs.has(id))

    this.inputConfigs.set(id, {
      label: label || '(未命名)',
      config,
      createdAt: Date.now(),
    })

    this.send(ws, { type: MSG.INPUT_SAVED, configId: id })
    console.log(`[InputConfig] Saved ${id} "${label}" (${this.inputConfigs.size} total)`)
  }

  loadInputConfig(ws, msg) {
    const id = (msg.configId || '').toUpperCase().trim()
    const entry = this.inputConfigs.get(id)
    if (!entry) {
      this.send(ws, { type: MSG.ROOM_ERROR, message: '输入配置不存在' })
      return
    }
    this.send(ws, {
      type: MSG.INPUT_LOADED,
      configId: id,
      label: entry.label,
      config: entry.config,
    })
    console.log(`[InputConfig] Loaded ${id}`)
  }

  listInputConfigs(ws) {
    const list = []
    for (const [id, entry] of this.inputConfigs) {
      list.push({
        configId: id,
        label: entry.label,
        createdAt: entry.createdAt,
      })
    }
    this.send(ws, { type: MSG.INPUT_LIST_RESULT, configs: list })
  }

  // ── Log subscribe (researcher monitor) ──────────────────
  handleLogSubscribe(ws, msg) {
    const code = (msg.roomCode || '').toUpperCase().trim()
    if (!code) {
      this.send(ws, { type: MSG.ROOM_ERROR, message: '缺少房间码' })
      return
    }

    if (!this.logSubscribers.has(code)) {
      this.logSubscribers.set(code, new Set())
    }
    this.logSubscribers.get(code).add(ws)

    // Send existing logs as initial backfill
    const existing = this.studyLogs.get(code) || []
    this.send(ws, {
      type: MSG.LOG_SUBSCRIBED,
      roomCode: code,
      backfill: existing,
    })

    // Send current room status
    const room = this.rooms.get(code)
    if (room) {
      this.send(ws, {
        type: MSG.LOG_FEED,
        entry: {
          timestamp: new Date().toISOString(),
          role: 'SYSTEM',
          event: 'monitor_connected',
          data: {
            connectedClients: [...room.clients.keys()],
            logCount: room.logs.length,
          },
          phase: null,
          scenarioId: code,
        },
      })
    }

    console.log(`[Monitor] Researcher subscribed to room ${code}`)
  }

  handleLogRequest(ws, msg) {
    const code = (msg.roomCode || '').toUpperCase().trim()
    const logs = this.studyLogs.get(code) || []
    this.send(ws, {
      type: MSG.LOG_RESPONSE,
      roomCode: code,
      logs,
    })
  }

  // ── Log persistence to disk ────────────────────────────
  appendLogToDisk(roomCode, entry) {
    try {
      const filename = this.logFiles.get(roomCode)
      if (!filename) return
      const filepath = join(LOGS_DIR, filename)
      appendFileSync(filepath, JSON.stringify(entry) + '\n', 'utf-8')
    } catch (err) {
      console.error(`[Logs] Failed to append log for room ${roomCode}:`, err.message)
    }
  }

  forwardLogToSubscribers(roomCode, entry) {
    const subs = this.logSubscribers.get(roomCode)
    if (!subs || subs.size === 0) return
    for (const subWs of subs) {
      if (subWs.readyState === 1) {
        this.send(subWs, { type: MSG.LOG_FEED, entry })
      } else {
        subs.delete(subWs)
      }
    }
  }

  saveFullLogDump(roomCode, room) {
    try {
      const dumpFilename = `${roomCode}_FULL_${new Date().toISOString().replace(/[:.]/g, '-')}.json`
      const filepath = join(LOGS_DIR, dumpFilename)
      const dump = {
        roomCode,
        mode: room.mode,
        proximity: room.proximity,
        createdAt: new Date(room.createdAt).toISOString(),
        exportedAt: new Date().toISOString(),
        eventCount: room.logs.length,
        logs: room.logs,
      }
      writeFileSync(filepath, JSON.stringify(dump, null, 2), 'utf-8')
      console.log(`[Logs] Full dump saved: ${dumpFilename} (${room.logs.length} events)`)
    } catch (err) {
      console.error(`[Logs] Failed to save full dump for room ${roomCode}:`, err.message)
    }
  }

  // ── Static: list log files on disk ─────────────────────
  static listLogFiles() {
    try {
      if (!existsSync(LOGS_DIR)) return []
      return readdirSync(LOGS_DIR)
        .filter(f => f.endsWith('.jsonl') || f.endsWith('.json'))
        .map(f => {
          const fpath = join(LOGS_DIR, f)
          const stat = statSync(fpath)
          return { filename: f, size: stat.size, modified: stat.mtime.toISOString() }
        })
        .sort((a, b) => b.modified.localeCompare(a.modified))
    } catch {
      return []
    }
  }

  static getLogFilePath(filename) {
    // Sanitize to prevent path traversal
    const safe = filename.replace(/[^a-zA-Z0-9_\-\.]/g, '')
    const fpath = join(LOGS_DIR, safe)
    if (existsSync(fpath)) return fpath
    return null
  }

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
