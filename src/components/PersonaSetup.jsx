// ─────────────────────────────────────────────────────────────
//  PersonaSetup — "幕后" (Backstage) configuration screen
//
//  Inspired by Goffman's Dramaturgy:
//    Front stage  → Theater (simulation)
//    Back stage   → PersonaSetup (preparation / identity construction)
//
//  Users configure minimal semantic identity:
//    • Color palette (映射到角色服装 + 氛围)
//    • 1 visual feature (高辨识度像素特征)
//    • Scene atmosphere (影响 proxemics 算法的空间参数)
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import PixelChar from './PixelChar'

// ── Color palettes ────────────────────────────────────────────
const PALETTES = {
  A: [
    {
      id: 'blue', label: '海蓝',
      color: '#7ab0e8', darkColor: '#4a7cd4',
      outfitColor: '#4a7cd4', outfitDark: '#2a5298',
      hairColor: '#8B4513',
      glowColor: 'rgba(122,176,232,0.55)',
      thoughtBg: 'rgba(80,130,210,0.13)', thoughtBorder: '#5882d0',
    },
    {
      id: 'purple', label: '紫荆',
      color: '#c080e8', darkColor: '#9050c0',
      outfitColor: '#8050c0', outfitDark: '#5030a0',
      hairColor: '#2a1830',
      glowColor: 'rgba(192,128,232,0.55)',
      thoughtBg: 'rgba(130,80,200,0.13)', thoughtBorder: '#9060d0',
    },
    {
      id: 'teal', label: '青瓷',
      color: '#60c8c0', darkColor: '#3a9890',
      outfitColor: '#3a9890', outfitDark: '#247870',
      hairColor: '#1a3020',
      glowColor: 'rgba(96,200,192,0.55)',
      thoughtBg: 'rgba(60,160,150,0.13)', thoughtBorder: '#4ab0a8',
    },
  ],
  B: [
    {
      id: 'red', label: '赤焰',
      color: '#e87a7a', darkColor: '#c84a4a',
      outfitColor: '#b84a4a', outfitDark: '#7a2a2a',
      hairColor: '#3a2820',
      glowColor: 'rgba(232,122,122,0.55)',
      thoughtBg: 'rgba(210,80,80,0.13)', thoughtBorder: '#c85050',
    },
    {
      id: 'amber', label: '琥珀',
      color: '#e8b050', darkColor: '#c07828',
      outfitColor: '#b07020', outfitDark: '#804a10',
      hairColor: '#2a1808',
      glowColor: 'rgba(232,176,80,0.55)',
      thoughtBg: 'rgba(200,140,50,0.13)', thoughtBorder: '#c89030',
    },
    {
      id: 'slate', label: '岩灰',
      color: '#90a8c0', darkColor: '#607888',
      outfitColor: '#506070', outfitDark: '#304050',
      hairColor: '#151820',
      glowColor: 'rgba(144,168,192,0.55)',
      thoughtBg: 'rgba(90,100,120,0.13)', thoughtBorder: '#607080',
    },
  ],
}

// ── Visual features ───────────────────────────────────────────
const FEATURES = [
  { id: 'none',     label: '默认', icon: '○' },
  { id: 'glasses',  label: '眼镜', icon: '目' },
  { id: 'longHair', label: '长发', icon: '‖' },
  { id: 'beard',    label: '胡须', icon: '﹏' },
]

// ── Scene atmospheres ─────────────────────────────────────────
// Semantic choice: affects proxemic parameters + visual density
const SCENES = [
  {
    id: 'enclosed',
    label: '封闭空间',
    sublabel: '室内 · 情感密度高',
    desc: '墙壁将压力封锁，无处可逃',
    icon: '⌂',
  },
  {
    id: 'open',
    label: '开放空间',
    sublabel: '室外 · 疏离感强',
    desc: '距离可以延伸，却带来更深的孤独',
    icon: '◎',
  },
]

