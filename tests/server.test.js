import test from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { once } from 'node:events'
import { WebSocket } from 'ws'

test('real server pairs clients, reveals only at the gate, and disables HTTP log access', { timeout: 15000 }, async () => {
  const probe = createServer()
  probe.listen(0, '127.0.0.1')
  await once(probe, 'listening')
  const port = probe.address().port
  await new Promise(resolve => probe.close(resolve))
  const child = spawn(process.execPath, ['server/index.js', String(port)], {
    cwd: new URL('..', import.meta.url),
    env: { ...process.env, ASIDE_ENABLE_LOGGING: 'false' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const sockets = []
  try {
    let ready = false
    for (let attempt = 0; attempt < 100; attempt++) {
      try { ready = (await fetch(`http://127.0.0.1:${port}/`)).ok } catch {}
      if (ready) break
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    assert.ok(ready, 'server did not become ready')
    assert.equal((await fetch(`http://127.0.0.1:${port}/logs`)).status, 404)
    assert.equal((await fetch(`http://127.0.0.1:${port}/logs`, { method: 'POST', body: '{}' })).status, 404)
    async function connect() {
      const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`)
      sockets.push(ws)
      ws.messages = []
      ws.on('message', raw => ws.messages.push(JSON.parse(raw.toString())))
      await once(ws, 'open')
      return ws
    }
    async function receive(ws, type) {
      for (let i = 0; i < 100; i++) {
        const result = ws.messages.find(message => message.type === type)
        if (result) return result
        await new Promise(resolve => setTimeout(resolve, 20))
      }
      assert.fail(`timed out waiting for ${type}`)
    }
    const a = await connect(), b = await connect()
    a.send(JSON.stringify({ type: 'room:create' }))
    const { code } = await receive(a, 'room:created')
    b.send(JSON.stringify({ type: 'room:join', code }))
    await receive(b, 'room:joined')
    a.send(JSON.stringify({ type: 'annotation:reveal', partnerDisputes: { 'B-1': { text: 'held until ready' } } }))
    a.send(JSON.stringify({ type: 'sync:phase_ready', phase: 'together_viewing' }))
    await receive(b, 'sync:phase_partner_ready')
    assert.equal(JSON.stringify(b.messages).includes('held until ready'), false)
    b.send(JSON.stringify({ type: 'annotation:reveal', partnerDisputes: {} }))
    b.send(JSON.stringify({ type: 'sync:phase_ready', phase: 'together_viewing' }))
    const revealed = await receive(b, 'sync:phase_go')
    assert.equal(revealed.partnerDisputes['B-1'].text, 'held until ready')
    await receive(a, 'sync:phase_go')
  } finally {
    for (const ws of sockets) ws.terminate()
    child.kill()
    await once(child, 'exit')
  }
})
