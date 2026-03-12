// ─────────────────────────────────────────────────────────────
//  PixelChar — SVG pixel-art style character
//  16×28 grid, rendered at 3.5× (56×98 px)
//
//  Props:
//    persona   — color data
//    emotion   — neutral|confrontational|defensive|angry|hurt|withdrawn|warm|sitting
//    facing    — 'right' | 'left'
//    lean      — 'forward' | 'back' | 'none'
//    scale     — number (1.0 = normal)
//    glow      — boolean
//    feature   — 'none' | 'glasses' | 'longHair' | 'beard'
// ─────────────────────────────────────────────────────────────

const SCALE = 3.5
const W = 16
const H = 28

function Px({ x, y, w = 1, h = 1, fill, opacity = 1 }) {
  return (
    <rect x={x} y={y} width={w} height={h}
      fill={fill} opacity={opacity} shapeRendering="crispEdges" />
  )
}

// ── Expressions ───────────────────────────────────────────────
function Eyes({ emotion }) {
  const e = '#1a1010'
  if (emotion === 'angry') return (
    <>
      <Px x={5} y={4} fill={e} /><Px x={9} y={4} fill={e} />
      <Px x={4} y={3} w={2} fill="#6a2a20" /><Px x={9} y={3} w={2} fill="#6a2a20" />
    </>
  )
  if (emotion === 'hurt' || emotion === 'withdrawn') return (
    <><Px x={5} y={5} fill={e} /><Px x={9} y={5} fill={e} /></>
  )
  if (emotion === 'warm' || emotion === 'surprised') return (
    <>
      <Px x={5} y={3} fill={e} /><Px x={5} y={4} fill={e} />
      <Px x={9} y={3} fill={e} /><Px x={9} y={4} fill={e} />
    </>
  )
  return <><Px x={5} y={4} fill={e} /><Px x={9} y={4} fill={e} /></>
}

function Mouth({ emotion }) {
  if (emotion === 'angry')           return <Px x={5} y={7} w={5} fill="#7a2a2a" />
  if (emotion === 'hurt')            return <><Px x={5} y={8} w={2} fill="#9a5040" /><Px x={8} y={7} w={2} fill="#9a5040" /></>
  if (emotion === 'warm')            return <><Px x={5} y={7} fill="#e06060" /><Px x={6} y={8} w={3} fill="#e06060" /><Px x={9} y={7} fill="#e06060" /></>
  if (emotion === 'confrontational') return <Px x={6} y={7} w={3} fill="#a05040" />
  if (emotion === 'surprised')       return <><Px x={6} y={7} w={3} fill="#1a1010" /><Px x={6} y={8} w={3} fill="#1a1010" /></>
  return <Px x={6} y={7} w={4} fill="#b06050" />
}

function Arms({ emotion, oc, od }) {
  if (emotion === 'defensive') return (
    <>
      <Px x={3} y={11} w={5} h={2} fill={od} /><Px x={7} y={11} w={5} h={2} fill={od} />
      <Px x={3} y={13} w={3} h={1} fill={oc} /><Px x={9} y={13} w={3} h={1} fill={oc} />
    </>
  )
  if (emotion === 'angry') return (
    <>
      <Px x={1} y={10} w={3} h={6} fill={oc} /><Px x={11} y={10} w={3} h={6} fill={oc} />
      <Px x={1} y={15} w={3} h={1} fill={od} /><Px x={11} y={15} w={3} h={1} fill={od} />
    </>
  )
  if (emotion === 'confrontational') return (
    <>
      <Px x={2} y={10} w={2} h={3} fill={oc} /><Px x={2} y={13} w={3} h={2} fill={oc} />
      <Px x={11} y={10} w={2} h={3} fill={oc} /><Px x={10} y={13} w={3} h={2} fill={oc} />
    </>
  )
  if (emotion === 'warm' || emotion === 'surprised') return (
    <>
      <Px x={2} y={10} w={2} h={7} fill={oc} /><Px x={1} y={14} w={2} h={2} fill={oc} />
      <Px x={11} y={10} w={2} h={7} fill={oc} /><Px x={12} y={14} w={2} h={2} fill={oc} />
    </>
  )
  return (
    <><Px x={2} y={10} w={2} h={7} fill={oc} /><Px x={11} y={10} w={2} h={7} fill={oc} /></>
  )
}

function SittingBody({ oc, od }) {
  return (
    <>
      <Px x={3} y={9}  w={9} h={8} fill={oc} />
      <Px x={2} y={10} w={2} h={5} fill={oc} />
      <Px x={11} y={10} w={2} h={5} fill={oc} />
      <Px x={3} y={17} w={4} h={4} fill={od} />
      <Px x={8} y={17} w={4} h={4} fill={od} />
      <Px x={3} y={21} w={3} h={2} fill="#1a1010" />
      <Px x={9} y={21} w={3} h={2} fill="#1a1010" />
    </>
  )
}

