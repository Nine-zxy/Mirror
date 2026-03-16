// ─────────────────────────────────────────────────────────────
//  PixelChar — Modular chibi SVG character
//  32×52 grid, rendered at 2.5× (80×130 px)
//
//  Chibi proportions: head ~40% of total height
//  Modular components:
//    Hair    → short | medium | long | tied | curly
//    Outfit  → casual | formal | sporty | cozy
//    Accessory → none | glasses | hat | scarf
//
//  Visual distinctiveness strategy:
//    • Hair silhouettes differ dramatically in shape, not just length
//      (tied = side-bun protrusion, curly = wide dome, long = side waterfalls)
//    • Outfit silhouettes differ in neckline + shoulder shape
//      (formal = V-lapel, sporty = hood, cozy = turtleneck)
//    • Accessories layered on top of hair/outfit
//    • Emotion expressed through eyes + mouth + arms
//
//  Props:
//    persona   — { outfitColor, outfitDark, hairColor, id,
//                  hairStyle, outfitStyle, accessory }
//    emotion   — neutral | angry | hurt | withdrawn | warm
//                | surprised | defensive | confrontational
//                | anxious | reflective | sitting
//    facing    — 'right' | 'left'
//    lean      — 'forward' | 'back' | 'none'
//    scale     — number (1.0 = normal)
//    glow      — boolean
// ─────────────────────────────────────────────────────────────

const SCALE = 2.5
const W     = 32
const H     = 52

// ── Colour palette ──────────────────────────────────────────
const SKIN       = '#f5d0b0'
const SKIN_LT    = '#fae0c8'
const SKIN_SHADE = '#ddb090'
const SKIN_DARK  = '#c89878'
const EYE        = '#1a1010'
const WHITE      = '#fffefa'
const SHOE       = '#2e2018'
const SHOE_SOLE  = '#1a0e08'
const NOSE_COL   = '#e8b898'
const BLUSH_COL  = '#f0a090'

// ── Pixel helper ────────────────────────────────────────────
function Px({ x, y, w = 1, h = 1, fill, op = 1 }) {
  return (
    <rect x={x} y={y} width={w} height={h}
      fill={fill} opacity={op} shapeRendering="crispEdges" />
  )
}

// ═══════════════════════════════════════════════════════════
//  HAIR COMPONENTS
//  Key silhouettes:
//    short  → compact crown, minimal sides
//    medium → wider, frames face to mid-ear
//    long   → crown + waterfalls down both sides past torso
//    tied   → pulled-back crown + side-bun (distinctive shape!)
//    curly  → wide dome, wider than head itself
// ═══════════════════════════════════════════════════════════

function ShortHair({ hc }) {
  return (
    <>
      {/* Crown */}
      <Px x={10} y={0}  w={12} h={1}  fill={hc} />
      <Px x={8}  y={1}  w={16} h={1}  fill={hc} />
      <Px x={7}  y={2}  w={18} h={2}  fill={hc} />
      {/* Sides just covering ears */}
      <Px x={6}  y={4}  w={4}  h={3}  fill={hc} />
      <Px x={22} y={4}  w={4}  h={3}  fill={hc} />
      {/* Bangs — a couple of front strands */}
      <Px x={9}  y={4}  w={5}  h={2}  fill={hc} />
      <Px x={18} y={4}  w={5}  h={2}  fill={hc} />
      {/* Highlight */}
      <Px x={12} y={1}  w={5}  h={1}  fill={WHITE} op={0.1} />
    </>
  )
}

function MediumHair({ hc }) {
  return (
    <>
      {/* Crown — slightly wider than short */}
      <Px x={9}  y={0}  w={14} h={1}  fill={hc} />
      <Px x={7}  y={1}  w={18} h={1}  fill={hc} />
      <Px x={6}  y={2}  w={20} h={2}  fill={hc} />
      {/* Sides — cover full ear area, down to jaw */}
      <Px x={5}  y={4}  w={4}  h={8}  fill={hc} op={0.9} />
      <Px x={23} y={4}  w={4}  h={8}  fill={hc} op={0.9} />
      {/* Wave hints at bottom of sides */}
      <Px x={5}  y={11} w={3}  h={2}  fill={hc} op={0.6} />
      <Px x={24} y={11} w={3}  h={2}  fill={hc} op={0.6} />
      {/* Bangs with slight part */}
      <Px x={8}  y={4}  w={4}  h={3}  fill={hc} />
      <Px x={20} y={4}  w={4}  h={3}  fill={hc} />
      <Px x={13} y={4}  w={6}  h={1}  fill={hc} op={0.5} />
      {/* Highlight */}
      <Px x={12} y={1}  w={6}  h={1}  fill={WHITE} op={0.12} />
    </>
  )
}

