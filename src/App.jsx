import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { scenario as BASE_SCENARIO }                from './data/scenario'
import { scenario_liuhaoze }                        from './data/scenario_liuhaoze'

// Available pre-built scenarios for study mode
const STUDY_SCENARIOS = {
  default: BASE_SCENARIO,
  liuhaoze: scenario_liuhaoze,
}
// SCENE_PRESETS used in Theater.jsx; PersonaEditor removed from App
import {
  initSession, log, logPhase, logBeat, logSeek,
  logTag, logDispute, logToggle, logReflect,
  logArchetype, logAppearanceSet, downloadLog,
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
// EmotionBar removed: Stephy advised against elements without direct research justification
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
//  Rationale for Self-Confirm-First (pilot finding + retroactive interference):
//  1. Editing partner's thoughts first would contaminate self-recall via retroactive
//     interference — pilot P1 reported "knowing B's perspective weakened my original anger"
//  2. Self-Confirm before Solo preserves clean ground truth for perspective-taking accuracy
//  3. Compatible with Peer-First principle: DP6 prevents AI-anchoring of self-assessment,
//     which is already handled by showing AI inference (not raw answer) during self-confirm
//  Both phases happen in the theater view.
//
//  Lobby phase only in Together mode
//  together_viewing only in Together mode
// ─────────────────────────────────────────────────────────────

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
const STUDY_ID   = URL_PARAMS.get('study')
const STUDY_ROLE = URL_PARAMS.get('role')?.toUpperCase()
const PREPARE_MODE = URL_PARAMS.get('mode') === 'prepare'

// ── Main App ─────────────────────────────────────────────────
export default function App() {
  const sync = useSyncContext()

  // Researcher prepare mode — completely separate screen
  if (PREPARE_MODE) {
    return <PrepareScreen />
  }

  // Determine initial phase
  const initialPhase = STUDY_ID ? 'study_loading' : 'intro'

  const [phase, setPhase]               = useState(initialPhase)
  const [beatIndex, setBeatIndex]       = useState(0)
  const [isPlaying, setIsPlaying]       = useState(false)
  // Bubble visibility: 'none' | 'self' | 'partner' | 'both'
  // Default = 'partner' (DP6: Peer-First — only see other person's thoughts in solo_viewing)
  // self_confirm phase sets to 'self', together_viewing sets to 'both'
  const [bubbleVisibility, setBubbleVisibility] = useState('partner')
  const [showScript, setShowScript]     = useState(false)
  const [annotation, setAnnotation]     = useState('')

  const [liveScenario, setLiveScenario] = useState(BASE_SCENARIO)
  const [personas, setPersonas]         = useState(BASE_SCENARIO.personas)

  const [tags, setTags]                 = useState([])
  const [disputes, setDisputes]         = useState({})
  const [selfConfirms, setSelfConfirms] = useState({})

  // Together mode state
  const [proximity, setProximity]               = useState(null)
  const [partnerDisputes, setPartnerDisputes]   = useState(null)

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
        sync.createRoom('colocated')
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
      setStudyError(err.message || '加载场景失败')
    })
  }, [STUDY_ID, phase, sync.connected]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    initSession({
      scenarioId: STUDY_ID || BASE_SCENARIO.id,
      appVersion: '0.7.0',
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

    // Playback sync
    unsubs.push(sync.onMessage('sync:beat', (msg) => {
      isRemote.current = true
      setBeatIndex(msg.beatIndex)
      if (msg.isPlaying !== undefined) setIsPlaying(msg.isPlaying)
      isRemote.current = false
    }))

    unsubs.push(sync.onMessage('sync:phase', (msg) => {
      isRemote.current = true
      setPhase(msg.phase)
      isRemote.current = false
    }))

    // Scenario from partner (role B receives this)
    unsubs.push(sync.onMessage('scenario:ready', (msg) => {
      if (msg.scenario) {
        isRemote.current = true
        setLiveScenario(msg.scenario)
        setPersonas(msg.scenario.personas)
        setBeatIndex(0); setAnnotation(''); setTags([]); setDisputes({}); setSelfConfirms({})
        setPhase('solo_viewing')
        setIsPlaying(false)  // Don't auto-play — wait for either person to press play
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

    // Partner annotations reveal (at end phase)
    unsubs.push(sync.onMessage('annotation:reveal', (msg) => {
      setPartnerDisputes(msg.partnerDisputes || {})
    }))

    return () => unsubs.forEach(fn => fn())
  }, [sync.mode]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync helper: send if in together mode and not a remote update ──
  const syncSend = useCallback((type, payload) => {
    if (sync.mode === 'together' && !isRemote.current) {
      sync.send(type, payload)
    }
  }, [sync])

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

  const isPlaybackPhase = phase === 'solo_viewing' || phase === 'together_viewing' || phase === 'self_confirm'
  useEffect(() => {
    if (!isPlaying || !isPlaybackPhase) return
    timerRef.current = setTimeout(advance, currentBeat?.duration ?? 4000)
    return () => clearTimeout(timerRef.current)
  }, [isPlaying, beatIndex, isPlaybackPhase, currentBeat, advance])

  const BLOCKING_PHASES = new Set(['intro', 'input', 'reflection', 'lobby', 'divergence', 'study_loading'])

  const handlePlayPause = useCallback(() => {
    if (BLOCKING_PHASES.has(phase)) return
    if (phase === 'end') {
      setBeatIndex(0); setPhase('solo_viewing'); setIsPlaying(true)
      logPhase('end', 'solo_viewing')
      syncSend('sync:phase', { phase: 'solo_viewing' })
      syncSend('sync:beat', { beatIndex: 0, isPlaying: true })
      return
    }

    // Together mode: directly start or pause, syncing to partner via sync:beat
    if (sync.mode === 'together') {
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
    if (phase !== 'solo_viewing' && phase !== 'together_viewing') {
      setPhase('solo_viewing')
    }
    logSeek(idx)
    syncSend('sync:beat', { beatIndex: idx, isPlaying: false })
  }, [phase, syncSend])

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
    // V4: Self-Confirm FIRST — establish ground truth before editing partner (retroactive interference)
    setPhase('self_confirm')
    setBubbleVisibility('self')
    logPhase('input', 'self_confirm')

    if (sync.mode === 'together') {
      setIsPlaying(false)
      sync.send('scenario:generated', { scenario })
      syncSend('sync:phase', { phase: 'self_confirm' })
    } else {
      // Solo: auto-play into self_confirm
      setIsPlaying(true)
      logBeat(0, 'auto')
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

  // self_confirm → solo_viewing (confirm own first, then edit partner)
  const handleSelfConfirmToSoloViewing = useCallback(() => {
    setIsPlaying(false)
    setBeatIndex(0)
    setPhase('solo_viewing')
    setBubbleVisibility('partner')
    logPhase('self_confirm', 'solo_viewing')
    syncSend('sync:phase', { phase: 'solo_viewing' })
    log('self_confirm_finished', { selfConfirmCount: Object.keys(selfConfirms).length })
  }, [selfConfirms, syncSend])

  // solo_viewing → together_viewing or divergence (user clicks "完成标注")
  const handleFinishAnnotation = useCallback(() => {
    setIsPlaying(false)
    log('annotation_finished', { disputeCount: Object.keys(disputes).length })
    if (sync.mode === 'together') {
      sync.send('annotation:self_confirms', { selfConfirms })
      setBeatIndex(0)
      setPhase('together_viewing')
      setBubbleVisibility('both')
      setIsPlaying(false)
      logPhase('solo_viewing', 'together_viewing')
      syncSend('sync:phase', { phase: 'together_viewing' })
    } else {
      setPhase('divergence')
      logPhase('solo_viewing', 'divergence')
    }
  }, [disputes, sync, syncSend, selfConfirms])

  // SelfConfirmScreen: confirm/edit a single beat
  const handleSelfConfirm = useCallback((role, beatId, data) => {
    const key = `${role}-${beatId}`
    setSelfConfirms(prev => ({ ...prev, [key]: data }))
    log('self_confirm', { key, status: data.status, emotionChanged: data.emotion !== data.originalEmotion })
  }, [])

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
      if (update.status === 'confirmed') logAssumptionConfirm(personaId, beatId)
      else if (update.status === 'disputed') logAssumptionDispute(personaId, beatId)
      else if (update.status === 'edited') {
        logAssumptionEdit(personaId, beatId, {
          originalLen: update.original?.length ?? 0,
          editedLen: update.text?.length ?? 0,
          emotionChanged: update.emotion !== update.originalEmotion,
          newEmotion: update.emotion,
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
  const myRole = STUDY_ROLE || sync.role || 'A'  // study mode uses URL param, solo defaults to A
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
            <div className="font-mono text-[9px] text-white/30">请确认场景 ID 正确且服务器正在运行</div>
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
              {sync.connected ? '正在加载场景...' : '正在连接服务器...'}
            </div>
            <div className="font-mono text-[8px] text-white/25">
              场景 ID: {STUDY_ID} / 角色: {STUDY_ROLE || 'A'}
            </div>
          </div>
        )}
      </div>
    )

  if (phase === 'intro')
    return <IntroScreen scenario={liveScenario} onBegin={handleBegin} />

  if (phase === 'lobby')
    return <LobbyScreen proximity={proximity} onBothReady={handleLobbyReady} onBack={handleLobbyBack} />

  if (phase === 'input')
    return <ConflictInput onScenarioReady={handleScenarioReady} syncMode={sync.mode} />

  // self_confirm now happens IN the theater (bubbleVisibility='self')
  // No separate SelfConfirmScreen routing needed

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
          <SyncStatusBadge />
        </div>
        <span className="font-mono text-[10px] text-white/20 tracking-widest truncate mx-4">
          {liveScenario.title}
          {phase === 'solo_viewing' && <span className="ml-2 text-[8px]" style={{ color: 'rgba(122,176,232,0.35)' }}>· 标注对方的内心</span>}
          {phase === 'self_confirm' && <span className="ml-2 text-[8px]" style={{ color: 'rgba(122,176,232,0.35)' }}>· 确认自己的内心</span>}
          {phase === 'together_viewing' && <span className="ml-2 text-[8px]" style={{ color: 'rgba(122,176,232,0.35)' }}>· 一起观看</span>}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={handleBubbleCycle}
            className="font-mono text-[9px] px-2 py-0.5 rounded border transition-all relative"
            style={hBtn(bubbleVisibility !== 'none')}
            title={`气泡: ${bubbleVisibility === 'none' ? '关闭' : bubbleVisibility === 'partner' ? '仅对方' : '全部'} (T)`}>
            <img src="/assets/ui/icons/thought.png" alt="" className="inline w-3.5 h-3.5" style={{imageRendering:'pixelated'}} /> {bubbleVisibility === 'none' ? '关闭' : bubbleVisibility === 'partner' ? '对方' : '全部'}
          </button>
          <button onClick={() => setShowScript(p => !p)}
            className="font-mono text-[9px] px-2 py-0.5 rounded border transition-all"
            style={hBtn(showScript, '#7ab0e8')} title="剧本面板 (S)">
            <img src="/assets/ui/icons/script.svg" alt="" className="inline w-3.5 h-3.5" style={{imageRendering:'auto'}} />
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
            disputes={disputes}
            onDispute={handleDispute}
            onMark={handleMark}
          />

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
      </div>

      <ConflictTimeline
        beats={beats}
        beatIndex={beatIndex}
        isPlaying={isPlaying}
        phase={phase}
        tags={tags}
        onPlayPause={handlePlayPause}
        onSelectBeat={handleSelectBeat}
        onFinishAnnotation={
          phase === 'self_confirm' ? handleSelfConfirmToSoloViewing :
          phase === 'solo_viewing' ? handleFinishAnnotation :
          null
        }
        finishLabel={
          phase === 'self_confirm' ? '确认完成，标注对方 →' :
          phase === 'solo_viewing' ? '完成标注 →' :
          null
        }
      />
    </div>
  )
}
