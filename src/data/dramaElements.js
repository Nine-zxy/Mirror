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
    defaultScene: 'cafe_evening',
    defaultAppearanceA: { hairStyle: 'curly', outfitStyle: 'casual', accessory: 'none' },
    defaultAppearanceB: { hairStyle: 'long', outfitStyle: 'casual', accessory: 'none' },
  },
  {
    id: 'colleagues',
    label: '同事',
    icon: '💼',
    en: 'Colleagues',
    promptHint: 'workplace colleagues with professional boundaries, implicit power dynamics, and the need to maintain working relationship',
    defaultScene: 'office_day',
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
// Assets: PNG backgrounds in /public/backgrounds/
// 25 scenes across 12 locations × time-of-day variants
export const SCENE_PRESETS = {
  // ── 卧室 Bedroom ──────────────────────────────────────────
  bedroom_night: {
    label: '卧室·夜',
    en: 'Bedroom, night',
    bg: '/backgrounds/bedroom_night.png',
    fallbackGradient: 'linear-gradient(180deg, #0d1520 0%, #121a2e 40%, #0a0e1a 100%)',
    ambientColor: '#1a3a5c',
    suggestedRelationships: ['romantic'],
    charScale: 0.78,
    roomColors: {
      ceiling: '#0c1422', wall: '#1e2d4a', floor: '#1a1410',
      trim: '#16203a', light: '#e8a030', outdoor: false,
    },
  },
  bedroom_evening: {
    label: '卧室·黄昏',
    en: 'Bedroom, evening',
    bg: '/backgrounds/bedroom_evening.png',
    fallbackGradient: 'linear-gradient(180deg, #1a2040 0%, #2a3058 40%, #181828 100%)',
    ambientColor: '#3a4870',
    suggestedRelationships: ['romantic'],
    charScale: 0.78,
    roomColors: {
      ceiling: '#1a2040', wall: '#2a3058', floor: '#1a1410',
      trim: '#202840', light: '#e0a040', outdoor: false,
    },
  },

  bedroom_morning: {
    label: '卧室·早晨',
    en: 'Bedroom, morning',
    bg: '/backgrounds/bedroom_morning.png',
    fallbackGradient: 'linear-gradient(180deg, #e8e0d0 0%, #ddd4c0 40%, #c8b898 100%)',
    ambientColor: '#e8d8b0',
    suggestedRelationships: ['romantic', 'family'],
    charScale: 0.78,
    roomColors: {
      ceiling: '#f0e8d8', wall: '#e8dcc0', floor: '#c0a878',
      trim: '#d8c8a0', light: '#fff0c0', outdoor: false,
    },
  },

  // ── 客厅 Living Room ──────────────────────────────────────
  livingroom_evening: {
    label: '客厅·傍晚',
    en: 'Living room, evening',
    bg: '/backgrounds/livingroom_evening.png',
    fallbackGradient: 'linear-gradient(180deg, #1a0f0a 0%, #1e1208 40%, #100a05 100%)',
    ambientColor: '#4a2a10',
    suggestedRelationships: ['romantic', 'family', 'friends'],
    charScale: 0.75,
    roomColors: {
      ceiling: '#1c1408', wall: '#3a2a18', floor: '#2a1c0c',
      trim: '#281808', light: '#e89030', outdoor: false,
    },
  },
  livingroom_night: {
    label: '客厅·深夜',
    en: 'Living room, late night',
    bg: '/backgrounds/livingroom_night.png',
    fallbackGradient: 'linear-gradient(180deg, #080a10 0%, #0c1018 40%, #060810 100%)',
    ambientColor: '#1a2030',
    suggestedRelationships: ['romantic', 'family'],
    charScale: 0.75,
    roomColors: {
      ceiling: '#080a12', wall: '#10141e', floor: '#0e0c0a',
      trim: '#0c1018', light: '#5888c8', outdoor: false,
    },
  },

  livingroom_day: {
    label: '客厅·白天',
    en: 'Living room, daytime',
    bg: '/backgrounds/livingroom_day.png',
    fallbackGradient: 'linear-gradient(180deg, #e8e0d0 0%, #d8d0c0 40%, #b8a888 100%)',
    ambientColor: '#d0c0a0',
    suggestedRelationships: ['family', 'friends', 'romantic'],
    charScale: 0.75,
    roomColors: {
      ceiling: '#f0e8d8', wall: '#e0d8c0', floor: '#b0a080',
      trim: '#c8b898', light: '#f8f0d0', outdoor: false,
    },
  },

  // ── 厨房 Kitchen ──────────────────────────────────────────
  kitchen_morning: {
    label: '厨房·早晨',
    en: 'Kitchen, morning',
    bg: '/backgrounds/kitchen_morning.png',
    fallbackGradient: 'linear-gradient(180deg, #d8d0c0 0%, #cec8b8 40%, #9a8c74 100%)',
    ambientColor: '#e8d8b0',
    suggestedRelationships: ['family'],
    charScale: 0.72,
    roomColors: {
      ceiling: '#e8e0d0', wall: '#d8d0b8', floor: '#a8987a',
      trim: '#c8b890', light: '#fff0b0', outdoor: false,
    },
  },
  kitchen_evening: {
    label: '厨房·傍晚',
    en: 'Kitchen, evening',
    bg: '/backgrounds/kitchen_evening.png',
    fallbackGradient: 'linear-gradient(180deg, #2a1808 0%, #3a2010 40%, #1a1008 100%)',
    ambientColor: '#4a3010',
    suggestedRelationships: ['family', 'romantic'],
    charScale: 0.72,
    roomColors: {
      ceiling: '#2a1808', wall: '#3a2818', floor: '#2a1a0c',
      trim: '#281808', light: '#e88830', outdoor: false,
    },
  },

  // ── 办公室 Office ─────────────────────────────────────────
  office_day: {
    label: '办公室·白天',
    en: 'Office, daytime',
    bg: '/backgrounds/office_day.png',
    fallbackGradient: 'linear-gradient(180deg, #c8d0d8 0%, #b0b8c8 40%, #8890a0 100%)',
    ambientColor: '#90a0b8',
    suggestedRelationships: ['colleagues'],
    charScale: 0.70,
    roomColors: {
      ceiling: '#c8d0d8', wall: '#a0a8b8', floor: '#808890',
      trim: '#909aa8', light: '#e0e8f0', outdoor: false,
    },
  },
  office_night: {
    label: '办公室·加班',
    en: 'Office, overtime night',
    bg: '/backgrounds/office_night.png',
    fallbackGradient: 'linear-gradient(180deg, #0a0e18 0%, #0e1220 40%, #080c14 100%)',
    ambientColor: '#1a2040',
    suggestedRelationships: ['colleagues'],
    charScale: 0.70,
    roomColors: {
      ceiling: '#101420', wall: '#1e2438', floor: '#141620',
      trim: '#182030', light: '#80aae0', outdoor: false,
    },
  },
  office_latenight: {
    label: '办公室·深夜',
    en: 'Office, late night',
    bg: '/backgrounds/office_latenight.png',
    fallbackGradient: 'linear-gradient(180deg, #080a14 0%, #0c1020 40%, #060a10 100%)',
    ambientColor: '#182838',
    suggestedRelationships: ['colleagues'],
    charScale: 0.70,
    roomColors: {
      ceiling: '#080a14', wall: '#141a28', floor: '#0c0e14',
      trim: '#101828', light: '#6088b0', outdoor: false,
    },
  },

  // ── 咖啡馆 Café ───────────────────────────────────────────
  cafe_day: {
    label: '咖啡馆·白天',
    en: 'Café, daytime',
    bg: '/backgrounds/cafe_day.png',
    fallbackGradient: 'linear-gradient(180deg, #e0d8c8 0%, #d0c8b0 40%, #a09878 100%)',
    ambientColor: '#d8c8a0',
    suggestedRelationships: ['friends', 'colleagues'],
    charScale: 0.72,
    roomColors: {
      ceiling: '#e0d8c8', wall: '#d0c8b0', floor: '#a09878',
      trim: '#c0b890', light: '#f8f0d0', outdoor: false,
    },
  },
  cafe_evening: {
    label: '咖啡馆·傍晚',
    en: 'Café, evening',
    bg: '/backgrounds/cafe_evening.png',
    fallbackGradient: 'linear-gradient(180deg, #160e08 0%, #1e1408 40%, #140e06 100%)',
    ambientColor: '#3a2a10',
    suggestedRelationships: ['friends', 'romantic'],
    charScale: 0.72,
    roomColors: {
      ceiling: '#1c1208', wall: '#382818', floor: '#281810',
      trim: '#221408', light: '#e87830', outdoor: false,
    },
  },

  // ── 公园 Park ─────────────────────────────────────────────
  park_day: {
    label: '公园·白天',
    en: 'Park, daytime',
    bg: '/backgrounds/park_day.png',
    fallbackGradient: 'linear-gradient(180deg, #88c0e8 0%, #78b0d0 35%, #40a050 70%, #308040 100%)',
    ambientColor: '#68a840',
    suggestedRelationships: ['friends', 'romantic'],
    charScale: 0.68,
    roomColors: {
      ceiling: '#88c0e8', wall: '#68a0d0', floor: '#308040',
      trim: '#408050', light: '#f0e8a0', outdoor: true,
    },
  },
  park_night: {
    label: '公园·夜',
    en: 'Park, night',
    bg: '/backgrounds/park_night.png',
    fallbackGradient: 'linear-gradient(180deg, #060e1a 0%, #0a1428 35%, #0c1810 70%, #080e08 100%)',
    ambientColor: '#1a3a20',
    suggestedRelationships: ['friends', 'romantic'],
    charScale: 0.68,
    roomColors: {
      ceiling: '#06101e', wall: '#0e1e3a', floor: '#0c1208',
      trim: '#101808', light: '#5878c8', outdoor: true,
    },
  },

  park_evening: {
    label: '公园·黄昏',
    en: 'Park, evening',
    bg: '/backgrounds/park_evening.png',
    fallbackGradient: 'linear-gradient(180deg, #3a1848 0%, #6a2850 35%, #c86820 70%, #804010 100%)',
    ambientColor: '#a05830',
    suggestedRelationships: ['friends', 'romantic'],
    charScale: 0.68,
    roomColors: {
      ceiling: '#4a2050', wall: '#7a3850', floor: '#604018',
      trim: '#503010', light: '#e8a030', outdoor: true,
    },
  },

  // ── 阳台 Balcony ──────────────────────────────────────────
  balcony_night: {
    label: '阳台·夜',
    en: 'Balcony, night',
    bg: '/backgrounds/balcony_night.png',
    fallbackGradient: 'linear-gradient(180deg, #060a18 0%, #0a1020 40%, #080c14 100%)',
    ambientColor: '#1a2838',
    suggestedRelationships: ['romantic'],
    charScale: 0.72,
    roomColors: {
      ceiling: '#060a18', wall: '#0e1828', floor: '#181410',
      trim: '#0c1420', light: '#e0c060', outdoor: true,
    },
  },

  balcony_evening: {
    label: '阳台·黄昏',
    en: 'Balcony, evening',
    bg: '/backgrounds/balcony_evening.png',
    fallbackGradient: 'linear-gradient(180deg, #6a4080 0%, #a06068 40%, #d89058 100%)',
    ambientColor: '#b07858',
    suggestedRelationships: ['romantic', 'friends'],
    charScale: 0.72,
    roomColors: {
      ceiling: '#7a5090', wall: '#b07070', floor: '#806040',
      trim: '#906050', light: '#e8b060', outdoor: true,
    },
  },

  // ── 车内 Car ──────────────────────────────────────────────
  car_night: {
    label: '车内·夜',
    en: 'Car, night',
    bg: '/backgrounds/car_night.png',
    fallbackGradient: 'linear-gradient(180deg, #080a10 0%, #0c1018 40%, #060810 100%)',
    ambientColor: '#1a2830',
    suggestedRelationships: ['romantic'],
    charScale: 0.60,    // confined space, characters smaller
    roomColors: {
      ceiling: '#080a10', wall: '#10181e', floor: '#0a0c10',
      trim: '#0c1018', light: '#40a0b0', outdoor: false,
    },
  },

  car_day: {
    label: '车内·白天',
    en: 'Car, daytime',
    bg: '/backgrounds/car_day.png',
    fallbackGradient: 'linear-gradient(180deg, #a0c8e0 0%, #b8c8b0 40%, #90a080 100%)',
    ambientColor: '#a0b890',
    suggestedRelationships: ['romantic', 'family'],
    charScale: 0.60,    // confined space, characters smaller
    roomColors: {
      ceiling: '#b8c0b0', wall: '#a0a890', floor: '#888878',
      trim: '#909080', light: '#e0e8c0', outdoor: false,
    },
  },

  // ── 书房 Study ────────────────────────────────────────────
  study_afternoon: {
    label: '书房·午后',
    en: 'Study, afternoon',
    bg: '/backgrounds/study_afternoon.png',
    fallbackGradient: 'linear-gradient(180deg, #2a2018 0%, #3a2820 40%, #1a1410 100%)',
    ambientColor: '#4a3820',
    suggestedRelationships: ['friends', 'family'],
    charScale: 0.72,
    roomColors: {
      ceiling: '#2a2018', wall: '#3a2820', floor: '#1a1410',
      trim: '#281c10', light: '#e0c060', outdoor: false,
    },
  },

  study_night: {
    label: '书房·深夜',
    en: 'Study, late night',
    bg: '/backgrounds/study_night.png',
    fallbackGradient: 'linear-gradient(180deg, #0e0c14 0%, #181420 40%, #0a0810 100%)',
    ambientColor: '#1a1828',
    suggestedRelationships: ['friends', 'family'],
    charScale: 0.72,
    roomColors: {
      ceiling: '#100e16', wall: '#1c1828', floor: '#140e0c',
      trim: '#181420', light: '#40a060', outdoor: false,
    },
  },

  // ── 地铁 Subway ───────────────────────────────────────────
  subway_evening: {
    label: '地铁·傍晚',
    en: 'Subway, evening',
    bg: '/backgrounds/subway_evening.png',
    fallbackGradient: 'linear-gradient(180deg, #888890 0%, #707078 40%, #505058 100%)',
    ambientColor: '#606068',
    suggestedRelationships: ['romantic', 'friends'],
    charScale: 0.68,
    roomColors: {
      ceiling: '#888890', wall: '#707078', floor: '#505058',
      trim: '#606068', light: '#d0d0d8', outdoor: false,
    },
  },

  // ── 餐厅 Restaurant ──────────────────────────────────────
  restaurant_night: {
    label: '餐厅·夜',
    en: 'Restaurant, night',
    bg: '/backgrounds/restaurant_night.png',
    fallbackGradient: 'linear-gradient(180deg, #1a0a0a 0%, #2a1018 40%, #100810 100%)',
    ambientColor: '#3a1828',
    suggestedRelationships: ['romantic'],
    charScale: 0.72,
    roomColors: {
      ceiling: '#1a0a0a', wall: '#2a1018', floor: '#180c0c',
      trim: '#201010', light: '#e0a040', outdoor: false,
    },
  },

  restaurant_evening: {
    label: '餐厅·傍晚',
    en: 'Restaurant, evening',
    bg: '/backgrounds/restaurant_evening.png',
    fallbackGradient: 'linear-gradient(180deg, #2a1818 0%, #3a2020 40%, #1a1010 100%)',
    ambientColor: '#4a2820',
    suggestedRelationships: ['romantic', 'friends'],
    charScale: 0.72,
    roomColors: {
      ceiling: '#2a1818', wall: '#3a2420', floor: '#201410',
      trim: '#2a1a14', light: '#e8a840', outdoor: false,
    },
  },

  // ── Legacy aliases (backward compatibility) ───────────────
  // These map old scene keys to new ones
  get outdoor_park() { return this.park_night },
  get cafe() { return this.cafe_evening },
  get office() { return this.office_night },
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