function LongHair({ hc }) {
  return (
    <>
      {/* Crown */}
      <Px x={10} y={0}  w={12} h={1}  fill={hc} />
      <Px x={8}  y={1}  w={16} h={2}  fill={hc} />
      <Px x={7}  y={3}  w={18} h={2}  fill={hc} />
      {/* Top sides framing face */}
      <Px x={6}  y={5}  w={4}  h={5}  fill={hc} />
      <Px x={22} y={5}  w={4}  h={5}  fill={hc} />
      {/* Waterfall — left side, goes way down past torso */}
      <Px x={4}  y={10} w={4}  h={12} fill={hc} op={0.95} />
      <Px x={4}  y={22} w={3}  h={8}  fill={hc} op={0.8} />
      <Px x={4}  y={30} w={3}  h={6}  fill={hc} op={0.55} />
      <Px x={5}  y={36} w={2}  h={4}  fill={hc} op={0.3} />
      {/* Waterfall — right side */}
      <Px x={24} y={10} w={4}  h={12} fill={hc} op={0.95} />
      <Px x={25} y={22} w={3}  h={8}  fill={hc} op={0.8} />
      <Px x={25} y={30} w={3}  h={6}  fill={hc} op={0.55} />
      <Px x={25} y={36} w={2}  h={4}  fill={hc} op={0.3} />
      {/* Bangs */}
      <Px x={9}  y={5}  w={4}  h={2}  fill={hc} />
      <Px x={19} y={5}  w={4}  h={2}  fill={hc} />
      {/* Highlight */}
      <Px x={12} y={1}  w={5}  h={1}  fill={WHITE} op={0.12} />
    </>
  )
}

function TiedHair({ hc }) {
  // Pulled-back look + SIDE BUN sticking out to the right
  // The side bun is the distinctive silhouette marker
  return (
    <>
      {/* Crown — pulled tight/flat */}
      <Px x={10} y={0}  w={12} h={1}  fill={hc} />
      <Px x={8}  y={1}  w={16} h={2}  fill={hc} />
      <Px x={7}  y={3}  w={18} h={2}  fill={hc} />
      {/* Tight sides (pulled back, not loose) */}
      <Px x={6}  y={5}  w={3}  h={6}  fill={hc} op={0.8} />
      <Px x={23} y={5}  w={3}  h={6}  fill={hc} op={0.8} />
      {/* Tie band */}
      <Px x={22} y={6}  w={4}  h={2}  fill={hc} op={0.6} />
      {/* SIDE BUN — protruding right, large circular shape */}
      {/* This is the key distinctive silhouette element */}
      <Px x={25} y={2}  w={5}  h={1}  fill={hc} op={0.7} />
      <Px x={26} y={1}  w={5}  h={1}  fill={hc} />
      <Px x={25} y={0}  w={6}  h={1}  fill={hc} />
      <Px x={26} y={-1} w={5}  h={1}  fill={hc} op={0.9} />
      <Px x={27} y={-2} w={4}  h={1}  fill={hc} op={0.7} />
      {/* Bun volume (rendered in positive space as protrusion) */}
      <Px x={25} y={2}  w={6}  h={5}  fill={hc} />
      <Px x={24} y={3}  w={8}  h={4}  fill={hc} />
      <Px x={25} y={7}  w={6}  h={2}  fill={hc} op={0.7} />
      {/* Bun highlight */}
      <Px x={26} y={3}  w={3}  h={2}  fill={WHITE} op={0.12} />
      {/* Minimal front fringe */}
      <Px x={9}  y={5}  w={6}  h={1}  fill={hc} op={0.6} />
    </>
  )
}

function CurlyHair({ hc }) {
  // Wide dome/afro — significantly wider than head, very distinctive
  return (
    <>
      {/* Wide dome crown */}
      <Px x={8}  y={0}  w={16} h={1}  fill={hc} />
      <Px x={5}  y={1}  w={22} h={1}  fill={hc} />
      <Px x={3}  y={2}  w={26} h={2}  fill={hc} />
      <Px x={2}  y={4}  w={28} h={2}  fill={hc} />
      {/* Wide poofy sides */}
      <Px x={1}  y={6}  w={6}  h={6}  fill={hc} op={0.95} />
      <Px x={25} y={6}  w={6}  h={6}  fill={hc} op={0.95} />
      {/* Side taper */}
      <Px x={2}  y={12} w={5}  h={3}  fill={hc} op={0.7} />
      <Px x={25} y={12} w={5}  h={3}  fill={hc} op={0.7} />
      {/* Curly texture dots at edges */}
      <Px x={2}  y={2}  w={2}  h={2}  fill={hc} />
      <Px x={28} y={2}  w={2}  h={2}  fill={hc} />
      <Px x={1}  y={4}  w={2}  h={3}  fill={hc} op={0.8} />
      <Px x={29} y={4}  w={2}  h={3}  fill={hc} op={0.8} />
      {/* Central highlight */}
      <Px x={12} y={1}  w={8}  h={2}  fill={WHITE} op={0.1} />
      <Px x={10} y={2}  w={12} h={1}  fill={WHITE} op={0.06} />
    </>
  )
}