// ── Persona feature overlays ───────────────────────────────────
function FeatureOverlay({ feature, hairColor }) {
  if (!feature || feature === 'none') return null

  if (feature === 'glasses') return (
    <>
      {/* Left lens frame */}
      <rect x={4} y={3} width={3} height={2.5}
        fill="rgba(40,40,60,0.15)" stroke="#3a3a5a" strokeWidth={0.5}
        shapeRendering="crispEdges" />
      {/* Right lens frame */}
      <rect x={8} y={3} width={3} height={2.5}
        fill="rgba(40,40,60,0.15)" stroke="#3a3a5a" strokeWidth={0.5}
        shapeRendering="crispEdges" />
      {/* Bridge */}
      <Px x={7} y={4} fill="#4a4a6a" opacity={0.9} />
      {/* Side arms */}
      <Px x={3} y={3} fill="#3a3a5a" opacity={0.7} />
      <Px x={11} y={3} fill="#3a3a5a" opacity={0.7} />
    </>
  )

  if (feature === 'longHair') return (
    <>
      {/* Long strands down both sides, below the base hair */}
      <Px x={3} y={4} w={2} h={5} fill={hairColor} opacity={0.95} />
      <Px x={11} y={4} w={2} h={5} fill={hairColor} opacity={0.95} />
      <Px x={3} y={9}  w={1} h={4} fill={hairColor} opacity={0.75} />
      <Px x={11} y={9} w={1} h={4} fill={hairColor} opacity={0.75} />
      <Px x={3} y={13} w={1} h={2} fill={hairColor} opacity={0.45} />
      <Px x={11} y={13} w={1} h={2} fill={hairColor} opacity={0.45} />
    </>
  )

  if (feature === 'beard') return (
    <>
      <Px x={5} y={8} w={5} h={1} fill="#5a3418" opacity={0.85} />
      <Px x={6} y={9} w={3} h={1} fill="#4a2810" opacity={0.70} />
      <Px x={5} y={8} fill="#3a2010" opacity={0.4} />
      <Px x={9} y={8} fill="#3a2010" opacity={0.4} />
    </>
  )

  return null
}

// ── Lean angle calculation ─────────────────────────────────────
function leanDeg(lean, facing) {
  if (lean === 'none' || !lean) return 0
  const dir = facing === 'right' ? 1 : -1
  if (lean === 'forward') return dir * 6
  if (lean === 'back')    return dir * -5
  return 0
}

// ── Main component ─────────────────────────────────────────────
export default function PixelChar({
  persona,
  emotion  = 'neutral',
  facing   = 'right',
  lean     = 'none',
  scale    = 1.0,
  glow     = true,
  feature  = 'none',
}) {
  const isSitting = emotion === 'sitting'
  const oc = persona.outfitColor
  const od = persona.outfitDark

  const glowClass = emotion === 'warm'
    ? 'char-glow-warm'
    : persona.id === 'A' ? 'char-glow-A' : 'char-glow-B'

  const rotation = leanDeg(lean, facing)
  const flipX    = facing === 'left' ? -1 : 1

  return (
    <div
      className={`pixel ${glow ? glowClass : ''}`}
      style={{
        display:         'inline-block',
        width:           `${W * SCALE * scale}px`,
        height:          `${H * SCALE * scale}px`,
        transform:       `rotate(${rotation}deg) scaleX(${flipX}) scale(${scale})`,
        transformOrigin: 'bottom center',
        transition:      'transform 0.7s cubic-bezier(0.4,0,0.2,1), width 0.7s, height 0.7s',
      }}
    >
      <svg
        width={W * SCALE}
        height={H * SCALE}
        viewBox={`0 0 ${W} ${H}`}
        style={{ transform: `scaleX(${flipX})`, transformOrigin: 'center' }}
      >
        {/* Base hair */}
        <Px x={4} y={0} w={7} h={1} fill={persona.hairColor} />
        <Px x={3} y={1} w={9} h={2} fill={persona.hairColor} />
        <Px x={3} y={3} w={2} h={1} fill={persona.hairColor} />
        <Px x={10} y={3} w={2} h={1} fill={persona.hairColor} />

        {/* Long hair extension (rendered below base hair but above head edges) */}
        <FeatureOverlay feature={feature === 'longHair' ? 'longHair' : null} hairColor={persona.hairColor} />

        {/* Head */}
        <Px x={3} y={2} w={9} h={7} fill="#f0c8a8" />

        {/* Glasses (rendered above head, below eyes) */}
        <FeatureOverlay feature={feature === 'glasses' ? 'glasses' : null} hairColor={persona.hairColor} />

        {/* Face details */}
        <Eyes emotion={emotion} />
        <Mouth emotion={emotion} />

        {/* Beard (rendered below mouth) */}
        <FeatureOverlay feature={feature === 'beard' ? 'beard' : null} hairColor={persona.hairColor} />

        {/* Neck */}
        <Px x={6} y={9} w={3} h={1} fill="#f0c8a8" />

        {/* Body */}
        {isSitting
          ? <SittingBody oc={oc} od={od} />
          : <>
              <Px x={3} y={10} w={9} h={9} fill={oc} />
              <Px x={7} y={11} w={1} h={7} fill={od} opacity={0.5} />
              <Arms emotion={emotion} oc={oc} od={od} />
              <Px x={4} y={19} w={3} h={7} fill={od} />
              <Px x={8} y={19} w={3} h={7} fill={od} />
              <Px x={3} y={25} w={4} h={2} fill="#1a1010" />
              <Px x={8} y={25} w={4} h={2} fill="#1a1010" />
            </>
        }
      </svg>
    </div>
  )
}
