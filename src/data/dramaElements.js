// ─────────────────────────────────────────────────────────────
//  dramaElements.js — Drama Element Mapping Library
//
//  Grounded in LLM-based Interactive Drama (arXiv 2024) 6-element framework:
//    Plot | Character | Thought | Diction | Spectacle | Interaction
//
//  Each element's data source is annotated:
//    [USER]   = explicit user selection
//    [LLM]    = inferred by language model
//    [SYSTEM] = system design decision
//    [HYBRID] = user selection + LLM calibration
// ─────────────────────────────────────────────────────────────

// ── [CHARACTER] Relationship Types ──────────────────────────
// Source: [USER] selection — LLM role-play anchor (not personality test)
export const RELATIONSHIP_TYPES = [
  {
    id: 'romantic',
    label: '恋人',
    icon: '💑',
    en: 'Romantic Partners',
    promptHint: 'romantic partners in an intimate relationship with high emotional stakes and attachment dynamics',
    defaultScene: 'bedroom_night',
    defaultAppearanceA: { hairStyle: 'medium', outfitStyle: 'casual', accessory: 'none' },
    defaultAppearanceB: { hairStyle: 'short', outfitStyle: 'sporty', accessory: 'none' },
  },
  {
    id: 'family',
    label: '家人',
    icon: '👨‍👧',
    en: 'Family',
    promptHint: 'family members with generational dynamics, care underneath the surface of conflict, and long shared history',
    defaultScene: 'kitchen_morning',
    defaultAppearanceA: { hairStyle: 'tied', outfitStyle: 'casual', accessory: 'none' },
    defaultAppearanceB: { hairStyle: 'short', outfitStyle: 'formal', accessory: 'glasses' },
  },
  {
    id: 'friends',
    label: '朋友',
    icon: '🤝',
    en: 'Close Friends',
    promptHint: 'close friends with shared history, mutual expectations, and loyalty underneath the argument',
    defaultScene: 'cafe',
    defaultAppearanceA: { hairStyle: 'curly', outfitStyle: 'casual', accessory: 'none' },
    defaultAppearanceB: { hairStyle: 'long', outfitStyle: 'casual', accessory: 'none' },
  },
  {
    id: 'colleagues',
    label: '同事',
    icon: '💼',
    en: 'Colleagues',
    promptHint: 'workplace colleagues with professional boundaries, implicit power dynamics, and the need to maintain working relationship',
    defaultScene: 'office',
    defaultAppearanceA: { hairStyle: 'medium', outfitStyle: 'formal', accessory: 'none' },
    defaultAppearanceB: { hairStyle: 'short', outfitStyle: 'formal', accessory: 'glasses' },
  },
]

// ── [CHARACTER] Communication Styles ────────────────────────
// Source: [USER] vote — "first vote about their partner"
// These are LLM role-play anchors for dialogue generation (Diction element)
export const COMM_STYLES = [
  {
    id: 'avoidant',
    label: '回避型',
    desc: '遇事沉默，需要空间',
    icon: '🌊',
    promptHint: 'goes silent under stress, physically or emotionally withdraws, needs time to process before re-engaging; uses brief one-word responses, changes topic, or simply stops responding',
    thoughtPattern: 'suppressed feelings behind quiet exterior; wishes conflict would just go away',
  },
  {
    id: 'anxious',
    label: '焦虑型',
    desc: '需要即时回应，反复确认',
    icon: '🔁',
    promptHint: 'needs immediate response and explicit reassurance; asks the same question in different ways; fears being dismissed or abandoned; escalates when not acknowledged',
    thoughtPattern: 'fear and insecurity underlying the pressure; desperately needs validation',
  },
  {
    id: 'direct',
    label: '直接型',
    desc: '直说，缺少情绪包装',
    icon: '➡️',
    promptHint: 'blunt and straightforward; says exactly what they mean without softening; can sound harsh even when not intending to; struggles to understand why others are hurt',
    thoughtPattern: 'genuinely confused why facts cause hurt; wants efficient resolution',
  },
  {
    id: 'analytical',
    label: '分析型',
    desc: '讲道理，不擅长情绪',
    icon: '🔍',
    promptHint: 'rationalizes and problem-solves instinctively; deflects with logic when emotions arise; struggles with emotional validation; may seem dismissive of feelings',
    thoughtPattern: 'genuinely trying to help by solving the problem; discomfort with raw emotion',
  },
]