function HairLayer({ hairStyle = 'short', hc }) {
  switch (hairStyle) {
    case 'medium': return <MediumHair hc={hc} />
    case 'long':   return <LongHair   hc={hc} />
    case 'tied':   return <TiedHair   hc={hc} />
    case 'curly':  return <CurlyHair  hc={hc} />
    default:       return <ShortHair  hc={hc} />
  }
}

// ═══════════════════════════════════════════════════════════
//  HEAD + FACE
// ═══════════════════════════════════════════════════════════

function Head() {
  return (
    <>
      {/* Main face — chibi big head */}
      <Px x={8}  y={3}  w={16} h={15} fill={SKIN} />
      {/* Rounded corners */}
      <Px x={7}  y={4}  w={1}  h={13} fill={SKIN} />
      <Px x={24} y={4}  w={1}  h={13} fill={SKIN} />
      <Px x={9}  y={3}  w={1}  h={1}  fill={SKIN} />
      <Px x={22} y={3}  w={1}  h={1}  fill={SKIN} />
      {/* Cheek blush base */}
      <Px x={8}  y={13} w={4}  h={2}  fill={SKIN_SHADE} op={0.15} />
      <Px x={20} y={13} w={4}  h={2}  fill={SKIN_SHADE} op={0.15} />
      {/* Jaw shading */}
      <Px x={9}  y={16} w={14} h={1}  fill={SKIN_SHADE} op={0.2} />
      {/* Chin */}
      <Px x={11} y={17} w={10} h={1}  fill={SKIN} />
      {/* Ears */}
      <Px x={6}  y={8}  w={2}  h={4}  fill={SKIN_SHADE} />
      <Px x={24} y={8}  w={2}  h={4}  fill={SKIN_SHADE} />
      <Px x={6}  y={9}  w={1}  h={2}  fill={SKIN_DARK} op={0.35} />
      <Px x={25} y={9}  w={1}  h={2}  fill={SKIN_DARK} op={0.35} />
    </>
  )
}

