import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { scenario as BASE_SCENARIO }                from './data/scenario'
import { APPEARANCE_OPTIONS, SCENE_PRESETS }        from './data/dramaElements'
import {
  initSession, log, logPhase, logBeat, logSeek,
  logTag, logDispute, logToggle, logReflect,
  logArchetype, logAppearanceSet, downloadLog,
  logAssumptionConfirm, logAssumptionDispute,
  logAssumptionEdit, logAssumptionClear,
} from './utils/behaviorLog'
import { useSyncContext } from './sync/SyncContext'

import IntroScreen       from './components/IntroScreen'
import LobbyScreen       from './components/LobbyScreen'
import ConflictInput     from './components/ConflictInput'
import Theater           from './components/Theater'
import EmotionBar        from './components/EmotionBar'
import ConflictTimeline  from './components/ConflictTimeline'
import ReflectionOverlay from './components/ReflectionOverlay'
import DivergenceSummary from './components/DivergenceSummary'
import ScriptPanel       from './components/ScriptPanel'
import SyncStatusBadge   from './components/SyncStatusBadge'

// ─────────────────────────────────────────────────────────────
//  App — Root state machine
//  Phase flow: intro → [lobby] → input → simulation → reflection → end
//  Lobby phase only in Together mode
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

// ── PersonaEditor + SceneSelector panel ─────────────────────
function PersonaEditor({ personas, onUpdate, currentScene, onSceneChange, onClose }) {
  const [tab, setTab] = useState('scene')
  const hairStyles   = APPEARANCE_OPTIONS.hairStyles
  const outfitStyles = APPEARANCE_OPTIONS.outfitStyles
  const accessories  = APPEARANCE_OPTIONS.accessories

  function Chip({ active, onClick, label, color = '#7ab0e8' }) {
    return (
      <button onClick={onClick}
        className="px-2 py-0.5 rounded font-mono text-[9px] transition-all"
        style={{
          background:  active ? `${color}22` : 'rgba(255,255,255,0.04)',
          border:      `1px solid ${active ? `${color}55` : 'rgba(255,255,255,0.08)'}`,
          color:       active ? color : 'rgba(255,255,255,0.38)',
        }}>
        {label}
      </button>
    )
  }

  function PersonaSection({ id }) {
    const p = personas[id]
    const accent = p.color || (id === 'A' ? '#7ab0e8' : '#e87a7a')
    return (
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: accent }} />
          <span className="font-mono text-[10px] tracking-[0.15em]" style={{ color: accent }}>
            {p.name} · {id === 'A' ? '你' : '对方'}
          </span>
        </div>
        <div className="mb-2">
          <p className="font-mono text-[8px] text-white/22 tracking-wider mb-1.5">发型</p>
          <div className="flex flex-wrap gap-1">
            {hairStyles.map(h => (
              <Chip key={h.id} active={p.hairStyle === h.id} label={h.label} color={accent}
                onClick={() => onUpdate(id, { hairStyle: h.id })} />
            ))}
          </div>
        </div>
        <div className="mb-2">
          <p className="font-mono text-[8px] text-white/22 tracking-wider mb-1.5">服装</p>
          <div className="flex flex-wrap gap-1">
            {outfitStyles.map(o => (
              <Chip key={o.id} active={p.outfitStyle === o.id} label={o.label} color={accent}
                onClick={() => onUpdate(id, { outfitStyle: o.id })} />
            ))}
          </div>
        </div>
        <div>
          <p className="font-mono text-[8px] text-white/22 tracking-wider mb-1.5">配件</p>
          <div className="flex flex-wrap gap-1">
            {accessories.map(a => (
              <Chip key={a.id} active={(p.accessory || 'none') === a.id} label={a.label} color={accent}
                onClick={() => onUpdate(id, { accessory: a.id })} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  function SceneSection() {
    return (
      <div>
        <p className="font-mono text-[8px] text-white/22 tracking-wider mb-2">选择场景</p>
        <div className="grid grid-cols-2 gap-1.5">
          {Object.entries(SCENE_PRESETS).map(([key, preset]) => {
            const active = currentScene === key
            return (
              <button key={key} onClick={() => onSceneChange(key)}
                className="relative rounded overflow-hidden transition-all"
                style={{
                  border: `1.5px solid ${active ? preset.ambientColor : 'rgba(255,255,255,0.07)'}`,
                  boxShadow: active ? `0 0 12px ${preset.ambientColor}40` : 'none',
                  aspectRatio: '16/9',
                }}>
                <div style={{ position: 'absolute', inset: 0, background: preset.fallbackGradient, opacity: active ? 0.9 : 0.55 }} />
                <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%,-50%)',
                  width: '14px', height: '14px', borderRadius: '50%', background: preset.ambientColor, filter: 'blur(5px)', opacity: 0.6 }} />
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
                  <span className="font-mono text-[8px]"
                    style={{ color: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)' }}>
                    {preset.label}
                  </span>
                  {active && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: preset.ambientColor }} />}
                </div>
              </button>
            )
          })}
        </div>
        <p className="font-mono text-[7px] text-white/15 mt-2">场景切换立即生效</p>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 flex items-start justify-end pointer-events-none" style={{ top: 0, zIndex: 50 }}>
      <div className="pointer-events-auto relative flex flex-col anim-fadeIn"
        style={{ width: '230px', maxHeight: 'calc(100% - 8px)', background: 'rgba(7,9,16,0.97)',
          border: '1px solid rgba(255,255,255,0.09)', borderTop: 'none', borderRight: 'none', backdropFilter: 'blur(14px)' }}>
        <div className="flex items-center justify-between px-4 py-2 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex gap-0">
            {[['scene','场景'], ['persona','角色']].map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)}
                className="font-mono text-[9px] px-3 py-1 transition-all"
                style={{ color: tab === t ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.25)',
                  borderBottom: tab === t ? '1px solid rgba(255,255,255,0.4)' : '1px solid transparent' }}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="font-mono text-[10px] text-white/20 hover:text-white/50 transition-colors">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pt-3 pb-3" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
          {tab === 'scene' ? <SceneSection /> : (
            <>
              <PersonaSection id="A" />
              <div className="border-t mb-4" style={{ borderColor: 'rgba(255,255,255,0.05)' }} />
              <PersonaSection id="B" />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main App ─────────────────────────────────────────────────
export default function App() {
  const sync = useSyncContext()

  const [phase, setPhase]               = useState('intro')
  const [beatIndex, setBeatIndex]       = useState(0)
  const [isPlaying, setIsPlaying]       = useState(false)
  // Bubble visibility: 'none' | 'partner' | 'both'
  // In together mode default='partner' (only see other person's thoughts)
  // In solo mode default='both' (see everything)
  const [bubbleVisibility, setBubbleVisibility] = useState(() =>
    sync.mode === 'together' ? 'partner' : 'both'
  )
  const [showScript, setShowScript]     = useState(false)
  const [showPersonaEditor, setShowPersonaEditor] = useState(false)
  const [annotation, setAnnotation]     = useState('')

  const [liveScenario, setLiveScenario] = useState(BASE_SCENARIO)
  const [personas, setPersonas]         = useState(BASE_SCENARIO.personas)

  const [tags, setTags]                 = useState([])
  const [disputes, setDisputes]         = useState({})

  // Together mode state
  const [proximity, setProximity]               = useState(null)
  const [partnerDisputes, setPartnerDisputes]   = useState(null)
  const [playReady, setPlayReady]               = useState(false)   // "I pressed play, waiting for partner"
  const [partnerPlayReady, setPartnerPlayReady] = useState(false)   // partner pressed play

  const beats       = liveScenario.beats
  const currentBeat = beats[beatIndex]
  const timerRef    = useRef(null)
  const isRemote    = useRef(false)  // prevents echo loops for sync

  useEffect(() => {
    initSession({
      scenarioId: BASE_SCENARIO.id,
      appVersion: '0.7.0',
      mode: sync.mode,
      role: sync.role,
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
        setBeatIndex(0); setAnnotation(''); setTags([]); setDisputes({})
        setPhase('simulation')
        setIsPlaying(false)  // Don't auto-play — require both to press play
        setPlayReady(false); setPartnerPlayReady(false)
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

    // Ready-to-play gate
    unsubs.push(sync.onMessage('sync:play_partner_ready', () => {
      setPartnerPlayReady(true)
    }))

    unsubs.push(sync.onMessage('sync:play_go', (msg) => {
      // Both ready → start playback simultaneously
      isRemote.current = true
      setPlayReady(false)
      setPartnerPlayReady(false)
      if (msg.beatIndex !== undefined) setBeatIndex(msg.beatIndex)
      setIsPlaying(true)
      log('playback_play', { beatIndex: msg.beatIndex ?? beatIndex, trigger: 'sync_go' })
      isRemote.current = false
    }))

    unsubs.push(sync.onMessage('sync:play_cancel', () => {
      setPartnerPlayReady(false)
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
      setTimeout(() => {
        setPhase('reflection')
        logPhase('simulation', 'reflection')
        syncSend('sync:phase', { phase: 'reflection' })
      }, 1200)
      return
    }
    const nb = beats[next]
    setBeatIndex(next)
    logBeat(next, 'auto')
    syncSend('sync:beat', { beatIndex: next, isPlaying: !nb.isPausePoint })
    if (nb.isPausePoint) setIsPlaying(false)
  }, [beatIndex, beats, syncSend])

  useEffect(() => {
    if (!isPlaying || phase !== 'simulation') return
    timerRef.current = setTimeout(advance, currentBeat?.duration ?? 4000)
    return () => clearTimeout(timerRef.current)
  }, [isPlaying, beatIndex, phase, currentBeat, advance])

  const BLOCKING_PHASES = new Set(['intro', 'input', 'reflection', 'lobby'])

  const handlePlayPause = useCallback(() => {
    if (BLOCKING_PHASES.has(phase)) return
    if (phase === 'end') {
      setBeatIndex(0); setPhase('simulation'); setIsPlaying(true)
      logPhase('end', 'simulation')
      syncSend('sync:phase', { phase: 'simulation' })
      syncSend('sync:beat', { beatIndex: 0, isPlaying: true })
      return
    }

    // Together mode: use ready-to-play gate for starting playback
    if (sync.mode === 'together' && !isPlaying) {
      if (playReady) {
        // Cancel ready state
        setPlayReady(false)
        setPartnerPlayReady(false)
        sync.send('sync:play_cancel', {})
        log('play_ready_cancel', { beatIndex })
      } else {
        // Signal readiness
        setPlayReady(true)
        sync.send('sync:play_ready', { beatIndex })
        log('play_ready', { beatIndex })
      }
      return
    }

    // Together mode: pausing is immediate (relay to partner)
    if (sync.mode === 'together' && isPlaying) {
      setIsPlaying(false)
      log('playback_pause', { beatIndex })
      syncSend('sync:beat', { beatIndex, isPlaying: false })
      return
    }

    // Solo mode: toggle directly
    setIsPlaying(p => {
      const next = !p
      log(next ? 'playback_play' : 'playback_pause', { beatIndex })
      return next
    })
  }, [phase, beatIndex, syncSend, sync, isPlaying, playReady]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectBeat = useCallback((idx) => {
    clearTimeout(timerRef.current)
    setBeatIndex(idx); setIsPlaying(false); setPhase('simulation'); logSeek(idx)
    syncSend('sync:beat', { beatIndex: idx, isPlaying: false })
  }, [syncSend])

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
    setBeatIndex(0); setAnnotation(''); setTags([]); setDisputes({})
    setPhase('simulation')
    logPhase('input', 'simulation')

    if (sync.mode === 'together') {
      // Together: don't auto-play, require both to press play
      setIsPlaying(false)
      setPlayReady(false); setPartnerPlayReady(false)
      sync.send('scenario:generated', { scenario })
      syncSend('sync:phase', { phase: 'simulation' })
    } else {
      // Solo: auto-play as before
      setIsPlaying(true)
      logBeat(0, 'auto')
    }
  }, [sync, syncSend])

  const handleReflectionDone = useCallback(() => {
    setPhase('end'); logPhase('reflection', 'end')
    syncSend('sync:phase', { phase: 'end' })
    // Request partner's annotations
    if (sync.mode === 'together') {
      sync.requestPartnerAnnotations()
    }
  }, [sync, syncSend])

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
  const myRole = sync.role || 'A'  // solo mode defaults to A
  const thoughtVisibility = useMemo(() => {
    if (bubbleVisibility === 'none')    return { A: false, B: false }
    if (bubbleVisibility === 'both')    return { A: true,  B: true }
    // 'partner': only show the OTHER person's thoughts
    if (myRole === 'A') return { A: false, B: true }
    else                return { A: true,  B: false }
  }, [bubbleVisibility, myRole])

  useEffect(() => {
    const k = (e) => {
      if (e.code === 'Space')      { e.preventDefault(); handlePlayPause() }
      if (e.code === 'ArrowRight') { advance(); logBeat(beatIndex + 1, 'keyboard') }
      if (e.code === 'KeyT')       handleBubbleCycle()
      if (e.code === 'KeyS')       setShowScript(p => !p)
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [handlePlayPause, advance, beatIndex, handleBubbleCycle])

  const hBtn = (active, color = '#7ab0e8') => ({
    color:       active ? color : '#3a3a3a',
    borderColor: active ? `${color}44` : 'rgba(255,255,255,0.06)',
    background:  active ? `${color}0e` : 'transparent',
  })

  // ── Phase routing ──────────────────────────────────────────
  if (phase === 'intro')
    return <IntroScreen scenario={liveScenario} onBegin={handleBegin} />

  if (phase === 'lobby')
    return <LobbyScreen proximity={proximity} onBothReady={handleLobbyReady} onBack={handleLobbyBack} />

  if (phase === 'input')
    return <ConflictInput onScenarioReady={handleScenarioReady} syncMode={sync.mode} />

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden select-none">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 h-9 bg-black border-b border-white/5 flex-shrink-0 relative z-40">
        <div className="flex items-center gap-2">
          <span className="font-pixel text-[8px] tracking-[0.3em]" style={{ color: '#7ab0e8' }}>
            ASIDE
          </span>
          <SyncStatusBadge />
        </div>
        <span className="font-mono text-[10px] text-white/20 tracking-widest truncate mx-4">
          {liveScenario.title}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={handleBubbleCycle}
            className="font-mono text-[9px] px-2 py-0.5 rounded border transition-all relative"
            style={hBtn(bubbleVisibility !== 'none')}
            title={`气泡: ${bubbleVisibility === 'none' ? '关闭' : bubbleVisibility === 'partner' ? '仅对方' : '全部'} (T)`}>
            💭 {bubbleVisibility === 'none' ? '关闭' : bubbleVisibility === 'partner' ? '对方' : '全部'}
          </button>
          <button onClick={() => setShowScript(p => !p)}
            className="font-mono text-[9px] px-2 py-0.5 rounded border transition-all"
            style={hBtn(showScript, '#c8a850')} title="剧本面板 (S)">
            📜 剧本
          </button>
          <button onClick={() => setShowPersonaEditor(p => !p)}
            className="font-mono text-[9px] px-2 py-0.5 rounded border transition-all"
            style={hBtn(showPersonaEditor, '#b878c8')} title="场景与角色设定">
            🎭 设定
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
                setBeatIndex(0); setPhase('simulation'); setIsPlaying(true)
                logPhase('end', 'simulation')
                syncSend('sync:phase', { phase: 'simulation' })
                syncSend('sync:beat', { beatIndex: 0, isPlaying: true })
              }}
              onReconfigure={() => setPhase('input')}
              onExport={downloadLog}
            />
          )}

          {showPersonaEditor && (
            <PersonaEditor
              personas={personas}
              onUpdate={handlePersonaUpdate}
              currentScene={liveScenario.scene || 'bedroom_night'}
              onSceneChange={handleSceneChange}
              onClose={() => setShowPersonaEditor(false)}
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

      <EmotionBar beat={currentBeat} personas={personas} phase={phase} />
      <ConflictTimeline
        beats={beats}
        beatIndex={beatIndex}
        isPlaying={isPlaying}
        phase={phase}
        tags={tags}
        onPlayPause={handlePlayPause}
        onSelectBeat={handleSelectBeat}
        playReady={playReady}
        partnerPlayReady={partnerPlayReady}
      />
    </div>
  )
}
