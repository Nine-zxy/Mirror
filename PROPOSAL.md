# Mirror: AI-Simulated Theatrical Replay of Dyadic Conflict with Externalized Thought Bubbles for Joint Reflection

**Target venue**: UIST 2026 (Full Paper, 10-page double-column)
**System status**: Implemented (React 18 + Vite + Tailwind + Gemini API)
**Last updated**: March 2026

---

## Abstract

We present Mirror, a system that reconstructs interpersonal conflicts as observable pixel-art theatrical simulations, enabling both parties to watch AI-generated re-enactments of their disputes from a shared third-person perspective. Mirror's core interaction is a thought bubble interface that externalizes each person's inferred relational assumptions -- the unspoken interpretations that drive conflict behavior -- as visible, disputable UI elements rendered alongside dialogue within an animated scene. The system employs a two-stage LLM pipeline: a lightweight behavioral calibration stage that infers communication patterns from chat logs for user verification, followed by a full scene generation stage that outputs a structured 7-beat dramatic scenario encoded in the Relationship Scripting Language (RSL). Characters are rendered as customizable pixel-art avatars in themed environments, a deliberate abstraction that creates psychological distance between users and their on-screen representations. We ground Mirror in theories of self-distancing, psychological distance, and the looking-glass self, arguing that the combination of theatrical abstraction, simultaneous perspective externalization, and interactive dispute mechanisms constitutes a novel interaction paradigm that cannot exist without AI mediation. We report findings from a study with couples examining how joint observation of AI-simulated conflict and its externalized assumptions shapes reflection and mutual understanding.

---

## 1. Introduction and Motivation

Conflicts in close relationships are rarely about the words exchanged. They are driven by relational assumptions -- each person's interpretation of what the other means, intends, or feels. "She doesn't care about my time." "He's dismissing my feelings again." These assumptions remain invisible during the conflict itself. They surface only partially in retrospect, if at all, and almost never symmetrically: each person recalls their own reasoning vividly while the other's internal state remains opaque.

Existing technology-mediated approaches to relationship support replicate this asymmetry. A person consults a chatbot, receives advice or reframing, and returns to the relationship with private insight that the other partner never sees. This individual-centric model misses two fundamental properties of relational conflict:

1. **Conflict is inherently dyadic.** One-sided reflection produces one-sided insight. Understanding a conflict requires seeing both perspectives simultaneously, as an outside observer would.
2. **The critical information is internal.** The assumptions each person makes about the other's motives are precisely what drives escalation, yet these assumptions are never directly exchanged.

We draw on three theoretical foundations:

- **Self-distancing** (Kross & Ayduk, 2011): Adopting a third-person perspective on one's own emotional experiences reduces reactivity and promotes analytical processing. Watching a simulation of yourself, rather than reliving the conflict, shifts cognitive processing from immersion to observation.
- **Psychological distance** (Trope & Liberman, 2010): Abstraction -- here, pixel-art characters in a theatrical staging -- promotes pattern recognition over detail fixation. The stylized representation is not a failure of fidelity; it is a design affordance that frees users to see relational dynamics rather than debate specific words.
- **The looking-glass self** (Cooley, 1902): We understand ourselves partly through how we imagine others perceive us. Mirror literalizes this: each person sees an AI's interpretation of how they appeared to their partner, rendered as visible thought bubbles.

These mechanisms converge in a single design question: **What if both partners could sit together and watch an AI-simulated theatrical version of their conflict, with each character's hidden assumptions displayed as visible, editable thought bubbles?**

This is the interaction Mirror enables. Critically, this interaction cannot exist without the technology: no therapist, no worksheet, no individual chatbot can simultaneously reconstruct both partners' internal states, render them visually in real time, and let both people observe and dispute those representations together. The system is not applying AI to an existing interaction -- it is creating an interaction paradigm that has no non-technological analog.

---

## 2. Related Work and Positioning

Mirror sits at the intersection of four research areas. We position against each to clarify what is novel.

### 2.1 AI for Relationship Support

Current AI-mediated relationship tools (e.g., Replika, Woebot, various LLM-based counseling chatbots) operate in an individual-to-AI dyad: one person describes a problem, the AI responds with advice, reframing, or emotional support. These systems are individual-centric by design. Mirror differs in two structural ways: (a) it serves both parties simultaneously as a shared artifact, and (b) it provides no advice. The system reconstructs and displays -- it does not prescribe. This no-advice stance is a deliberate design decision grounded in drama therapy principles: the therapeutic value lies in observation, not instruction.

### 2.2 Multi-Agent Simulation

