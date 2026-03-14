# Rapport: Bilateral AI for Post-Conflict Interpersonal Alignment
## — Long-Distance Couples as Primary Context —

---

## One-Liner

**Rapport** is a bilateral AI that simultaneously holds both partners'
perspectives—drawn from their shared conflict transcript—to mediate post-conflict
reflection, surfacing mutual misunderstandings that neither partner could reach
through direct conversation.

---

## Problem

Long-distance couples conduct their relationships almost entirely through text.
When conflict erupts, the same medium that carries the relationship also carries
the wound. Two people who need to understand each other most acutely find
themselves least able to communicate: emotion blocks honesty, defensiveness
distorts memory, and the asymmetry between what each person experienced and
what each person expressed widens with silence.

What these couples need is a third party—someone who knows them both, has no
stake in the outcome, and can stand between them without taking sides. In
everyday life, this role is filled by a mutual friend: someone both parties
trust, who can hold two contradictory accounts of the same event without
collapsing them into a verdict.

But mutual friends are rare, biased by loyalty, and unavailable at 2am after
a fight. Professional mediators are costly and don't know the specific texture
of this relationship. And existing AI tools are fundamentally **unilateral**—
they serve one person, can be steered by one person's framing, and cannot
simultaneously hold both parties' perspectives without being co-opted.

**The gap is structural: no current system is designed to be equally
accountable to two people at once.**

---

## Empirical Motivation

In our prior work (CHI EA 2026, N=14 LDR couples), participants reflected on
their experiences with AI during relational conflict. A recurring, unprompted
theme emerged: participants wished AI could occupy the role of a *mutual
friend*—an entity that knew both partners, wouldn't take sides, and could
help them understand each other without requiring them to be emotionally
ready for direct conversation.

One participant described it directly:
> "It would be great if the AI could be like our mutual friend—it knows both
> of us, but it's not going to judge either of us or take sides."

This is not a feature request. It is a description of a structural role that
does not yet exist in AI design. **This paper is a response to that absence.**

---

## Why Existing Approaches Fall Short

**Unilateral AI assistants** serve whoever is typing. Given the same conflict,
A's AI validates A's account; B's AI validates B's. Two unilateral AIs produce
two better-articulated versions of the same original disagreement—not bilateral
understanding.

**Structured reflection exercises** (e.g., Gottman's Mirror technique,
role-reversal exercises) require both parties to voluntarily inhabit each
other's perspective. This is precisely the capacity that conflict depletes.
Knowing you *should* practice empathy does not make you able to when you are
hurt and defensive.

**Couples therapy** provides a skilled human third party but requires cost,
scheduling, and willingness that many couples—especially LDR couples navigating
time zones—cannot consistently access.

The problem is not a lack of good intentions or good methods. All existing
approaches require either one party to do all the bridging work, or a human
third party to be present. Neither is available at the moment after a fight.

---

## The Bilateral AI Concept

We propose **Bilateral AI**: an AI that is simultaneously accountable to
two people. Its defining properties:

- It draws its understanding from data **both parties generated together**
  (the shared conflict transcript)—not from either person's retrospective account.
- Its mediating interventions are **grounded in both perspectives**. When one
  partner has contributed less, it proactively seeks that partner's input before
  synthesizing.
- It serves **the relationship as a unit**—it can give honest feedback to either
  partner but cannot be weaponized by either against the other.
- It creates **psychological distance** by positioning itself as the subject of
  discussion ("what the AI said about the scene") rather than directing accusations
  between partners ("what you did to me").

A bilateral AI does not need to accurately model inner states. It needs to
generate a **shared artifact** that both parties are willing to engage, correct,
and discuss—and whose divergent corrections reveal what neither had said directly.

---

## Design Goals

**DG1 — Proactive Bilateral Equity**
The AI's synthesis must be grounded in both parties' perspectives. Partners may
share as much or as little as they choose—but when the AI detects significant
asymmetry in expression or engagement, it proactively invites the quieter
partner before producing shared output. One partner's silence should never be
silently filled by the other's account.

**DG2 — Relational Fidelity Over Individual Advocacy**
The AI serves the relationship, not either individual. It holds equal commitment
to both partners' honest understanding of what happened. It can offer
uncomfortable observations to either party. It does not compare, does not
score, does not decide relationship outcomes, and cannot be steered by one
partner's framing to produce a judgment against the other.

