import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { scenario as BASE_SCENARIO }                from './data/scenario'

// Available pre-built scenarios for study mode
const STUDY_SCENARIOS = { default: BASE_SCENARIO }
import { SCENE_PRESETS }                           from './data/dramaElements'
import {
  initSession, log, logPhase, logBeat, logSeek,
  logTag, logDispute, logToggle, logReflect,
  logArchetype, logAppearanceSet, downloadLog, uploadLog,
  logAssumptionConfirm, logAssumptionDispute,
  logAssumptionEdit, logAssumptionClear,
  setSyncCallback,
} from './utils/behaviorLog'
import { useSyncContext } from './sync/SyncContext'

import IntroScreen       from './components/IntroScreen'
import LobbyScreen       from './components/LobbyScreen'
import ConflictInput     from './components/ConflictInput'
import PrepareScreen     from './components/PrepareScreen'
import Theater           from './components/Theater'
// EmotionBar is not part of the paper workflow.
import ConflictTimeline  from './components/ConflictTimeline'
import ReflectionOverlay from './components/ReflectionOverlay'
import DivergenceSummary from './components/DivergenceSummary'
import SelfConfirmScreen from './components/SelfConfirmScreen'
import DivergenceCards   from './components/DivergenceCards'
import ScriptPanel       from './components/ScriptPanel'
import SyncStatusBadge   from './components/SyncStatusBadge'

// ─────────────────────────────────────────────────────────────
//  App — Root state machine  (Version B)
//
//  Phase flow (V4 — pilot-validated):
//    intro → [lobby] → input → self_confirm → solo_viewing
//      → [together_viewing] → divergence
//
//  self_confirm:     FIRST — confirm/edit AI inference about YOUR OWN thoughts (in theater)
//  solo_viewing:     THEN — see partner's AI-inferred thoughts, edit them (in theater)
//  together_viewing: (Together mode only) Watch together with edited versions
//  divergence:       Three-layer comparison cards
//
//  Self-Confirm precedes cross-editing to preserve independent self-description.
//  Both phases happen in the theater view.
//
//  Lobby phase only in Together mode
//  together_viewing only in Together mode
// ─────────────────────────────────────────────────────────────

// ── WaitingOverlay — both participants must finish before reveal ──
function WaitingOverlay({ targetPhase }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const iv = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(iv)
  }, [])

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(6,8,16,0.85)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: '8px', height: '8px', borderRadius: '50%', background: '#7ab0e8',
              animation: `blink 1.2s ${i * 0.3}s ease-in-out infinite`,
            }} />
          ))}
        </div>
        <p className="font-mono text-[13px] tracking-wider" style={{ color: '#7ab0e8' }}>
          {targetPhase === 'solo_viewing' ? 'Waiting for partner to finish confirming...' : 'Waiting for partner to finish annotating...'}
        </p>
        <p className="font-mono text-[9px] text-white/25">
          You will enter the next phase together once your partner is done
        </p>
        <p className="font-mono text-[8px] text-white/15 mt-1">
          {elapsed}s
        </p>
      </div>
    </div>
  )
}

// ── StudyWaitingOverlay — simulates partner sync for pre-built scenarios ──
function StudyWaitingOverlay({ onReady }) {
  const [step, setStep] = useState(0) // 0=waiting, 1=partner ready, 2=generating
  const onReadyRef = useRef(onReady)
  onReadyRef.current = onReady
  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 3000)   // partner joins
    const t2 = setTimeout(() => setStep(2), 5500)   // both ready → generating
    const t3 = setTimeout(() => onReadyRef.current(), 8000)     // enter theater
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const partnerReady = step >= 1
  const generating = step >= 2

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-5"
      style={{ background: '#060810' }}>
      {/* Status dots */}
      <div className="flex gap-5 items-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full" style={{
            background: '#58c878',
            boxShadow: '0 0 10px rgba(88,200,120,0.5)',
          }} />
          <span className="font-mono text-[12px] text-white/40">You</span>
        </div>
        <div className="w-10 h-px" style={{
          background: partnerReady
            ? 'linear-gradient(90deg, rgba(88,200,120,0.5), rgba(88,200,120,0.5))'
            : 'linear-gradient(90deg, rgba(88,200,120,0.5), rgba(255,255,255,0.1))',
        }} />
        <div className="flex flex-col items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full" style={{
            background: partnerReady ? '#58c878' : 'rgba(255,255,255,0.15)',
            boxShadow: partnerReady ? '0 0 10px rgba(88,200,120,0.5)' : 'none',
            animation: partnerReady ? 'none' : 'pulse 2s ease-in-out infinite',
          }} />
          <span className="font-mono text-[12px] text-white/40">Partner</span>
        </div>
      </div>

      {/* Status text */}
      <div className="font-mono text-[16px] text-white/60 mt-2">
        {generating
          ? 'Both ready. Entering theater…'
          : partnerReady
            ? 'Both ready. Preparing scenario…'
            : 'Waiting for partner to complete input…'}
      </div>
      <div className="font-mono text-[12px] text-white/25">
        {generating ? 'GENERATING SCENARIO' : partnerReady ? 'BOTH READY' : 'WAITING FOR PARTNER'}
      </div>

      {/* Loading dots */}
      {!generating && (
        <div className="flex gap-2 mt-2">
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.3)',
              animation: `blink 1.1s ${i * 0.28}s ease-in-out infinite`,
            }} />
          ))}
        </div>
      )}
    </div>
  )
}

// Default scene elements per scene key (CSS fallback furniture/props)
const SCENE_ELEMENTS_MAP = {
  bedroom_night:      ['window', 'curtains', 'bed', 'lamp', 'phone_screen', 'rug', 'bookshelf', 'wallart'],
  bedroom_evening:    ['window', 'curtains', 'bed', 'lamp', 'rug', 'bookshelf', 'wallart'],
  livingroom_evening: ['window', 'curtains', 'sofa', 'table', 'lamp', 'rug', 'plant', 'wallart'],
  livingroom_night:   ['window', 'curtains', 'sofa', 'table', 'tv', 'rug'],
  kitchen_morning:    ['window', 'table', 'cup', 'plant', 'shelf'],
  kitchen_evening:    ['window', 'table', 'cup', 'plant', 'shelf'],
  office_day:         ['window', 'desk', 'coffee', 'bookshelf', 'plant'],
  office_night:       ['window', 'desk', 'coffee', 'bookshelf', 'plant'],
  office_latenight:   ['window', 'desk', 'coffee', 'bookshelf'],
  cafe_day:           ['window', 'table', 'coffee', 'plant', 'wallart'],
  cafe_evening:       ['window', 'table', 'coffee', 'plant', 'wallart'],
  park_day:           ['tree', 'bench', 'plant'],
  park_night:         ['tree', 'bench', 'moon', 'plant'],
  balcony_night:      ['plant'],
  car_night:          [],
  study_afternoon:    ['window', 'desk', 'lamp', 'bookshelf'],
  subway_evening:     [],
  restaurant_night:   ['table', 'lamp'],
  // Legacy aliases
  outdoor_park:       ['tree', 'bench', 'moon', 'plant'],
  cafe:               ['window', 'table', 'coffee', 'plant', 'wallart'],
  office:             ['window', 'desk', 'coffee', 'bookshelf', 'plant'],
}