Generative agent architectures (e.g., Park et al., 2023, "Generative Agents") demonstrate that LLMs can simulate believable interpersonal behavior. Mirror draws on this capacity but differs in purpose and structure. Generative agent systems simulate autonomous social behavior for research or entertainment. Mirror's agents are not autonomous -- they are calibrated reconstructions of specific real people in a specific real conflict, constrained by user-verified behavioral patterns. The simulation is not open-ended exploration but structured dramatic re-enactment.

### 2.3 Self-Reflection and Perspective-Taking Systems

Prior HCI work has explored technology-mediated self-reflection through journaling prompts, mood tracking, and visualization of personal data. Avatar-mediated perspective-taking research (e.g., Bailenson et al.) demonstrates that embodying another's viewpoint can shift attitudes. Mirror extends this line by providing simultaneous dual-perspective observation: both people see both characters' inner states at once, creating a shared reflective artifact rather than an individual experience. The theatrical framing adds a layer that pure data visualization cannot: narrative coherence and emotional arc.

### 2.4 Drama and Theatrical Computation

Interactive drama systems (e.g., Facade; LLM-based Interactive Drama frameworks) use dramatic structure to organize AI-generated narrative. Mirror adopts the six-element drama framework (Plot, Character, Thought, Diction, Spectacle, Interaction) as an organizing principle for system design, mapping each dramatic element to a specific system component. However, Mirror is not an entertainment system -- the "audience" is also the "subject," and the goal is not engagement but self-recognition.

**Research gap.** No existing system provides a shared, observable AI simulation of a dyadic interaction where both partners' internal assumptions are made explicit simultaneously and rendered as interactive, disputable interface elements.

---

## 3. System Design: Mirror

### 3.1 Design Principles

Four principles guided Mirror's design, each derived from theoretical grounding:

**P1: Third-person observation, not first-person reliving.** The system presents the conflict as something to watch, not something to re-experience. Users observe pixel-art characters on a stage, maintaining the psychological distance that self-distancing theory predicts will reduce emotional reactivity.

**P2: Abstraction as affordance.** The pixel-art aesthetic is not a constraint -- it is a deliberate design choice. Characters are recognizable as "representing me" but are clearly not "me." This gap creates what we term the *abstraction buffer*: sufficient psychological distance to enable reflection without triggering defensive identification. The level of abstraction in the avatar is itself a designable dimension with implications for how users engage with the simulation.

**P3: Assumptions made visible.** The core interface contribution is the thought bubble: each character's inferred internal state is displayed alongside their dialogue. What was private interpretation during the conflict becomes shared observable information during reflection.

**P4: Interaction at the interpretation layer.** Users do not edit dialogue (the "what happened" layer). They interact with assumptions (the "what each person thought was happening" layer) through dispute mechanisms, enabling negotiation of meaning rather than facts.

### 3.2 Phase Flow

Mirror follows a six-phase interaction sequence:

```
Intro --> ConflictInput --> CalibrationOverlay --> Simulation --> Reflection --> DivergenceSummary
```

**Phase 1: Intro.** System introduction and consent framing. Establishes that the upcoming simulation is an AI interpretation, not a factual record.

**Phase 2: ConflictInput.** Users provide conflict data through two channels:
- *Chat log input*: Paste or upload a conversation log (supports multiple messaging formats including WeChat). The system parses sender-receiver structure automatically.
- *Archetype selection*: Users select (a) relationship type (romantic, family, friends, colleagues) and (b) communication style for each partner (avoidant, anxious, direct, analytical). These archetypes serve as LLM role-play anchors that constrain dialogue generation style, not as personality assessments.
- *Core concerns*: Each partner optionally states what the conflict was really about for them.

**Phase 3: CalibrationOverlay.** The system runs a lightweight LLM call (Stage 1 of the pipeline) that infers 2-3 specific behavioral patterns per partner from the chat log, anchored by the selected archetypes. Examples: "tends to express dissatisfaction through questions rather than direct statements," "gives single-word responses under pressure." Users review, confirm, adjust, or reject each inference. Confirmed patterns become hard constraints for scene generation. This calibration loop serves two functions: it improves simulation accuracy, and it begins the reflective process before the simulation even starts.

**Phase 4: Simulation (Theater).** The main interaction. A pixel-art theatrical scene plays out across 7 beats, showing two characters in a themed environment (bedroom, living room, cafe, park, office). Each beat presents:
- Character spatial positioning and proxemic state (approaching, tension, hot, cold)
- Dialogue rendered as subtitles, styled to match each character's communication archetype
- Thought bubbles displaying each character's inferred internal state, categorized by type (cloud, hesitation, aggressive, warm)
- Narrator text for scene-setting
- Intensity curve visualized on a timeline

