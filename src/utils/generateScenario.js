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

// ── Main system prompt ────────────────────────────────────────
const BASE_SYSTEM_PROMPT = `You are the scenario reconstruction engine for Aside — a research system for HCI studies on dyadic conflict dynamics.
Analyse the relationship conflict provided and output a structured 7-beat dramatic scenario in JSON.
The scenario reconstructs the conflict as a theatrical performance with two characters.
Output ONLY valid JSON — no markdown, no explanation, no code fences.`

// ── Main prompt builder ───────────────────────────────────────
function buildPrompt({ chatLog, concernA, concernB, context, archetype, calibration }) {
  const contextBlock = context ? `\nBACKGROUND CONTEXT:\n${context}\n` : ''
  const concernBlock = (concernA || concernB)
    ? `\nCORE CONCERNS:\n- Partner A: ${concernA || '(not provided)'}\n- Partner B: ${concernB || '(not provided)'}\n`
    : ''

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
[ARCHETYPE ANCHORING — Role-play constraints, not personality labels]
Relationship type: ${relType?.label || ''} — ${relType?.promptHint || ''}
Partner A communication archetype: ${stylesA.join('; ')}
Partner B communication archetype: ${stylesB.join('; ')}
→ Ensure dialogue word choice, response style, and inner thoughts reflect these archetypes consistently.
  Example: an avoidant person does NOT say "I don't want to talk" — they say "Fine" or go silent.
  An anxious person repeats the same question in different forms across beats.
`
  }

  // ── Calibration constraints block ────────────────────────
  let calibrationBlock = ''
  if (calibration) {
    const confirmedA = (calibration.inferA || []).filter(i => i.confirmed !== false)
    const confirmedB = (calibration.inferB || []).filter(i => i.confirmed !== false)
    if (confirmedA.length > 0 || confirmedB.length > 0) {
      calibrationBlock = `
[BEHAVIORAL CALIBRATION — User-verified patterns from actual conversation]
Partner A confirmed patterns:
${confirmedA.map(i => `- ${i.adjusted || i.text}`).join('\n')}
Partner B confirmed patterns:
${confirmedB.map(i => `- ${i.adjusted || i.text}`).join('\n')}
→ These patterns MUST be visible in both dialogue (Diction) and inner thoughts (Thought).
  They are the user's ground truth about how these two people communicate.
`
    }
  }

  // ── Scene enum — expanded ─────────────────────────────────
  const sceneEnum = archetype?.relationshipType === 'colleagues'
    ? 'bedroom_night | livingroom_evening | kitchen_morning | outdoor_park | cafe | office'
    : 'bedroom_night | livingroom_evening | kitchen_morning | outdoor_park | cafe'

  return `Analyse this conflict and return a JSON scenario matching the schema below exactly.

CONFLICT INPUT:
"""
${chatLog.trim()}
"""
${contextBlock}${concernBlock}${archetypeBlock}${calibrationBlock}
REQUIRED JSON SCHEMA (output this object only):
{
  "id": "generated_conflict",
  "title": "<8-char Chinese title>",
  "subtitle": "<English subtitle>",
  "scene": "<one of: ${sceneEnum}>",
  "sceneElements": ["<3-5 items from: bed, sofa, table, lamp, phone_screen, window, moon, tree, bench, cup, desk, coffee>"],
  "personas": {
    "A": {
      "id": "A", "name": "<Person A name from input>", "label": "PARTNER A",
      "color": "#7ab0e8", "darkColor": "#4a80c8", "glowColor": "rgba(122,176,232,0.55)",
      "thoughtBg": "rgba(80,130,210,0.13)", "thoughtBorder": "#5882d0",
      "hairColor": "#8B4513", "outfitColor": "#4a80c8", "outfitDark": "#2a5098",
      "hairStyle": "<short|medium|long|tied|curly>",
      "outfitStyle": "<casual|formal|sporty|hoodie>",
      "accessory": "<none|glasses|hat>"
    },
    "B": {
      "id": "B", "name": "<Person B name from input>", "label": "PARTNER B",
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
      "id": 0, "duration": 3200, "intensity": 0.05,
      "narrator": "<scene-setting sentence in Chinese>",
      "proxemic": { "state": "neutral", "divider": false },
      "spatial": {
        "A": { "x": 18, "facing": "right", "pose": "neutral", "lean": "none", "scale": 1.0, "visible": true },
        "B": { "x": 74, "facing": "left",  "pose": "neutral", "lean": "none", "scale": 1.0, "visible": true }
      },
      "thoughts": { "A": null, "B": null },
      "dialogue": null
    },
    {
      "id": 1, "duration": 4600, "intensity": 0.25,
      "narrator": null,
      "proxemic": { "state": "approaching", "divider": false },
      "spatial": {
        "A": { "x": 30, "facing": "right", "pose": "confrontational", "lean": "forward", "scale": 1.05, "visible": true },
        "B": { "x": 72, "facing": "left",  "pose": "neutral", "lean": "none", "scale": 1.0, "visible": true }
      },
      "thoughts": {
        "A": { "text": "<A's unspoken opening feeling — 2 lines Chinese>", "emotion": "anxious", "bubbleType": "hesitation" },
        "B": null
      },
      "dialogue": { "speaker": "A", "text": "<A's opening line — match A's communication archetype>" }
    },
    {
      "id": 2, "duration": 3800, "intensity": 0.45,
      "narrator": null,
      "proxemic": { "state": "tension", "divider": true },
      "spatial": {
        "A": { "x": 32, "facing": "right", "pose": "anxious", "lean": "none", "scale": 1.0, "visible": true },
        "B": { "x": 67, "facing": "left",  "pose": "defensive", "lean": "back", "scale": 1.0, "visible": true }
      },
      "thoughts": {
        "A": null,
        "B": { "text": "<B's defensive reaction — 2 lines>", "emotion": "defensive", "bubbleType": "cloud" }
      },
      "dialogue": { "speaker": "B", "text": "<B's response — match B's communication archetype>" }
    },
    {
      "id": 3, "duration": 4800, "intensity": 0.62,
      "isPausePoint": true,
      "reflectionPrompt": "<First reflection question about the escalation — Chinese>",
      "proxemic": { "state": "hot", "divider": true },
      "spatial": {
        "A": { "x": 38, "facing": "right", "pose": "confrontational", "lean": "forward", "scale": 1.05, "visible": true },
        "B": { "x": 64, "facing": "left",  "pose": "defensive", "lean": "back", "scale": 1.0, "visible": true }
      },
      "thoughts": {
        "A": { "text": "<A's escalated inner state — 2 lines>", "emotion": "hurt", "bubbleType": "hesitation" },
        "B": { "text": "<B's inner frustration — 2 lines>", "emotion": "defensive", "bubbleType": "cloud" }
      },
      "dialogue": { "speaker": "A", "text": "<A's escalated line>" }
    },
    {
      "id": 4, "duration": 4200, "intensity": 0.78,
      "narrator": null,
      "proxemic": { "state": "hot", "divider": true },
      "spatial": {
        "A": { "x": 40, "facing": "right", "pose": "hurt", "lean": "back", "scale": 1.0, "visible": true },
        "B": { "x": 62, "facing": "left",  "pose": "angry", "lean": "forward", "scale": 1.08, "visible": true }
      },
      "thoughts": {
        "A": null,
        "B": { "text": "<B's peak frustration — 2 lines>", "emotion": "angry", "bubbleType": "aggressive" }
      },
      "dialogue": { "speaker": "B", "text": "<B's peak outburst — true to B's archetype>" }
    },
    {
      "id": 5, "duration": 4800, "intensity": 0.88,
      "narrator": null,
      "proxemic": { "state": "cold", "divider": true },
      "spatial": {
        "A": { "x": 28, "facing": "right", "pose": "withdrawn", "lean": "back", "scale": 0.98, "visible": true },
        "B": { "x": 72, "facing": "left",  "pose": "withdrawn", "lean": "back", "scale": 0.98, "visible": true }
      },
      "thoughts": {
        "A": { "text": "<A's withdrawal inner state — 2 lines>", "emotion": "hurt", "bubbleType": "cloud" },
        "B": { "text": "<B's inner regret — 2 lines>", "emotion": "reflective", "bubbleType": "hesitation" }
      },
      "dialogue": { "speaker": "A", "text": "<A's quiet hurt or silence line>" }
    },
    {
      "id": 6, "duration": 5200, "intensity": 0.95,
      "isPausePoint": true,
      "reflectionPrompt": "<Final reflection — what was never said? Chinese>",
      "proxemic": { "state": "cold", "divider": true },
      "spatial": {
        "A": { "x": 22, "facing": "right", "pose": "hurt", "lean": "none", "scale": 1.0, "visible": true },
        "B": { "x": 78, "facing": "left",  "pose": "withdrawn", "lean": "none", "scale": 1.0, "visible": true }
      },
      "thoughts": {
        "A": { "text": "<A's final unspoken wish — 2 lines>", "emotion": "reflective", "bubbleType": "warm" },
        "B": { "text": "<B's final unspoken wish — 2 lines>", "emotion": "reflective", "bubbleType": "warm" }
      },
      "dialogue": null
    }
  ]
}

RULES:
- All narrative text (narrator, thoughts, dialogue, reflectionPrompt) MUST be in Simplified Chinese.
- Extract real names from the input if available; otherwise use 小美 (A) and 小凯 (B).
- Dialogue: 1–2 short sentences. Match each persona's communication archetype in word choice and tone.
- Thought text: exactly 2 lines separated by \\n, revealing what is NOT being said aloud.
- Thoughts should directly relate to the core concerns if provided.
- 7 beats total, 2 pause points at beat 3 and beat 6.
- Intensity arc: 0.05 → 0.25 → 0.45 → 0.62 → 0.78 → 0.88 → 0.95
- scene: choose based on relationship type and conflict content.
- sceneElements: pick 3-5 elements relevant to the conflict.
- hairStyle: assign contrasting styles for A and B (visual distinctiveness matters).
- outfitStyle: assign contrasting styles (e.g. A=casual, B=formal or A=hoodie, B=casual).
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
export const API_KEY_AVAILABLE = Boolean(import.meta.env.VITE_GEMINI_API_KEY)

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