// ── URL parameter detection ───────────────────────────────────
const URL_PARAMS = new URLSearchParams(window.location.search)
if (__ASIDE_STATIC_SITE__) {
  for (const key of [...URL_PARAMS.keys()]) {
    if (!['lang', 'demo', 'beat'].includes(key) || (key === 'demo' && URL_PARAMS.get(key) !== 'solo')) URL_PARAMS.delete(key)
  }
}
const DEMO_MODE = URL_PARAMS.get('demo')
const DEMO_PAIR = DEMO_MODE === 'pair'
const STUDY_ID   = URL_PARAMS.get('study')
const STUDY_ROLE = URL_PARAMS.get('role')?.toUpperCase()
const PREPARE_MODE = URL_PARAMS.get('mode') === 'prepare'
// Direct scenario load: ?scenario=default&role=A → skip intro, load pre-built scenario
const DIRECT_SCENARIO = URL_PARAMS.get('scenario')
const DIRECT_ROLE = URL_PARAMS.get('role')?.toUpperCase()

// ── Main App ─────────────────────────────────────────────────
export default function App() {
  const sync = useSyncContext()

  // Researcher prepare mode — completely separate screen
  if (PREPARE_MODE) {
    return <PrepareScreen />
  }

  // Determine initial phase and scenario from URL
  const directScenarioData = DIRECT_SCENARIO ? STUDY_SCENARIOS[DIRECT_SCENARIO] : null
  const initialPhase = DEMO_MODE === 'solo' || DEMO_PAIR ? 'self_confirm' : STUDY_ID ? 'study_loading' : directScenarioData ? 'study_intro' : 'intro'
  const initScenario = directScenarioData || BASE_SCENARIO

  const [phase, setPhase]               = useState(initialPhase)
  const [beatIndex, setBeatIndex]       = useState(DEMO_MODE === 'solo' && URL_PARAMS.get('beat') === '1' ? 1 : 0)
  const [isPlaying, setIsPlaying]       = useState(false)
  // Bubble visibility: 'none' | 'self' | 'partner' | 'both'
  // self_confirm: 'self' (see only own thoughts)
  // solo_viewing: 'partner' (see only partner's thoughts)
  // together_viewing: 'both'
  const [bubbleVisibility, setBubbleVisibility] = useState(directScenarioData || DEMO_MODE ? 'self' : 'partner')
  const [showScript, setShowScript]     = useState(false)
  const [showSceneSelector, setShowSceneSelector] = useState(false)
  const [annotation, setAnnotation]     = useState('')

  const [liveScenario, setLiveScenario] = useState(initScenario)
  const [personas, setPersonas]         = useState(initScenario.personas)

  const [tags, setTags]                 = useState([])
  const [disputes, setDisputes]         = useState({})
  const [selfConfirms, setSelfConfirms] = useState({})

  // ── Feature 1: State persistence across refresh ──────────────
  const persistState = useCallback(() => {
    const state = {
      phase,
      beatIndex,
      disputes: JSON.stringify(disputes),
      selfConfirms: JSON.stringify(selfConfirms),
      bubbleVisibility,
      scenarioId: DIRECT_SCENARIO || STUDY_ID || null,
      role: DIRECT_ROLE || STUDY_ROLE || sync.role || 'A',
    }
    try { sessionStorage.setItem('aside_state', JSON.stringify(state)) } catch {}
  }, [phase, beatIndex, disputes, selfConfirms, bubbleVisibility])

  useEffect(() => { persistState() }, [phase, disputes, selfConfirms]) // eslint-disable-line react-hooks/exhaustive-deps

  // Restore state on mount
  const [restored, setRestored] = useState(false)
  useEffect(() => {
    if (restored) return
    try {
      const saved = JSON.parse(sessionStorage.getItem('aside_state'))
      if (saved && saved.scenarioId === (DIRECT_SCENARIO || STUDY_ID)) {
        // Only restore if we're on the same scenario
        if (saved.disputes) setDisputes(JSON.parse(saved.disputes))
        if (saved.selfConfirms) setSelfConfirms(JSON.parse(saved.selfConfirms))
        if (saved.phase) setPhase(saved.phase)
        if (saved.bubbleVisibility) setBubbleVisibility(saved.bubbleVisibility)
        if (saved.beatIndex !== undefined) setBeatIndex(saved.beatIndex)
      }
    } catch {}
    setRestored(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Feature 2: Back button handler ──────────────────────────
  const handleGoBack = useCallback(() => {
    if (phase === 'solo_viewing') {
      setPhase('self_confirm')
      setBubbleVisibility('self')
      setBeatIndex(0)
    } else if (phase === 'together_viewing') {
      setPhase('solo_viewing')
      setBubbleVisibility('partner')
      setBeatIndex(0)
      setWaitingForPhase(null)
    } else if (phase === 'divergence') {
      setPhase('together_viewing')
      setBubbleVisibility('both')
      setBeatIndex(0)
    }
  }, [phase])

  // Together mode state
  const [proximity, setProximity]               = useState(null)
  const [partnerDisputes, setPartnerDisputes]   = useState(null)

  // Phase gate state (Bug 3: synchronized phase transitions)
  const [waitingForPhase, setWaitingForPhase]   = useState(null) // target phase we're waiting on
  const [partnerPhaseReady, setPartnerPhaseReady] = useState(null)

  const beats       = liveScenario.beats
  const currentBeat = beats[beatIndex]
  const timerRef    = useRef(null)
  const isRemote    = useRef(false)  // prevents echo loops for sync

  // ── Study mode: load pre-generated scenario from server ──────
  const [studyError, setStudyError] = useState(null)

  useEffect(() => {
    if (!STUDY_ID) return

    // Switch to together mode and connect to server
    if (sync.mode !== 'together') {
      sync.setMode('together')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!STUDY_ID || phase !== 'study_loading') return
    if (!sync.connected) return

    // Use the scenarioId as room code: create or join room
    const role = STUDY_ROLE === 'B' ? 'B' : 'A'

    // Load scenario
    sync.loadScenario(STUDY_ID).then(({ scenario: loadedScenario }) => {
      setLiveScenario(loadedScenario)
      setPersonas(loadedScenario.personas)
      setBeatIndex(0)
      setAnnotation('')
      setTags([])
      setDisputes({})
      setSelfConfirms({})

      // Join room using scenarioId as room code
      if (role === 'A') {
        sync.createRoom('colocated', STUDY_ID)
      } else {
        sync.joinRoom(STUDY_ID)
      }
      // Wait briefly for room creation, then set phase
      // Role B needs to join the room created by A
      // We use scenarioId as a coordination mechanism but actual rooms are separate
      // Both clients will use scenarioId-based room pairing

      setPhase('self_confirm')
      setBubbleVisibility('self')
      setIsPlaying(false)
      log('study_mode_loaded', { studyId: STUDY_ID, role })
    }).catch((err) => {
      console.error('[Study] Failed to load scenario:', err)
      setStudyError(err.message || 'Failed to load scenario')
    })
  }, [STUDY_ID, phase, sync.connected]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Preloaded scenario auto-sync: connect WS and join room ──
  const scenarioRoomJoined = useRef(false)

  useEffect(() => {
    if ((!DIRECT_SCENARIO && !DEMO_PAIR) || STUDY_ID) return
    // Switch to together mode so WS connects
    if (sync.mode !== 'together') {
      sync.setMode('together')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if ((!DIRECT_SCENARIO && !DEMO_PAIR) || STUDY_ID) return
    if (!sync.connected || scenarioRoomJoined.current) return
    scenarioRoomJoined.current = true
    const roomCode = (URL_PARAMS.get('room') || DIRECT_SCENARIO || 'DEMO').toUpperCase()
    const role = DIRECT_ROLE || 'A'
    if (role === 'A') {
      sync.createRoom('colocated', roomCode)
    } else {
      sync.joinRoom(roomCode)
    }
    console.log(`[Scenario] Auto-joining room "${roomCode}" as ${role}`)
  }, [sync.connected]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    initSession({
      scenarioId: STUDY_ID || BASE_SCENARIO.id,
      appVersion: '0.1.0-public',
      mode: STUDY_ID ? 'study' : sync.mode,
      role: STUDY_ROLE || sync.role,
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Forward log events to server in together mode ──────────
  useEffect(() => {
    if (sync.mode === 'together') {
      setSyncCallback((entry) => {
        sync.send('log:event', { entry })
      })
    } else {
      setSyncCallback(null)
    }
    return () => setSyncCallback(null)
  }, [sync.mode, sync]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync: register remote message handlers ────────────────
  useEffect(() => {
    if (sync.mode !== 'together') return
    const unsubs = []

    // Playback sync — only during together_viewing (editing phases are independent)
    unsubs.push(sync.onMessage('sync:beat', (msg) => {
      // Don't sync beats during self_confirm or solo_viewing
      if (phase === 'self_confirm' || phase === 'solo_viewing') return
      isRemote.current = true
      setBeatIndex(msg.beatIndex)
      if (msg.isPlaying !== undefined) setIsPlaying(msg.isPlaying)
      isRemote.current = false
    }))

    unsubs.push(sync.onMessage('sync:phase', (msg) => {
      // Bug 2 fix: Do NOT auto-change phase during editing phases (self_confirm, solo_viewing).
      // Phase transitions in these phases should ONLY happen via explicit user button click
      // or via the sync:phase_ready gate mechanism.
      //
      // GUARD: only accept phase transitions that are FORWARD in the flow.
      // Prevents stale messages from jumping backwards after WebSocket reconnect.
      const PHASE_ORDER = ['intro', 'lobby', 'input', 'study_intro', 'study_input', 'study_waiting',
                           'self_confirm', 'solo_viewing', 'together_viewing', 'divergence', 'study_archive']
      setPhase(currentPhase => {
        const editingPhases = ['self_confirm', 'solo_viewing']
        if (editingPhases.includes(currentPhase)) {
          console.log(`[Sync] Blocked remote phase change from ${currentPhase} to ${msg.phase} — user is editing`)
          return currentPhase  // stay in current phase
        }
        // Reject backward phase jumps (stale messages after reconnect)
        const currentIdx = PHASE_ORDER.indexOf(currentPhase)
        const newIdx = PHASE_ORDER.indexOf(msg.phase)
        if (currentIdx >= 0 && newIdx >= 0 && newIdx < currentIdx) {
          console.log(`[Sync] Ignoring backward phase jump: ${currentPhase} → ${msg.phase}`)
          return currentPhase
        }
        return msg.phase
      })
    }))

    // Scenario from partner (role B receives this)
    unsubs.push(sync.onMessage('scenario:ready', (msg) => {
      if (msg.scenario) {
        isRemote.current = true
        setLiveScenario(msg.scenario)
        setPersonas(msg.scenario.personas)
        setBeatIndex(0); setAnnotation(''); setTags([]); setDisputes({}); setSelfConfirms({})
        setPhase('self_confirm')       // V4: self_confirm FIRST (was incorrectly solo_viewing)
        setBubbleVisibility('self')    // Show own thoughts for self-confirmation
        setIsPlaying(false)
        log('scenario_received', { source: msg.source })
        isRemote.current = false
      }
    }))

    // Persona sync
    unsubs.push(sync.onMessage('sync:persona', (msg) => {
      isRemote.current = true
      setPersonas(prev => ({ ...prev, [msg.personaId]: { ...prev[msg.personaId], ...msg.changes } }))
      isRemote.current = false
    }))

    // Scene sync
    unsubs.push(sync.onMessage('sync:scene', (msg) => {
      isRemote.current = true
      const newElements = SCENE_ELEMENTS_MAP[msg.sceneKey] || liveScenario.sceneElements
      setLiveScenario(prev => ({ ...prev, scene: msg.sceneKey, sceneElements: newElements }))
      isRemote.current = false
    }))

    // Phase gate: partner is ready for a phase transition
    unsubs.push(sync.onMessage('sync:phase_partner_ready', (msg) => {
      setPartnerPhaseReady(msg.phase)
      console.log(`[Sync] Partner ready for phase: ${msg.phase}`)
    }))

    // Phase gate: server says both ready — transition now!
    unsubs.push(sync.onMessage('sync:phase_go', (msg) => {
      console.log(`[Sync] Phase gate GO → ${msg.phase}`)
      setWaitingForPhase(null)
      setPartnerPhaseReady(null)
      if (msg.phase === 'solo_viewing') {
        setBeatIndex(0)
        setPhase('solo_viewing')
        setBubbleVisibility('partner')
        setIsPlaying(false)
        logPhase('self_confirm', 'solo_viewing')
      } else if (msg.phase === 'together_viewing') {
        // Merge partner's disputes/selfConfirms from the GO message
        // This is the RELIABLE data exchange — doesn't depend on real-time relay
        if (msg.partnerDisputes) {
          const pd = msg.partnerDisputes
          setPartnerDisputes(pd)
          setDisputes(prev => ({ ...prev, ...pd }))
          console.log(`[Sync] Merged ${Object.keys(pd).length} partner disputes from phase_go`)
        }
        if (msg.partnerSelfConfirms) {
          const ps = msg.partnerSelfConfirms
          setSelfConfirms(prev => ({ ...prev, ...ps }))
          console.log(`[Sync] Merged ${Object.keys(ps).length} partner selfConfirms from phase_go`)
        }
        setBeatIndex(0)
        setPhase('together_viewing')
        setBubbleVisibility('both')
        setIsPlaying(false)
        logPhase('solo_viewing', 'together_viewing')
      }
    }))

    // Partner annotations reveal — merge partner's edits into local disputes
    // In together_viewing, each person sees the OTHER's edits of their own thoughts
    unsubs.push(sync.onMessage('annotation:reveal', (msg) => {
      const pd = msg.partnerDisputes || {}
      const ps = msg.partnerSelfConfirms || {}
      setPartnerDisputes(pd)
      // Merge partner's disputes into local disputes so Theater shows them
      setDisputes(prev => ({ ...prev, ...pd }))
      // Merge partner's selfConfirms into local selfConfirms
      setSelfConfirms(prev => ({ ...prev, ...ps }))
      log('partner_reveal_received', { disputeCount: Object.keys(pd).length, selfConfirmCount: Object.keys(ps).length })
    }))

    return () => unsubs.forEach(fn => fn())
  }, [sync.mode]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync helper: send if in together mode and not a remote update ──
  const syncSend = useCallback((type, payload) => {
    if (sync.mode === 'together' && !isRemote.current) {
      sync.send(type, payload)
    }
  }, [sync])

  // ── Re-send phase_ready after WS reconnect (if we were waiting) ──
  useEffect(() => {
    if (sync.connected && waitingForPhase) {
      console.log(`[Sync] Reconnected while waiting for ${waitingForPhase} — re-sending phase_ready + annotation:reveal`)
      if (waitingForPhase === 'together_viewing') {
        sync.send('annotation:reveal', { partnerDisputes: disputes, partnerSelfConfirms: selfConfirms })
      }
      sync.send('sync:phase_ready', { phase: waitingForPhase })
    }
  }, [sync.connected]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Playback ───────────────────────────────────────────────
  const advance = useCallback(() => {
    const next = beatIndex + 1
    if (next >= beats.length) {
      setIsPlaying(false)
      // In solo_viewing: just stop playback. User clicks "完成标注" to proceed.
      // In together_viewing: auto-transition to divergence after brief pause.
      if (phase === 'together_viewing') {
        setTimeout(() => {
          setPhase('divergence')
          logPhase('together_viewing', 'divergence')
          uploadLog()  // Auto-save log to server when reaching divergence
          syncSend('sync:phase', { phase: 'divergence' })
        }, 1200)
      }
      // solo_viewing: no auto-transition — wait for user to click "完成标注"
      return
    }
    const nb = beats[next]
    setBeatIndex(next)
    logBeat(next, 'auto')
    syncSend('sync:beat', { beatIndex: next, isPlaying: true })
    // isPausePoint auto-pause removed — disruptive during study
  }, [beatIndex, beats, phase, syncSend])

  const isPlaybackPhase = phase === 'together_viewing'
  useEffect(() => {
    if (!isPlaying || !isPlaybackPhase) return
    timerRef.current = setTimeout(advance, currentBeat?.duration ?? 4000)
    return () => clearTimeout(timerRef.current)
  }, [isPlaying, beatIndex, isPlaybackPhase, currentBeat, advance])

  const BLOCKING_PHASES = new Set(['intro', 'input', 'reflection', 'lobby', 'divergence', 'study_loading', 'study_intro', 'study_waiting', 'study_archive'])

  const handlePlayPause = useCallback(() => {
    if (BLOCKING_PHASES.has(phase)) return
    if (phase === 'end') {
      setBeatIndex(0); setPhase('solo_viewing'); setIsPlaying(true)
      logPhase('end', 'solo_viewing')
      syncSend('sync:phase', { phase: 'solo_viewing' })
      syncSend('sync:beat', { beatIndex: 0, isPlaying: true })
      return
    }

    // Together mode: only sync beats during together_viewing (not during self_confirm/solo_viewing)
    if (sync.mode === 'together' && phase === 'together_viewing') {
      const next = !isPlaying
      setIsPlaying(next)
      log(next ? 'playback_play' : 'playback_pause', { beatIndex })
      syncSend('sync:beat', { beatIndex, isPlaying: next })
      return
    }

    // Solo mode: toggle directly
    setIsPlaying(p => {
      const next = !p
      log(next ? 'playback_play' : 'playback_pause', { beatIndex })
      return next
    })
  }, [phase, beatIndex, syncSend, sync, isPlaying]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectBeat = useCallback((idx) => {
    clearTimeout(timerRef.current)
    setBeatIndex(idx); setIsPlaying(false)
    // Stay in current phase if it's a playback phase, else go to solo_viewing
    if (phase !== 'solo_viewing' && phase !== 'together_viewing' && phase !== 'self_confirm') {
      setPhase('solo_viewing')
    }
    logSeek(idx)
    // Only sync beats during together_viewing — editing phases are independent
    if (phase === 'together_viewing') {
      syncSend('sync:beat', { beatIndex: idx, isPlaying: false })
    }
  }, [phase, syncSend])

  // Manual beat navigation for editing phases (self_confirm, solo_viewing)
  const handlePrevBeat = useCallback(() => {
    if (beatIndex <= 0) return
    const prev = beatIndex - 1
    clearTimeout(timerRef.current)
    setBeatIndex(prev)
    setIsPlaying(false)
    logSeek(prev)
    // Don't sync during editing phases
    if (phase === 'together_viewing') syncSend('sync:beat', { beatIndex: prev, isPlaying: false })
  }, [beatIndex, phase, syncSend])

  const handleNextBeat = useCallback(() => {
    if (beatIndex >= beats.length - 1) return
    const next = beatIndex + 1
    clearTimeout(timerRef.current)
    setBeatIndex(next)
    setIsPlaying(false)
    logSeek(next)
    // Don't sync during editing phases
    if (phase === 'together_viewing') syncSend('sync:beat', { beatIndex: next, isPlaying: false })
  }, [beatIndex, beats.length, phase, syncSend])

  // ── Intro → mode selection ────────────────────────────────
  const handleBegin = useCallback((mode, prox) => {
    if (mode === 'together') {
      sync.setMode('together')
      setProximity(prox || 'colocated')
      setPhase('lobby')
      logPhase('intro', 'lobby')
      log('mode_selected', { mode: 'together', proximity: prox })
    } else {
      setPhase('input')
      logPhase('intro', 'input')
      log('mode_selected', { mode: 'solo' })
    }
  }, [sync])

  // ── Lobby → both connected → input ────────────────────────
  const handleLobbyReady = useCallback(() => {
    setPhase('input')
    logPhase('lobby', 'input')
  }, [])

  const handleLobbyBack = useCallback(() => {
    sync.setMode('solo')
    setPhase('intro')
  }, [sync])

  // ── Scenario ready ────────────────────────────────────────
  const handleScenarioReady = useCallback((scenario, rawInput) => {
    setLiveScenario(scenario); setPersonas(scenario.personas)
    log('scenario_generated', { scenarioId: scenario.id, inputLength: rawInput?.length || 0,
      scene: scenario.scene, hasArchetype: Boolean(scenario.personas?.A?.archetype) })
    if (scenario.personas?.A?.archetype) {
      const arc = scenario.personas.A.archetype
      logArchetype(arc.relationshipType, arc.communicationStyle || [], arc.communicationStyle || [])
    }
    setBeatIndex(0); setAnnotation(''); setTags([]); setDisputes({}); setSelfConfirms({})
    // Self-Confirm precedes editing the partner's perspective.
    setPhase('self_confirm')
    setBubbleVisibility('self')
    logPhase('input', 'self_confirm')

    if (sync.mode === 'together') {
      setIsPlaying(false)
      sync.send('scenario:generated', { scenario })
      syncSend('sync:phase', { phase: 'self_confirm' })
    } else {
      // Solo: no auto-play in editing phases — user navigates manually
      setIsPlaying(false)
    }
  }, [sync, syncSend])

  const handleReflectionDone = useCallback(() => {
    setPhase('end'); logPhase('reflection', 'end')
    syncSend('sync:phase', { phase: 'end' })
    if (sync.mode === 'together') {
      sync.requestPartnerAnnotations()
    }
  }, [sync, syncSend])

  // ── Version B: Phase transition handlers ────────────────────

  // self_confirm → solo_viewing (no waiting — each person transitions independently)
  const handleSelfConfirmToSoloViewing = useCallback(() => {
    setIsPlaying(false)
    log('self_confirm_finished', { selfConfirmCount: Object.keys(selfConfirms).length })
    // Transition immediately — no phase gate between self_confirm and solo_viewing
    setBeatIndex(0)
    setPhase('solo_viewing')
    setBubbleVisibility('partner')
    logPhase('self_confirm', 'solo_viewing')
  }, [selfConfirms])

  // solo_viewing → together_viewing (always, both solo and together mode)
  // Together Viewing shows BOTH people's thoughts (edited versions) side by side
  const handleFinishAnnotation = useCallback(() => {
    setIsPlaying(false)
    log('annotation_finished', { disputeCount: Object.keys(disputes).length })
    if (sync.mode === 'together') {
      // Always wait for partner in together mode (even if WS briefly disconnected)
      if (sync.connected) {
        // Send edits to partner
        sync.send('annotation:reveal', { partnerDisputes: disputes, partnerSelfConfirms: selfConfirms })
        sync.send('sync:phase_ready', { phase: 'together_viewing' })
        console.log('[Sync] Sent phase_ready + annotation:reveal for together_viewing')
      } else {
        console.log('[Sync] WS disconnected — waiting for reconnect to send phase_ready')
      }
      // Wait for the partner; the public artifact does not bypass this gate.
      setWaitingForPhase('together_viewing')
    } else {
      // Solo mode: transition immediately
      setBeatIndex(0)
      setPhase('together_viewing')
      setBubbleVisibility('both')
      logPhase('solo_viewing', 'together_viewing')
    }
  }, [disputes, sync, selfConfirms])

  // SelfConfirmScreen: confirm/edit a single beat
  const handleSelfConfirm = useCallback((role, beatId, data) => {
    const key = `${role}-${beatId}`
    setSelfConfirms(prev => ({ ...prev, [key]: data }))
    log('self_confirm', {
      key,
      status: data.status,
      originalText: data.original || '',
      confirmedText: data.text || '',
      originalEmotion: data.originalEmotion || '',
      confirmedEmotion: data.emotion || '',
      emotionChanged: data.emotion !== data.originalEmotion,
    })
  }, [])

  // Wrapper: Theater's onDispute during self_confirm phase → route to selfConfirms, NOT disputes
  const handleSelfConfirmDispute = useCallback((personaId, beatId, update) => {
    if (update === null) {
      // Clear
      const key = `${personaId}-${beatId}`
      setSelfConfirms(prev => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== key)))
      return
    }
    handleSelfConfirm(personaId, beatId, {
      source: 'user',
      status: update.status || 'confirmed',
      text: update.text,
      original: update.original,
      emotion: update.emotion,
      originalEmotion: update.originalEmotion || update.emotion,
    })
  }, [handleSelfConfirm])

  // handleSelfConfirmDone is now handled by handleSelfConfirmToSoloViewing above
  // (self_confirm → solo_viewing, not directly to together_viewing)

  const handleMark = useCallback((emoji) => {
    setTags(prev => [...prev, { id: Date.now(), beatIndex, emoji }])
    logTag(emoji, beatIndex)
  }, [beatIndex])

  const handleDispute = useCallback((personaId, beatId, update) => {
    const key = `${personaId}-${beatId}`
    setDisputes(prev => {
      if (update === null) {
        logAssumptionClear(personaId, beatId)
        // Sync annotation clear to server
        if (sync.mode === 'together') {
          sync.send('annotation:update', { key, dispute: null })
        }
        return Object.fromEntries(Object.entries(prev).filter(([k]) => k !== key))
      }
      if (update.status === 'confirmed') logAssumptionConfirm(personaId, beatId, {
        originalText: update.original, emotion: update.emotion,
      })
      else if (update.status === 'disputed') logAssumptionDispute(personaId, beatId, {
        originalText: update.original, emotion: update.emotion,
      })
      else if (update.status === 'edited') {
        logAssumptionEdit(personaId, beatId, {
          originalText: update.original || '',
          editedText: update.text || '',
          originalLen: update.original?.length ?? 0,
          editedLen: update.text?.length ?? 0,
          emotionChanged: update.emotion !== update.originalEmotion,
          newEmotion: update.emotion,
          originalEmotion: update.originalEmotion,
        })
      }
      logDispute(personaId, beatId, update.original, update.text)
      // Sync annotation to server (stored, not forwarded to partner)
      if (sync.mode === 'together') {
        sync.send('annotation:update', { key, dispute: update })
      }
      return { ...prev, [key]: update }
    })
  }, [sync])

  const handlePersonaUpdate = useCallback((personaId, changes) => {
    setPersonas(prev => ({ ...prev, [personaId]: { ...prev[personaId], ...changes } }))
    logAppearanceSet({ ...changes, _id: personaId })
    syncSend('sync:persona', { personaId, changes })
  }, [syncSend])

  const handleSceneChange = useCallback((sceneKey) => {
    const newElements = SCENE_ELEMENTS_MAP[sceneKey] || liveScenario.sceneElements
    setLiveScenario(prev => ({ ...prev, scene: sceneKey, sceneElements: newElements }))
    log('scene_change', { scene: sceneKey })
    syncSend('sync:scene', { sceneKey })
  }, [liveScenario.sceneElements, syncSend])

  // Cycle: partner → both → none → partner …
  const BUBBLE_CYCLE = ['partner', 'both', 'none']
  const handleBubbleCycle = useCallback(() => {
    setBubbleVisibility(prev => {
      const idx = BUBBLE_CYCLE.indexOf(prev)
      const next = BUBBLE_CYCLE[(idx + 1) % BUBBLE_CYCLE.length]
      logToggle('bubble_visibility', next)
      return next
    })
  }, [])

  // Compute per-character thought visibility for Theater
  const myRole = DIRECT_ROLE || STUDY_ROLE || sync.role || 'A'  // URL param > study mode > sync > default A
  const thoughtVisibility = useMemo(() => {
    if (bubbleVisibility === 'none')    return { A: false, B: false }
    if (bubbleVisibility === 'both')    return { A: true,  B: true }
    if (bubbleVisibility === 'self') {
      // self_confirm phase: only show MY OWN thoughts
      if (myRole === 'A') return { A: true, B: false }
      else                return { A: false, B: true }
    }
    // 'partner': only show the OTHER person's thoughts
    if (myRole === 'A') return { A: false, B: true }
    else                return { A: true,  B: false }
  }, [bubbleVisibility, myRole])

  // Auto-sync bubbleVisibility when phase changes
  useEffect(() => {
    if (phase === 'together_viewing') {
      setBubbleVisibility('both')
    } else if (phase === 'solo_viewing') {
      setBubbleVisibility('partner')
    } else if (phase === 'self_confirm') {
      setBubbleVisibility('self')  // self_confirm: only show MY OWN thoughts
    }
  }, [phase])

  // DEV: Ctrl+D → skip to solo_viewing with base scenario (remove before production)
  const devSkip = useCallback(() => {
    setLiveScenario(BASE_SCENARIO); setPersonas(BASE_SCENARIO.personas)
    setBeatIndex(0); setAnnotation(''); setTags([]); setDisputes({}); setSelfConfirms({})
    setPhase('solo_viewing'); setIsPlaying(true)
  }, [])

  useEffect(() => {
    const k = (e) => {
      // Ignore keyboard shortcuts when user is typing in an input/textarea
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return

      if (e.code === 'Space')      { e.preventDefault(); handlePlayPause() }
      if (e.code === 'ArrowRight') { advance(); logBeat(beatIndex + 1, 'keyboard') }
      if (e.code === 'KeyT')       handleBubbleCycle()
      if (e.code === 'KeyS')       setShowScript(p => !p)
      if (e.code === 'KeyD' && e.ctrlKey) { e.preventDefault(); devSkip() }
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [handlePlayPause, advance, beatIndex, handleBubbleCycle, devSkip])

  const hBtn = (active, color = '#7ab0e8') => ({
    color:       active ? color : '#3a3a3a',
    borderColor: active ? `${color}44` : 'rgba(255,255,255,0.06)',
    background:  active ? `${color}0e` : 'transparent',
  })

  // ── Phase routing ──────────────────────────────────────────

  if (phase === 'study_loading')
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4" style={{ background: '#060810' }}>
        <span className="font-pixel text-[8px] tracking-[0.35em]" style={{ color: '#7ab0e8' }}>ASIDE</span>
        {studyError ? (
          <div className="flex flex-col items-center gap-3">
            <div className="font-mono text-[11px]" style={{ color: '#e87a7a' }}>{studyError}</div>
            <div className="font-mono text-[9px] text-white/30">Please verify the scenario ID is correct and the server is running</div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: '6px', height: '6px', borderRadius: '50%', background: '#7ab0e8',
                  animation: `blink 1.1s ${i * 0.28}s ease-in-out infinite`,
                }} />
              ))}
            </div>
            <div className="font-mono text-[10px] text-white/50">
              {sync.connected ? 'Loading scenario...' : 'Connecting to server...'}
            </div>
            <div className="font-mono text-[8px] text-white/25">
              Scenario ID: {STUDY_ID} / Role: {STUDY_ROLE || 'A'}
            </div>
          </div>
        )}
      </div>
    )

  if (phase === 'study_intro')
    return (
      <div className="relative h-screen overflow-y-auto select-none"
        style={{ background: 'linear-gradient(180deg, #0a1628 0%, #060d18 50%, #040810 100%)' }}>
        {/* Curtain panels */}
        <div className="fixed left-0 top-0 bottom-0 w-[13%] z-0 pointer-events-none" style={{
          background: 'linear-gradient(90deg, #0d1a30 0%, transparent 100%)',
        }} />
        <div className="fixed right-0 top-0 bottom-0 w-[13%] z-0 pointer-events-none" style={{
          background: 'linear-gradient(-90deg, #0d1a30 0%, transparent 100%)',
        }} />

        <div className="relative z-[1] flex flex-col items-center px-6 pt-16 pb-10 min-h-screen justify-center gap-8">
          {/* Logo with spotlight */}
          <div className="relative flex flex-col items-center gap-3 anim-fadeIn" style={{ animationDuration: '1.5s' }}>
            <div className="absolute inset-0 -top-24 -bottom-20 pointer-events-none" style={{
              background: 'radial-gradient(ellipse 140px 180px at 50% 40%, rgba(122,176,232,0.15) 0%, rgba(122,176,232,0.04) 40%, transparent 70%)',
            }} />
            <span className="font-pixel tracking-[0.5em] relative"
              style={{ fontSize: '28px', color: '#7ab0e8', textShadow: '0 0 40px rgba(122,176,232,0.4), 0 0 80px rgba(122,176,232,0.15)' }}>
              ASIDE
            </span>
            <span className="font-mono text-[10px] tracking-[0.25em]" style={{ color: 'rgba(122,176,232,0.50)' }}>
              DYADIC REFLECTION THEATER
            </span>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2 anim-fadeIn" style={{ animationDelay: '0.2s', animationDuration: '1.2s' }}>
            <div className="w-16 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(122,176,232,0.3))' }} />
            <span style={{ color: '#7ab0e8', fontSize: '6px', opacity: 0.4 }}>&#9670;</span>
            <div className="w-16 h-px" style={{ background: 'linear-gradient(-90deg, transparent, rgba(122,176,232,0.3))' }} />
          </div>

          {/* Prompt */}
          <div className="text-center anim-fadeIn" style={{ animationDelay: '0.35s', animationDuration: '1.2s' }}>
            <p className="text-[15px] leading-[2.0]" style={{
              color: '#e8dcc8',
              fontFamily: 'var(--font-ui)',
              fontWeight: 400,
              letterSpacing: '0.08em',
            }}>
              Tonight, you will witness<br/>
              that conversation again as a spectator.
            </p>
          </div>

          {/* Enter button */}
          <button
            onClick={() => { setPhase('study_input'); logPhase('study_intro', 'study_input') }}
            className="anim-fadeIn tracking-[0.25em] px-12 py-4 rounded-sm border transition-all duration-500 cursor-pointer"
            style={{
              animationDelay: '0.6s',
              color: '#7ab0e8',
              borderColor: 'rgba(122,176,232,0.35)',
              background: 'rgba(122,176,232,0.04)',
              fontFamily: '"Inter", sans-serif',
              fontSize: '15px',
              letterSpacing: '0.3em',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(122,176,232,0.12)'
              e.currentTarget.style.borderColor = 'rgba(122,176,232,0.6)'
              e.currentTarget.style.boxShadow = '0 0 30px rgba(122,176,232,0.1)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(122,176,232,0.04)'
              e.currentTarget.style.borderColor = 'rgba(122,176,232,0.35)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            ENTER
          </button>

          {/* Controls hint */}
          <div className="flex gap-5 font-mono text-[8px] tracking-wider" style={{ color: 'rgba(122,176,232,0.18)' }}>
            <span>SPACE Play</span>
            <span>→ Next beat</span>
            <span>T Toggle bubbles</span>
          </div>
        </div>
      </div>
    )

  if (phase === 'intro')
    return <IntroScreen scenario={liveScenario} onBegin={handleBegin} />

  if (phase === 'lobby')
    return <LobbyScreen proximity={proximity} onBothReady={handleLobbyReady} onBack={handleLobbyBack} />

  if (phase === 'input')
    return <ConflictInput onScenarioReady={handleScenarioReady} syncMode={sync.mode} />

  // Study input: show ConflictInput for concerns/feelings, but skip API — use preloaded scenario
  if (phase === 'study_input')
    return <ConflictInput
      onScenarioReady={(_, rawInput) => {
        // Log the full input content (concern, feeling, context)
        let parsedInput = {}
        try { parsedInput = JSON.parse(rawInput || '{}') } catch(e) {}
        log('study_input_submitted', {
          scenario: DIRECT_SCENARIO,
          concern: parsedInput.concern || '',
          feeling: parsedInput.feeling || '',
          context: parsedInput.context || '',
        })
        // Preload scenario data
        const scenario = directScenarioData || initScenario
        setLiveScenario(scenario)
        setPersonas(scenario.personas)
        setBeatIndex(0); setAnnotation(''); setTags([]); setDisputes({}); setSelfConfirms({})
        // Go to waiting phase (simulates partner sync)
        setPhase('study_waiting')
        logPhase('study_input', 'study_waiting')
      }}
      syncMode={sync.mode}
      skipGeneration={true}
    />

  // self_confirm now happens IN the theater (bubbleVisibility='self')
  // No separate SelfConfirmScreen routing needed

  if (phase === 'study_waiting')
    return <StudyWaitingOverlay onReady={() => {
      setPhase('self_confirm')
      setBubbleVisibility('self')
      setIsPlaying(false)
      logPhase('study_waiting', 'self_confirm')
    }} />

  if (phase === 'study_archive')
    return (
      <div className="flex flex-col items-center justify-center h-screen" style={{
        background: 'linear-gradient(180deg, #0a0c1a 0%, #060810 100%)',
      }}>
        <div className="flex flex-col items-center gap-6 max-w-lg px-8">
          {/* Logo */}
          <div className="flex flex-col items-center gap-2">
            <span className="font-pixel text-[14px] tracking-[0.4em]" style={{ color: '#7ab0e8' }}>ASIDE</span>
            <div className="w-16 h-px" style={{ background: 'linear-gradient(90deg, transparent, #7ab0e8, transparent)' }} />
            <span className="font-mono text-[9px] tracking-[0.25em] text-white/25">DYADIC REFLECTION THEATER</span>
          </div>

          {/* Show info */}
          <div className="flex flex-col items-center gap-3 mt-4">
            <p className="text-[22px] tracking-wider text-white/80" style={{
              fontFamily: 'var(--font-ui)',
            }}>
              {liveScenario.title || 'Conflict Review'}
            </p>
            {liveScenario.subtitle && (
              <p className="font-mono text-[10px] tracking-[0.2em] text-white/25 italic">{liveScenario.subtitle}</p>
            )}
          </div>

          {/* Cast */}
          <div className="flex items-center gap-8 mt-2">
            <div className="flex flex-col items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ background: personas.A?.color || '#7ab0e8' }} />
              <span className="font-mono text-[10px]" style={{ color: personas.A?.color || '#7ab0e8' }}>{personas.A?.name || 'A'}</span>
            </div>
            <span className="font-mono text-[8px] text-white/15">×</span>
            <div className="flex flex-col items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ background: personas.B?.color || '#e87a7a' }} />
              <span className="font-mono text-[10px]" style={{ color: personas.B?.color || '#e87a7a' }}>{personas.B?.name || 'B'}</span>
            </div>
          </div>

          {/* Role indicator */}
          <div className="mt-2 px-4 py-2 rounded-lg" style={{
            background: 'rgba(122,176,232,0.06)',
            border: '1px solid rgba(122,176,232,0.15)',
          }}>
            <p className="font-mono text-[10px] text-center" style={{ color: 'rgba(122,176,232,0.6)' }}>
              Your perspective: <span style={{ color: personas[myRole]?.color || '#7ab0e8' }}>{personas[myRole]?.name || myRole}</span>
            </p>
          </div>

          {/* Completed label */}
          <p className="text-[13px] text-center leading-relaxed text-white/35 mt-2" style={{
            fontFamily: 'var(--font-ui)',
          }}>
            Session complete.
          </p>

          {/* Action buttons */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => {
                setBeatIndex(0); setPhase('solo_viewing'); setIsPlaying(true)
                logPhase('study_archive', 'solo_viewing')
              }}
              className="px-8 py-3 rounded-sm border transition-all duration-300 cursor-pointer font-mono text-[13px] tracking-[0.15em]"
              style={{ color: '#7ab0e8', borderColor: 'rgba(122,176,232,0.35)', background: 'rgba(122,176,232,0.04)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(122,176,232,0.12)'; e.currentTarget.style.borderColor = 'rgba(122,176,232,0.6)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(122,176,232,0.04)'; e.currentTarget.style.borderColor = 'rgba(122,176,232,0.35)' }}
            >
              REPLAY
            </button>
            <button
              onClick={downloadLog}
              className="px-8 py-3 rounded-sm border transition-all duration-300 cursor-pointer font-mono text-[13px] tracking-[0.15em]"
              style={{ color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            >
              EXPORT
            </button>
          </div>
        </div>
      </div>
    )

  if (phase === 'divergence')
    return (
      <DivergenceCards
        beats={beats}
        personas={personas}
        disputes={disputes}
        selfConfirms={selfConfirms}
        myRole={myRole}
        onReplay={() => {
          setBeatIndex(0); setPhase('solo_viewing'); setIsPlaying(true)
          setDisputes({}); setSelfConfirms({})
          logPhase('divergence', 'solo_viewing')
          syncSend('sync:phase', { phase: 'solo_viewing' })
          syncSend('sync:beat', { beatIndex: 0, isPlaying: true })
        }}
        onArchive={directScenarioData ? () => { setPhase('study_archive'); logPhase('divergence', 'study_archive') } : null}
        onReconfigure={() => { setPhase('input'); setDisputes({}); setSelfConfirms({}) }}
        onExport={downloadLog}
      />
    )

  // ── Playback phases: solo_viewing, together_viewing (and legacy simulation/reflection/end) ──
  return (
    <div className="flex flex-col h-screen overflow-hidden select-none" style={{ background: '#060810' }}>

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 h-9 border-b flex-shrink-0 relative z-40" style={{ background: '#060810', borderColor: 'rgba(122,176,232,0.12)' }}>
        <div className="flex items-center gap-2">
          <span className="font-pixel text-[8px] tracking-[0.3em]" style={{ color: '#7ab0e8' }}>
            ASIDE
          </span>
          {(phase === 'solo_viewing' || phase === 'together_viewing' || phase === 'divergence') && (
            <button onClick={handleGoBack}
              className="font-mono text-[9px] px-2 py-0.5 rounded border transition-all hover:opacity-80"
              style={{ color: 'rgba(255,255,255,0.45)', borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
              ← Go back
            </button>
          )}
          <SyncStatusBadge />
        </div>
        <span className="font-mono text-[10px] text-white/20 tracking-widest truncate mx-4">
          {liveScenario.title}
          {phase === 'solo_viewing' && <span className="ml-2 text-[8px]" style={{ color: 'rgba(122,176,232,0.35)' }}>· Annotate partner's thoughts</span>}
          {phase === 'self_confirm' && <span className="ml-2 text-[8px]" style={{ color: 'rgba(122,176,232,0.35)' }}>· Confirm your own thoughts</span>}
          {phase === 'together_viewing' && <span className="ml-2 text-[8px]" style={{ color: 'rgba(122,176,232,0.35)' }}>· Watch together</span>}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={handleBubbleCycle}
            className="font-mono text-[9px] px-2 py-0.5 rounded border transition-all relative"
            style={hBtn(bubbleVisibility !== 'none')}
            title={`Bubbles: ${bubbleVisibility === 'none' ? 'Off' : bubbleVisibility === 'partner' ? 'Partner only' : 'All'} (T)`}>
            <img src={import.meta.env.BASE_URL + 'assets/ui/icons/thought.png'} alt="" className="inline w-3.5 h-3.5" style={{imageRendering:'pixelated'}} /> {bubbleVisibility === 'none' ? 'Off' : bubbleVisibility === 'partner' ? 'Partner' : 'All'}
          </button>
          <button onClick={() => setShowScript(p => !p)}
            className="font-mono text-[9px] px-2 py-0.5 rounded border transition-all"
            style={hBtn(showScript, '#7ab0e8')} title="Script panel (S)">
            📜
          </button>
          <button onClick={() => setShowSceneSelector(p => !p)}
            className="font-mono text-[9px] px-2 py-0.5 rounded border transition-all"
            style={hBtn(showSceneSelector, '#90c878')} title="Switch scene">
            🎬 Scene
          </button>
        </div>
      </header>

      {/* ── Main stage ── */}
      <div className="flex-1 overflow-hidden flex relative">

        <div className="relative overflow-hidden flex-1">
          <Theater
            beat={currentBeat}
            personas={personas}
            thoughtVisibility={thoughtVisibility}
            scene={liveScenario.scene || 'bedroom_night'}
            sceneElements={liveScenario.sceneElements}
            phase={phase}
            myRole={myRole}
            disputes={phase === 'self_confirm' ? { ...disputes, ...selfConfirms } : disputes}
            onDispute={phase === 'self_confirm' ? handleSelfConfirmDispute : handleDispute}
            onMark={handleMark}
          />

          {/* Waiting for partner at the phase gate */}
          {waitingForPhase && (
            <WaitingOverlay targetPhase={waitingForPhase} />
          )}

          {phase === 'reflection' && (
            <ReflectionOverlay
              beat={currentBeat}
              personas={personas}
              annotation={annotation}
              onAnnotationChange={(v) => { setAnnotation(v); logReflect(v.length) }}
              onContinue={handleReflectionDone}
            />
          )}

          {phase === 'end' && (
            <DivergenceSummary
              beats={beats}
              personas={personas}
              disputes={disputes}
              partnerDisputes={sync.mode === 'together' ? partnerDisputes : null}
              tags={tags}
              annotation={annotation}
              onReplay={() => {
                setBeatIndex(0); setPhase('solo_viewing'); setIsPlaying(true)
                logPhase('end', 'solo_viewing')
                syncSend('sync:phase', { phase: 'solo_viewing' })
                syncSend('sync:beat', { beatIndex: 0, isPlaying: true })
              }}
              onReconfigure={() => setPhase('input')}
              onExport={downloadLog}
            />
          )}

        </div>

        {showScript && (
          <ScriptPanel
            beats={beats}
            beatIndex={beatIndex}
            personas={personas}
            tags={tags}
            disputes={disputes}
            onSeek={handleSelectBeat}
          />
        )}

        {/* Scene selector panel */}
        {showSceneSelector && (
          <div className="absolute top-0 right-0 z-50 anim-fadeIn"
            style={{ width: '220px', maxHeight: '100%', background: 'rgba(6,8,16,0.97)', border: '1px solid rgba(122,176,232,0.15)', borderTop: 'none', borderRight: 'none', backdropFilter: 'blur(14px)' }}>
            <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: 'rgba(122,176,232,0.1)' }}>
              <span className="font-mono text-[10px] text-white/50">Select scene</span>
              <button onClick={() => setShowSceneSelector(false)} className="text-[10px] text-white/20 hover:text-white/50">✕</button>
            </div>
            <div className="overflow-y-auto p-2 grid grid-cols-2 gap-1.5" style={{ maxHeight: 'calc(100vh - 80px)', scrollbarWidth: 'thin' }}>
              {Object.entries(SCENE_PRESETS).map(([key, preset]) => {
                const active = (liveScenario.scene || 'bedroom_night') === key
                return (
                  <button key={key} onClick={() => { handleSceneChange(key); setShowSceneSelector(false) }}
                    className="relative rounded overflow-hidden transition-all text-left"
                    style={{
                      border: `1.5px solid ${active ? (preset.ambientColor || '#7ab0e8') : 'rgba(255,255,255,0.07)'}`,
                      boxShadow: active ? `0 0 8px ${preset.ambientColor || '#7ab0e8'}40` : 'none',
                      aspectRatio: '16/9',
                    }}>
                    <div style={{ position: 'absolute', inset: 0, background: preset.fallbackGradient, opacity: active ? 0.9 : 0.5 }} />
                    <div className="absolute inset-0 flex items-end justify-center pb-1">
                      <span className="font-mono text-[8px]"
                        style={{ color: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)' }}>
                        {preset.label}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <ConflictTimeline
        beats={beats}
        beatIndex={beatIndex}
        isPlaying={isPlaying}
        phase={phase}
        tags={tags}
        onPlayPause={handlePlayPause}
        onSelectBeat={handleSelectBeat}
        onPrevBeat={handlePrevBeat}
        onNextBeat={handleNextBeat}
        onFinishAnnotation={
          phase === 'self_confirm' ? handleSelfConfirmToSoloViewing :
          phase === 'solo_viewing' ? handleFinishAnnotation :
          phase === 'together_viewing' ? (() => { setPhase('divergence'); logPhase('together_viewing', 'divergence'); uploadLog() }) :
          null
        }
        finishLabel={
          phase === 'self_confirm' ? 'Done confirming, annotate partner →' :
          phase === 'solo_viewing' ? 'Finish annotation →' :
          phase === 'together_viewing' ? 'View divergence →' :
          null
        }
      />
    </div>
  )
}
