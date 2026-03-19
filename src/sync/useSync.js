// ─────────────────────────────────────────────────────────────
//  useSync — WebSocket sync hook for Aside Together mode
//
//  In solo mode: returns no-op stubs, no connection.
//  In together mode: manages WS lifecycle, room pairing,
//  message dispatch, and reconnection.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react'

const WS_URL = import.meta.env.VITE_WS_URL
  || `ws://${window.location.hostname}:3001`

// ── Solo mode stub ─────────────────────────────────────────
const SOLO_STUB = {
  mode: 'solo',
  connected: false,
  partnerConnected: false,
  role: null,
  roomCode: null,
  proximity: null,
  send: () => {},
  createRoom: () => {},
  joinRoom: () => {},
  onMessage: () => () => {},
  requestPartnerAnnotations: () => {},
}

export default function useSync(mode = 'solo') {
  const [connected, setConnected]               = useState(false)
  const [partnerConnected, setPartnerConnected] = useState(false)
  const [role, setRole]                         = useState(null)
  const [roomCode, setRoomCode]                 = useState(null)
  const [proximity, setProximity]               = useState(null)

  const wsRef       = useRef(null)
  const handlersRef = useRef(new Map())  // type → Set<callback>
  const retryRef    = useRef(0)

  // ── Connect WebSocket ────────────────────────────────────
  const connect = useCallback(() => {
    if (mode === 'solo') return

    try {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        setConnected(true)
        retryRef.current = 0
        console.log('[Sync] Connected to', WS_URL)
      }

      ws.onclose = () => {
        setConnected(false)
        wsRef.current = null
        console.log('[Sync] Disconnected')
        // One retry after 2s
        if (retryRef.current < 1) {
          retryRef.current++
          setTimeout(connect, 2000)
        }
      }

      ws.onerror = (err) => {
        console.error('[Sync] WebSocket error:', err)
      }

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          dispatch(msg)
        } catch (e) {
          console.error('[Sync] Parse error:', e)
        }
      }
    } catch (err) {
      console.error('[Sync] Connection failed:', err)
    }
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Dispatch incoming message to registered handlers ─────
  const dispatch = useCallback((msg) => {
    const { type } = msg

    // Built-in handlers
    switch (type) {
      case 'room:created':
        setRole(msg.role)
        setRoomCode(msg.code)
        break
      case 'room:joined':
        setRole(msg.role)
        setRoomCode(msg.code)
        setPartnerConnected(true)
        break
      case 'room:partner_connected':
        setPartnerConnected(true)
        break
      case 'room:partner_disconnected':
        setPartnerConnected(false)
        break
      case 'room:error':
        console.warn('[Sync] Room error:', msg.message)
        break
    }

    // Dispatch to registered handlers
    const callbacks = handlersRef.current.get(type)
    if (callbacks) {
      callbacks.forEach(cb => cb(msg))
    }
  }, [])

  // ── Send message ─────────────────────────────────────────
  const send = useCallback((type, payload = {}) => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    ws.send(JSON.stringify({ type, ...payload }))
  }, [])

  // ── Room actions ─────────────────────────────────────────
  const createRoom = useCallback((prox = 'colocated') => {
    setProximity(prox)
    send('room:create', { mode: 'together', proximity: prox })
  }, [send])

  const joinRoom = useCallback((code) => {
    // Reset any existing room state before joining (e.g. if auto-created a room)
    setRoomCode(null)
    setRole(null)
    setPartnerConnected(false)
    send('room:join', { code: code.toUpperCase().trim() })
  }, [send])

  // ── Register message handler ─────────────────────────────
  // Returns unsubscribe function
  const onMessage = useCallback((type, callback) => {
    if (!handlersRef.current.has(type)) {
      handlersRef.current.set(type, new Set())
    }
    handlersRef.current.get(type).add(callback)
    return () => {
      handlersRef.current.get(type)?.delete(callback)
    }
  }, [])

  // ── Request partner annotations (at end phase) ──────────
  const requestPartnerAnnotations = useCallback(() => {
    send('annotation:request_reveal')
  }, [send])

  // ── Lifecycle ────────────────────────────────────────────
  useEffect(() => {
    if (mode === 'together') connect()
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [mode, connect])

  // Solo mode → return stubs
  if (mode === 'solo') return SOLO_STUB

  return {
    mode,
    connected,
    partnerConnected,
    role,
    roomCode,
    proximity,
    send,
    createRoom,
    joinRoom,
    onMessage,
    requestPartnerAnnotations,
  }
}