function Eyes({ emotion }) {
  // Chibi bigger eyes: left x=9..13, right x=19..23, y=8..12
  if (emotion === 'angry') return (
    <>
      <Px x={8}  y={7}  w={5}  h={1}  fill="#6a2a20" />
      <Px x={19} y={7}  w={5}  h={1}  fill="#6a2a20" />
      <Px x={9}  y={6}  w={3}  h={1}  fill="#6a2a20" op={0.5} />
      <Px x={20} y={6}  w={3}  h={1}  fill="#6a2a20" op={0.5} />
      <Px x={9}  y={8}  w={4}  h={3}  fill={EYE} />
      <Px x={19} y={8}  w={4}  h={3}  fill={EYE} />
      <Px x={12} y={8}  w={1}  h={1}  fill={WHITE} op={0.3} />
      <Px x={22} y={8}  w={1}  h={1}  fill={WHITE} op={0.3} />
    </>
  )

  if (emotion === 'hurt' || emotion === 'withdrawn') return (
    <>
      {/* Drooping sad brows */}
      <Px x={10} y={7}  w={4}  h={1}  fill={EYE} op={0.2} />
      <Px x={18} y={7}  w={4}  h={1}  fill={EYE} op={0.2} />
      {/* Downcast eyes — half-lidded */}
      <Px x={9}  y={9}  w={4}  h={2}  fill={EYE} />
      <Px x={19} y={9}  w={4}  h={2}  fill={EYE} />
      <Px x={9}  y={11} w={4}  h={1}  fill={EYE} op={0.3} />
      <Px x={19} y={11} w={4}  h={1}  fill={EYE} op={0.3} />
      {/* Teardrop on hurt */}
      {emotion === 'hurt' && <>
        <Px x={10} y={12} w={1}  h={2}  fill="#a0c0e0" op={0.7} />
        <Px x={21} y={12} w={1}  h={2}  fill="#a0c0e0" op={0.5} />
      </>}
    </>
  )

  if (emotion === 'warm') return (
    <>
      {/* Raised happy brows */}
      <Px x={10} y={6}  w={4}  h={1}  fill={EYE} op={0.25} />
      <Px x={18} y={6}  w={4}  h={1}  fill={EYE} op={0.25} />
      {/* Crescent/arc eyes — happy */}
      <Px x={9}  y={8}  w={5}  h={1}  fill={EYE} />
      <Px x={19} y={8}  w={5}  h={1}  fill={EYE} />
      <Px x={10} y={9}  w={4}  h={2}  fill={EYE} />
      <Px x={20} y={9}  w={4}  h={2}  fill={EYE} />
      <Px x={9}  y={11} w={5}  h={1}  fill={EYE} />
      <Px x={19} y={11} w={5}  h={1}  fill={EYE} />
      {/* Big sparkle highlights */}
      <Px x={10} y={8}  w={3}  h={2}  fill={WHITE} op={0.65} />
      <Px x={20} y={8}  w={3}  h={2}  fill={WHITE} op={0.65} />
      <Px x={12} y={11} w={1}  h={1}  fill={WHITE} op={0.3} />
      <Px x={22} y={11} w={1}  h={1}  fill={WHITE} op={0.3} />
    </>
  )

  if (emotion === 'surprised') return (
    <>
      <Px x={10} y={5}  w={3}  h={1}  fill={EYE} op={0.3} />
      <Px x={19} y={5}  w={3}  h={1}  fill={EYE} op={0.3} />
      {/* Wide O-eyes */}
      <Px x={9}  y={7}  w={5}  h={5}  fill={EYE} />
      <Px x={19} y={7}  w={5}  h={5}  fill={EYE} />
      <Px x={10} y={8}  w={3}  h={3}  fill={WHITE} op={0.6} />
      <Px x={20} y={8}  w={3}  h={3}  fill={WHITE} op={0.6} />
      <Px x={12} y={10} w={1}  h={1}  fill={WHITE} op={0.2} />
      <Px x={22} y={10} w={1}  h={1}  fill={WHITE} op={0.2} />
    </>
  )

  if (emotion === 'defensive' || emotion === 'confrontational') return (
    <>
      <Px x={8}  y={7}  w={5}  h={1}  fill={EYE} op={0.25} />
      <Px x={19} y={7}  w={5}  h={1}  fill={EYE} op={0.25} />
      <Px x={9}  y={8}  w={4}  h={3}  fill={EYE} />
      <Px x={19} y={8}  w={4}  h={3}  fill={EYE} />
      <Px x={12} y={8}  w={1}  h={1}  fill={WHITE} op={0.4} />
      <Px x={22} y={8}  w={1}  h={1}  fill={WHITE} op={0.4} />
    </>
  )

  if (emotion === 'anxious') return (
    <>
      <Px x={9}  y={7}  w={4}  h={1}  fill={EYE} op={0.2} />
      <Px x={19} y={7}  w={4}  h={1}  fill={EYE} op={0.2} />
      {/* Wobbly uncertain eyes */}
      <Px x={9}  y={8}  w={5}  h={4}  fill={EYE} />
      <Px x={19} y={8}  w={5}  h={4}  fill={EYE} />
      <Px x={10} y={8}  w={2}  h={2}  fill={WHITE} op={0.55} />
      <Px x={20} y={8}  w={2}  h={2}  fill={WHITE} op={0.55} />
    </>
  )

  // Default / neutral / reflective / sitting
  return (
    <>
      <Px x={9}  y={7}  w={4}  h={1}  fill={EYE} op={0.18} />
      <Px x={19} y={7}  w={4}  h={1}  fill={EYE} op={0.18} />
      <Px x={9}  y={8}  w={4}  h={3}  fill={EYE} />
      <Px x={19} y={8}  w={4}  h={3}  fill={EYE} />
      <Px x={10} y={8}  w={2}  h={2}  fill={WHITE} op={0.5} />
      <Px x={20} y={8}  w={2}  h={2}  fill={WHITE} op={0.5} />
    </>
  )
}

function Nose() {
  return (
    <>
      <Px x={15} y={12} w={2}  h={1}  fill={NOSE_COL} op={0.5} />
      <Px x={15} y={13} w={1}  h={1}  fill={SKIN_DARK} op={0.2} />
    </>
  )
}

function Mouth({ emotion }) {
  if (emotion === 'angry')
    return <Px x={12} y={14} w={8}  h={1}  fill="#7a2a2a" />
  if (emotion === 'hurt')
    return (
      <>
        <Px x={12} y={15} w={3}  h={1}  fill="#9a5040" />
        <Px x={17} y={14} w={3}  h={1}  fill="#9a5040" />
      </>
    )
  if (emotion === 'warm')
    return (
      <>
        <Px x={12} y={14} w={1}  h={1}  fill="#e06060" />
        <Px x={13} y={15} w={6}  h={1}  fill="#e06060" />
        <Px x={19} y={14} w={1}  h={1}  fill="#e06060" />
        <Px x={14} y={16} w={4}  h={1}  fill="#e06060" op={0.3} />
      </>
    )
  if (emotion === 'surprised')
    return (
      <>
        <Px x={13} y={14} w={6}  h={1}  fill={EYE} />
        <Px x={12} y={15} w={8}  h={2}  fill={EYE} />
        <Px x={13} y={14} w={6}  h={1}  fill="#4a2020" op={0.5} />
      </>
    )
  if (emotion === 'defensive' || emotion === 'confrontational')
    return <Px x={13} y={14} w={6}  h={1}  fill="#a05040" />
  if (emotion === 'withdrawn' || emotion === 'reflective')
    return <Px x={13} y={14} w={6}  h={1}  fill="#b06050" op={0.35} />
  // neutral / anxious
  return <Px x={13} y={14} w={6}  h={1}  fill="#b06050" />
}