Interactive mechanisms during simulation:
- **Thought bubble dispute**: Either user can flag a thought bubble as inaccurate, triggering a dispute annotation that is recorded for the divergence summary.
- **Beat tagging**: Users mark beats with emoji reactions (recognition, surprise, disagreement) for later reflection.
- **Temporal scrubbing**: Non-linear navigation through the 7-beat arc via a timeline interface with intensity visualization.
- **Persona editing**: Real-time adjustment of character appearance (hair style, outfit, accessories) and scene selection during playback.

**Phase 5: Reflection.** At two designated pause points (beats 3 and 6), the simulation pauses and presents a reflection prompt. Users discuss what they observed. The system also presents an overlay summarizing disputed thought bubbles and tagged beats.

**Phase 6: DivergenceSummary.** A structured summary of where the two users' interpretations diverged: which thought bubbles were disputed, which beats were tagged differently, and which assumptions were confirmed versus rejected during calibration. This artifact serves as a concrete takeaway for continued discussion.

### 3.3 Drama Element Mapping

Mirror's architecture is organized around the six-element framework from LLM-based Interactive Drama research, with each dramatic element mapped to specific system components and data sources:

| Drama Element | System Component | Data Source |
|---|---|---|
| **Plot** | 7-beat narrative arc + ConflictTimeline | LLM-generated from chat log + archetype |
| **Character** | Persona archetypes + CalibrationOverlay | User selection + LLM calibration (hybrid) |
| **Thought** | ThoughtBubble + dispute mechanism | LLM-inferred, user-disputable |
| **Diction** | Dialogue subtitles styled by archetype | LLM-generated, anchored by comm style |
| **Spectacle** | Pixel-art Theater + scene presets + avatars | System presets, LLM scene selection, user customization |
| **Interaction** | Pause points + calibration + dispute + tagging | System design |

This mapping serves as both a design framework and an analytical tool: each element can be independently evaluated for its contribution to the reflective experience.

---

## 4. System Architecture

### 4.1 Two-Stage LLM Pipeline

Mirror employs a two-stage pipeline to balance accuracy with generative quality:

**Stage 1 -- Behavioral Calibration (light call).** Input: chat log + archetype selections. Output: 2-3 behavioral pattern inferences per partner. Parameters: temperature 0.5, ~1500 token budget. This stage runs quickly and produces structured inferences that users can verify. The low temperature prioritizes factual pattern extraction over creative generation.

**Stage 2 -- Scene Generation (full call).** Input: chat log + core concerns + archetype anchoring + confirmed calibration patterns. Output: complete RSL v2 scenario (7 beats with spatial positioning, dialogue, thoughts, proxemic states, intensity curve). Parameters: temperature 0.75, ~12000 token budget. Calibration constraints are injected as hard constraints in the system prompt, ensuring that user-verified behavioral patterns appear in both dialogue (Diction) and inner thoughts (Thought).

The two-stage design serves a critical interaction purpose: the calibration stage is not merely a preprocessing step but an interactive moment where users begin reflecting on their own patterns before seeing the simulation. This pre-simulation reflection primes the observational stance that self-distancing theory predicts will be most productive.

### 4.2 Relationship Scripting Language (RSL v2)

The scene generation output follows a structured JSON schema we call RSL v2. Each scenario contains:

- **Metadata**: title, subtitle, scene key, scene elements
- **Personas**: two character objects with name, color palette, appearance properties (hair style, outfit style, accessory), and thought bubble styling
- **Beats** (array of 7): each beat specifies:
  - `duration`: playback time in milliseconds
  - `intensity`: 0-1 conflict intensity value for timeline visualization
  - `narrator`: optional scene-setting text
  - `proxemic`: relational spatial state (neutral / approaching / tension / hot / cold) and divider visibility
  - `spatial`: per-character positioning (x-coordinate, facing direction, pose, lean, scale, visibility)
  - `thoughts`: per-character thought bubble (text, emotion, bubbleType) or null
  - `dialogue`: speaker ID and text, or null
  - `isPausePoint` / `reflectionPrompt`: optional pause for structured reflection

RSL serves as the interface contract between the LLM generation pipeline and the rendering engine. Its explicit structure ensures that generated scenarios are always renderable, and its semantic fields (proxemic state, intensity, bubble type) carry meaning that the visualization layer translates into spatial and visual cues.

### 4.3 Frontend Architecture

Mirror is implemented as a single-page application (React 18, Vite, Tailwind CSS) with the following component structure:

