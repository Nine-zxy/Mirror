// ─────────────────────────────────────────────────────────────
//  mergeInputs — Combine two partners' independent inputs
//
//  Each partner independently provides:
//    - chatLog (should be same conversation)
//    - concern (their own perspective)
//    - archetype.styles (their own communication style)
//    - calibration (their own verified behavioral inferences)
//
//  Returns a unified input object for generateScenario().
// ─────────────────────────────────────────────────────────────

export default function mergeInputs(inputA, inputB) {
  // Take the longer chat log (they should be the same conversation,
  // but one might have pasted more context)
  const chatLog = (inputA?.chatLog?.length || 0) >= (inputB?.chatLog?.length || 0)
    ? inputA.chatLog
    : inputB.chatLog

  return {
    chatLog,
    // Each partner's own core concern
    concernA: inputA?.concern || '',
    concernB: inputB?.concern || '',
    // Combine context from both (either might provide scene context)
    context: inputA?.context || inputB?.context || '',
    // Archetype: relationship type from either (should agree),
    // but each person's style is self-selected
    archetype: {
      relationshipType:
        inputA?.archetype?.relationshipType ||
        inputB?.archetype?.relationshipType ||
        'romantic',
      styleA: inputA?.archetype?.styles || [],
      styleB: inputB?.archetype?.styles || [],
    },
    // Each partner's calibrated behavioral inferences
    calibrationA: inputA?.calibration || null,
    calibrationB: inputB?.calibration || null,
  }
}
