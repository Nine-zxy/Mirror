// ─────────────────────────────────────────────────────────────
//  generateScenario — Conflict text + archetype → RSL v2 scenario
//
//  Two-stage pipeline:
//
//  Stage 1 — callGeminiCalibration(chatLog, archetype)
//    Light call (temp 0.5, ~1500 tokens) that extracts 2-3 behavioral
//    patterns per partner from the chat log. User confirms/adjusts.
//
//  Stage 2 — generateScenario({ chatLog, concerns, archetype, calibration })
//    Full scene generation with archetype anchoring + calibration
//    constraints injected into the system prompt.
//
//  Drama Element Mapping (see dramaElements.js for full table):
//    Character archetype → Diction style in dialogue
//    Calibrated traits  → Thought patterns per beat
//    Scene preset       → Spectacle (background image)
//
//  Returns:  { scenario, source: 'ai' | 'fallback' }
// ─────────────────────────────────────────────────────────────

import { scenario as BASE_SCENARIO } from '../data/scenario'
import { RELATIONSHIP_TYPES, COMM_STYLES } from '../data/dramaElements'

// ── Calibration system prompt ─────────────────────────────────
const CALIBRATION_SYSTEM_PROMPT = `You are a behavioral pattern analyst for Aside, a dyadic conflict reflection system.
Given a conflict conversation and two personas' communication archetypes, identify 2-3 specific behavioral patterns each person exhibits.
These patterns help reconstruct realistic inner states and dialogue in the drama scene.
Output ONLY valid JSON. No markdown, no explanation.`

function buildCalibrationPrompt(chatLog, archetype) {
  const relType = RELATIONSHIP_TYPES.find(r => r.id === archetype.relationshipType)
  const stylesA = (archetype.styleA || []).map(id => COMM_STYLES.find(s => s.id === id)?.label).filter(Boolean)
  const stylesB = (archetype.styleB || []).map(id => COMM_STYLES.find(s => s.id === id)?.label).filter(Boolean)

  return `Analyse this conflict conversation between two people.

RELATIONSHIP TYPE: ${relType?.label || '未知'} (${relType?.en || ''})
PARTNER A communication style: ${stylesA.join(', ') || '未指定'}
PARTNER B communication style: ${stylesB.join(', ') || '未指定'}

CONVERSATION:
"""
${chatLog.trim().slice(0, 2000)}
"""

Return JSON matching this schema EXACTLY:
{
  "namesDetected": { "A": "<name from conversation or 伴侣A>", "B": "<name or 伴侣B>" },
  "inferA": [
    { "text": "<specific behavioral pattern for A, 15-25 Chinese chars, concrete and observable>" },
    { "text": "<another pattern>" }
  ],
  "inferB": [
    { "text": "<specific behavioral pattern for B>" },
    { "text": "<another pattern>" }
  ]
}

RULES:
- Each inference describes a SPECIFIC observable pattern, not a personality label
- Patterns should be concrete: "倾向于用问句表达不满" not "情绪化"
- 2-3 inferences per partner (no more than 3)
- All text in Simplified Chinese
- Be precise and insightful, not generic`
}

