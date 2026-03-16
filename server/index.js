// ─────────────────────────────────────────────────────────────
//  Aside Sync Server — Lightweight WebSocket relay
//
//  Usage: node server/index.js [port]
//  Default port: 3001
// ─────────────────────────────────────────────────────────────

import { WebSocketServer } from 'ws'
import { RoomManager } from './roomManager.js'

const PORT = parseInt(process.argv[2] || process.env.ASIDE_WS_PORT || '3001', 10)
const manager = new RoomManager()

const wss = new WebSocketServer({ port: PORT })

wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress
  console.log(`[WS] Client connected from ${ip}`)

  ws.isAlive = true
  ws.on('pong', () => { ws.isAlive = true })

  ws.on('message', (data) => {
    try {
      manager.handleMessage(ws, data.toString())
    } catch (err) {
      console.error('[WS] Error handling message:', err.message)
    }
  })

  ws.on('close', () => {
    manager.handleDisconnect(ws)
    console.log(`[WS] Client disconnected`)
  })

  ws.on('error', (err) => {
    console.error('[WS] Socket error:', err.message)
  })
})

// Heartbeat — prune dead connections every 30s
const heartbeat = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate()
    ws.isAlive = false
    ws.ping()
  })
}, 30000)

wss.on('close', () => clearInterval(heartbeat))

console.log(`
  ╔═══════════════════════════════════════╗
  ║  ASIDE Sync Server                    ║
  ║  Port: ${String(PORT).padEnd(33)}║
  ║  Ready for connections                ║
  ╚═══════════════════════════════════════╝
`)

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Server] Shutting down...')
  wss.close()
  process.exit(0)
})