// ── [SPECTACLE] Scene Presets ────────────────────────────────
// Source: [LLM] selects from enum based on relationship type + chat content
// Assets: PNG backgrounds in /public/assets/backgrounds/
export const SCENE_PRESETS = {
  bedroom_night: {
    label: '卧室·夜',
    en: 'Bedroom, night',
    bg: '/assets/backgrounds/bedroom_night.png',
    fallbackGradient: 'linear-gradient(180deg, #0d1520 0%, #121a2e 40%, #0a0e1a 100%)',
    ambientColor: '#1a3a5c',
    suggestedRelationships: ['romantic'],
    // Room architecture colors for CSS front-view rendering
    roomColors: {
      ceiling: '#0c1422',     // deep night ceiling
      wall:    '#1e2d4a',     // visible navy-indigo wall
      floor:   '#1a1410',     // dark warm wood floor
      trim:    '#16203a',     // baseboard matching wall
      light:   '#e8a030',     // warm amber lamp glow
      outdoor: false,
    },
  },
  livingroom_evening: {
    label: '客厅·傍晚',
    en: 'Living room, evening',
    bg: '/assets/backgrounds/livingroom_evening.png',
    fallbackGradient: 'linear-gradient(180deg, #1a0f0a 0%, #1e1208 40%, #100a05 100%)',
    ambientColor: '#4a2a10',
    suggestedRelationships: ['romantic', 'family', 'friends'],
    roomColors: {
      ceiling: '#1c1408',
      wall:    '#3a2a18',     // warm teak-brown wall, evening light
      floor:   '#2a1c0c',     // warm dark wood
      trim:    '#281808',
      light:   '#e89030',     // rich warm incandescent
      outdoor: false,
    },
  },
  kitchen_morning: {
    label: '厨房·早晨',
    en: 'Kitchen, morning',
    bg: '/assets/backgrounds/kitchen_morning.png',
    fallbackGradient: 'linear-gradient(180deg, #d8d0c0 0%, #cec8b8 40%, #9a8c74 100%)',
    ambientColor: '#e8d8b0',
    suggestedRelationships: ['family'],
    roomColors: {
      ceiling: '#e8e0d0',     // bright daytime ceiling
      wall:    '#d8d0b8',     // warm cream wall, morning light
      floor:   '#a8987a',     // warm tile/wood floor, daylight
      trim:    '#c8b890',
      light:   '#fff0b0',     // bright morning sun
      outdoor: false,
    },
  },
  outdoor_park: {
    label: '户外·公园',
    en: 'Outdoors, park',
    bg: '/assets/backgrounds/outdoor_park.png',
    fallbackGradient: 'linear-gradient(180deg, #060e1a 0%, #0a1428 35%, #0c1810 70%, #080e08 100%)',
    ambientColor: '#1a3a20',
    suggestedRelationships: ['friends'],
    roomColors: {
      ceiling: '#06101e',     // night sky top
      wall:    '#0e1e3a',     // deep blue night sky
      floor:   '#0c1208',     // dark grass
      trim:    '#101808',     // ground edge
      light:   '#5878c8',     // moonlight blue (brighter)
      outdoor: true,          // use outdoor layout (sky + ground, no room walls)
    },
  },
  cafe: {
    label: '咖啡馆',
    en: 'Café',
    bg: '/assets/backgrounds/cafe.png',
    fallbackGradient: 'linear-gradient(180deg, #160e08 0%, #1e1408 40%, #140e06 100%)',
    ambientColor: '#3a2a10',
    suggestedRelationships: ['friends', 'colleagues'],
    roomColors: {
      ceiling: '#1c1208',     // dark wood-paneled ceiling
      wall:    '#382818',     // warm café mahogany wall
      floor:   '#281810',     // dark hardwood floor
      trim:    '#221408',
      light:   '#e87830',     // warm pendant lights
      outdoor: false,
    },
  },
  office: {
    label: '办公室',
    en: 'Office',
    bg: '/assets/backgrounds/office.png',
    fallbackGradient: 'linear-gradient(180deg, #0a0e18 0%, #0e1220 40%, #080c14 100%)',
    ambientColor: '#1a2040',
    suggestedRelationships: ['colleagues'],
    roomColors: {
      ceiling: '#101420',     // office drop ceiling
      wall:    '#1e2438',     // cool blue-slate wall
      floor:   '#141620',     // dark carpet
      trim:    '#182030',
      light:   '#80aae0',     // fluorescent/LED cool (brighter)
      outdoor: false,
    },
  },
}