// ── Chat log parser ──────────────────────────────────────────
// Parses WeChat-style chat logs into structured messages
// Supports formats:
//   "小美：你为什么不回我消息？"
//   "小凯: 我在忙啊"
//   "小美(2024/3/15 22:01): 你为什么不回我"
function parseChatLog(chatLog, nameA, nameB) {
  const lines = chatLog.trim().split('\n').filter(l => l.trim())
  const messages = []
  // Detect speaker patterns
  const speakerPattern = /^([^\s，。,\.:\n(（]{1,8})\s*(?:\([^)]*\))?\s*[:：]\s*(.+)/
  const detectedNames = new Set()

  for (const line of lines) {
    const match = line.match(speakerPattern)
    if (match) {
      const name = match[1].trim()
      const text = match[2].trim()
      if (text.length > 0) {
        detectedNames.add(name)
        messages.push({ name, text })
      }
    }
  }

  // Map detected names to A/B roles
  const nameList = [...detectedNames]
  let mapNameToRole = {}
  if (nameA && nameList.includes(nameA)) {
    mapNameToRole[nameA] = 'A'
    const otherNames = nameList.filter(n => n !== nameA)
    if (otherNames.length > 0) mapNameToRole[otherNames[0]] = 'B'
  } else if (nameB && nameList.includes(nameB)) {
    mapNameToRole[nameB] = 'B'
    const otherNames = nameList.filter(n => n !== nameB)
    if (otherNames.length > 0) mapNameToRole[otherNames[0]] = 'A'
  } else if (nameList.length >= 2) {
    mapNameToRole[nameList[0]] = 'A'
    mapNameToRole[nameList[1]] = 'B'
  } else if (nameList.length === 1) {
    mapNameToRole[nameList[0]] = 'A'
  }

  // Build structured messages with roles
  const parsed = messages
    .map(m => ({ role: mapNameToRole[m.name] || null, name: m.name, text: m.text }))
    .filter(m => m.role)

  // Merge consecutive messages from same speaker
  const merged = []
  for (const msg of parsed) {
    const last = merged[merged.length - 1]
    if (last && last.role === msg.role && last.text.length + msg.text.length < 60) {
      last.text += '\n' + msg.text
    } else {
      merged.push({ ...msg })
    }
  }

  return {
    messages: merged,
    nameA: Object.entries(mapNameToRole).find(([,v]) => v === 'A')?.[0] || nameA || '伴侣A',
    nameB: Object.entries(mapNameToRole).find(([,v]) => v === 'B')?.[0] || nameB || '伴侣B',
  }
}

// ── Build beats from parsed messages ─────────────────────────
// Each message becomes one beat with its original dialogue preserved
function buildBeatsFromMessages(messages) {
  const beats = []

  // Beat 0: scene-setting (no dialogue)
  beats.push({
    id: 0,
    speaker: null,
    text: null,
    isOpening: true,
  })

  // Each message = one beat
  for (let i = 0; i < messages.length; i++) {
    beats.push({
      id: i + 1,
      speaker: messages[i].role,
      text: messages[i].text,
      isOpening: false,
    })
  }

  return beats
}

// ── Main system prompt (new: thoughts-only generation) ───────
const BASE_SYSTEM_PROMPT = `You are the inner-thought inference engine for Aside — a research system for HCI studies on dyadic conflict reflection.

Your job: Given a sequence of dialogue beats from a real conflict conversation, generate the INNER THOUGHTS (what each person was thinking but not saying) for every beat.

You do NOT generate dialogue — the dialogue is already provided from the original chat log.
You ONLY generate thoughts, emotions, spatial staging, and scene metadata.

Output ONLY valid JSON — no markdown, no explanation, no code fences.`

