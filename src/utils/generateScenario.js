// ─────────────────────────────────────────────────────────────
//  generateScenario — Conflict text → RSL scenario
//
//  Two modes (auto-selected):
//
//  [AI mode]      If VITE_ANTHROPIC_API_KEY is set in .env.local,
//                 calls Claude via the Vite dev-server proxy
//                 (/api/claude/v1/messages → api.anthropic.com).
//                 Returns a fully dynamic RSL scenario.
//
//  [Fallback mode] No API key → personalises the built-in scenario
//                 by extracting names/context from the input text.
//
//  Returns:  { scenario, source: 'ai' | 'fallback' }
// ─────────────────────────────────────────────────────────────

import { scenario as BASE_SCENARIO } from '../data/scenario'

// ── System prompt ─────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a research tool for an HCI study on couples' conflict dynamics (Mirror system, UIST demo).
Analyse the relationship conflict provided and output a structured 5-beat dramatic scenario in JSON.
Output ONLY valid JSON — no markdown, no explanation, no code fences.`

// ── User prompt builder ───────────────────────────────────────
function buildPrompt(input) {
  return `Analyse this conflict and return a JSON scenario matching the schema below exactly.

CONFLICT INPUT:
"""
${input.trim()}
"""

REQUIRED JSON SCHEMA (output this object only):
{
  "id": "generated_conflict",
  "title": "<8-char Chinese title>",
  "subtitle": "<English subtitle>",
  "scene": "apartment_evening",
  "personas": {
    "A": {
      "id": "A", "name": "<Person A name or 小美>", "label": "PARTNER A",
      "color": "#7ab0e8", "darkColor": "#4a80c8", "glowColor": "rgba(122,176,232,0.55)",
      "thoughtBg": "rgba(80,130,210,0.13)", "thoughtBorder": "#5882d0",
      "hairColor": "#8B4513", "outfitColor": "#4a80c8", "outfitDark": "#2a5098"
    },
    "B": {
      "id": "B", "name": "<Person B name or 小凯>", "label": "PARTNER B",
      "color": "#e87a7a", "darkColor": "#b84a4a", "glowColor": "rgba(232,122,122,0.55)",
      "thoughtBg": "rgba(210,80,80,0.13)", "thoughtBorder": "#c85050",
      "hairColor": "#3a2820", "outfitColor": "#b84a4a", "outfitDark": "#7a2a2a"
    }
  },
  "beats": [
    {
      "id": 0, "duration": 3200, "intensity": 0.05,
      "narrator": "<scene-setting sentence in Chinese>",
      "proxemic": { "state": "neutral", "divider": false },
      "spatial": {
        "A": { "x": 18, "facing": "right", "pose": "neutral", "lean": "none", "scale": 1.0, "visible": true },
        "B": { "x": 74, "facing": "left",  "pose": "sitting", "lean": "none", "scale": 1.0, "visible": true }
      },
      "thoughts": { "A": null, "B": null },
      "dialogue": null
    },
    {
      "id": 1, "duration": 4600, "intensity": 0.38,
      "narrator": null,
      "proxemic": { "state": "approaching", "divider": false },
      "spatial": {
        "A": { "x": 30, "facing": "right", "pose": "confrontational", "lean": "forward", "scale": 1.05, "visible": true },
        "B": { "x": 72, "facing": "left",  "pose": "sitting",         "lean": "none",    "scale": 1.0,  "visible": true }
      },
      "thoughts": {
        "A": { "text": "<A's unspoken feeling — 2 lines Chinese>", "emotion": "anxious", "bubbleType": "hesitation" },
        "B": null
      },
      "dialogue": { "speaker": "A", "text": "<A's opening accusation/question in Chinese>" }
    },
    {
      "id": 2, "duration": 3800, "intensity": 0.55,
      "narrator": null,
      "proxemic": { "state": "tension", "divider": true },
      "spatial": {
        "A": { "x": 32, "facing": "right", "pose": "anxious",   "lean": "none", "scale": 1.0, "visible": true },
        "B": { "x": 67, "facing": "left",  "pose": "defensive", "lean": "back", "scale": 1.0, "visible": true }
      },
      "thoughts": {
        "A": null,
        "B": { "text": "<B's defensive internal reaction — 2 lines Chinese>", "emotion": "defensive", "bubbleType": "cloud" }
      },
      "dialogue": { "speaker": "B", "text": "<B's deflecting reply in Chinese>" }
    },
    {
      "id": 3, "duration": 4800, "intensity": 0.72,
      "narrator": null,
      "proxemic": { "state": "hot", "divider": true },
      "spatial": {
        "A": { "x": 42, "facing": "right", "pose": "confrontational", "lean": "forward", "scale": 1.08, "visible": true },
        "B": { "x": 64, "facing": "left",  "pose": "defensive",       "lean": "back",    "scale": 1.0,  "visible": true }
      },
      "thoughts": {
        "A": { "text": "<A's escalated hurt thought — 2 lines Chinese>", "emotion": "hurt", "bubbleType": "hesitation" },
        "B": null
      },
      "dialogue": { "speaker": "A", "text": "<A's escalated challenge in Chinese>" }
    },
    {
      "id": 4, "duration": 5200, "intensity": 0.95,
      "isPausePoint": true,
      "reflectionPrompt": "<Reflection question about the peak in Chinese>",
      "proxemic": { "state": "hot", "divider": true },
      "spatial": {
        "A": { "x": 42, "facing": "right", "pose": "hurt",  "lean": "back",    "scale": 1.0,  "visible": true },
        "B": { "x": 61, "facing": "left",  "pose": "angry", "lean": "forward", "scale": 1.1,  "visible": true }
      },
      "thoughts": {
        "A": { "text": "<A's peak inner pain — 2 lines Chinese>",  "emotion": "hurt",  "bubbleType": "cloud" },
        "B": { "text": "<B's peak frustration — 2 lines Chinese>", "emotion": "angry", "bubbleType": "aggressive" }
      },
      "dialogue": { "speaker": "B", "text": "<B's outburst line in Chinese>" }
    }
  ]
}

