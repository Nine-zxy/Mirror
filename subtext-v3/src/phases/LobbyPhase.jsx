import { useState, useEffect } from 'react'
import { C } from '../theme'
import { getSession, joinSession, subscribeSession, setSharedPhase } from '../utils/session'

// ── Lobby — two flows:
//   Host (role A): shows share URL, waits for B to join, then starts together
//   Join (role B): enter code → mark joined → wait for A to start
//
// Props:
//   myRole:      'A' | null  (null means "I want to join")
//   sessionCode: string | null (set when hosting)
//   onJoined:    (code, role, scriptData) => void

export default function LobbyPhase({ myRole: initialRole, sessionCode: initialCode, onJoined }) {
  const autoJoin = initialRole === 'B' && Boolean(initialCode)
  const [mode, setMode]       = useState(initialRole === 'A' ? 'host' : autoJoin ? 'joining' : 'choose')
  const [joinInput, setJoinInput] = useState(initialCode || '')
  const [joining, setJoining] = useState(autoJoin)
  const [joinError, setJoinError] = useState(null)

  // B's waiting-room state
  const [bCode, setBCode]           = useState(null)
  const [bScriptData, setBScriptData] = useState(null)

  // Auto-join when B opens URL with session code already in params
  useEffect(() => {
    if (autoJoin) {
      getSession(initialCode)
        .then(async session => {
          if (!session) {
            setJoining(false); setMode('join')
            setJoinError('找不到这个会话，确认一下代码？'); return
          }
          await joinSession(initialCode, 'B')
          setBCode(initialCode)
          setBScriptData({ title: session.title, personas: session.personas, script: session.script })
          setJoining(false)
          setMode('b-waiting')
        })
        .catch(err => { setJoining(false); setMode('join'); setJoinError(err.message) })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleJoin = async () => {
    const c = joinInput.trim().toUpperCase()
    if (c.length < 4) return
    setJoining(true)
    setJoinError(null)
    try {
      const session = await getSession(c)
      if (!session) throw new Error('找不到这个会话，确认一下代码？')
      await joinSession(c, 'B')
      setBCode(c)
      setBScriptData({ title: session.title, personas: session.personas, script: session.script })
      setJoining(false)
      setMode('b-waiting')
    } catch (err) {
      setJoinError(err.message)
      setJoining(false)
    }
  }

  // ── Auto-joining spinner ───────────────────────────────────
  if (mode === 'joining') {
    return (
      <div style={centered}>
        <div style={{ textAlign: 'center' }} className="fade">
          <Dots color={C.b} />
          <p style={{ fontSize: 13, color: C.mu, fontFamily: 'DM Mono, monospace' }}>正在加入会话 {initialCode}…</p>
          {joinError && <p style={{ marginTop: 10, fontSize: 11, color: C.re, fontFamily: 'DM Mono, monospace' }}>{joinError}</p>}
        </div>
      </div>
    )
  }

  // ── B waiting for A to start ───────────────────────────────
  if (mode === 'b-waiting') {
    return (
      <BWaitingView
        code={bCode}
        onStart={() => onJoined({ code: bCode, role: 'B', scriptData: bScriptData })}
      />
    )
  }

  // ── Choose: host or join ───────────────────────────────────
  if (mode === 'choose') {
    return (
      <div style={centered}>
        <div style={{ maxWidth: 420, textAlign: 'center' }} className="fade">
          <p style={mono({ color: C.mu, fontSize: 9, marginBottom: 6 })}>SUBTEXT · 会话</p>
          <h2 style={serif(30)}>你是哪一方？</h2>
          <p style={{ margin: '12px 0 32px', fontSize: 13, color: C.mu, lineHeight: 1.9 }}>
            一方创建会话，输入你们的对话记录；<br />
            另一方收到分享链接后加入。
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Btn onClick={() => setMode('input-host')} bg={C.a} label="我来创建会话" sub="输入聊天记录，生成剧本" />
            <Btn onClick={() => setMode('join')} bg={C.b} label="我来加入" sub="输入另一方给我的分享码" />
          </div>
        </div>
      </div>
    )
  }

  // ── Input host: redirect back to InputPhase logic ─────────
  if (mode === 'input-host') {
    return (
      <div style={centered}>
        <div style={{ maxWidth: 420, textAlign: 'center' }} className="fade">
          <p style={mono({ color: C.a, fontSize: 10, marginBottom: 12 })}>创建会话</p>
          <p style={{ fontSize: 14, color: C.mu, lineHeight: 1.8 }}>
            返回上一步，输入你们的聊天记录，<br />生成剧本后系统会给你一个分享链接。
          </p>
          <button
            onClick={() => onJoined({ code: null, role: 'A', scriptData: null, needInput: true })}
            style={{ marginTop: 24, padding: '12px 32px', borderRadius: 24, border: 'none', background: C.a, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            ← 去输入聊天记录
          </button>
        </div>
      </div>
    )
  }

  // ── Join flow ─────────────────────────────────────────────
  if (mode === 'join') {
    return (
      <div style={centered}>
        <div style={{ maxWidth: 380, textAlign: 'center' }} className="fade">
          <p style={mono({ color: C.b, fontSize: 9, marginBottom: 6 })}>SUBTEXT · 加入会话</p>
          <h2 style={serif(28)}>输入分享码</h2>
          <p style={{ margin: '8px 0 24px', fontSize: 12, color: C.mu, lineHeight: 1.8 }}>
            请对方把 6 位代码发给你
          </p>
          <input
            value={joinInput}
            onChange={e => setJoinInput(e.target.value.toUpperCase().slice(0, 6))}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
            placeholder="如 ABC123"
            maxLength={6}
            style={{
              width: '100%', padding: '14px 18px', borderRadius: 10,
              background: C.card, border: `1.5px solid ${joinError ? C.re : C.bd2}`,
              color: C.tx, fontSize: 22, fontWeight: 600, outline: 'none',
              letterSpacing: '0.3em', textAlign: 'center', fontFamily: 'DM Mono, monospace',
              marginBottom: 12, boxSizing: 'border-box',
            }}
          />
          {joinError && (
            <p style={{ fontSize: 11, color: C.re, fontFamily: 'DM Mono, monospace', marginBottom: 10 }}>{joinError}</p>
          )}
          <button
            onClick={handleJoin}
            disabled={joinInput.length < 4 || joining}
            style={{
              width: '100%', padding: '13px 0', borderRadius: 10, border: 'none',
              background: joinInput.length >= 4 ? C.b : C.dim,
              color: joinInput.length >= 4 ? '#fff' : C.mu,
              fontSize: 14, fontWeight: 600, cursor: joinInput.length >= 4 ? 'pointer' : 'default',
            }}
          >
            {joining ? '加入中…' : '加入 →'}
          </button>
          <button onClick={() => setMode('choose')} style={{ marginTop: 12, background: 'transparent', border: 'none', color: C.mu, fontSize: 12, cursor: 'pointer' }}>
            ← 返回
          </button>
        </div>
      </div>
    )
  }

  // ── Host view ─────────────────────────────────────────────
  return <HostView initialCode={initialCode} onJoined={onJoined} />
}

// ── Host view: share URL + presence + synchronized start ─────

function HostView({ initialCode, onJoined }) {
  const [session, setSession]   = useState(null)
  const [copied, setCopied]     = useState(false)
  const [starting, setStarting] = useState(false)

  const shareUrl = `${window.location.origin}${window.location.pathname}?s=${initialCode}&r=B`
  const bJoined  = session?.joined?.B === true

  useEffect(() => {
    const unsub = subscribeSession(initialCode, setSession)
    return unsub
  }, [initialCode])

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {}
  }

  const handleStart = async () => {
    if (!bJoined || starting) return
    setStarting(true)
    try {
      await setSharedPhase(initialCode, 'watch')
      onJoined({ code: initialCode, role: 'A', scriptData: null })
    } catch (err) {
      console.error(err)
      setStarting(false)
    }
  }

  return (
    <div style={centered}>
      <div style={{ maxWidth: 480, width: '100%' }} className="fade">
        <p style={mono({ color: C.a, fontSize: 9, marginBottom: 6, textAlign: 'center' })}>SUBTEXT · 主持人</p>
        <h2 style={{ ...serif(28), textAlign: 'center', marginBottom: 24 }}>等待对方加入</h2>

        {/* Share URL card */}
        <div style={{ background: C.card, border: `1.5px solid ${C.bd2}`, borderRadius: 14, padding: '18px 20px', marginBottom: 20 }}>
          <p style={{ margin: '0 0 6px', fontSize: 9, color: C.mu, fontFamily: 'DM Mono, monospace', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            把这个链接发给对方
          </p>
          <p style={{ margin: '0 0 14px', fontSize: 11, color: C.tx + 'CC', fontFamily: 'DM Mono, monospace', wordBreak: 'break-all', lineHeight: 1.7 }}>
            {shareUrl}
          </p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={copyUrl}
              style={{
                padding: '7px 18px', borderRadius: 8,
                border: `1.5px solid ${copied ? C.gr : C.bd2}`,
                background: copied ? C.gr + '18' : C.dim,
                color: copied ? C.gr : C.mu,
                fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Mono, monospace',
                transition: 'all .2s',
              }}
            >
              {copied ? '✓ 已复制' : '复制链接'}
            </button>
            <span style={{ fontSize: 10, color: C.mu + '55', fontFamily: 'DM Mono, monospace' }}>
              或直接告诉对方代码&nbsp;
              <span style={{ color: C.a, letterSpacing: '0.2em' }}>{initialCode}</span>
            </span>
          </div>
        </div>

        {/* Presence indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          padding: '14px 0', marginBottom: 20,
        }}>
          {bJoined ? (
            <>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.gr, boxShadow: `0 0 10px ${C.gr}88`, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: C.gr, fontFamily: 'DM Mono, monospace' }}>对方已到达 ✓</span>
            </>
          ) : (
            <>
              <Dots color={C.mu} size={4} />
              <span style={{ fontSize: 13, color: C.mu, fontFamily: 'DM Mono, monospace' }}>等待对方加入…</span>
            </>
          )}
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          disabled={!bJoined || starting}
          style={{
            width: '100%', padding: '15px 0', borderRadius: 12, border: 'none',
            background: bJoined ? C.a : C.dim,
            color: bJoined ? '#fff' : C.mu + '88',
            fontSize: 15, fontWeight: 600,
            cursor: bJoined && !starting ? 'pointer' : 'default',
            transition: 'background .35s, color .35s',
            letterSpacing: '0.03em',
          }}
        >
          {starting ? '开始中…' : bJoined ? '▶ 一起开始放映' : '等待对方加入后可开始'}
        </button>
        <p style={{ marginTop: 10, fontSize: 11, color: C.mu + '55', textAlign: 'center', lineHeight: 1.7 }}>
          点击后双方同步进入放映
        </p>
      </div>
    </div>
  )
}

// ── B waiting room: subscribes to session phase ───────────────

function BWaitingView({ code, onStart }) {
  useEffect(() => {
    const unsub = subscribeSession(code, (session) => {
      if (session?.phase === 'watch') onStart()
    })
    return unsub
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  return (
    <div style={centered}>
      <div style={{ maxWidth: 420, textAlign: 'center' }} className="fade">
        <p style={mono({ color: C.b, fontSize: 9, marginBottom: 6 })}>SUBTEXT · 已加入</p>
        <h2 style={{ ...serif(28), marginBottom: 16 }}>准备就绪</h2>
        <p style={{ margin: '0 0 32px', fontSize: 13, color: C.mu, lineHeight: 1.9 }}>
          已加入会话&nbsp;
          <span style={{ color: C.b, fontFamily: 'DM Mono, monospace', letterSpacing: '0.2em' }}>{code}</span>
          <br />等待主持人开始放映…
        </p>
        <Dots color={C.b} size={5} />
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────

function Dots({ color, size = 5 }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: size, height: size, borderRadius: '50%', background: color, animation: `blink 1.8s ${i * 0.3}s infinite` }} />
      ))}
    </div>
  )
}

function Btn({ onClick, bg, label, sub }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '20px 16px', borderRadius: 12,
      border: `1.5px solid ${bg}44`, background: bg + '12',
      cursor: 'pointer', textAlign: 'left',
    }}>
      <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: bg }}>{label}</p>
      <p style={{ margin: 0, fontSize: 11, color: C.mu, lineHeight: 1.5 }}>{sub}</p>
    </button>
  )
}

// ── Style helpers ──────────────────────────────────────────────
const centered = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }
const mono = (extra = {}) => ({ fontFamily: 'DM Mono, monospace', letterSpacing: '0.15em', textTransform: 'uppercase', ...extra })
const serif = (size) => ({ fontFamily: 'Cormorant Garamond, serif', fontSize: size, fontWeight: 300, lineHeight: 1.25, margin: '0 0 0' })