// ── Main prompt builder (new architecture) ───────────────────
function buildPrompt({ chatLog, concernA, concernB, context, archetype, calibration, userRole, userName }) {
  const contextBlock = context ? `\nBACKGROUND CONTEXT:\n${context}\n` : ''
  const concernBlock = (concernA || concernB)
    ? `\nCORE CONCERNS:\n- Partner A: ${concernA || '(not provided)'}\n- Partner B: ${concernB || '(not provided)'}\n`
    : ''

  // Parse chat log into structured messages
  const calNames = calibration?.namesDetected || {}
  const parsed = parseChatLog(chatLog, calNames.A || userName, calNames.B)

  // Build beat list from parsed messages
  const beatList = buildBeatsFromMessages(parsed.messages)

  // ── Archetype anchoring block ────────────────────────────
  let archetypeBlock = ''
  if (archetype) {
    const relType = RELATIONSHIP_TYPES.find(r => r.id === archetype.relationshipType)
    const stylesA = (archetype.styleA || []).map(id => {
      const s = COMM_STYLES.find(st => st.id === id)
      return s ? `${s.label} (${s.promptHint})` : id
    })
    const stylesB = (archetype.styleB || []).map(id => {
      const s = COMM_STYLES.find(st => st.id === id)
      return s ? `${s.label} (${s.promptHint})` : id
    })

    archetypeBlock = `
[ARCHETYPE ANCHORING]
Relationship type: ${relType?.label || ''} — ${relType?.promptHint || ''}
Partner A (${parsed.nameA}) communication style: ${stylesA.join('; ')}
Partner B (${parsed.nameB}) communication style: ${stylesB.join('; ')}
→ Inner thoughts should reflect these communication patterns.
`
  }

  // ── Calibration constraints block ────────────────────────
  let calibrationBlock = ''
  if (calibration) {
    const confirmedA = (calibration.inferA || []).filter(i => i.confirmed !== false)
    const confirmedB = (calibration.inferB || []).filter(i => i.confirmed !== false)
    if (confirmedA.length > 0 || confirmedB.length > 0) {
      calibrationBlock = `
[BEHAVIORAL CALIBRATION — User-verified patterns]
Partner A patterns: ${confirmedA.map(i => i.adjusted || i.text).join('; ')}
Partner B patterns: ${confirmedB.map(i => i.adjusted || i.text).join('; ')}
→ These patterns MUST be reflected in the generated inner thoughts.
`
    }
  }

  // ── Scene enum ─────────────────────────────────────────────
  const sceneEnum = archetype?.relationshipType === 'colleagues'
    ? 'bedroom_night | livingroom_evening | kitchen_morning | outdoor_park | cafe | office'
    : 'bedroom_night | livingroom_evening | kitchen_morning | outdoor_park | cafe'

  // ── Build the pre-structured beats for the prompt ──────────
  const beatsDescription = beatList.map(b => {
    if (b.isOpening) return `Beat ${b.id}: [OPENING — no dialogue, scene-setting]`
    return `Beat ${b.id}: ${b.speaker} says: "${b.text}"`
  }).join('\n')

  return `Here is a parsed conflict conversation between ${parsed.nameA} (Partner A) and ${parsed.nameB} (Partner B).
The dialogue is ALREADY extracted from the original chat log — do NOT change it.
Your job is to generate inner thoughts for each beat.

PARSED DIALOGUE (${beatList.length} beats):
${beatsDescription}
${contextBlock}${concernBlock}${archetypeBlock}${calibrationBlock}
Generate a complete JSON scenario. The dialogue for each beat is FIXED — copy it exactly as shown above.
You must generate thoughts for BOTH A and B on every beat that has dialogue.

REQUIRED JSON SCHEMA:
{
  "id": "generated_conflict",
  "title": "<4-8 char Chinese title summarizing the conflict>",
  "subtitle": "<short English subtitle>",
  "scene": "<one of: ${sceneEnum}>",
  "sceneElements": ["<3-5 items>"],
  "personas": {
    "A": {
      "id": "A", "name": "${parsed.nameA}", "label": "PARTNER A",
      "color": "#7ab0e8", "darkColor": "#4a80c8", "glowColor": "rgba(122,176,232,0.55)",
      "thoughtBg": "rgba(80,130,210,0.13)", "thoughtBorder": "#5882d0",
      "hairColor": "#8B4513", "outfitColor": "#4a80c8", "outfitDark": "#2a5098",
      "hairStyle": "<short|medium|long|tied|curly>",
      "outfitStyle": "<casual|formal|sporty|hoodie>",
      "accessory": "<none|glasses|hat>"
    },
    "B": {
      "id": "B", "name": "${parsed.nameB}", "label": "PARTNER B",
      "color": "#e87a7a", "darkColor": "#b84a4a", "glowColor": "rgba(232,122,122,0.55)",
      "thoughtBg": "rgba(210,80,80,0.13)", "thoughtBorder": "#c85050",
      "hairColor": "#3a2820", "outfitColor": "#b84a4a", "outfitDark": "#7a2a2a",
      "hairStyle": "<short|medium|long|tied|curly>",
      "outfitStyle": "<casual|formal|sporty|hoodie>",
      "accessory": "<none|glasses|hat>"
    }
  },
  "beats": [
    {
      "id": 0, "duration": 3000, "intensity": 0.05,
      "narrator": "<纯事实：时间地点，如'晚上十点，卧室'>",
      "proxemic": { "state": "neutral", "divider": false },
      "spatial": {
        "A": { "x": 25, "facing": "right", "pose": "neutral", "lean": "none", "scale": 1.0, "visible": true },
        "B": { "x": 75, "facing": "left",  "pose": "neutral", "lean": "none", "scale": 1.0, "visible": true }
      },
      "thoughts": { "A": null, "B": null },
      "dialogue": null
    },
    {
      "id": 1, "duration": 4500, "intensity": 0.2,
      "narrator": null,
      "proxemic": { "state": "<proxemic state>", "divider": false },
      "spatial": {
        "A": { "x": "<15-85>", "facing": "<left|right>", "pose": "<pose>", "lean": "none", "scale": 1.0, "visible": true },
        "B": { "x": "<15-85>", "facing": "<left|right>", "pose": "<pose>", "lean": "none", "scale": 1.0, "visible": true }
      },
      "thoughts": {
        "A": { "text": "<说这句话/听到这句话时没说出口的真实想法，2-3行>", "emotion": "<emotion>", "bubbleType": "<cloud|aggressive|hesitation|warm>" },
        "B": { "text": "<听到/说这句话时的内心反应，2-3行>", "emotion": "<emotion>", "bubbleType": "<cloud|aggressive|hesitation|warm>" }
      },
      "dialogue": { "speaker": "<A or B — MUST match the parsed beat>", "text": "<EXACT text from parsed beat — do NOT rewrite>" }
    }
    // ... generate ALL ${beatList.length} beats
  ]
}

CRITICAL RULES:
- dialogue.text for each beat MUST be the EXACT text from the PARSED DIALOGUE above. Do NOT rewrite, summarize, or rephrase.
- dialogue.speaker MUST match the parsed beat (A or B as shown above).
- Beat 0 is always the scene-setting beat (narrator only, no dialogue, no thoughts).
- For ALL other beats: thoughts MUST exist for BOTH A and B. No null thoughts on dialogue beats.
- narrator: null on most beats. Only use for observable facts (time/place/action). NEVER interpret emotions in narrator.
- thoughts text: 2-3 lines, specific and concrete, revealing the gap between what is said and what is felt.
- thoughts should directly reflect the core concerns if provided.
- intensity: 0.0-1.0, following natural conflict arc across all beats.
- All text in Simplified Chinese.
- valid emotion: anxious | defensive | angry | hurt | withdrawn | warm | reflective | surprised | neutral
- valid pose: neutral | sitting | confrontational | defensive | angry | hurt | anxious | withdrawn
- valid proxemic.state: neutral | approaching | tension | hot | cold
- valid bubbleType: cloud | aggressive | hesitation | warm`
}

