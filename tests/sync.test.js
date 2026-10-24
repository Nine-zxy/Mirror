import test from 'node:test'
import assert from 'node:assert/strict'
import { RoomManager } from '../server/roomManager.js'
import { MSG, validateMessage } from '../server/protocol.js'
import { createDemoScenario } from '../src/data/demoScenario.js'

function session() {
  const client = () => ({ readyState: 1, messages: [], send(raw) { this.messages.push(JSON.parse(raw)) } })
  const a = client(), b = client(), manager = new RoomManager()
  const room = manager.createRoom(a)
  manager.joinRoom(b, { code: room.code })
  a.messages = []; b.messages = []
  const send = (ws, type, payload = {}) => manager.handleMessage(ws, JSON.stringify({ type, ...payload }))
  return { a, b, manager, room, send }
}

test('private edits and early reveal requests cannot expose partner annotations', () => {
  const { a, b, send } = session()
  send(a, MSG.ANNOTATION_UPDATE, { key: 'B-1', dispute: { text: 'private edit' } })
  send(a, MSG.ANNOTATION_REVEAL, { partnerDisputes: { 'B-1': { text: 'private edit' } }, partnerSelfConfirms: { 'A-1': { text: 'private self-confirm' } } })
  send(b, MSG.ANNOTATION_REQUEST_REVEAL)
  send(a, MSG.SYNC_PHASE_READY, { phase: 'together_viewing' })
  assert.equal(b.messages.some(m => m.type === MSG.ANNOTATION_REVEAL || m.type === MSG.SYNC_PHASE_GO), false)
  assert.equal(JSON.stringify(b.messages).includes('private edit'), false)
  assert.equal(JSON.stringify(b.messages).includes('private self-confirm'), false)
})

test('matching readiness releases the opposite partner snapshot to both clients', () => {
  const { a, b, send } = session()
  send(a, MSG.ANNOTATION_REVEAL, { partnerDisputes: { 'B-1': { text: 'A interprets B' } }, partnerSelfConfirms: { 'A-1': { text: 'A self' } } })
  send(b, MSG.ANNOTATION_REVEAL, { partnerDisputes: { 'A-1': { text: 'B interprets A' } }, partnerSelfConfirms: { 'B-1': { text: 'B self' } } })
  send(a, MSG.SYNC_PHASE_READY, { phase: 'together_viewing' })
  send(b, MSG.SYNC_PHASE_READY, { phase: 'solo_viewing' })
  assert.equal(a.messages.some(m => m.type === MSG.SYNC_PHASE_GO), false)
  send(b, MSG.SYNC_PHASE_READY, { phase: 'together_viewing' })
  const revealA = a.messages.find(m => m.type === MSG.SYNC_PHASE_GO)
  const revealB = b.messages.find(m => m.type === MSG.SYNC_PHASE_GO)
  assert.equal(revealA.partnerDisputes['A-1'].text, 'B interprets A')
  assert.equal(revealA.partnerSelfConfirms['B-1'].text, 'B self')
  assert.equal(revealB.partnerDisputes['B-1'].text, 'A interprets B')
  assert.equal(revealB.partnerSelfConfirms['A-1'].text, 'A self')
})

test('playback waits for both clients and a third client cannot join a full room', () => {
  const { a, b, manager, room, send } = session()
  send(a, MSG.SYNC_PLAY_READY, { beatIndex: 2 })
  assert.equal(a.messages.some(m => m.type === MSG.SYNC_PLAY_GO), false)
  send(b, MSG.SYNC_PLAY_READY, { beatIndex: 2 })
  assert.equal(a.messages.find(m => m.type === MSG.SYNC_PLAY_GO).beatIndex, 2)
  const outsider = { readyState: 1, messages: [], send(raw) { this.messages.push(JSON.parse(raw)) } }
  manager.joinRoom(outsider, { code: room.code })
  assert.equal(outsider.messages[0].type, MSG.ROOM_ERROR)
  assert.equal(room.clients.size, 2)
})

test('starting another editing round closes the reveal gate again', () => {
  const { a, b, send } = session()
  send(a, MSG.SYNC_PHASE_READY, { phase: 'together_viewing' })
  send(b, MSG.SYNC_PHASE_READY, { phase: 'together_viewing' })
  send(a, MSG.SYNC_PHASE, { phase: 'solo_viewing' })
  b.messages = []
  send(a, MSG.ANNOTATION_REVEAL, { partnerDisputes: { 'B-1': { text: 'new private edit' } } })
  send(b, MSG.ANNOTATION_REQUEST_REVEAL)
  assert.equal(JSON.stringify(b.messages).includes('new private edit'), false)
})

test('logging and researcher log side channels are disabled by default', () => {
  const { a, b, room, send } = session()
  send(a, MSG.LOG_EVENT, { entry: { type: 'self_confirm', text: 'private' } })
  send(b, MSG.LOG_REQUEST, { roomCode: room.code })
  send(b, MSG.LOG_SUBSCRIBE, { roomCode: room.code })
  assert.deepEqual(room.logs, [])
  assert.deepEqual(b.messages, [])
  assert.deepEqual(RoomManager.listLogFiles(), [])
  assert.equal(RoomManager.getLogFilePath('../package.json'), null)
})

test('invalid protocol payloads are ignored', () => {
  for (const raw of ['{', 'null', '1', '{}', '{"type":3}']) assert.equal(validateMessage(raw), null)
})

test('both authored examples preserve beat structure and both editing targets', () => {
  const zh = createDemoScenario('zh'), en = createDemoScenario('en')
  assert.equal(zh.beats.length, 9)
  assert.equal(en.beats.length, zh.beats.length)
  for (const [index, beat] of zh.beats.entries()) {
    assert.equal(beat.id, en.beats[index].id)
    if (!index) continue
    assert.equal(beat.dialogue.speaker, en.beats[index].dialogue.speaker)
    for (const role of ['A', 'B']) assert.ok(beat.thoughts[role].text && en.beats[index].thoughts[role].text)
  }
  zh.beats[1].spatial.A.x = 999
  assert.notEqual(zh.beats[2].spatial.A.x, 999)
})
