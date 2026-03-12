import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { scenario as BASE_SCENARIO }      from './data/scenario'
import { applyConflictProfile, DEFAULT_PROFILE } from './utils/applyConflictProfile'
import {
  initSession, log, logPhase, logBeat, logSeek,
  logTag, logDispute, logProfile, logToggle, logReflect,
  downloadLog,
} from './utils/behaviorLog'

import IntroScreen     from './components/IntroScreen'
import ConflictInput   from './components/ConflictInput'
import PersonaSetup    from './components/PersonaSetup'
import ConflictProfile from './components/ConflictProfile'
import Theater         from './components/Theater'
import EmotionBar      from './components/EmotionBar'
import ConflictTimeline from './components/ConflictTimeline'
import ReflectionOverlay from './components/ReflectionOverlay'
import ScriptPanel     from './components/ScriptPanel'

// ─────────────────────────────────────────────────────────────
//  App — Root state machine
//
//  Full phase flow:
//    intro → input → setup → profile → simulation → reflection → end
//
//  New in this iteration:
//    • ConflictInput phase: AI-powered RSL generation
//    • behaviorLog: event tracking throughout session
//    • liveScenario: dynamic scenario (from AI or fallback)
//    • Export button on end screen
// ─────────────────────────────────────────────────────────────