function Blush({ emotion }) {
  if (!['warm', 'hurt', 'surprised', 'anxious'].includes(emotion)) return null
  return (
    <>
      <Px x={7}  y={12} w={4}  h={2}  fill={BLUSH_COL} op={emotion === 'warm' ? 0.45 : 0.25} />
      <Px x={21} y={12} w={4}  h={2}  fill={BLUSH_COL} op={emotion === 'warm' ? 0.45 : 0.25} />
    </>
  )
}

// ═══════════════════════════════════════════════════════════
//  NECK
// ═══════════════════════════════════════════════════════════
function Neck() {
  return (
    <>
      <Px x={13} y={18} w={6}  h={3}  fill={SKIN} />
      <Px x={14} y={18} w={1}  h={3}  fill={SKIN_SHADE} op={0.2} />
    </>
  )
}

// ═══════════════════════════════════════════════════════════
//  OUTFIT COMPONENTS
//  Key visual distinctions:
//    casual  → standard shirt, slight collar, button hint
//    formal  → suit jacket with V-lapels (visible dark lapels)
//    sporty  → hoodie with hood visible at back, front pocket strip
//    cozy    → turtleneck sweater (band at neck, softer shape)
// ═══════════════════════════════════════════════════════════

function CasualOutfit({ oc, od, emotion }) {
  return (
    <>
      {/* Shoulders */}
      <Px x={7}  y={21} w={18} h={2}  fill={oc} />
      {/* Torso */}
      <Px x={8}  y={23} w={16} h={12} fill={oc} />
      {/* Collar V */}
      <Px x={13} y={21} w={6}  h={1}  fill={od} op={0.35} />
      <Px x={14} y={22} w={4}  h={2}  fill={SKIN} op={0.4} />
      {/* Center button line */}
      <Px x={15} y={24} w={2}  h={9}  fill={od} op={0.25} />
      <Px x={15} y={25} w={2}  h={1}  fill={od} op={0.4} />
      <Px x={15} y={28} w={2}  h={1}  fill={od} op={0.4} />
      <Px x={15} y={31} w={2}  h={1}  fill={od} op={0.4} />
      {/* Side shading */}
      <Px x={8}  y={23} w={2}  h={10} fill={od} op={0.18} />
      <Px x={22} y={23} w={2}  h={10} fill={od} op={0.18} />
      {/* Hem */}
      <Px x={8}  y={34} w={16} h={1}  fill={od} op={0.3} />
    </>
  )
}

function FormalOutfit({ oc, od }) {
  // Suit jacket: distinct V-lapels in dark color, slightly wider shoulders
  const lapelColor = od
  return (
    <>
      {/* Wide shoulders (formal look) */}
      <Px x={5}  y={21} w={22} h={2}  fill={od} />
      <Px x={7}  y={21} w={18} h={1}  fill={oc} />
      {/* Jacket body */}
      <Px x={8}  y={23} w={16} h={12} fill={oc} />
      {/* LEFT lapel — dark V shape */}
      <Px x={12} y={21} w={3}  h={1}  fill={lapelColor} op={0.8} />
      <Px x={11} y={22} w={3}  h={2}  fill={lapelColor} op={0.8} />
      <Px x={10} y={24} w={3}  h={3}  fill={lapelColor} op={0.75} />
      <Px x={10} y={27} w={2}  h={3}  fill={lapelColor} op={0.5} />
      {/* RIGHT lapel */}
      <Px x={17} y={21} w={3}  h={1}  fill={lapelColor} op={0.8} />
      <Px x={18} y={22} w={3}  h={2}  fill={lapelColor} op={0.8} />
      <Px x={19} y={24} w={3}  h={3}  fill={lapelColor} op={0.75} />
      <Px x={20} y={27} w={2}  h={3}  fill={lapelColor} op={0.5} />
      {/* Shirt + tie peeking */}
      <Px x={13} y={22} w={6}  h={3}  fill={SKIN_LT} op={0.5} />
      <Px x={15} y={24} w={2}  h={5}  fill="#c04040" op={0.7} />
      {/* Jacket sides shading */}
      <Px x={8}  y={23} w={2}  h={11} fill={od} op={0.3} />
      <Px x={22} y={23} w={2}  h={11} fill={od} op={0.3} />
      <Px x={8}  y={34} w={16} h={1}  fill={od} op={0.4} />
    </>
  )
}

