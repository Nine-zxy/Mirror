// ─────────────────────────────────────────────────────────────
//  useSync — WebSocket sync hook for Aside Together mode
//
//  In solo mode: returns no-op stubs, no connection.
//  In together mode: manages WS lifecycle, room pairing,
//  message dispatch, and reconnection.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react'

const WS_URL = import.meta.env.VITE_WS_URL
  || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`

// ── Solo mode stub ─────────────────────────────────────────
const SOLO_STUB = {
  mode: 'solo',
  connected: false,
  connectionState: 'disconnected',
  partnerConnected: false,
  role: null,
  roomCode: null,
  proximity: null,
  send: () => {},
  createRoom: () => {},
  joinRoom: () => {},
  onMessage: () => () => {},
  requestPartnerAnnotations: () => {},
  subscribeToLogs: () => Promise.reject(new Error('Solo mode')),
  requestLogs: () => Promise.reject(new Error('Solo mode')),
  saveScenario: () => Promise.reject(new Error('Solo mode')),
  loadScenario: () => Promise.reject(new Error('Solo mode')),
  listScenarios: () => Promise.resolve([]),
  saveInputConfig: () => Promise.reject(new Error('Solo mode')),
  loadInputConfig: () => Promise.reject(new Error('Solo mode')),
  listInputConfigs: () => Promise.resolve([]),
}

export default function useSync(mode = 'solo') {
  const [connected, setConnected]               = useState(false)
  const [partnerConnected, setPartnerConnected] = useState(false)
  const [role, setRole]                         = useState(null)
  const [roomCode, setRoomCode]                 = useState(null)
  const [proximity, setProximity]               = useState(null)
  // connectionState: 'connecting' | 'connected' | 'reconnecting' | 'disconnected'
  const [connectionState, setConnectionState]   = useState('disconnected')

  const wsRef       = useRef(null)
  const handlersRef = useRef(new Map())  // type → Set<callback>
  const retryRef    = useRef(0)
  const reconnectTimer = useRef(null)
  const lastRoomCode   = useRef(null)   // track room for auto-rejoin on reconnect
  const lastProximity  = useRef(null)

  // ── Connect WebSocket ────────────────────────────────────
  const connect = useCallback(() => {
    if (mode === 'solo') return

    // Clear any pending reconnect timer
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current)
      reconnectTimer.current = null
    }

    setConnectionState(retryRef.current > 0 ? 'reconnecting' : 'connecting')

    try {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        const wasReconnect = retryRef.current > 0
        setConnected(true)
        setConnectionState('connected')
        retryRef.current = 0
        console.log('[Sync] Connected to', WS_URL)

        // Auto-rejoin room after reconnect
        if (wasReconnect && lastRoomCode.current) {
          console.log(`[Sync] Reconnected — re-joining room ${lastRoomCode.current}`)
          ws.send(JSON.stringify({
            type: 'room:join',
            code: lastRoomCode.current,
          }))
        }
      }

      ws.onclose = () => {
        setConnected(false)
        wsRef.current = null

        // Exponential backoff reconnect
        const delay = Math.min(1000 * Math.pow(2, retryRef.current), 10000)
        retryRef.current++

        if (retryRef.current <= 20) {
          setConnectionState('reconnecting')
          console.log(`[Sync] Reconnecting in ${delay}ms (attempt ${retryRef.current}/20)...`)
          reconnectTimer.current = setTimeout(() => {
            connect() // re-run the connection logic
          }, delay)
        } else {
          setConnectionState('disconnected')
          console.log('[Sync] Max reconnect attempts reached')
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
      setConnectionState('disconnected')
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
        lastRoomCode.current = msg.code
        break
      case 'room:joined':
        setRole(msg.role)
        setRoomCode(msg.code)
        lastRoomCode.current = msg.code
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
  const createRoom = useCallback((prox = 'colocated', roomCodeOverride = null) => {
    setProximity(prox)
    const payload = { mode: 'together', proximity: prox }
    if (roomCodeOverride) payload.code = roomCodeOverride
    send('room:create', payload)
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

  // ── Scenario storage (researcher pre-load) ──────────────
  const saveScenario = useCallback((scenario, metadata = {}) => {
    return new Promise((resolve, reject) => {
      const unsub = onMessage('scenario:saved', (msg) => {
        unsub()
        resolve(msg.scenarioId)
      })
      // Also listen for errors
      const unsubErr = onMessage('room:error', (msg) => {
        unsubErr()
        reject(new Error(msg.message))
      })
      send('scenario:save', { scenario, metadata })
      // Timeout after 5s
      setTimeout(() => { unsub(); unsubErr(); reject(new Error('保存超时')) }, 5000)
    })
  }, [send, onMessage])

  const loadScenario = useCallback((scenarioId) => {
    return new Promise((resolve, reject) => {
      const unsub = onMessage('scenario:loaded', (msg) => {
        unsub()
        resolve({ scenario: msg.scenario, metadata: msg.metadata })
      })
      const unsubErr = onMessage('room:error', (msg) => {
        unsubErr()
        reject(new Error(msg.message))
      })
      send('scenario:load', { scenarioId })
      setTimeout(() => { unsub(); unsubErr(); reject(new Error('加载超时')) }, 5000)
    })
  }, [send, onMessage])

  const listScenarios = useCallback(() => {
    return new Promise((resolve, reject) => {
      const unsub = onMessage('scenario:list_result', (msg) => {
        unsub()
        resolve(msg.scenarios)
      })
      send('scenario:list', {})
      setTimeout(() => { unsub(); reject(new Error('列表超时')) }, 5000)
    })
  }, [send, onMessage])

  // ── Input config storage (researcher pre-load) ─────────
  const saveInputConfig = useCallback((label, config) => {
    return new Promise((resolve, reject) => {
      const unsub = onMessage('input:saved', (msg) => {
        unsub()
        resolve(msg.configId)
      })
      const unsubErr = onMessage('room:error', (msg) => {
        unsubErr()
        reject(new Error(msg.message))
      })
      send('input:save', { label, config })
      setTimeout(() => { unsub(); unsubErr(); reject(new Error('保存超时')) }, 5000)
    })
  }, [send, onMessage])

  const loadInputConfig = useCallback((configId) => {
    return new Promise((resolve, reject) => {
      const unsub = onMessage('input:loaded', (msg) => {
        unsub()
        resolve({ configId: msg.configId, label: msg.label, config: msg.config })
      })
      const unsubErr = onMessage('room:error', (msg) => {
        unsubErr()
        reject(new Error(msg.message))
      })
      send('input:load', { configId })
      setTimeout(() => { unsub(); unsubErr(); reject(new Error('加载超时')) }, 5000)
    })
  }, [send, onMessage])

  const listInputConfigs = useCallback(() => {
    return new Promise((resolve, reject) => {
      const unsub = onMessage('input:list_result', (msg) => {
        unsub()
        resolve(msg.configs)
      })
      send('input:list', {})
      setTimeout(() => { unsub(); reject(new Error('列表超时')) }, 5000)
    })
  }, [send, onMessage])

  // ── Request partner annotations (at end phase) ──────────
  const requestPartnerAnnotations = useCallback(() => {
    send('annotation:request_reveal')
  }, [send])

  // ── Log subscription (researcher monitor) ─────────────
  const subscribeToLogs = useCallback((roomCode) => {
    return new Promise((resolve, reject) => {
      const unsub = onMessage('log:subscribed', (msg) => {
        unsub()
        resolve(msg)
      })
      const unsubErr = onMessage('room:error', (msg) => {
        unsubErr()
        reject(new Error(msg.message))
      })
      send('log:subscribe', { roomCode })
      setTimeout(() => { unsub(); unsubErr(); reject(new Error('订阅超时')) }, 5000)
    })
  }, [send, onMessage])

  const requestLogs = useCallback((roomCode) => {
    return new Promise((resolve, reject) => {
      const unsub = onMessage('log:response', (msg) => {
        unsub()
        resolve(msg)
      })
      send('log:request', { roomCode })
      setTimeout(() => { unsub(); reject(new Error('请求超时')) }, 5000)
    })
  }, [send, onMessage])

  // ── Lifecycle ────────────────────────────────────────────
  useEffect(() => {
    if (mode === 'together') connect()
    return () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current)
        reconnectTimer.current = null
      }
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
    connectionState,
    partnerConnected,
    role,
    roomCode,
    proximity,
    send,
    createRoom,
    joinRoom,
    onMessage,
    requestPartnerAnnotations,
    subscribeToLogs,
    requestLogs,
    saveScenario,
    loadScenario,
    listScenarios,
    saveInputConfig,
    loadInputConfig,
    listInputConfigs,
  }
}