export default function App() {
  const [phase, setPhase]               = useState('intro')
  const [beatIndex, setBeatIndex]       = useState(0)
  const [isPlaying, setIsPlaying]       = useState(false)
  const [showThoughts, setShowThoughts] = useState(true)
  const [annotation, setAnnotation]     = useState('')
  const [sceneType, setSceneType]       = useState('enclosed')
  const [conflictProfile, setConflictProfile] = useState(DEFAULT_PROFILE)

  // Dynamic scenario (replaced by AI output after ConflictInput)
  const [liveScenario, setLiveScenario] = useState(BASE_SCENARIO)
  const [personas, setPersonas]         = useState(BASE_SCENARIO.personas)

  // Interaction state
  const [tags, setTags]             = useState([])
  const [disputes, setDisputes]     = useState({})
  const [showScript, setShowScript] = useState(false)

  // Profile-adjusted beats (re-computed on profile change)
  const beats = useMemo(
    () => applyConflictProfile(liveScenario.beats, conflictProfile),
    [liveScenario, conflictProfile],
  )

  const currentBeat = beats[beatIndex]
  const timerRef    = useRef(null)

  // Init session on mount
  useEffect(() => {
    initSession({ scenarioId: BASE_SCENARIO.id, appVersion: '0.4.0' })
  }, [])

  // ── Playback ───────────────────────────────────────────────
  const advance = useCallback(() => {
    const next = beatIndex + 1
    if (next >= beats.length) { setIsPlaying(false); return }
    const nb = beats[next]
    setBeatIndex(next)
    logBeat(next, 'auto')
    if (nb.isPausePoint) {
      setIsPlaying(false)
      setTimeout(() => {
        setPhase('reflection')
        logPhase('simulation', 'reflection')
      }, 1200)
    }
  }, [beatIndex, beats])

  useEffect(() => {
    if (!isPlaying || phase !== 'simulation') return
    timerRef.current = setTimeout(advance, currentBeat?.duration ?? 4000)
    return () => clearTimeout(timerRef.current)
  }, [isPlaying, beatIndex, phase, currentBeat, advance])

  const BLOCKING_PHASES = new Set(['intro', 'input', 'setup', 'profile', 'reflection'])

  const handlePlayPause = useCallback(() => {
    if (BLOCKING_PHASES.has(phase)) return
    if (phase === 'end') {
      setBeatIndex(0); setPhase('simulation'); setIsPlaying(true)
      logPhase('end', 'simulation')
      return
    }
    setIsPlaying(p => {
      log(p ? 'playback_pause' : 'playback_play', { beatIndex })
      return !p
    })
  }, [phase, beatIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectBeat = useCallback((idx) => {
    clearTimeout(timerRef.current)
    setBeatIndex(idx)
    setIsPlaying(false)
    setPhase('simulation')
    logSeek(idx)
  }, [])

  // ── Phase transitions ──────────────────────────────────────
  const handleBegin = useCallback(() => {
    setPhase('input')
    logPhase('intro', 'input')
  }, [])

  // ConflictInput → scenario generated
  const handleScenarioReady = useCallback((scenario, rawInput) => {
    setLiveScenario(scenario)
    setPersonas(scenario.personas)
    log('scenario_generated', {
      scenarioId: scenario.id,
      inputLength: rawInput.length,
    })
    setPhase('setup')
    logPhase('input', 'setup')
  }, [])

  // PersonaSetup confirms → go to conflict profile
  const handleSetupConfirm = useCallback((finalPersonas, scene) => {
    setPersonas(finalPersonas)
    setSceneType(scene)
    setPhase('profile')
    logPhase('setup', 'profile')
  }, [])

  // ConflictProfile confirms → apply, reset, start simulation
  const handleProfileConfirm = useCallback((profile) => {
    setConflictProfile(profile)
    setBeatIndex(0)
    setAnnotation('')
    setTags([])
    setDisputes({})
    setPhase('simulation')
    setIsPlaying(true)
    logProfile(profile)
    logPhase('profile', 'simulation')
    logBeat(0, 'auto')
  }, [])

  const handleReflectionDone = useCallback(() => {
    setPhase('end')
    logPhase('reflection', 'end')
  }, [])

  // ── Tag / mark ─────────────────────────────────────────────
  const handleMark = useCallback((emoji) => {
    setTags(prev => [...prev, { id: Date.now(), beatIndex, emoji }])
    logTag(emoji, beatIndex)
  }, [beatIndex])

  // ── Dispute ────────────────────────────────────────────────
  const handleDispute = useCallback((personaId, beatId, update) => {
    const key = `${personaId}-${beatId}`
    setDisputes(prev => {
      if (update === null) {
        return Object.fromEntries(Object.entries(prev).filter(([k]) => k !== key))
      }
      logDispute(personaId, beatId, update.original, update.text)
      return { ...prev, [key]: update }
    })
  }, [])

  // ── Subtext / Script toggles ───────────────────────────────
  const handleThoughtsToggle = useCallback(() => {
    setShowThoughts(p => { logToggle('thought', !p); return !p })
  }, [])

  const handleScriptToggle = useCallback(() => {
    setShowScript(p => { logToggle('script', !p); return !p })
  }, [])

  // ── Keyboard shortcuts ─────────────────────────────────────
  useEffect(() => {
    const k = (e) => {
      if (e.code === 'Space')      { e.preventDefault(); handlePlayPause() }
      if (e.code === 'ArrowRight') { advance(); logBeat(beatIndex + 1, 'keyboard') }
      if (e.code === 'KeyT')       handleThoughtsToggle()
      if (e.code === 'KeyS')       handleScriptToggle()
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [handlePlayPause, advance, beatIndex, handleThoughtsToggle, handleScriptToggle])

  // ── Phase renders ──────────────────────────────────────────
  if (phase === 'intro')
    return <IntroScreen scenario={liveScenario} onBegin={handleBegin} />

  if (phase === 'input')
    return <ConflictInput onScenarioReady={handleScenarioReady} />

  if (phase === 'setup')
    return <PersonaSetup initialPersonas={personas} onConfirm={handleSetupConfirm} />

  if (phase === 'profile')
    return <ConflictProfile personas={personas} onConfirm={handleProfileConfirm} />

  // ── Simulation / reflection / end ──────────────────────────
  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden select-none">

      {/* Header */}
      <header className="flex items-center justify-between px-5 h-9 bg-black border-b border-white/5 flex-shrink-0">
        <span className="font-pixel text-[8px] tracking-[0.3em]" style={{ color: '#7ab0e8' }}>
          MIRROR
        </span>
        <span className="font-mono text-[10px] text-white/25 tracking-widest">
          {liveScenario.title}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleThoughtsToggle}
            className="font-mono text-[9px] px-2 py-0.5 rounded border transition-all"
            style={{
              color:       showThoughts ? '#7ab0e8' : '#444',
              borderColor: showThoughts ? 'rgba(122,176,232,0.35)' : 'rgba(255,255,255,0.07)',
              background:  showThoughts ? 'rgba(122,176,232,0.07)' : 'transparent',
            }}
          >
            💭 SUBTEXT
          </button>
          <button
            onClick={handleScriptToggle}
            className="font-mono text-[9px] px-2 py-0.5 rounded border transition-all"
            style={{
              color:       showScript ? '#c0a0e8' : '#444',
              borderColor: showScript ? 'rgba(192,160,232,0.35)' : 'rgba(255,255,255,0.07)',
              background:  showScript ? 'rgba(192,160,232,0.07)' : 'transparent',
            }}
          >
            📋 剧本
          </button>
        </div>
      </header>

      {/* Main stage + optional sidebar */}
      <div className="flex-1 overflow-hidden flex relative">

        <div className="relative overflow-hidden flex-1">
          <Theater
            beat={currentBeat}
            personas={personas}
            showThoughts={showThoughts}
            sceneType={sceneType}
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
            <EndScreen
              annotation={annotation}
              tags={tags}
              disputes={disputes}
              onReplay={() => { setBeatIndex(0); setPhase('simulation'); setIsPlaying(true); logPhase('end', 'simulation') }}
              onAdjustProfile={() => setPhase('profile')}
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

      <EmotionBar
        beat={currentBeat}
        personas={personas}
        phase={phase}
        profile={conflictProfile}
      />
      <ConflictTimeline
        beats={beats}
        beatIndex={beatIndex}
        isPlaying={isPlaying}
        phase={phase}
        tags={tags}
        onPlayPause={handlePlayPause}
        onSelectBeat={handleSelectBeat}
      />
    </div>
  )
}

// ── End screen (extracted component) ─────────────────────────
function EndScreen({ annotation, tags, disputes, onReplay, onAdjustProfile, onReconfigure, onExport }) {
  const disputeCount = Object.keys(disputes).length

  return (
    <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center z-50 gap-5 anim-fadeIn">
      <p className="font-pixel text-[9px] text-white/40 tracking-widest">SIMULATION COMPLETE</p>

      {/* Session stats */}
      <div className="glass rounded-xl px-6 py-3 flex gap-6">
        <Stat label="标记时刻" value={tags.length} />
        <Stat label="标注内心" value={disputeCount} />
        <Stat label="反思记录" value={annotation.trim() ? '✓' : '—'} />
      </div>

      {/* Annotation */}
      {annotation.trim() && (
        <div className="glass rounded-xl px-6 py-4 max-w-sm text-center">
          <p className="font-mono text-[8px] text-white/28 mb-2 tracking-widest">你的反思</p>
          <p className="text-sm text-white/55 leading-snug"
            style={{ fontFamily: '"PingFang SC","Inter",sans-serif' }}>
            {annotation}
          </p>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="glass rounded-xl px-5 py-3 max-w-sm">
          <p className="font-mono text-[8px] text-white/28 mb-2 tracking-widest">标记的时刻</p>
          <div className="flex flex-wrap gap-1.5">
            {tags.map(t => (
              <span key={t.id} className="font-mono text-[10px] text-white/50">
                {t.emoji} Beat {t.beatIndex + 1}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 justify-center">
        <ActionBtn onClick={onReplay}         label="重新播放" />
        <ActionBtn onClick={onAdjustProfile}  label="调整模式" />
        <ActionBtn onClick={onReconfigure}    label="新的冲突" accent />
        <ActionBtn onClick={onExport}         label="⬇ 导出日志" highlight />
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="font-mono text-[16px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
        {value}
      </span>
      <span className="font-mono text-[8px] text-white/28 tracking-widest">{label}</span>
    </div>
  )
}

function ActionBtn({ onClick, label, accent = false, highlight = false }) {
  const base = accent
    ? { color: '#7ab0e8', borderColor: 'rgba(122,176,232,0.35)', background: 'rgba(122,176,232,0.07)' }
    : highlight
    ? { color: '#58c878', borderColor: 'rgba(88,200,120,0.35)', background: 'rgba(88,200,120,0.07)' }
    : { color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.12)', background: 'transparent' }

  return (
    <button
      onClick={onClick}
      className="font-mono text-xs px-5 py-2.5 rounded-lg border transition-all hover:opacity-80"
      style={base}
    >
      {label}
    </button>
  )
}
