// ─────────────────────────────────────────────────────────────────
//  generateScenario — chat log / description → subtext script
//
//  Generates a SubtextScript:
//  {
//    title:    string,
//    personas: { A: { name }, B: { name } },
//    script: [
//      { id, speaker: "A"|"B"|"action", text, innerA, innerB }
//    ]
//  }
//
//  innerA / innerB are the AI's inferred inner monologues,
//  which each party will later confirm or correct in their own session.
// ─────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an AI research assistant for a couples' conflict reflection study (Subtext system, UIST paper).
Your task: analyse a conflict description and reconstruct it as a dramatic script with inferred inner monologues.
Output ONLY valid JSON — no markdown, no explanation, no code fences.`

function buildPrompt(input) {
  return `Analyse this conflict and return a SubtextScript JSON object exactly matching the schema below.

CONFLICT INPUT:
"""
${input.trim()}
"""

REQUIRED JSON SCHEMA (output this object only, no wrapper):
{
  "title": "<6-10 char Chinese title for this conflict>",
  "personas": {
    "A": { "name": "<Person A's name, or 小美 if unknown>" },
    "B": { "name": "<Person B's name, or 小凯 if unknown>" }
  },
  "script": [
    {
      "id": 0,
      "speaker": "action",
      "text": "<Scene-setting stage direction in Chinese, 1–2 sentences>",
      "innerA": null,
      "innerB": null
    },
    {
      "id": 1,
      "speaker": "A",
      "text": "<A's first spoken line — 1–2 short sentences>",
      "innerA": "<What A is actually thinking but NOT saying — 2 lines separated by \\n. Reveal the unspoken need, fear, or assumption>",
      "innerB": null
    },
    {
      "id": 2,
      "speaker": "B",
      "text": "<B's response — 1–2 short sentences>",
      "innerA": null,
      "innerB": "<What B is actually thinking but NOT saying — 2 lines. The gap between their words and their inner state>"
    },
    {
      "id": 3,
      "speaker": "A",
      "text": "<A's escalating line>",
      "innerA": "<A's deeper hurt or assumption at this point — 2 lines>",
      "innerB": null
    },
    {
      "id": 4,
      "speaker": "action",
      "text": "<A key non-verbal moment or silence that reveals the dynamic>",
      "innerA": "<A's inner state during this beat — 2 lines>",
      "innerB": "<B's inner state during this beat — 2 lines>"
    },
    {
      "id": 5,
      "speaker": "B",
      "text": "<B's response or outburst>",
      "innerA": null,
      "innerB": "<B's peak inner state — 2 lines>"
    }
  ]
}

RULES:
- All text fields (title, text, innerA, innerB) must be in Chinese (Simplified).
- Extract real names from the input if available; use 小美 (A) and 小凯 (B) as fallbacks.
- "speaker" must be exactly "A", "B", or "action".
- innerA/innerB: exactly 2 lines separated by \\n. Reveal the UNSPOKEN — assumptions, fears, needs not expressed aloud.
- dialogue text: 1–2 short, natural sentences. No over-explanation.
- action beats: describe non-verbal behaviour, silence, gestures, or environment. No dialogue.
- Generate 5–7 script entries total. The schema above has 6 as an example — adapt to the actual conflict.
- innerA is null on beats where only B speaks (unless it's an action beat).
- innerB is null on beats where only A speaks (unless it's an action beat).`
}

// ── Claude API call (via Vite proxy) ──────────────────────────
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
  const clean = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  return JSON.parse(clean)
}

// ── Fallback script (used when no API key) ────────────────────
function fallbackScript(input) {
  // Try to extract names
  const nameMatch = input.match(/^([^\s,，。\n]{2,4})\s*[:：]/)
  const names = []
  const lines = input.split('\n')
  for (const line of lines) {
    const m = line.match(/^([^\s,，。\n]{2,4})\s*[:：]/)
    if (m && !names.includes(m[1])) names.push(m[1])
    if (names.length >= 2) break
  }

  const nameA = names[0] || '小美'
  const nameB = names[1] || '小凯'

  return {
    title: '某个普通夜晚',
    personas: {
      A: { name: nameA },
      B: { name: nameB },
    },
    script: [
      {
        id: 0, speaker: 'action',
        text: '某个寻常的夜晚，两人都在家。',
        innerA: null, innerB: null,
      },
      {
        id: 1, speaker: 'A',
        text: '我跟你说了一件重要的事。',
        innerA: '我需要他认真听我说。\n不只是点头，是真的放下手里的事。',
        innerB: null,
      },
      {
        id: 2, speaker: 'action',
        text: '他点了点头，继续看手机。',
        innerA: '他根本没在听。\n就这样敷衍我。',
        innerB: '她在说话，但我在追这集的结尾。\n快结束了，我在听。',
      },
      {
        id: 3, speaker: 'A',
        text: '（沉默了很久） 没事。',
        innerA: '我在等他追问。\n如果他在乎，他会追问的。',
        innerB: null,
      },
      {
        id: 4, speaker: 'action',
        text: '他看了眼消息，没有回复，继续看手机。',
        innerA: '他果然不在乎我。\n我早就该知道。',
        innerB: '她说没事，那就是真的没事了。\n我尊重她说的。',
      },
      {
        id: 5, speaker: 'B',
        text: '……怎么了？',
        innerA: null,
        innerB: '气氛有点奇怪。\n但她说没事，我不确定要不要再问。',
      },
    ],
  }
}

// ── Public API ────────────────────────────────────────────────
export const API_KEY_AVAILABLE = Boolean(import.meta.env.VITE_ANTHROPIC_API_KEY)

export async function generateScenario(input) {
  if (API_KEY_AVAILABLE) {
    try {
      const result = await callClaude(input)
      return { script: result, source: 'ai' }
    } catch (err) {
      console.warn('[Subtext] Claude API failed, using fallback:', err.message)
    }
  }
  return { script: fallbackScript(input), source: 'fallback' }
}