// ── Gemini API call ───────────────────────────────────────────
async function callGemini({ systemPrompt, userPrompt, temperature = 0.7, maxOutputTokens = 12000 }) {
  const resp = await fetch('/api/gemini/v1beta/models/gemini-2.5-flash:generateContent', {
    method:  'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens,
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  })

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`Engine error ${resp.status}: ${err}`)
  }

  const data = await resp.json()
  const raw  = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const clean = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  return JSON.parse(clean)
}

// ── Fallback ──────────────────────────────────────────────────
function extractNamesFromText(text) {
  const patterns = [
    /^([^\s，。,\.:\n]{2,4})[:：]/m,
    /([^\s，。,\.]{2,3})(?:说|问|回答|发了|发消息)/,
  ]
  const names = []
  for (const line of text.split('\n').slice(0, 20)) {
    for (const pat of patterns) {
      const m = line.match(pat)
      if (m?.[1] && !names.includes(m[1]) && m[1].length >= 2) {
        names.push(m[1])
      }
      if (names.length >= 2) break
    }
    if (names.length >= 2) break
  }
  return { nameA: names[0] || null, nameB: names[1] || null }
}

function fallbackScenario(input) {
  const chatLog = typeof input === 'string' ? input : input.chatLog
  const { nameA, nameB } = extractNamesFromText(chatLog)
  const base = JSON.parse(JSON.stringify(BASE_SCENARIO))

  if (nameA) base.personas.A.name = nameA
  if (nameB) base.personas.B.name = nameB

  // Apply archetype-based appearance if available
  if (input.archetype?.relationshipType) {
    const { RELATIONSHIP_TYPES: RT } = import.meta.env.MODE === 'test'
      ? { RELATIONSHIP_TYPES }
      : { RELATIONSHIP_TYPES }
    const relType = RT.find(r => r.id === input.archetype.relationshipType)
    if (relType?.defaultAppearanceA) {
      base.personas.A = { ...base.personas.A, ...relType.defaultAppearanceA }
      base.personas.B = { ...base.personas.B, ...(relType.defaultAppearanceB || {}) }
      base.scene = relType.defaultScene || 'bedroom_night'
    }
  }

  if (!base.scene) base.scene = 'bedroom_night'
  if (!base.sceneElements) base.sceneElements = ['window', 'bed', 'lamp', 'phone_screen']

  const titleMatch = chatLog.match(/[\u4e00-\u9fa5]{2,8}/)
  if (titleMatch) base.title = titleMatch[0].slice(0, 8)

  return base
}