**DG3 — Mediated Distance as a Design Tool**
When direct communication is blocked by emotion, the AI becomes the subject
of discussion instead of the partner. Both parties respond to the AI's
representation of the conflict—not to each other—reducing the defensiveness
that makes direct conversation so difficult post-conflict. This distance is
structural and deliberate, grounded in Construal Level Theory (Trope &
Liberman, 2010): temporal, social, and narrative distance from the conflict
enables higher-order reflection that direct confrontation forecloses.

---

## System: Rapport

### Architecture Overview

```
Shared conflict transcript (both partners' messages)
                ↓
    Bilateral AI generation
    ─────────────────────────────────────────
    A's inferred inner monologue  |  B's inferred inner monologue
    (equally grounded, equally detailed for both)
                ↓
    Blind independent engagement         ← DG1, DG2
    (A and B each interact without
     seeing the other's responses)
                ↓
    Divergence classification
    (iMisreadPartner / partnerMisreadMe /
     mutual misread / shared doubt)
                ↓
    Structured negotiation per divergence
    (each states their view →
     shared understanding, co-authored)
                ↓
    Session summary + pattern reflection
```

### Phase Flow

**1. Input**
Either partner initiates. Both provide (or agree to use) a shared conflict
transcript. Neither can submit a private account the other cannot see—the
shared origin is what makes the AI bilateral.

**2. Watch**
Both partners read a dramatized reconstruction of the conflict: a theatrical
script with inferred inner monologues for each character. The theatrical format
operationalizes DG3—you are watching a scene, not reliving an accusation.
Each partner may privately tag emotional reactions (emoji, blind to the other).

**3. Annotate** *(cross-role)*
Each partner independently evaluates the AI's portrayal of the **other**
person's inner state: does this match who you know your partner to be?
Neither sees the other's evaluations until both have submitted.
This structural independence (prior commitment principle, Janis & Mann, 1977)
ensures your judgment of your partner is formed before you know how your
partner judged you—preventing anchoring.

**4. Self-Correct** *(own-role)*
Each partner evaluates the AI's portrayal of **their own** inner state.
What did the AI get wrong? What was actually happening inside you at that
moment? Partners rewrite in their own words.

**5. Compare**
The system reveals divergences across four types:
- *iMisreadPartner*: I endorsed the AI's portrayal of my partner, but my
  partner corrected it → my model of my partner was wrong.
- *partnerMisreadMe*: My partner endorsed the AI's portrayal of me, but I
  corrected it → my partner's model of me was wrong.
- *Mutual misread*: both of the above at the same beat.
- *Shared doubt*: both questioned the AI's portrayal → productive uncertainty.

These are not scores or blame. They are a map of where understanding broke down.

**6. Negotiate**
For each divergence, both partners write their response. The AI frames each
divergence with a question tailored to its type—inviting reflection, not
judgment. A shared field ("what we now understand") is co-authored by whoever
is ready to write first.

**7. Done**
Session summary: divergence patterns, shared understandings reached, and
(for researchers) a full data export of the interaction log.

---

## Research Questions

**RQ1 — Experience**
How do LDR couples experience a bilateral AI as a post-conflict mediator?
What aspects of the bilateral structure shape their sense of being heard,
fairly represented, and understood by their partner?

**RQ2 — Asymmetry and Proactivity**
How does the system handle asymmetry between partners in expressiveness
and emotional readiness? How does the AI's proactive engagement of the
quieter partner affect participation and perceived fairness?

**RQ3 — Emerging Understanding**
What new mutual understanding emerges through bilateral AI mediation that
couples report could not have been reached through direct conversation?
What is the nature and depth of these understandings, and do they persist?

---

## Study Design

### Paradigm: Retrospective Session Study

Rather than deploying the system longitudinally and waiting for conflicts
to occur, we recruit couples who have **already experienced a recent conflict**
(within the past 1–3 months) and reflect on that specific event.

This preserves ecological validity (real conflicts, real stakes, real chat logs)
while making the study tractable within a research timeline. LDR couples are
ideal: their conflicts happen via text by necessity, so participants already
have the shared transcript. The conflict is real; the reflection is structured
and new.

### Participants

- 16–20 LDR couples (both partners must participate)
- Inclusion: conflict within past 3 months, primarily via text messaging,
  chat log available, both willing to participate
- Exclusion: ongoing acute crisis, history of intimate partner violence

