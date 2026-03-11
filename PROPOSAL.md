# Mirror: An AI-Mediated Simulation System for Dyadic Conflict Reflection

---

## One-Line Summary

Mirror is a dyadic AI system that reconstructs relationship conflicts as observable simulations, making hidden relational assumptions visible and interactable for joint reflection.

---

## Motivation

Conflicts in close relationships are rarely about what is said — they are about what each person *assumes* the other means. These relational assumptions (e.g., "she doesn't care," "he always deflects") are invisible during the conflict itself, surfacing only in retrospect, if at all.

Existing technology-mediated approaches to relationship support operate individually: one person consults an AI, receives advice, and returns to the relationship unchanged. This misses a fundamental property of conflict — it is inherently dyadic. Understanding a conflict requires seeing both people's perspectives simultaneously, as an outside observer.

We take inspiration from two separate bodies of work:
- **Self-distancing** (Kross & Ayduk, 2011): Observing oneself from a third-person perspective reduces emotional reactivity and promotes insight.
- **Generative AI simulation**: LLMs can reconstruct plausible dialogue and internal states from minimal user descriptions.

Combining these, we ask: *What if both partners could watch an AI-simulated version of their conflict, see each other's hidden assumptions made explicit, and reflect together?*

---

## Research Gap

Existing AI systems for relationship support are **individual-centric**: one partner consults an AI privately, receives coaching or reframing, and re-enters the dyadic relationship alone. This model:

1. Ignores the dyadic nature of conflict — one-sided reflection produces one-sided insight.
2. Keeps relational assumptions invisible — AI advice addresses surface behavior, not underlying interpretation patterns.
3. Provides no shared artifact — both partners have no common reference point for joint reflection.

**No existing system provides a shared, observable AI simulation of a dyadic interaction where both partners' internal assumptions are made explicit simultaneously.**

---

## System: Mirror

Mirror is a three-component system:

### 1. Persona Modeling (Lightweight)
Each partner independently completes a short input session:
- A brief natural language description of the conflict
- 6–8 structured questions capturing three dimensions:
  - **Expression Style**: directness, withdrawal, sarcasm patterns
  - **Interpretation Bias**: how they typically read ambiguous partner behavior (anxious / neutral / defensive)
  - **Conflict Strategy**: escalate / clarify / withdraw

Output: an `InteractionalPersona` profile used to drive the AI actor.

### 2. Simulation Engine
- **AI Director**: reconstructs the conflict scenario from both descriptions
- **AI Actors**: two LLM-driven agents embodying each partner's persona, generating dialogue + internal monologue
- Output: a scene graph of `{utterance, subtext, emotion}` tuples for each turn

### 3. Shared Reflection Interface
A three-panel interface designed for **joint viewing**:

| Panel | Content | Purpose |
|---|---|---|
| **Evidence Log** (left) | Original chat/message evidence | Ground truth anchor |
| **Stage** (center) | 2D top-down pixel simulation with dialogue + thought bubbles | Self-distancing through observation |
| **Console** (right) | Assumption editor, divergence meter, annotation tools | Active reflection and negotiation |

**Key interaction mechanisms:**
- **Thought Bubble Visualization**: each AI actor's internal assumption is displayed in real time alongside dialogue (blue = User A, red = User B)
- **Temporal Scrubbing**: navigate through the simulated conflict non-linearly
- **Assumption Editing**: either partner can correct an AI-inferred assumption and re-run the simulation from that point
- **Counterfactual Branching**: "What if User A said X instead?" generates a new simulation branch
- **Dyadic Divergence Meter**: real-time display of interpretation gap between the two AI personas

---

## Research Questions

**RQ1**: How do couples interpret and react to AI-simulated versions of their past conflicts, and how do they negotiate discrepancies between the simulation and their memory?

**RQ2**: How does observing externalized relational assumptions (thought bubbles) influence partners' understanding of the conflict and each other?

**RQ3**: How do interactive mechanisms — assumption editing and counterfactual branching — shape the joint reflection process?

---

## Contributions

**C1 — Interaction Design**
A *thought bubble interface* that externalizes relational assumptions (interpretation biases) as visible, editable UI elements within an AI simulation — making the invisible dynamics of conflict observable.

**C2 — System**
Mirror: a dyadic AI system featuring lightweight interactional persona modeling, LLM-driven conflict simulation, and a shared reflection interface with assumption editing and counterfactual branching.

**C3 — Empirical Insights**
Findings from a study with N couples on how AI-simulated self-observation triggers reflection, where simulations fail or mislead, and what design conditions facilitate vs. disrupt joint reflection.

---

## Probe Scenario

**Domain**: Romantic couple conflicts (chosen for emotional salience, clear dyadic structure, and established theoretical grounding in relationship science).

**Generalizability**: The persona modeling framework and simulation architecture are domain-agnostic. Broader applications include team retrospectives, negotiation training, and parent-child communication — addressed as future directions.

---

## Theoretical Grounding

- Kross & Ayduk (2011) — Self-distancing in emotional processing
- Gottman & Levenson (1992) — Conflict patterns in couples
- Cooley (1902) — The looking-glass self
- Bailenson (2018) — Perspective-taking through avatar embodiment

---

## Open Questions / Design Challenges

1. **Fidelity vs. Distortion**: How accurate does the simulation need to be to trigger reflection without feeling wrong or invalidating?
2. **Re-escalation Risk**: What interface mechanisms prevent the simulation from re-triggering conflict rather than reflection?
3. **Persona Privacy**: Should each partner's persona profile be visible to the other?

---

*Draft — March 2026*