// ── Single persona panel ──────────────────────────────────────
function PersonaPanel({ personaId, config, onChange }) {
  const palettes = PALETTES[personaId]
  const currentPalette = palettes.find(p => p.id === config.paletteId) || palettes[0]

  // Build a preview persona object
  const previewPersona = {
    ...config,
    id: personaId,
    outfitColor: currentPalette.outfitColor,
    outfitDark:  currentPalette.outfitDark,
    hairColor:   currentPalette.hairColor,
    color:       currentPalette.color,
  }

  return (
    <div
      className="flex flex-col gap-4 rounded-xl p-5"
      style={{
        background: `rgba(${personaId === 'A' ? '74,124,212' : '184,74,74'},0.06)`,
        border: `1px solid rgba(${personaId === 'A' ? '122,176,232' : '232,122,122'},0.18)`,
        flex: 1,
        minWidth: 0,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{
            background: currentPalette.color,
            boxShadow: `0 0 6px ${currentPalette.color}`,
          }}
        />
        <span
          className="font-mono text-[9px] tracking-[0.2em] uppercase"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          Partner {personaId}
        </span>
      </div>

      {/* Character preview */}
      <div className="flex justify-center items-end" style={{ height: '110px' }}>
        <PixelChar
          persona={previewPersona}
          emotion="neutral"
          facing={personaId === 'A' ? 'right' : 'left'}
          lean="none"
          scale={1.0}
          glow={true}
          feature={config.feature}
        />
      </div>

      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[9px] text-white/30 tracking-widest">名字</label>
        <input
          type="text"
          value={config.name}
          onChange={e => onChange({ ...config, name: e.target.value })}
          maxLength={6}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/80 focus:outline-none focus:border-white/25 transition-colors font-mono text-center"
          style={{ fontFamily: '"JetBrains Mono","PingFang SC",monospace' }}
        />
      </div>

      {/* Color palette */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-[9px] text-white/30 tracking-widest">色调</label>
        <div className="flex gap-2">
          {palettes.map(p => (
            <button
              key={p.id}
              onClick={() => onChange({ ...config, paletteId: p.id, ...p })}
              className="flex flex-col items-center gap-1 flex-1 rounded-lg py-2 transition-all"
              style={{
                background: config.paletteId === p.id
                  ? `${p.color}20` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${config.paletteId === p.id ? p.color + '70' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  background: p.outfitColor,
                  boxShadow: config.paletteId === p.id
                    ? `0 0 8px ${p.color}` : 'none',
                }}
              />
              <span className="font-mono text-[8px]" style={{ color: config.paletteId === p.id ? p.color : '#666' }}>
                {p.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Feature selection */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-[9px] text-white/30 tracking-widest">标志特征</label>
        <div className="grid grid-cols-2 gap-1.5">
          {FEATURES.map(f => (
            <button
              key={f.id}
              onClick={() => onChange({ ...config, feature: f.id })}
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-all"
              style={{
                background: config.feature === f.id
                  ? `${currentPalette.color}18` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${config.feature === f.id
                  ? currentPalette.color + '50' : 'rgba(255,255,255,0.07)'}`,
              }}
            >
              <span className="text-[11px]" style={{ color: config.feature === f.id ? currentPalette.color : '#555' }}>
                {f.icon}
              </span>
              <span
                className="font-mono text-[9px]"
                style={{ color: config.feature === f.id ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.35)' }}
              >
                {f.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────
export default function PersonaSetup({ initialPersonas, onConfirm }) {
  const defaultA = {
    ...initialPersonas.A,
    paletteId: 'blue',
    feature: 'none',
  }
  const defaultB = {
    ...initialPersonas.B,
    paletteId: 'red',
    feature: 'none',
  }

  const [configA, setConfigA] = useState(defaultA)
  const [configB, setConfigB] = useState(defaultB)
  const [sceneType, setSceneType] = useState('enclosed')

  const handleConfirm = () => {
    // Build final persona objects (merge config on top of initial)
    const paletteA = PALETTES.A.find(p => p.id === configA.paletteId) || PALETTES.A[0]
    const paletteB = PALETTES.B.find(p => p.id === configB.paletteId) || PALETTES.B[0]

    const personaA = { ...initialPersonas.A, ...paletteA, name: configA.name, feature: configA.feature }
    const personaB = { ...initialPersonas.B, ...paletteB, name: configB.name, feature: configB.feature }

    onConfirm({ A: personaA, B: personaB }, sceneType)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black overflow-auto py-8 px-6">

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(40,30,20,0.6) 0%, transparent 70%)',
      }} />

      <div className="relative w-full max-w-2xl flex flex-col gap-6 anim-fadeIn">

        {/* Header */}
        <div className="text-center flex flex-col gap-1">
          <span className="font-pixel text-[8px] tracking-[0.35em]" style={{ color: '#7ab0e8' }}>
            MIRROR
          </span>
          <div className="w-12 h-px mx-auto my-1" style={{
            background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)',
          }} />
          <p className="font-mono text-[10px] text-white/30 tracking-[0.2em]">
            配置角色 / CONFIGURE PERSONAS
          </p>
          <p className="text-sm text-white/40 mt-1" style={{ fontFamily: '"PingFang SC","Inter",sans-serif' }}>
            选择能代表你们的外观，这将影响模拟场景的呈现方式。
          </p>
        </div>

        {/* Persona panels */}
        <div className="flex gap-4">
          <PersonaPanel personaId="A" config={configA} onChange={setConfigA} />
          <PersonaPanel personaId="B" config={configB} onChange={setConfigB} />
        </div>

        {/* Scene atmosphere */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[9px] text-white/30 tracking-widest">场景氛围</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="font-mono text-[8px] text-white/20">影响人际距离算法</span>
          </div>
          <div className="flex gap-3">
            {SCENES.map(s => (
              <button
                key={s.id}
                onClick={() => setSceneType(s.id)}
                className="flex-1 rounded-xl px-4 py-3.5 text-left transition-all"
                style={{
                  background: sceneType === s.id
                    ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.025)',
                  border: `1px solid ${sceneType === s.id
                    ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}`,
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[14px]" style={{ color: sceneType === s.id ? '#fff' : '#555' }}>
                    {s.icon}
                  </span>
                  <span
                    className="font-mono text-[10px] tracking-wide"
                    style={{ color: sceneType === s.id ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)' }}
                  >
                    {s.label}
                  </span>
                  <span
                    className="font-mono text-[8px]"
                    style={{ color: sceneType === s.id ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.18)' }}
                  >
                    {s.sublabel}
                  </span>
                </div>
                <p
                  className="text-[11px] leading-snug"
                  style={{
                    color: sceneType === s.id ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.2)',
                    fontFamily: '"PingFang SC","Inter",sans-serif',
                  }}
                >
                  {s.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Confirm */}
        <div className="flex justify-center pt-1">
          <button
            onClick={handleConfirm}
            className="font-mono text-[12px] tracking-[0.2em] px-10 py-3.5 rounded-xl border transition-all duration-300"
            style={{
              color: '#7ab0e8',
              borderColor: 'rgba(122,176,232,0.4)',
              background: 'rgba(122,176,232,0.07)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(122,176,232,0.15)'
              e.currentTarget.style.borderColor = 'rgba(122,176,232,0.7)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(122,176,232,0.07)'
              e.currentTarget.style.borderColor = 'rgba(122,176,232,0.4)'
            }}
          >
            开始重现 / BEGIN RECONSTRUCTION
          </button>
        </div>

      </div>
    </div>
  )
}