function SportyOutfit({ oc, od }) {
  // Hoodie: hood visible at back/neck, front kangaroo pocket strip
  return (
    <>
      {/* Hood at back (visible above shoulders) */}
      <Px x={9}  y={18} w={14} h={3}  fill={oc} op={0.6} />
      {/* Shoulders — slightly looser/puffier */}
      <Px x={6}  y={21} w={20} h={2}  fill={oc} />
      {/* Hoodie body */}
      <Px x={8}  y={23} w={16} h={12} fill={oc} />
      {/* Hood seam at neck */}
      <Px x={10} y={21} w={12} h={2}  fill={od} op={0.2} />
      {/* Drawstring hint */}
      <Px x={14} y={23} w={1}  h={4}  fill={od} op={0.5} />
      <Px x={17} y={23} w={1}  h={4}  fill={od} op={0.5} />
      {/* Kangaroo pocket strip */}
      <Px x={10} y={28} w={12} h={5}  fill={od} op={0.2} />
      <Px x={10} y={28} w={12} h={1}  fill={od} op={0.35} />
      <Px x={10} y={32} w={12} h={1}  fill={od} op={0.35} />
      {/* Ribbed cuff at hem */}
      <Px x={8}  y={33} w={16} h={2}  fill={od} op={0.3} />
    </>
  )
}

function CozyOutfit({ oc, od }) {
  // Turtleneck sweater: distinctive neck band, round soft shape
  return (
    <>
      {/* TURTLENECK BAND — most distinctive element */}
      <Px x={11} y={17} w={10} h={5}  fill={oc} />
      <Px x={11} y={17} w={10} h={1}  fill={od} op={0.3} />
      <Px x={11} y={21} w={10} h={1}  fill={od} op={0.3} />
      {/* Rib texture on turtleneck */}
      <Px x={12} y={18} w={2}  h={3}  fill={od} op={0.15} />
      <Px x={15} y={18} w={2}  h={3}  fill={od} op={0.15} />
      <Px x={18} y={18} w={2}  h={3}  fill={od} op={0.15} />
      {/* Shoulders */}
      <Px x={7}  y={22} w={18} h={2}  fill={oc} />
      {/* Sweater body — slightly rounded/softer */}
      <Px x={8}  y={24} w={16} h={11} fill={oc} />
      {/* Knit texture — horizontal rib lines */}
      <Px x={8}  y={26} w={16} h={1}  fill={od} op={0.12} />
      <Px x={8}  y={29} w={16} h={1}  fill={od} op={0.12} />
      <Px x={8}  y={32} w={16} h={1}  fill={od} op={0.12} />
      {/* Side gentle shading */}
      <Px x={8}  y={24} w={2}  h={10} fill={od} op={0.15} />
      <Px x={22} y={24} w={2}  h={10} fill={od} op={0.15} />
      <Px x={8}  y={34} w={16} h={1}  fill={od} op={0.25} />
    </>
  )
}

function OutfitLayer({ outfitStyle = 'casual', oc, od, emotion }) {
  switch (outfitStyle) {
    case 'formal':  return <FormalOutfit oc={oc} od={od} />
    case 'sporty':  return <SportyOutfit oc={oc} od={od} />
    case 'cozy':    return <CozyOutfit   oc={oc} od={od} />
    default:        return <CasualOutfit oc={oc} od={od} emotion={emotion} />
  }
}

// ═══════════════════════════════════════════════════════════
//  ARMS  (responsive to emotion)
// ═══════════════════════════════════════════════════════════
function Arms({ emotion, oc, od }) {
  if (emotion === 'defensive') return (
    <>
      <Px x={3}  y={22} w={5}  h={2}  fill={oc} />
      <Px x={3}  y={24} w={4}  h={6}  fill={oc} />
      <Px x={7}  y={25} w={7}  h={3}  fill={od} op={0.3} />
      <Px x={24} y={22} w={5}  h={2}  fill={oc} />
      <Px x={25} y={24} w={4}  h={6}  fill={oc} />
      <Px x={18} y={25} w={7}  h={3}  fill={od} op={0.3} />
      <Px x={6}  y={27} w={4}  h={2}  fill={SKIN_SHADE} />
      <Px x={22} y={27} w={4}  h={2}  fill={SKIN_SHADE} />
    </>
  )

  if (emotion === 'angry') return (
    <>
      <Px x={3}  y={22} w={4}  h={2}  fill={oc} />
      <Px x={3}  y={24} w={4}  h={9}  fill={oc} />
      <Px x={25} y={22} w={4}  h={2}  fill={oc} />
      <Px x={25} y={24} w={4}  h={9}  fill={oc} />
      <Px x={3}  y={30} w={4}  h={3}  fill={SKIN_SHADE} />
      <Px x={25} y={30} w={4}  h={3}  fill={SKIN_SHADE} />
    </>
  )

  if (emotion === 'warm' || emotion === 'surprised') return (
    <>
      <Px x={3}  y={22} w={4}  h={2}  fill={oc} />
      <Px x={2}  y={24} w={5}  h={8}  fill={oc} />
      <Px x={25} y={22} w={4}  h={2}  fill={oc} />
      <Px x={25} y={24} w={5}  h={8}  fill={oc} />
      <Px x={1}  y={30} w={5}  h={2}  fill={SKIN} />
      <Px x={26} y={30} w={5}  h={2}  fill={SKIN} />
    </>
  )

  if (emotion === 'withdrawn' || emotion === 'reflective') return (
    <>
      <Px x={5}  y={22} w={3}  h={2}  fill={oc} />
      <Px x={5}  y={24} w={3}  h={10} fill={oc} />
      <Px x={24} y={22} w={3}  h={2}  fill={oc} />
      <Px x={24} y={24} w={3}  h={10} fill={oc} />
      <Px x={5}  y={33} w={3}  h={2}  fill={SKIN_SHADE} />
      <Px x={24} y={33} w={3}  h={2}  fill={SKIN_SHADE} />
    </>
  )

  // Default / neutral / anxious / confrontational
  return (
    <>
      <Px x={4}  y={22} w={4}  h={2}  fill={oc} />
      <Px x={4}  y={24} w={4}  h={9}  fill={oc} />
      <Px x={24} y={22} w={4}  h={2}  fill={oc} />
      <Px x={24} y={24} w={4}  h={9}  fill={oc} />
      <Px x={4}  y={27} w={4}  h={1}  fill={od} op={0.15} />
      <Px x={24} y={27} w={4}  h={1}  fill={od} op={0.15} />
      <Px x={4}  y={32} w={4}  h={2}  fill={SKIN} />
      <Px x={24} y={32} w={4}  h={2}  fill={SKIN} />
    </>
  )
}