RULES:
- All narrative text (narrator, thoughts, dialogue, reflectionPrompt) must be in Chinese (Simplified).
- Extract real names from the input if available; otherwise use 小美 (A) and 小凯 (B).
- Dialogue: 1–2 short sentences each.
- Thought text: exactly 2 lines separated by \\n, revealing what is NOT being said aloud.
- Keep intensity values: beat0≈0.05, beat1≈0.4, beat2≈0.55, beat3≈0.72, beat4=0.95.
- valid pose: neutral | sitting | confrontational | defensive | angry | hurt | anxious | withdrawn
- valid proxemic.state: neutral | approaching | tension | hot | cold
- valid bubbleType: cloud | aggressive | hesitation | warm`
}

// ── Claude API call (via Vite proxy) ─────────────────────────
async function callClaude(input) {
  const resp = await fetch('/api/claude/v1/messages', {
    method:  'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model:      'claude-opus-4-5',
      max_tokens: 2048,
      system:     SYSTEM_PROMPT,
      messages:   [{ role: 'user', content: buildPrompt(input) }],
    }),
  })

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`Claude API error ${resp.status}: ${err}`)
  }

  const data = await resp.json()
  const raw  = data.content?.[0]?.text ?? ''

  // Strip any accidental markdown fences
  const clean = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  return JSON.parse(clean)
}

// ── Fallback: name extraction + template personalisation ──────
function extractNames(text) {
  // Try to find Chinese names (2-3 char strings near common patterns)
  const patterns = [
    /(?:我叫|我是|我的名字是)\s*([^\s，。,\.]{2,4})/,
    /([^\s，。,\.]{2,3})(?:说|问|回答|发了|发消息)/,
    /^([^\s，。,\.:\n]{2,4})[:：]/m,
  ]
  const names = []
  for (const pat of patterns) {
    const m = text.match(pat)
    if (m?.[1] && !names.includes(m[1])) names.push(m[1])
    if (names.length >= 2) break
  }
  return {
    nameA: names[0] || null,
    nameB: names[1] || null,
  }
}

function fallbackScenario(input) {
  const { nameA, nameB } = extractNames(input)
  const base = JSON.parse(JSON.stringify(BASE_SCENARIO))   // deep clone

  if (nameA) {
    base.personas.A.name = nameA
  }
  if (nameB) {
    base.personas.B.name = nameB
  }

  // Derive a title from the first 8 chars of meaningful input
  const titleMatch = input.match(/[\u4e00-\u9fa5]{2,8}/)
  if (titleMatch) base.title = titleMatch[0].slice(0, 8)

  return base
}

// ── Public API ────────────────────────────────────────────────
const API_KEY_AVAILABLE = Boolean(import.meta.env.VITE_ANTHROPIC_API_KEY)

export async function generateScenario(input) {
  if (API_KEY_AVAILABLE) {
    try {
      const scenario = await callClaude(input)
      // Ensure personas have all required colour fields (fill from base if missing)
      mergePersonaDefaults(scenario)
      return { scenario, source: 'ai' }
    } catch (err) {
      console.warn('[Mirror] Claude API failed, using fallback:', err.message)
    }
  }

  // Fallback
  return { scenario: fallbackScenario(input), source: 'fallback' }
}

// Fill any missing persona colour fields from the base scenario
function mergePersonaDefaults(sc) {
  const defaults = BASE_SCENARIO.personas
  ;['A', 'B'].forEach(id => {
    if (!sc.personas?.[id]) return
    sc.personas[id] = { ...defaults[id], ...sc.personas[id] }
  })
}

export { API_KEY_AVAILABLE }