// ── [SPECTACLE] Character Appearance Options ─────────────────
// Source: [USER] optional micro-customization; system auto-recommends per archetype
// Sprite path convention: /assets/sprites/{gender?}/{hairStyle}_{outfitStyle}_{emotion}.png
// CSS hue-rotate technique: Partner A = blue tint, Partner B = red/warm tint
export const APPEARANCE_OPTIONS = {
  hairStyles: [
    { id: 'short',  label: '短发', spritePreview: '/assets/ui/hair_short.png' },
    { id: 'medium', label: '中发', spritePreview: '/assets/ui/hair_medium.png' },
    { id: 'long',   label: '长发', spritePreview: '/assets/ui/hair_long.png' },
    { id: 'tied',   label: '扎发', spritePreview: '/assets/ui/hair_tied.png' },
    { id: 'curly',  label: '卷发', spritePreview: '/assets/ui/hair_curly.png' },
  ],
  outfitStyles: [
    { id: 'casual', label: '休闲' },
    { id: 'formal', label: '正式' },
    { id: 'sporty', label: '帽衫' },
    { id: 'cozy',   label: '高领' },
  ],
  accessories: [
    { id: 'none',    label: '无' },
    { id: 'glasses', label: '眼镜' },
    { id: 'hat',     label: '帽子' },
    { id: 'scarf',   label: '围巾' },
  ],
}

export const DEFAULT_APPEARANCE = {
  hairStyle: 'short',
  outfitStyle: 'casual',
  accessory: 'none',
}

// ── [SPECTACLE] Sprite path resolver ────────────────────────
// Returns path to character sprite based on persona, emotion, and appearance.
// Falls back to SVG-rendered PixelChar when PNG assets are unavailable.
export function getSpritePath(personaId, hairStyle, outfitStyle, emotion) {
  return `/assets/sprites/${personaId}/${hairStyle}_${outfitStyle}_${emotion}.png`
}

// Emotion map: RSL emotion names → sprite file suffixes
export const EMOTION_TO_SPRITE = {
  neutral:          'neutral',
  confrontational:  'angry',
  angry:            'angry',
  defensive:        'defensive',
  hurt:             'hurt',
  withdrawn:        'withdrawn',
  warm:             'warm',
  anxious:          'anxious',
  surprised:        'surprised',
  reflective:       'neutral',
  sitting:          'neutral',
}

// ── [CHARACTER] CSS color filters for persona differentiation ─
// Single sprite asset set, differentiated via CSS filter hue-rotate
export const PERSONA_FILTERS = {
  A: 'hue-rotate(210deg) saturate(1.3) brightness(1.05)',   // Blue tint
  B: 'hue-rotate(340deg) saturate(1.2) brightness(1.0)',    // Red/warm tint
}

// ── Drama Element Mapping Reference ─────────────────────────
// For paper documentation — shows how Aside maps to 6-element framework
// Reference: "LLM-based Interactive Drama" (arXiv 2024)
export const DRAMA_ELEMENT_MAP = {
  plot: {
    description: '7-beat narrative arc with escalating intensity',
    source: 'LLM-generated from chat log + archetype anchoring',
    asideComponent: 'beats[] in RSL v2 schema + ConflictTimeline',
  },
  character: {
    description: 'Persona archetypes with communication style anchoring',
    source: 'Layer 1: User selection | Layer 2: LLM auto-calibration',
    asideComponent: 'RELATIONSHIP_TYPES + COMM_STYLES + CalibrationOverlay',
  },
  thought: {
    description: 'Inner monologue diverging from surface dialogue (subtext)',
    source: 'LLM-inferred, user can dispute/annotate',
    asideComponent: 'ThoughtBubble + dispute mechanism',
    // Relates to Drama Machine (arXiv 2024): intra-subjective internal monologue
  },
  diction: {
    description: 'Dialogue word choice and tone reflecting communication archetype',
    source: 'LLM-generated anchored by COMM_STYLES promptHints',
    asideComponent: 'Subtitle + beat.dialogue in RSL schema',
  },
  spectacle: {
    description: 'Visual staging: pixel art room + character sprites',
    source: 'Preset scene library, LLM selects scene, user customizes appearance',
    asideComponent: 'Theater + SCENE_PRESETS + APPEARANCE_OPTIONS + PNG assets',
  },
  interaction: {
    description: 'Structured user agency at pause points and calibration',
    source: 'System design: archetype voting, calibration confirm/adjust, thought dispute, reflection annotations',
    asideComponent: 'ArchetypeSelect + CalibrationOverlay + ReflectionOverlay + ThoughtBubble',
  },
}
