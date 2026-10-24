// ─────────────────────────────────────────────────────────────
//  Aside Sync Server — Lightweight WebSocket relay + HTTP log API
//
//  Usage: node server/index.js [port]
//  Default port: 3001
//
//  HTTP endpoints:
//    GET /logs          — list all log files
//    GET /logs/:file    — download a specific log file
// ─────────────────────────────────────────────────────────────

import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import { createReadStream, existsSync, mkdirSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { RoomManager } from './roomManager.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LOG_DIR = join(__dirname, '..', 'study-logs')

const PORT = parseInt(process.argv[2] || process.env.PORT || process.env.ASIDE_WS_PORT || '3001', 10)
const manager = new RoomManager()

// ── HTTP server (shared with WebSocket) ─────────────────────
const httpServer = createServer((req, res) => {
  // CORS headers for browser access
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  const url = new URL(req.url, `http://${req.headers.host}`)
  const pathname = url.pathname
  if (pathname.startsWith('/logs') && process.env.ASIDE_ENABLE_LOGGING !== 'true') {
    res.writeHead(404)
    res.end()
    return
  }

  // GET /logs — list all log files
  if (req.method === 'GET' && pathname === '/logs') {
    const files = RoomManager.listLogFiles()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ files }))
    return
  }

  // GET /logs/:filename — download a specific log file
  if (req.method === 'GET' && pathname.startsWith('/logs/')) {
    const filename = decodeURIComponent(pathname.slice(6))
    const filepath = RoomManager.getLogFilePath(filename)
    if (!filepath) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'File not found' }))
      return
    }

    const isJson = filename.endsWith('.json')
    res.writeHead(200, {
      'Content-Type': isJson ? 'application/json' : 'application/x-ndjson',
      'Content-Disposition': `attachment; filename="${filename}"`,
    })
    createReadStream(filepath).pipe(res)
    return
  }

  // POST /logs — receive log upload from participant browser
  if (req.method === 'POST' && pathname === '/logs') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try {
        const { filename, data } = JSON.parse(body)
        const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
        if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true })
        writeFileSync(join(LOG_DIR, safeName), JSON.stringify(data, null, 2))
        console.log(`[Log] Saved: ${safeName}`)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true, file: safeName }))
      } catch(e) {
        console.error('[Log] Save error:', e.message)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: e.message }))
      }
    })
    return
  }

  // GET / — simple health check
  if (req.method === 'GET' && pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      service: 'ASIDE Sync Server',
      status: 'running',
      stats: manager.stats,
      logFiles: RoomManager.listLogFiles().length,
    }))
    return
  }

  // 404 for everything else
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not found' }))
})

// ── WebSocket server (mounted on HTTP server) ───────────────
const wss = new WebSocketServer({ server: httpServer })

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

// ── Start HTTP server ────────────────────────────────────────
httpServer.listen(PORT, '127.0.0.1', () => {
  console.log(`[ASIDE] Sync server: http://127.0.0.1:${httpServer.address().port}`)
  console.log('[ASIDE] Open the Vite address; WebSockets use its /ws proxy.')
  console.log(`[ASIDE] Study logging: ${process.env.ASIDE_ENABLE_LOGGING === 'true' ? 'enabled' : 'disabled'}`)

})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Server] Shutting down...')
  wss.close()
  httpServer.close()
  process.exit(0)
})
