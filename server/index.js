// ─────────────────────────────────────────────────────────────
//  Aside Sync Server — Lightweight WebSocket relay
//
//  Usage: node server/index.js [port]
//  Default port: 3001
// ─────────────────────────────────────────────────────────────

import { WebSocketServer } from 'ws'
import { networkInterfaces } from 'os'
import { RoomManager } from './roomManager.js'

const PORT = parseInt(process.argv[2] || process.env.PORT || process.env.ASIDE_WS_PORT || '3001', 10)
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

// Get LAN IP for display
const lanIP = (() => {
  const nets = networkInterfaces()
  for (const iface of Object.values(nets)) {
    for (const info of iface) {
      if (info.family === 'IPv4' && !info.internal) return info.address
    }
  }
  return 'localhost'
})()

console.log(`
  ╔═══════════════════════════════════════╗
  ║  ASIDE Sync Server                    ║
  ║  Local:   ws://localhost:${PORT}            ║
  ║  Network: ws://${lanIP}:${PORT}       ║
  ║  Ready for connections                ║
  ╚═══════════════════════════════════════╝

  两台设备使用方法:
  1. 主机运行: npm run dev:together
  2. 两台设备都打开: http://${lanIP}:5173
  3. 设备A创建房间 → 设备B输入房间码加入
`)


// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Server] Shutting down...')
  wss.close()
  process.exit(0)
})
