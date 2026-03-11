import { useState, useEffect, useCallback } from 'react'
import { conflictData } from './data/conflict'
import EvidenceLog from './components/EvidenceLog'
import Stage from './components/Stage'
import Console from './components/Console'
import Timeline from './components/Timeline'

export default function App() {
  const [turnIndex, setTurnIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [turns, setTurns] = useState(conflictData.turns)

  const currentTurn = turns[turnIndex]

  // ── Auto-play ──────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying) return
    if (turnIndex >= turns.length - 1) {
      setIsPlaying(false)
      return
    }
    const timer = setTimeout(() => setTurnIndex(i => i + 1), 3800)
    return () => clearTimeout(timer)
  }, [isPlaying, turnIndex, turns.length])

  // ── Edit assumption ────────────────────────────────────
  const handleEditSubtext = useCallback((turnId, field, value) => {
    setTurns(prev =>
      prev.map(t => (t.id === turnId ? { ...t, [field]: value } : t))
    )
  }, [])

  // ── Playback control ───────────────────────────────────
  const handlePlayPause = useCallback(() => {
    if (turnIndex >= turns.length - 1 && !isPlaying) {
      setTurnIndex(0)
      setIsPlaying(true)
    } else {
      setIsPlaying(p => !p)
    }
  }, [turnIndex, turns.length, isPlaying])

  const handleSelectTurn = useCallback((idx) => {
    setTurnIndex(idx)
    setIsPlaying(false)
  }, [])

  return (
    <div className="flex flex-col h-screen bg-[#0D1117] text-[#E6EDF3] overflow-hidden select-none">

      {/* ── Top header bar ───────────────────────────────── */}
      <header className="flex items-center justify-between px-5 py-2.5 border-b border-[#21262D] bg-[#0D1117] flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <span
            className="font-pixel text-[9px] tracking-[0.2em]"
            style={{ color: '#4F8EF7' }}
          >
            MIRROR
          </span>
          <span className="w-px h-4 bg-[#30363D]" />
          {/* Scene label */}
          <span className="font-mono text-[11px] text-[#6E7681] tracking-wider">
            {conflictData.scene}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Turn counter */}
          <span className="font-mono text-[11px] text-[#6E7681] bg-[#161B22] border border-[#30363D] px-2.5 py-1 rounded">
            TURN {turnIndex + 1} / {turns.length}
          </span>
          {/* Divergence badge */}
          <span
            className="font-mono text-[11px] px-2.5 py-1 rounded border"
            style={{
              color: divergenceColor(currentTurn.divergence),
              borderColor: `${divergenceColor(currentTurn.divergence)}50`,
              background: `${divergenceColor(currentTurn.divergence)}12`,
            }}
          >
            {currentTurn.divergence}% MISMATCH
          </span>
        </div>
      </header>

      {/* ── Main 3-column layout ─────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left panel */}
        <EvidenceLog
          turns={turns}
          currentTurnIndex={turnIndex}
          onSelectTurn={handleSelectTurn}
          userA={conflictData.userA}
          userB={conflictData.userB}
        />

        {/* Center: stage + timeline */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <Stage
            currentTurn={currentTurn}
            turnIndex={turnIndex}
            userA={conflictData.userA}
            userB={conflictData.userB}
          />
          <Timeline
            turns={turns}
            currentTurnIndex={turnIndex}
            onSelectTurn={handleSelectTurn}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            userA={conflictData.userA}
            userB={conflictData.userB}
          />
        </div>

        {/* Right panel */}
        <Console
          currentTurn={currentTurn}
          onEditSubtext={handleEditSubtext}
          userA={conflictData.userA}
          userB={conflictData.userB}
        />

      </div>
    </div>
  )
}

function divergenceColor(d) {
  if (d >= 85) return '#FF6B6B'
  if (d >= 65) return '#F0A500'
  return '#3FB950'
}
