// ─────────────────────────────────────────────────────────────
//  applyConflictProfile — RSL beat parameterisation
//
//  Takes the base scenario beats and a conflict profile, returns
//  a new beats array with adjusted:
//    • thought text   (expression style + interpretation bias)
//    • bubble type    (interpretation bias)
//    • spatial lean   (conflict strategy)
//    • intensity      (aggregate bias/strategy multiplier)
//
//  Profile shape:
//    { A: { expression, interpretation, strategy },   ← 0..1 each
//      B: { expression, interpretation, strategy } }
//
//  Dimensions:
//    expression    0 = 克制 (restrained)   1 = 直接 (direct)
//    interpretation 0 = 善意 (charitable)  1 = 防御 (defensive)
//    strategy      0 = 退让 (concede)      1 = 坚守 (hold ground)
// ─────────────────────────────────────────────────────────────

// ── Pre-defined thought text variants per beat per persona ───
//  Each entry: [restrained/charitable, direct/defensive]
const THOUGHT_VARIANTS = {
  A: {
    1: {
      expression:    ['他可能在忙，\n但我还是很失落…',       '他为什么不回我…\n是不在乎我吗？'],
      interpretation:['他肯定有原因的，\n但我真的很担心。',  '他为什么不回我…\n是不在乎我吗？'],
    },
    3: {
      expression:    ['也许他真的很忙，\n我说话是不是太重了。', '忙？一条消息的时间都没有？\n他根本没把我放在心上。'],
      interpretation:['我说话有点重，\n但我就是需要他回应。', '忙？一条消息的时间都没有？\n他根本没把我放在心上。'],
    },
    4: {
      expression:    ['他发火了…\n我只是需要他看见我。',     '他又在对我发火了。\n我只是想要他在乎我…'],
      interpretation:['他压力很大，\n但我真的很难过。',       '他又在对我发火了。\n我只是想要他在乎我…'],
    },
  },
  B: {
    2: {
      expression:    ['我没时间解释，\n也不知道怎么说。',    '我就是在忙啊。\n这有什么好追问的。'],
      interpretation:['她在关心我，\n但我现在真的没力气。',  '我就是在忙啊。\n这有什么好追问的。'],
    },
    4: {
      expression:    ['我说了不想说，\n她为什么不能等一等。', '她不理解我的压力。\n为什么每次都这样！'],
      interpretation:['她只是在乎我，\n但我真的受不了这种压力。', '她不理解我的压力。\n为什么每次都这样！'],
    },
  },
}

// ── Bubble type mapping ──────────────────────────────────────
//  High defensive interpretation → more reactive bubble types
//  Low (charitable)              → introspective cloud bubble
function adjustBubbleType(base, interpretation) {
  if (interpretation < 0.3) {
    if (base === 'aggressive') return 'cloud'
    if (base === 'hesitation') return 'cloud'
  }
  if (interpretation > 0.72) {
    if (base === 'cloud')      return 'hesitation'
    if (base === 'hesitation') return 'aggressive'
  }
  return base
}

// ── Spatial lean mapping ─────────────────────────────────────
//  High strategy (hold ground) → maintain / amplify forward lean
//  Low strategy  (concede)     → pull back from forward lean
function adjustLean(base, strategy) {
  if (strategy < 0.32 && base === 'forward') return 'none'
  if (strategy > 0.72 && base === 'none')    return 'forward'
  return base
}

// ── Text selection helper ────────────────────────────────────
//  Picks between [restrained, direct] or [charitable, defensive]
//  based on a 0–1 dimension value. Uses a dead-zone in the middle.
function pickVariant(variants, value) {
  if (!variants) return null
  const [low, high] = variants
  if (value < 0.35) return low
  if (value > 0.65) return high
  return null                   // middle → keep original
}

// ── Main transform ───────────────────────────────────────────
export function applyConflictProfile(beats, profile) {
  return beats.map(beat => {
    const thoughts  = { ...beat.thoughts }
    const spatial   = { ...beat.spatial }

    ;['A', 'B'].forEach(id => {
      const p    = profile[id]
      const base = beat.thoughts?.[id]
      if (!base) return

      const vars = THOUGHT_VARIANTS[id]?.[beat.id]

      // — text selection —
      let text = base.text
      if (vars) {
        const byExpr   = pickVariant(vars.expression,    p.expression)
        const byInterp = pickVariant(vars.interpretation, p.interpretation)
        // interpretation bias overrides expression when strongly polarised
        text = byInterp ?? byExpr ?? base.text
      }

      thoughts[id] = {
        ...base,
        text,
        bubbleType: adjustBubbleType(base.bubbleType, p.interpretation),
      }

      // — lean —
      if (beat.spatial?.[id]) {
        spatial[id] = {
          ...beat.spatial[id],
          lean: adjustLean(beat.spatial[id].lean, p.strategy),
        }
      }
    })

    // — intensity scale —
    //  Higher combined defensiveness + hold-ground → more intense
    const avgBias     = (profile.A.interpretation + profile.B.interpretation) / 2
    const avgStrategy = (profile.A.strategy       + profile.B.strategy)       / 2
    const multiplier  = 0.82 + avgBias * 0.11 + avgStrategy * 0.09
    const intensity   = Math.min(1.0, beat.intensity * multiplier)

    return { ...beat, thoughts, spatial, intensity }
  })
}

// Default profile — centred on all axes
export const DEFAULT_PROFILE = {
  A: { expression: 0.5, interpretation: 0.5, strategy: 0.5 },
  B: { expression: 0.5, interpretation: 0.5, strategy: 0.5 },
}