// ─────────────────────────────────────────────────────────────
//  Public API
// ─────────────────────────────────────────────────────────────
// In dev: VITE_GEMINI_API_KEY enables the Vite proxy.
// In production: the serverless function at /api/gemini handles the key server-side,
// so we enable AI calls whenever we're not in dev mode OR have a key set.
export const API_KEY_AVAILABLE =
  import.meta.env.PROD || Boolean(import.meta.env.VITE_GEMINI_API_KEY)

// Stage 1: light calibration call
export async function callGeminiCalibration(chatLog, archetype) {
  if (!API_KEY_AVAILABLE) {
    // Return mock inferences in offline mode
    return {
      namesDetected: { A: '伴侣A', B: '伴侣B' },
      inferA: [
        { text: '倾向于用问句表达不满，而非直接陈述感受' },
        { text: '情绪激动时会重复类似的问题' },
      ],
      inferB: [
        { text: '压力下回复变得简短，用简单词语敷衍' },
        { text: '倾向于用"忙"或外部原因解释自己的行为' },
      ],
    }
  }

  const result = await callGemini({
    systemPrompt: CALIBRATION_SYSTEM_PROMPT,
    userPrompt:   buildCalibrationPrompt(chatLog, archetype),
    temperature:  0.5,
    maxOutputTokens: 1500,
  })
  return result
}

// Stage 2: full scenario generation
export async function generateScenario(input) {
  // Legacy: accept plain string
  const inputObj = typeof input === 'string'
    ? { chatLog: input, concernA: '', concernB: '', context: '', archetype: null, calibration: null }
    : input

  if (API_KEY_AVAILABLE) {
    try {
      const scenario = await callGemini({
        systemPrompt:    BASE_SYSTEM_PROMPT,
        userPrompt:      buildPrompt(inputObj),
        temperature:     0.75,
        maxOutputTokens: 12000,
      })
      mergePersonaDefaults(scenario)
      applyArchetypeAppearance(scenario, inputObj.archetype)
      return { scenario, source: 'ai' }
    } catch (err) {
      console.warn('[Aside] Engine failed, using fallback:', err.message)
    }
  }

  return { scenario: fallbackScenario(inputObj), source: 'fallback' }
}

// ── Helpers ───────────────────────────────────────────────────

// Fill any missing persona colour fields from the base scenario
function mergePersonaDefaults(sc) {
  const defaults = BASE_SCENARIO.personas
  ;['A', 'B'].forEach(id => {
    if (!sc.personas?.[id]) return
    sc.personas[id] = { ...defaults[id], ...sc.personas[id] }
  })
}

// If LLM didn't set hairStyle/outfitStyle, apply archetype defaults
function applyArchetypeAppearance(scenario, archetype) {
  if (!archetype?.relationshipType) return
  const relType = RELATIONSHIP_TYPES.find(r => r.id === archetype.relationshipType)
  if (!relType) return

  const pA = scenario.personas?.A
  const pB = scenario.personas?.B
  if (pA && !pA.hairStyle && relType.defaultAppearanceA) {
    Object.assign(pA, relType.defaultAppearanceA)
  }
  if (pB && !pB.hairStyle && relType.defaultAppearanceB) {
    Object.assign(pB, relType.defaultAppearanceB)
  }
  // Also default the scene if LLM chose an unexpected scene
  if (scenario.scene === 'bedroom_night' && relType.defaultScene) {
    // Keep LLM choice — just fall back if scene is undefined
  }
  if (!scenario.scene) {
    scenario.scene = relType.defaultScene || 'bedroom_night'
  }
}
