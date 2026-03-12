import { useState, useEffect, useCallback, useRef } from 'react'
import { scenario }         from './data/scenario'
import IntroScreen          from './components/IntroScreen'
import PersonaSetup         from './components/PersonaSetup'
import Theater              from './components/Theater'
import EmotionBar           from './components/EmotionBar'
import ConflictTimeline     from './components/ConflictTimeline'
import ReflectionOverlay    from './components/ReflectionOverlay'

// ─────────────────────────────────────────────────────────────
//  App — Root state machine
//
//  Phase flow:
//    intro → setup → simulation → reflection → end
//
//  "setup" is the backstage (Goffman) phase where users
//  configure their personas and scene atmosphere before
//  the front-stage simulation begins.
// ─────────────────────────────────────────────────────────────

export default function App() {
  const [phase, setPhase]           = useState('intro')
  const [beatIndex, setBeatIndex]   = useState(0)
  const [isPlaying, setIsPlaying]   = useState(false)
  const [showThoughts, setShowThoughts] = useState(true)
  const [annotation, setAnnotation] = useState('')

  // Mutable personas — start from scenario defaults, overridden in setup
  const [personas, setPersonas]     = useState(scenario.personas)
  const [sceneType, setSceneType]   = useState('enclosed')

  const beats       = scenario.beats
  const currentBeat = beats[beatIndex]
  const timerRef    = useRef(null)

  // ── Playback ─────────────────────────────────────────────
  const advance = useCallback(() => {
    const next = beatIndex + 1
    if (next >= beats.length) { setIsPlaying(false); return }
    const nb = beats[next]
    setBeatIndex(next)
    if (nb.isPausePoint) {
      setIsPlaying(false)
      setTimeout(() => setPhase('reflection'), 1200)
    }
  }, [beatIndex, beats])

  useEffect(() => {
    if (!isPlaying || phase !== 'simulation') return
    timerRef.current = setTimeout(advance, currentBeat?.duration ?? 4000)
    return () => clearTimeout(timerRef.current)
  }, [isPlaying, beatIndex, phase, currentBeat, advance])

  const handlePlayPause = useCallback(() => {
    if (phase === 'reflection' || phase === 'intro' || phase === 'setup') return
    if (phase === 'end') {
      setBeatIndex(0); setPhase('simulation'); setIsPlaying(true); return
    }
    setIsPlaying(p => !p)
  }, [phase])

  const handleSelectBeat = useCallback((idx) => {
    clearTimeout(timerRef.current)
    setBeatIndex(idx)
    setIsPlaying(false)
    setPhase('simulation')
  }, [])

  // ── Phase transitions ─────────────────────────────────────
  // Intro → Setup (backstage)
  const handleBegin = useCallback(() => {
    setPhase('setup')
  }, [])

  // Setup → Simulation (front stage)
  const handleSetupConfirm = useCallback((finalPersonas, scene) => {
    setPersonas(finalPersonas)
    setSceneType(scene)
    setBeatIndex(0)
    setAnnotation('')
    setPhase('simulation')
    setIsPlaying(true)
  }, [])

  // Reflection → End
  const handleReflectionDone = useCallback(() => setPhase('end'), [])

  // ── Keyboard shortcuts ────────────────────────────────────
  useEffect(() => {
    const k = (e) => {
      if (e.code === 'Space')      { e.preventDefault(); handlePlayPause() }
      if (e.code === 'ArrowRight') advance()
      if (e.code === 'KeyT')       setShowThoughts(p => !p)
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [handlePlayPause, advance])

  // ── Phase renders ─────────────────────────────────────────
  if (phase === 'intro') {
    return <IntroScreen scenario={scenario} onBegin={handleBegin} />
  }

  if (phase === 'setup') {
    return <PersonaSetup initialPersonas={personas} onConfirm={handleSetupConfirm} />
  }

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden select-none">

      {/* Header */}
      <header className="flex items-center justify-between px-5 h-9 bg-black border-b border-white/5 flex-shrink-0">
        <span className="font-pixel text-[8px] tracking-[0.3em]" style={{ color: '#7ab0e8' }}>
          MIRROR
        </span>
        <span className="font-mono text-[10px] text-white/25 tracking-widest">
          {scenario.title}
        </span>
        <button
          onClick={() => setShowThoughts(p => !p)}
          className="font-mono text-[9px] px-2 py-0.5 rounded border transition-all"
          style={{
            color:       showThoughts ? '#7ab0e8' : '#444',
            borderColor: showThoughts ? 'rgba(122,176,232,0.35)' : 'rgba(255,255,255,0.07)',
            background:  showThoughts ? 'rgba(122,176,232,0.07)' : 'transparent',
          }}
        >
          💭 SUBTEXT
        </button>
      </header>

      {/* Main stage */}
      <div className="flex-1 overflow-hidden relative">
        <Theater
          beat={currentBeat}
          personas={personas}
          showThoughts={showThoughts}
          sceneType={sceneType}
        />

        {/* Reflection overlay */}
        {phase === 'reflection' && (
          <ReflectionOverlay
            beat={currentBeat}
            personas={personas}
            annotation={annotation}
            onAnnotationChange={setAnnotation}
            onContinue={handleReflectionDone}
          />
        )}

        {/* End screen */}
        {phase === 'end' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 gap-5 anim-fadeIn">
            <p className="font-pixel text-[9px] text-white/40 tracking-widest">
              SIMULATION COMPLETE
            </p>
            {annotation.trim() && (
              <div className="glass rounded-xl px-6 py-4 max-w-sm text-center">
                <p className="font-mono text-[8px] text-white/28 mb-2 tracking-widest">你的反思</p>
                <p
                  className="text-sm text-white/55 leading-snug"
                  style={{ fontFamily: '"PingFang SC","Inter",sans-serif' }}
                >
                  {annotation}
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setBeatIndex(0); setPhase('simulation'); setIsPlaying(true) }}
                className="font-mono text-xs px-5 py-2.5 rounded-lg border border-white/12 text-white/40 hover:bg-white/5 transition-all"
              >
                重新播放
              </button>
              <button
                onClick={() => setPhase('setup')}
                className="font-mono text-xs px-5 py-2.5 rounded-lg border border-white/12 text-white/40 hover:bg-white/5 transition-all"
              >
                重新配置
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <EmotionBar beat={currentBeat} personas={personas} phase={phase} />
      <ConflictTimeline
        beats={beats}
        beatIndex={beatIndex}
        isPlaying={isPlaying}
        phase={phase}
        onPlayPause={handlePlayPause}
        onSelectBeat={handleSelectBeat}
      />

    </div>
  )
}