// ═══════════════════════════════════════════════════════════
//  LEGS + SHOES
// ═══════════════════════════════════════════════════════════
function Legs({ od }) {
  return (
    <>
      <Px x={9}  y={35} w={6}  h={11} fill={od} />
      <Px x={17} y={35} w={6}  h={11} fill={od} />
      <Px x={15} y={35} w={2}  h={9}  fill={od} op={0.55} />
      {/* Knee hint */}
      <Px x={9}  y={41} w={6}  h={1}  fill={SHOE} op={0.06} />
      <Px x={17} y={41} w={6}  h={1}  fill={SHOE} op={0.06} />
      {/* Left shoe */}
      <Px x={8}  y={46} w={7}  h={3}  fill={SHOE} />
      <Px x={7}  y={48} w={8}  h={2}  fill={SHOE} />
      <Px x={7}  y={50} w={8}  h={1}  fill={SHOE_SOLE} />
      {/* Right shoe */}
      <Px x={17} y={46} w={7}  h={3}  fill={SHOE} />
      <Px x={17} y={48} w={8}  h={2}  fill={SHOE} />
      <Px x={17} y={50} w={8}  h={1}  fill={SHOE_SOLE} />
    </>
  )
}

function SittingLegs({ od }) {
  return (
    <>
      {/* Thighs going forward */}
      <Px x={8}  y={35} w={7}  h={7}  fill={od} />
      <Px x={17} y={35} w={7}  h={7}  fill={od} />
      <Px x={15} y={35} w={2}  h={5}  fill={od} op={0.5} />
      {/* Shins horizontal */}
      <Px x={5}  y={41} w={8}  h={5}  fill={od} />
      <Px x={19} y={41} w={8}  h={5}  fill={od} />
      {/* Seated shoes */}
      <Px x={4}  y={45} w={9}  h={3}  fill={SHOE} />
      <Px x={19} y={45} w={9}  h={3}  fill={SHOE} />
      <Px x={4}  y={47} w={9}  h={1}  fill={SHOE_SOLE} />
      <Px x={19} y={47} w={9}  h={1}  fill={SHOE_SOLE} />
    </>
  )
}

// ═══════════════════════════════════════════════════════════
//  ACCESSORY COMPONENTS
// ═══════════════════════════════════════════════════════════

function GlassesAcc() {
  return (
    <>
      <rect x={8} y={7} width={6} height={5}
        fill="rgba(40,40,60,0.1)" stroke="#4a4a6a" strokeWidth={0.7} shapeRendering="crispEdges" />
      <rect x={18} y={7} width={6} height={5}
        fill="rgba(40,40,60,0.1)" stroke="#4a4a6a" strokeWidth={0.7} shapeRendering="crispEdges" />
      <Px x={14} y={9} w={4}  h={1}  fill="#4a4a6a" op={0.9} />
      <Px x={6}  y={9} w={2}  h={1}  fill="#3a3a5a" op={0.6} />
      <Px x={24} y={9} w={2}  h={1}  fill="#3a3a5a" op={0.6} />
    </>
  )
}

function HatAcc({ hc }) {
  // Flat cap / beanie sitting on top of hair
  const hatColor = hc  // match hair color
  return (
    <>
      {/* Brim */}
      <Px x={6}  y={2}  w={20} h={2}  fill={hatColor} op={0.9} />
      <Px x={5}  y={3}  w={5}  h={1}  fill={hatColor} />
      <Px x={22} y={3}  w={5}  h={1}  fill={hatColor} />
      {/* Crown of hat */}
      <Px x={7}  y={0}  w={18} h={3}  fill={hatColor} />
      <Px x={8}  y={-1} w={16} h={1}  fill={hatColor} op={0.8} />
      {/* Hat band */}
      <Px x={7}  y={3}  w={18} h={1}  fill="#222" op={0.35} />
      {/* Highlight */}
      <Px x={10} y={0}  w={8}  h={1}  fill={WHITE} op={0.12} />
    </>
  )
}

