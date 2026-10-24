# Paper-to-code map

Paper title read from the local camera-ready manuscript: **ASIDE: From Conflict Participants to Co-Observers Through Dyadic Spectator Reflection**. The local manuscript still contains template author metadata, so it is not used to populate a citation file.

| Paper mechanism | Implementation | Verification / boundary |
| --- | --- | --- |
| Reconstruction from dialogue and context | `src/utils/generateScenario.js`, `parseChatLog.js` | Prompt templates retained; live model call not covered by offline checks |
| Structured beat sequence, inner-state text, emotion, position | `src/data/demoScenario.js`, `Theater.jsx` | Fictional bilingual example with scene-setting plus eight dialogue beats |
| Self-Confirm | `App.jsx`, `ThoughtBubble.jsx`, `Theater.jsx` | Own thought bubbles shown for correction |
| Cross-Editing | `App.jsx`, `ThoughtBubble.jsx` | Partner's thought bubbles become the editing target |
| Private annotation and synchronized reveal | `server/roomManager.js`, `src/sync/` | Tests cover early reveal requests and matching two-party readiness |
| Together Viewing | `App.jsx`, `server/protocol.js` | Two-party playback gate and linked beat navigation |
| Divergence comparison | `DivergenceCards.jsx` | Compares self-description and partner interpretation; unedited text may fall back to AI/example text |
| Behavioral recording | `behaviorLog.js`, `roomManager.js` | Opt-in; no original records included |

## Deliberate differences from the inherited source

1. Removed participant-specific scenario modules and their imports. The replacement example was authored for this repository preparation.
2. The inherited generation endpoint named Gemini 2.0 Flash; the manuscript describes Gemini 2.5 Flash. The public default is aligned to the manuscript. This alone does not establish which executable version was used in the study.
3. The inherited `annotation:reveal` handler forwarded one side's data immediately. The curated server stores snapshots and releases them in `sync:phase_go` only after both clients report readiness. Early legacy reveal requests are ignored.
4. The reconnect path sends the annotation snapshot before readiness, preventing a gate from opening with an outdated snapshot.
5. The inherited waiting screen offered a timed bypass. That bypass is disabled in the public paired workflow.
6. Logging, uploads, and browser log backups are off by default. Keys are server-side and are not exposed through `VITE_*` variables.
7. Raster art is omitted pending provenance confirmation. Existing CSS/SVG rendering is enabled instead. Code-authored generic icons replace inherited raster UI icons; the appearance is not the study's exact appearance.
8. Bilingual entry and bilingual synthetic content are additions for dissemination. They do not establish the validity of an English-language study.

9. Development and WebSocket dependencies were updated to resolve the public-registry audit findings. These versions are not claimed to match the historical study environment.
10. Preloaded scenarios no longer display a simulated connected badge; connection status is read from the actual room state.

## What this artifact can reproduce

It exposes the interaction structure, prompts, data shape, rendering logic, and pair synchronization mechanisms. A deterministic example can be inspected without a model account. It cannot reproduce participant experiences, the exact historical model outputs, qualitative coding, or paper statistics. Do not use the fictional example as empirical evidence.