- **App.jsx**: Root state machine managing phase transitions
- **ConflictInput**: Chat log parsing (supports 6 WeChat message formats), archetype selection, core concern input
- **CalibrationOverlay**: Stage 1 result display with confirm/adjust/reject per inference
- **Theater**: Main simulation renderer -- CSS-based pixel-art room with front-view perspective, animated character positioning, proxemic dividers
- **PixelChar**: Modular pixel-art character renderer with hair/outfit/accessory composition and emotion-based pose system (8 poses: neutral, sitting, confrontational, defensive, angry, hurt, anxious, withdrawn)
- **ThoughtBubble**: Four visual types (cloud, aggressive, hesitation, warm) with dispute interaction
- **Subtitle**: Dialogue renderer with speaker-colored styling
- **EmotionBar**: Real-time intensity curve visualization
- **ConflictTimeline**: Beat-level navigation with tagging interface
- **ReflectionOverlay**: Pause-point reflection prompts and annotation capture
- **DivergenceSummary**: Post-simulation divergence analysis display
- **ScriptPanel**: Full beat-by-beat script view for detailed review

Supporting modules:
- **generateScenario.js**: Two-stage LLM pipeline with prompt construction, Gemini API integration, and fallback scenario generation
- **parseChatLog.js**: Multi-format chat log parser
- **behaviorLog.js**: Research data logging (session events, phase transitions, disputes, tags, seeks)
- **dramaElements.js**: Drama element mapping library, archetype definitions, scene presets, appearance options

---

## 5. Interaction Design: The Thought Bubble Interface

The thought bubble is Mirror's primary interaction contribution. We describe its design rationale in detail.

### 5.1 Why Thought Bubbles

In any conflict, each person maintains an internal narrative about the other's motives. These narratives are the actual drivers of escalation -- not the words spoken, but the interpretations assigned to them. A statement like "I was busy" is neutral in isolation but can be interpreted as dismissal, avoidance, or a simple fact depending on the listener's relational assumptions.

Traditional conflict resolution asks people to articulate these assumptions verbally. This is difficult for two reasons: (a) people are often unaware of their own assumptions until they see them reflected back, and (b) articulating assumptions in the presence of a partner triggers the very defensiveness the exercise aims to reduce.

Mirror's thought bubbles address both problems. The AI infers what each character might have been thinking, displays it visually alongside the dialogue, and invites users to observe and react rather than articulate and defend. The thought bubble is not a speech act -- it is a visible artifact that both people see simultaneously, shifting the conversation from "what were you thinking?" to "look at what the AI thinks you were thinking -- is that right?"

### 5.2 Bubble Types and Visual Encoding

Four thought bubble types encode the emotional quality of the internal state:

- **Cloud**: Diffuse, soft-edged -- represents ambient emotional states (worry, background frustration)
- **Hesitation**: Fragmented, dotted edges -- represents uncertainty, unspoken questions
- **Aggressive**: Sharp, angular edges -- represents confrontational internal states
- **Warm**: Rounded, glowing -- represents care or concern masked by surface behavior

These visual encodings provide an additional layer of information beyond the text content, allowing users to perceive the emotional tone of thoughts at a glance even during playback.

### 5.3 Dispute Mechanism

Either user can dispute a thought bubble by flagging it as inaccurate. The dispute does not change the simulation -- the original thought remains visible, now marked as contested. This design is intentional: the purpose is not to "fix" the AI but to surface the disagreement itself as data. When Partner A disputes a thought attributed to Partner B, the dispute reveals A's assumptions about B's inner life, creating a second layer of externalized interpretation.

Disputes are recorded and aggregated in the DivergenceSummary, providing a structured map of where the two users' models of each other diverge.

---

## 6. Study Plan

### 6.1 Research Questions

**RQ1**: How do couples interpret and react to AI-simulated versions of their past conflicts, and how do they negotiate discrepancies between the simulation and their memory?

**RQ2**: How does observing externalized relational assumptions (thought bubbles) influence partners' understanding of the conflict and each other?

**RQ3**: How do interactive mechanisms -- thought bubble dispute, beat tagging, and temporal scrubbing -- shape the joint reflection process?

### 6.2 Method

**Participants**: N couples (target: 12-16) in committed relationships who have experienced a recent interpersonal conflict they are willing to discuss.

**Procedure**:
1. Pre-session: Each partner independently completes the ConflictInput phase (chat log upload, archetype selection, core concerns) -- separated to prevent priming.
2. Joint session: Both partners sit together and proceed through CalibrationOverlay (jointly reviewing inferred patterns), Simulation (watching together with access to all interactive mechanisms), and Reflection/DivergenceSummary.
3. Semi-structured interview: Joint and individual debriefs covering simulation accuracy, thought bubble reactions, dispute rationale, and perceived impact on understanding.

