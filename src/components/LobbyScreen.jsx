import { useState, useEffect } from 'react'
import { useSyncContext } from '../sync/SyncContext'

// ─────────────────────────────────────────────────────────────
//  LobbyScreen — Room creation / joining for Together mode
//
//  Two flows:
//    1. Create room → show code → wait for partner → start
//    2. Join room → enter code → connect → wait for host → start
// ─────────────────────────────────────────────────────────────

export default function LobbyScreen({ proximity, onBothReady, onBack }) {
  const sync = useSyncContext()
  const [tab, setTab] = useState('create')  // 'create' | 'join'
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState(null)
  const [joinedRoom, setJoinedRoom] = useState(false) // track if user actively joined

  // Create room only when on the create tab (not when on join tab)
  useEffect(() => {
    if (tab === 'create' && sync.connected && !sync.roomCode) {
      sync.createRoom(proximity)
    }
  }, [tab, sync.connected, sync.roomCode, proximity]) // eslint-disable-line

  // Listen for room errors
  useEffect(() => {
    if (sync.mode !== 'together') return
    return sync.onMessage('room:error', (msg) => {
      setError(msg.message)
    })
  }, [sync])

  // Track successful join
  useEffect(() => {
    if (sync.mode !== 'together') return
    return sync.onMessage('room:joined', () => {
      setJoinedRoom(true)
    })
  }, [sync])

  // Auto-proceed when partner connects (for now, just enable the button)
  const canStart = sync.partnerConnected

  const handleJoin = () => {
    if (joinCode.length < 4) return
    setError(null)
    sync.joinRoom(joinCode)
  }

  const handleStart = () => {
    onBothReady()
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black overflow-hidden">
      <div className="absolute inset-0 opacity-10"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 60%, #90e8a8 0%, transparent 70%)' }}
      />

      <div className="relative flex flex-col items-center gap-6 px-8 max-w-md text-center anim-fadeIn">

        {/* Header */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-pixel text-[14px] tracking-[0.3em]" style={{ color: '#7ab0e8' }}>
            ASIDE
          </span>
          <div className="w-12 h-px" style={{ background: 'linear-gradient(90deg, transparent, #90e8a8, transparent)' }} />
          <p className="font-mono text-[9px] tracking-[0.2em] text-white/30">
            {proximity === 'colocated' ? '同处一室模式' : '远程连线模式'}
          </p>
        </div>

        {/* Connection status */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full transition-colors"
            style={{
              background: sync.connected ? '#60c880' : '#666',
              boxShadow: sync.connected ? '0 0 6px #60c880' : 'none',
            }}
          />
          <span className="font-mono text-[9px] text-white/40">
            {sync.connected ? '已连接服务器' : '正在连接…'}
          </span>
        </div>

        {/* Tab toggle */}
        <div className="flex gap-0 rounded-lg overflow-hidden border border-white/10">
          {[['create', '创建房间'], ['join', '加入房间']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setTab(key); setError(null) }}
              className="font-mono text-[10px] px-5 py-2 transition-all"
              style={{
                color: tab === key ? '#90e8a8' : 'rgba(255,255,255,0.3)',
                background: tab === key ? 'rgba(144,232,168,0.1)' : 'transparent',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === 'create' ? (
          <div className="flex flex-col items-center gap-4">
            {/* Room code display */}
            {sync.roomCode ? (
              <>
                <p className="font-mono text-[8px] text-white/30 tracking-widest">房间号码</p>
                <div className="flex gap-1.5">
                  {sync.roomCode.split('').map((ch, i) => (
                    <span key={i}
                      className="font-mono text-[28px] tracking-wider px-2.5 py-1.5 rounded-lg"
                      style={{
                        color: '#90e8a8',
                        background: 'rgba(144,232,168,0.08)',
                        border: '1px solid rgba(144,232,168,0.2)',
                        textShadow: '0 0 12px rgba(144,232,168,0.4)',
                      }}
                    >
                      {ch}
                    </span>
                  ))}
                </div>
                <p className="font-mono text-[8px] text-white/25">
                  请让对方输入此号码加入房间
                </p>

                {/* Partner status */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full transition-all"
                    style={{
                      background: sync.partnerConnected ? '#60c880' : '#555',
                      boxShadow: sync.partnerConnected ? '0 0 8px #60c880' : 'none',
                      animation: sync.partnerConnected ? 'none' : 'pulseSoft 2s ease-in-out infinite',
                    }}
                  />
                  <span className="font-mono text-[10px]"
                    style={{ color: sync.partnerConnected ? '#60c880' : 'rgba(255,255,255,0.3)' }}>
                    {sync.partnerConnected ? '对方已加入' : '等待对方加入…'}
                  </span>
                </div>
              </>
            ) : (
              <p className="font-mono text-[10px] text-white/30">
                {sync.connected ? '正在创建房间…' : '正在连接服务器…'}
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p className="font-mono text-[8px] text-white/30 tracking-widest">输入房间号码</p>

            {/* Code input */}
            <input
              type="text"
              value={joinCode}
              onChange={e => {
                setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))
                setError(null)
              }}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              placeholder="XXXXXX"
              maxLength={6}
              className="font-mono text-[24px] text-center tracking-[0.3em] px-4 py-3 rounded-lg bg-transparent border outline-none transition-all w-[240px]"
              style={{
                color: '#90e8a8',
                borderColor: error ? 'rgba(232,122,122,0.5)' : 'rgba(144,232,168,0.25)',
                background: 'rgba(144,232,168,0.04)',
              }}
              autoFocus
            />

            {error && (
              <p className="font-mono text-[9px]" style={{ color: '#e87a7a' }}>
                {error}
              </p>
            )}

            <button
              onClick={handleJoin}
              disabled={joinCode.length < 4 || !sync.connected}
              className="font-mono text-[11px] tracking-wider px-8 py-2.5 rounded-lg border transition-all disabled:opacity-30"
              style={{
                color: '#90e8a8',
                borderColor: 'rgba(144,232,168,0.3)',
                background: 'rgba(144,232,168,0.08)',
              }}
            >
              加入
            </button>

            {/* Partner status (shown after actually joining via the join button) */}
            {joinedRoom && sync.roomCode && (
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full" style={{ background: '#60c880', boxShadow: '0 0 8px #60c880' }} />
                <span className="font-mono text-[10px]" style={{ color: '#60c880' }}>
                  已加入房间 {sync.roomCode}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Start button — only when both connected */}
        {canStart && (
          <button
            onClick={handleStart}
            className="font-mono text-sm tracking-[0.2em] px-10 py-3.5 rounded-lg border transition-all anim-fadeIn"
            style={{
              color: '#90e8a8',
              borderColor: 'rgba(144,232,168,0.5)',
              background: 'rgba(144,232,168,0.1)',
              boxShadow: '0 0 20px rgba(144,232,168,0.15)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(144,232,168,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(144,232,168,0.1)' }}
          >
            双方就绪 — 开始
          </button>
        )}

        {/* Back button */}
        <button
          onClick={onBack}
          className="font-mono text-[9px] text-white/20 hover:text-white/40 transition-colors mt-2"
        >
          ← 返回选择
        </button>
      </div>
    </div>
  )
}