### Procedure

**Pre-session (async, each partner separately, ~10 min)**
Brief context survey capturing each partner's current understanding of the
conflict and what they believe the other was feeling/thinking at key moments.
(Baseline for post-session comparison of mutual understanding.)

**Session (synchronous call, separate devices, ~45–60 min)**
Both partners join a video call but use separate devices to go through the
system independently. Phases 1–4 are completed alone; Compare and Negotiate
are completed in real time, each reading the shared output on their own screen.
A researcher is present to observe and prompt reflection between phases.

**Post-session (together, ~10 min)**
Joint reflection: What surprised you? What feels different from conversations
you've had about this conflict before?

**2-week follow-up (individual semi-structured interviews, ~20 min each)**
Has your understanding of that conflict changed? Have you talked about it
differently since? What, if anything, stayed with you from the session?

### Data Sources

| Source | Addresses |
|--------|-----------|
| Interaction logs (annotations, corrections, negotiation text, timestamps) | RQ1, RQ2, RQ3 |
| Post-session questionnaire (perceived fairness, felt understanding, AI role comfort) | RQ1, RQ2 |
| 2-week individual interviews | RQ1, RQ3 |
| Researcher observation notes | RQ2 |

### Analysis

- **Thematic analysis** of interview transcripts (RQ1, RQ3)
- **Content coding** of negotiation texts for depth of perspective-taking
  (surface: "I see your point" vs. deep: "I understand now that when I did X,
  you experienced it as Y because of Z")
- **Interaction log analysis**: participation asymmetry, AI proactive
  intervention moments, divergence type distribution (RQ2)

---

## Contributions

**C1 — Concept: The Bilateral AI Paradigm**
A new design space for AI systems that are simultaneously accountable to two
people—grounded in shared data, structurally resistant to single-party
co-optation, and proactively equitable in the face of partner asymmetry.

**C2 — System: Rapport**
A full implementation of bilateral AI for post-conflict interpersonal alignment
in LDR couples, realizing all three design goals across a seven-phase
interaction flow.

**C3 — Empirical Findings**
Evidence from a study with N LDR couples on how bilateral AI shapes
post-conflict reflection: what new understanding emerges, how the system
handles partner asymmetry, and what persists two weeks later.

**C4 — Generalization**
Design walkthroughs of two additional relationship contexts—joint
decision-making under divergent priorities; support-style mismatch—
demonstrating the transferability of the bilateral AI mechanism and
providing design implications beyond the conflict domain.

---

## The Most UIST Point

Every existing AI is unilateral. The design space of AI systems that are
equally accountable to two parties simultaneously—with structural (not
instructional) neutrality, proactive equity toward the less expressive party,
and a shared AI-generated artifact as the medium of interpersonal reflection—
has not been explored in HCI.

This paper does not propose a better AI chatbot. It proposes a new
**relationship between humans and AI**: one where the AI holds the middle,
and two people understand each other through it.

---

## Theoretical Grounding

| Theory / Prior Work | How it grounds this paper |
|---------------------|--------------------------|
| Construal Level Theory (Trope & Liberman, 2010) | Psychological distance via theatrical framing reduces defensiveness (DG3) |
| Prior Commitment Principle (Janis & Mann, 1977) | Blind annotation prevents anchoring on partner's judgment |
| Proactive AI agents (ComPeer, CHI 2024) | Proactive outreach design; extended here to bilateral proactivity |
| Gottman's Dreams Within Conflict | Digs beneath surface conflict to inner needs; we automate this without requiring a therapist or voluntary self-disclosure |
| Couples technology (Hassenzahl, Vetere et al.) | Existing work is unilateral or requires co-presence; we address LDR + bilateral |
| CHI EA 2026 (our own prior work) | Empirical motivation: participants identified the共友 role as missing |

---

## Limitations & Open Questions

- **Session-based**: reflects on one conflict at a time; persistent bilateral
  memory across relationship history is future work.
- **AI accuracy**: inner monologues are AI-generated approximations; the
  self-correct phase turns inaccuracy into a feature (correctability > accuracy),
  but participant reactions to feeling "mis-described" warrant attention.
- **Requires mutual willingness**: cannot be used by one partner alone; this
  is a design property, not a bug, but limits use cases.
- **Generalization**: we study LDR text-based conflict; transferability to
  co-located couples or non-text conflict is an open empirical question.