**Data collection**: System behavior logs (all interactions logged via behaviorLog.js: phase transitions, beat navigation, thought disputes, tags, persona edits), screen recordings, interview transcripts.

**Analysis**: Thematic analysis of interview data, triangulated with behavioral log analysis (dispute frequency, tagging patterns, navigation behavior, time-per-beat). Focus on identifying reflection patterns, failure modes, and the role of specific interactive mechanisms.

### 6.3 Anticipated Contributions from Study

- Taxonomy of user responses to AI-simulated self (recognition, rejection, surprise, reinterpretation)
- Analysis of how thought bubble externalization shifts conflict discourse from blame to pattern observation
- Identification of design conditions that facilitate versus disrupt joint reflection
- Characterization of failure modes (re-escalation, simulation rejection, privacy concerns)

---

## 7. Contributions

**C1 -- Interaction Design.** A thought bubble interface that externalizes relational assumptions as visible, editable, disputable UI elements within a theatrical AI simulation -- making the invisible interpretive dynamics of conflict observable and negotiable by both parties simultaneously. The interaction paradigm (observing AI-inferred mutual assumptions in a shared theatrical frame) has no non-technological analog and cannot exist without AI mediation.

**C2 -- System.** Mirror: a dyadic AI system comprising a two-stage LLM pipeline (behavioral calibration + scene generation), the Relationship Scripting Language (RSL v2) scene graph schema, a drama-element-mapped component architecture, and a calibration loop that integrates user verification into the generative process. The system is designed for any dyadic relationship (romantic, family, friends, colleagues), with romantic couples as the probe scenario.

**C3 -- Empirical.** Findings from a couples study examining how theatrical AI simulation with externalized thought bubbles shapes joint conflict reflection, including a taxonomy of user responses to simulated self-observation, analysis of how interactive mechanisms (dispute, tagging, scrubbing) mediate reflection, and identification of design conditions for productive versus counterproductive joint observation.

---

## 8. Scope and Generalizability

Mirror is designed as a general-purpose system for any dyadic relationship. The archetype system supports four relationship types (romantic partners, family, close friends, colleagues) with type-specific scene defaults, communication style anchoring, and appearance presets. Romantic couples serve as the primary probe scenario due to emotional salience, clear dyadic structure, and established theoretical grounding in relationship science (Gottman). Future work includes application to team retrospectives, negotiation training, parent-child communication, and therapeutic settings.

---

## 9. Open Design Questions

1. **Abstraction level as design variable.** The pixel-art aesthetic was chosen to create psychological distance, but the optimal level of abstraction is an open question. Too abstract and users may not identify with the characters; too realistic and the simulation may trigger defensiveness rather than reflection. The appearance customization system (hair, outfit, accessories) provides a controlled way to study how identification varies with visual fidelity.

2. **Simulation fidelity and the "close enough" threshold.** The simulation does not need to be accurate -- it needs to be close enough to trigger recognition while leaving room for correction. The calibration loop and dispute mechanism are designed to make inaccuracy productive rather than disqualifying. The study will examine where this threshold lies.

3. **Re-escalation risk.** Observing a simulation of one's own conflict could re-trigger the original emotional response. Mirror's design mitigates this through abstraction (P2), third-person framing (P1), and structured pause points. The study will monitor for re-escalation events and analyze what design features prevent or trigger them.

4. **Privacy in dyadic input.** Each partner's archetype selection and core concern are currently shared. Whether persona profiles should remain partially private is a design question with implications for both honesty of input and richness of joint reflection.

---

## 10. Paper Outline (10-page plan)

| Section | Est. Pages | Content |
|---|---|---|
| Abstract + Introduction | 1.5 | Motivation, gap, contribution summary |
| Related Work | 1.5 | AI relationship support, multi-agent sim, self-reflection systems, drama computation |
| Design Principles | 0.5 | P1-P4 with theoretical grounding |
| System Design | 2.0 | Phase flow, drama element mapping, RSL v2, two-stage pipeline, component architecture |
| Interaction Design | 1.0 | Thought bubble interface deep dive, dispute mechanism, visual encoding |
| Study | 1.5 | Method, participants, procedure, analysis approach |
| Findings | 1.5 | Thematic findings organized by RQ |
| Discussion + Limitations | 0.5 | Abstraction as design dimension, generalizability, failure modes |

---

*Updated March 2026 -- reflects implemented system state (RSL v2, two-stage pipeline, drama element mapping, full interactive prototype).*