function ScarfAcc({ oc }) {
  // Colorful scarf wrapped at neck — very visible, changes silhouette at collar
  const scarfColor = oc
  return (
    <>
      {/* Main scarf wrap */}
      <Px x={10} y={19} w={12} h={4}  fill={scarfColor} op={0.9} />
      {/* Scarf texture */}
      <Px x={10} y={20} w={12} h={1}  fill="#ffffff" op={0.1} />
      <Px x={10} y={22} w={12} h={1}  fill="#000000" op={0.1} />
      {/* Scarf end hanging down (front fold) */}
      <Px x={14} y={23} w={4}  h={6}  fill={scarfColor} op={0.7} />
      <Px x={14} y={29} w={3}  h={3}  fill={scarfColor} op={0.45} />
      {/* Fringe */}
      <Px x={14} y={31} w={1}  h={2}  fill={scarfColor} op={0.3} />
      <Px x={16} y={31} w={1}  h={2}  fill={scarfColor} op={0.3} />
    </>
  )
}

function AccessoryLayer({ accessory, hc, oc }) {
  switch (accessory) {
    case 'glasses': return <GlassesAcc />
    case 'hat':     return <HatAcc hc={hc} />
    case 'scarf':   return <ScarfAcc oc={oc} />
    default:        return null
  }
}

// ═══════════════════════════════════════════════════════════
//  SHADOW
// ═══════════════════════════════════════════════════════════
function GroundShadow() {
  return (
    <ellipse cx={16} cy={51} rx={11} ry={1.5}
      fill="rgba(0,0,0,0.22)" />
  )
}

// ═══════════════════════════════════════════════════════════
//  LEAN HELPER
// ═══════════════════════════════════════════════════════════
function leanDeg(lean, facing) {
  if (lean === 'none' || !lean) return 0
  const dir = facing === 'right' ? 1 : -1
  if (lean === 'forward') return dir * 5
  if (lean === 'back')    return dir * -4
  return 0
}

// ═══════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function PixelChar({
  persona,
  emotion  = 'neutral',
  facing   = 'right',
  lean     = 'none',
  scale    = 1.0,
  glow     = true,
}) {
  const isSitting   = emotion === 'sitting'
  const oc          = persona.outfitColor  || '#4a6ea8'
  const od          = persona.outfitDark   || '#2a4e88'
  const hc          = persona.hairColor    || '#3a2810'
  const hairStyle   = persona.hairStyle    || 'short'
  const outfitStyle = persona.outfitStyle  || 'casual'
  const accessory   = persona.accessory    || 'none'

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
        transition:      'transform 0.7s cubic-bezier(0.4,0,0.2,1)',
        animation:       'charBreathe 3s ease-in-out infinite',
        overflow:        'visible',
      }}
    >
      <svg
        width={W * SCALE}
        height={H * SCALE}
        viewBox={`0 0 ${W} ${H}`}
        overflow="visible"
        style={{ transform: `scaleX(${flipX})`, transformOrigin: 'center', overflow: 'visible' }}
      >
        <GroundShadow />

        {/* Hair back layer (for long/tied) */}
        <HairLayer hairStyle={hairStyle} hc={hc} />

        {/* Head */}
        <Head />

        {/* Accessories behind eyes */}
        {accessory === 'glasses' && <GlassesAcc />}

        {/* Face */}
        <Eyes  emotion={emotion} />
        <Nose />
        <Mouth emotion={emotion} />
        <Blush emotion={emotion} />

        {/* Neck */}
        {outfitStyle !== 'cozy' && <Neck />}

        {/* Body */}
        {isSitting ? (
          <>
            <OutfitLayer outfitStyle={outfitStyle} oc={oc} od={od} emotion={emotion} />
            {/* Sitting arms */}
            <Px x={4}  y={22} w={4}  h={2}  fill={oc} />
            <Px x={4}  y={24} w={4}  h={9}  fill={oc} />
            <Px x={24} y={22} w={4}  h={2}  fill={oc} />
            <Px x={24} y={24} w={4}  h={9}  fill={oc} />
            <Px x={4}  y={32} w={4}  h={2}  fill={SKIN} />
            <Px x={24} y={32} w={4}  h={2}  fill={SKIN} />
            <SittingLegs od={od} />
          </>
        ) : (
          <>
            <OutfitLayer outfitStyle={outfitStyle} oc={oc} od={od} emotion={emotion} />
            <Arms emotion={emotion} oc={oc} od={od} />
            <Legs od={od} />
          </>
        )}

        {/* Accessories on top */}
        {accessory !== 'glasses' && (
          <AccessoryLayer accessory={accessory} hc={hc} oc={oc} />
        )}
      </svg>
    </div>
  )
}
