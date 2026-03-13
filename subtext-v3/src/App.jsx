import { useState, useEffect, useRef } from 'react'
import { GLOBAL_STYLES } from './theme'
import { subscribeSession } from './utils/session'

import InputPhase       from './phases/InputPhase'
import LobbyPhase       from './phases/LobbyPhase'
import WatchPhase       from './phases/WatchPhase'
import AnnotatePhase    from './phases/AnnotatePhase'
import SelfCorrectPhase from './phases/SelfCorrectPhase'
import ComparePhase     from './phases/ComparePhase'
import NegotiatePhase   from './phases/NegotiatePhase'
import DonePhase        from './phases/DonePhase'

// ── Phase flow ─────────────────────────────────────────────────
// input → lobby → watch → annotate → selfcorrect → compare → negotiate → done
//
// URL params control joining: ?s=CODE&r=B  (role B joins session CODE)

export default function App() {
  // ── Core state ───────────────────────────────────────────────
  const [phase, setPhase]           = useState(() => {
    // If URL has ?s=CODE, start at lobby as a joiner
    const params = new URLSearchParams(window.location.search)
    return params.get('s') ? 'lobby' : 'input'
  })
  const [sessionCode, setSessionCode] = useState(() => {
    return new URLSearchParams(window.location.search).get('s') || null
  })
  const [myRole, setMyRole]           = useState(() => {
    return new URLSearchParams(window.location.search).get('r') || null
  })
  const [scriptData, setScriptData]   = useState(null)    // { title, personas, script }
  const [sessionData, setSessionData] = useState(null)    // live Firestore/ls doc
  const [myAnnotations, setMyAnnotations]   = useState({})
  const [myCorrections, setMyCorrections]   = useState({})
  const [myWatchTags, setMyWatchTags]       = useState({})

  const unsubRef = useRef(null)

  // ── Subscribe to session once we have a code ─────────────────
  useEffect(() => {
    if (!sessionCode) return
    unsubRef.current?.()
    unsubRef.current = subscribeSession(sessionCode, (data) => {
      setSessionData(data)
      // Sync scriptData from session if we don't have it locally (role B)
      if (!scriptData && data.script) {
        setScriptData({ title: data.title, personas: data.personas, script: data.script })
      }
      // Auto-advance phase when both parties are ready
      autoAdvance(data)
    })
    return () => unsubRef.current?.()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionCode])

  // ── Phase auto-advance based on session ready state ──────────
  const autoAdvance = (data) => {
    const ready = data?.ready
    if (!ready || !myRole) return

    setPhase(curr => {
      // annotate → selfcorrect: own annotate done
      if (curr === 'annotate' && ready[myRole]?.annotate) return 'selfcorrect'
      // selfcorrect → compare: BOTH parties done with both phases
      if (curr === 'selfcorrect') {
        const bothDone = ready.A?.annotate && ready.A?.selfcorrect && ready.B?.annotate && ready.B?.selfcorrect
        if (bothDone) return 'compare'
      }
      return curr
    })
  }

  // ── Handlers ─────────────────────────────────────────────────

  // InputPhase → session created as role A
  const handleInputReady = ({ code, role, scriptData: sd, source }) => {
    setSessionCode(code)
    setMyRole(role)
    setScriptData(sd)
    // Update URL for sharing
    const url = new URL(window.location.href)
    url.searchParams.set('s', code)
    url.searchParams.set('r', 'A')
    window.history.replaceState({}, '', url)
    setPhase('lobby')
  }

  // LobbyPhase → both roles ready to watch
  const handleLobbyJoined = ({ code, role, scriptData: sd, needInput }) => {
    if (needInput) { setPhase('input'); return }
    if (code) setSessionCode(code)
    if (role) setMyRole(role)
    if (sd)   setScriptData(sd)
    if (role === 'B') {
      const url = new URL(window.location.href)
      url.searchParams.set('s', code)
      url.searchParams.set('r', 'B')
      window.history.replaceState({}, '', url)
    }
    setPhase('watch')
  }

  const handleWatchDone    = (tags) => { if (tags) setMyWatchTags(tags); setPhase('annotate') }

  const handleAnnotateDone = (annotations) => {
    setMyAnnotations(annotations)
    // Phase auto-advances via subscribeSession → autoAdvance
  }

  const handleSelfCorrectDone = (corrections) => {
    setMyCorrections(corrections)
    // Phase auto-advances when both ready
  }

  const handleCompareDone  = () => setPhase('negotiate')
  const handleNegotiateDone = () => setPhase('done')
  const handleReset        = () => {
    setPhase('input'); setSessionCode(null); setMyRole(null)
    setScriptData(null); setSessionData(null)
    setMyAnnotations({}); setMyCorrections({}); setMyWatchTags({})
    window.history.replaceState({}, '', window.location.pathname)
  }

  // ── Derive effective script from session or local state ───────
  const script   = sessionData?.script   || scriptData?.script   || []
  const personas = sessionData?.personas || scriptData?.personas || { A: { name: '她' }, B: { name: '他' } }

  // ── Render ───────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#07070D', color: '#E4E0D8', fontFamily: 'Outfit, sans-serif' }}>
      <style>{GLOBAL_STYLES}</style>

      {phase === 'input' && (
        <InputPhase onReady={handleInputReady} />
      )}

      {phase === 'lobby' && (
        <LobbyPhase
          myRole={myRole}
          sessionCode={sessionCode}
          onJoined={handleLobbyJoined}
        />
      )}

      {phase === 'watch' && (
        <WatchPhase
          script={script}
          personas={personas}
          myRole={myRole}
          sessionCode={sessionCode}
          onNext={handleWatchDone}
        />
      )}

      {phase === 'annotate' && (
        <AnnotatePhase
          script={script}
          personas={personas}
          myRole={myRole}
          sessionCode={sessionCode}
          onDone={handleAnnotateDone}
        />
      )}

      {phase === 'selfcorrect' && (
        <SelfCorrectPhase
          script={script}
          personas={personas}
          myRole={myRole}
          sessionCode={sessionCode}
          onDone={handleSelfCorrectDone}
        />
      )}

      {phase === 'compare' && (
        <ComparePhase
          script={script}
          personas={personas}
          myRole={myRole}
          sessionData={sessionData}
          onNext={handleCompareDone}
        />
      )}

      {phase === 'negotiate' && (
        <NegotiatePhase
          script={script}
          personas={personas}
          myRole={myRole}
          sessionData={sessionData}
          sessionCode={sessionCode}
          onNext={handleNegotiateDone}
        />
      )}

      {phase === 'done' && (
        <DonePhase
          sessionData={sessionData}
          personas={personas}
          myRole={myRole}
          onReset={handleReset}
        />
      )}
    </div>
  )
}
