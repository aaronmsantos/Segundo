# Deal Inspector

Score deals using {{methodology.framework}}. Surface risks. Recommend next actions. Update deal state.

## When to Use

- User mentions any deal by name
- User asks for deal health, status, or review
- User uploads or references a call transcript
- User says "inspect", "score", "health check", "MEDDPICC", "deal review"
- Post-call analysis or deal status updates
- Pipeline reviews or 1:1 prep

## Pre-Flight

Before scoring, verify:
- **Trace:** Is the user asking for a health score, a next action, a recovery play, or a quick status? If ambiguous, surface the options in one line before running the full inspection.
- **Scope:** Only inspect the requested deal. Do not drive-by refactor other deals.
- **Execute:** Read the deal file now. Do not promise to.

## Never Do

- Never score green without evidence. Assumed intel is yellow.
- Never recommend an action that does not close a methodology gap.
- Never rewrite the deal memory header during a quick inspection. Only append new intel.
- Never end inspection with "let me know if you want more detail." End with a specific next move + date.
- Never skip the control map. If you cannot name what {{user.name}} directly controls, the inspection is incomplete.
- Never fabricate deal numbers, customer references, or product capabilities.

## Process

### Step 1: Load Deal Context (Progressive Disclosure)

Use 3-layer retrieval. Do not dump full memory files unless targeted reads miss.

1. **Layer 1 (Index)**: Read the deal index to locate the deal entry and confirm the exact file name.
2. **Layer 2 (Targeted search)**: Search deal memory for the current-state header + recent entries. For competitive or pattern context, search those categories too.
3. **Layer 3 (Precision read)**: Read only the header block + latest 2-3 dated entries unless the task needs deeper history.
4. **Full-file fallback**: Only read the whole deal file if (a) search returns no matches, (b) user explicitly asked for a deep review, or (c) the file is under 200 lines.
5. Also check CRM data and recent transcripts if referenced.
6. Note today's date and calculate days since last activity.

**Why:** Prevents token bloat on routine inspections. A health check rarely needs full history. It needs current state + recent deltas.

### Step 2: Score {{methodology.framework}}

Score each factor on the 3-tier scale. Be honest, not optimistic.

| Score | Meaning | Criteria |
|-------|---------|----------|
| Green | Confirmed | Evidence from calls, emails, or docs. Not assumed. |
| Yellow | Partially known | Some signal but gaps remain. Needs validation. |
| Red | Unknown or at risk | No evidence, stale info, or active risk identified. |

**The 8 Factors (MEDDPICC):**

1. **Metrics** - Is the business impact quantified? Do we have dollar figures, volume numbers, FTE savings, or risk exposure? Green = prospect confirmed numbers. Yellow = we estimated but unconfirmed. Red = no numbers.
2. **Economic Buyer** - Is the person who signs the check identified AND engaged with {{company.name}}? Green = EB has met with our team directly. Yellow = EB identified but no direct engagement. Red = unknown or inaccessible.
3. **Decision Criteria** - Do we know what they are evaluating on? Green = criteria discussed in a call and confirmed. Yellow = inferred from context. Red = unknown.
4. **Decision Process** - Do we know the steps from "yes" to signed contract? Green = mapped step-by-step with the champion. Yellow = general shape known. Red = unknown.
5. **Paper Process** - Do we know procurement, legal, security review, and timeline? Green = mapped with specific steps and owners. Yellow = general awareness. Red = not discussed.
6. **Identified Pain** - Is the pain real, quantified, and personally felt by the champion? Green = champion articulated pain in their own words with consequences. Yellow = we identified pain, prospect acknowledged. Red = assumed pain only.
7. **Champion** - Do we have someone who: (a) has motive to fix the problem, (b) has influence in the org, (c) has access to the EB, and (d) is actively selling on our behalf? Green = all four. Yellow = 2-3 of four. Red = 0-1.
8. **Competition** - Do we know who else is being evaluated and our position vs them? Green = competitors identified, our differentiation confirmed by prospect. Yellow = competitors identified but position unclear. Red = unknown competitive landscape.

### Severity + Diagnosis Codes (per factor)

After scoring each factor, assign a diagnosis code that explains WHY it is at that score. This makes the score actionable, not just descriptive.

| Code | Meaning | Action |
|------|---------|--------|
| CONFIRMED | Evidence from call/email/doc, no gaps | None needed |
| ASSUMED | Inferred but never validated by prospect | Validate in next interaction |
| STALE | Was confirmed but >14 days without revalidation | Re-confirm or downgrade |
| MISSING | No evidence exists | Critical gap, address before next stage gate |
| CONFLICTING | Multiple signals disagree | Resolve contradiction before forecasting |
| BLOCKED | Known blocker preventing progress | Escalate or find workaround |
| DEGRADED | Was stronger, has weakened over time | Recovery play needed |

**Output format:** When scoring, append the diagnosis code:
```
M Green CONFIRMED -- $400K annual savings validated by champion on Jun 10 call
E Yellow STALE -- CFO confirmed in May room but no direct engagement in 21 days
C Yellow DEGRADED -- champion confirmed real but momentum has weakened, cannot accelerate eng timeline
```

### Step 3: Risk Assessment + Control Mapping

After scoring, identify:

1. **Fatal Flaw (Premortem)**: If this deal dies, what kills it? Write the one-sentence death story.
2. **Blind Spots**: What do we NOT know that could change the score?
3. **Stale Intel**: Any information older than 14 days that needs revalidation?
4. **Champion Energy**: Is the champion driving next steps or are we pushing? Leading indicators: who scheduled the last meeting, who followed up first, are they bringing new stakeholders in?

**Control Map:**
- **Direct Control**: What can {{user.name}} do right now, unilaterally, to move this deal? (build assets, send emails, schedule calls)
- **Influence Only**: What requires someone else but {{user.name}} can shape? (champion advocacy, EB engagement, partner intro)
- **Uncontrolled**: What is outside anyone's control? (competitor pricing, reorgs, budget freezes)

If the fatal flaw sits in the "uncontrolled" bucket, flag as highest risk. If it sits in "direct control," flag as highest priority fix.

### Step 4: Compelling Event Check

Verify at least one compelling event exists. A compelling event is:
- Time-bound (has a date)
- Has consequences if missed (not just "would be nice")
- Owned by the prospect (not a {{company.name}}-imposed deadline)

If no compelling event exists, flag as critical risk.

### Step 4b: Technical Readiness Check

Run this before requesting a solutions engineer scoping call. Pulling an SE into a call before these basics are known wastes their time and signals poor qualification.

| Item | Why It Matters | Status |
|------|---------------|--------|
| Annual usage volume + peak | Sizing and capacity planning | Confirmed / Unknown |
| Primary use cases | Solution architecture | Confirmed / Unknown |
| Tech stack + integration point | Where {{company.product}} plugs in | Confirmed / Unknown |
| Incumbent solution confirmed | Displacement vs greenfield strategy | Confirmed / Unknown |
| Complexity drivers (SKUs, regions, etc.) | Implementation scoping | Confirmed / Unknown |
| Champion identified and engaged | Someone to run the scoping call | Confirmed / Unknown |
| Timeline expectations | Resource planning | Confirmed / Unknown |

**READY**: all 7 confirmed -- schedule SE call
**NEEDS WORK**: flag missing items -- secure from champion before pulling SE in
**NOT READY**: 3+ unknowns -- do not schedule. Homework first.

### Step 5: Classification Rules

Before acting on a deal, classify it:
- **Group A (Mutual Plan)**: Has a booked next step, champion is engaged, process is moving. Mode: project management. Track milestones, hold timeline.
- **Group B (Uncertain)**: No booked next step, champion energy unclear, or stalled. Mode: value management. Make moves, not follow-ups. Create reasons to re-engage.

### Step 6: Gap-Move Audit

Before completing, audit the deal against 4 standard advancement moves:
1. **Multi-thread** -- target 3+ external stakeholders in last 14 days
2. **Compelling-event-uncover** -- dated business deadline + consequence
3. **Proof-point-drop** -- reference customer cited with specific metrics
4. **Technical-validator** -- prospect's engineer or product lead in a working session within 30 days

Flag the weakest one explicitly with a specific next step. Not "multi-thread this week" but "[Company]: 1 external thread, propose adding the [specific role] and the [specific role] before [day] call."

### Step 7: Next Best Action + Outcome Ownership

Recommend exactly ONE next action. Not a list of 5 things. The single most important move to advance this deal. Format:

**Next Best Action:** [What to do] by [when] because [why this matters now].
**Outcome Owned:** [What measurable outcome does {{user.name}} own if this action executes?]

The action must do at least one of: advance stage, increase urgency, clarify decision path, tighten stakeholder alignment, or strengthen business case. If it does not do any of these, pick a different action.

If the deal is stalled (no next step, champion quiet, timeline slipped), recommend one of these recovery paths:
1. **Value play**: Send new intel that reopens the conversation (market data, competitor news, regulatory change)
2. **Stakeholder play**: Go around the silent champion to another contact
3. **Timeline play**: Reference a compelling event or create one

### Step 8: Output Format

```
DEAL: [Name] | [ACV] | [Stage]
DATE: [Today]
DAYS SINCE LAST ACTIVITY: [N]

MEDDPICC SCORE
M [emoji] [DIAGNOSIS CODE] -- [one-line rationale with evidence]
E [emoji] [DIAGNOSIS CODE] -- [one-line rationale with evidence]
D [emoji] [DIAGNOSIS CODE] -- [one-line rationale with evidence]
D [emoji] [DIAGNOSIS CODE] -- [one-line rationale with evidence]
P [emoji] [DIAGNOSIS CODE] -- [one-line rationale with evidence]
I [emoji] [DIAGNOSIS CODE] -- [one-line rationale with evidence]
C [emoji] [DIAGNOSIS CODE] -- [one-line rationale with evidence]
C [emoji] [DIAGNOSIS CODE] -- [one-line rationale with evidence]

OVERALL: [emoji] [Commit / Best Case / Pipeline / At Risk]
CLASSIFICATION: [Group A: Mutual Plan / Group B: Uncertain]

FATAL FLAW: [one sentence]
BLIND SPOTS: [bulleted list]
COMPELLING EVENT: [event + date + consequence]
GAP MOVES: [weakest move + specific fix]
NEXT BEST ACTION: [action] by [date] because [reason]
OUTCOME OWNED: [what measurable outcome this produces]

CONTROL MAP
Direct: [what {{user.name}} controls]
Influence: [what requires others]
Uncontrolled: [external risks]
```

### Step 9: Update Memory

After inspection, update the deal memory file with:
- New methodology scores with diagnosis codes
- Updated next steps
- Any new intel surfaced during the inspection

Always append, never replace existing history.

## Product Fit Check

Always map deals against {{company.product_catalog}}. Never review a deal without asking: which products does this deal need? Reference the product catalog configuration for the full capability map.

## Few-Shot Examples

### BAD inspection (what NOT to produce)

```
DEAL: Acme Corp | $50K | Discovery
MEDDPICC SCORE
M Green They mentioned cost savings
E Yellow Not sure who signs
D Yellow Probably technical fit
...
NEXT BEST ACTION: Follow up next week and see where things stand.
```

Why this fails: "mentioned cost savings" is not quantified (yellow at best). "Not sure who signs" is red, not yellow. "Follow up next week" closes zero gaps, owns zero outcomes.

### GOOD inspection (the standard)

```
DEAL: DataFlow Inc | $45K | Validating
DATE: Jun 15 2026
DAYS SINCE LAST ACTIVITY: 3

MEDDPICC SCORE
M Yellow ASSUMED -- Champion mentioned 3-4x cost reduction vs incumbent but exact savings not confirmed
E Red MISSING -- VP Engineering identified but zero direct engagement with our team
D Yellow ASSUMED -- CTO will scrutinize architecture, criteria inferred not confirmed
D Yellow ASSUMED -- General shape: champion validates, CTO blesses, VP signs. Steps not mapped
P Red MISSING -- Procurement, legal, security review timeline completely unknown
I Green CONFIRMED -- Champion confirmed: incumbent renewal spike + expansion blocked + audit exposure
C Yellow DEGRADED -- Champion has motive + influence + access to VP. Not yet selling internally (3/4)
C Yellow ASSUMED -- Incumbent identified. Our differentiation acknowledged but not formally compared

OVERALL: Yellow Best Case
CLASSIFICATION: Group A: Mutual Plan

FATAL FLAW: VP Engineering has never heard our name. If champion cannot carry the business case internally, this deal dies in procurement.
BLIND SPOTS: CTO specific technical evaluation criteria. Paper process timeline. Whether incumbent has a retention play in motion.
COMPELLING EVENT: Incumbent renewal repricing (active now) -- if they sign renewal, we are locked out for 12-24 months.
GAP MOVES: Multi-thread weakest (1 external thread). Propose adding the platform eng lead and the revenue ops manager before Thursday call.
NEXT BEST ACTION: Ask champion to schedule a 20-min intro with VP Engineering before the incumbent renewal deadline, framed as "here is the alternative I found" by Jun 22.
OUTCOME OWNED: VP Engineering knows we exist and has seen the 3-year savings comparison before they sign the incumbent renewal.

CONTROL MAP
Direct: Build the VP-ready one-pager with 3-year savings math. Send champion the ask with specific framing language.
Influence: Champion carries the message to VP. Champion pushes back on incumbent renewal timeline.
Uncontrolled: Incumbent retention offer. VP appetite for vendor switch mid-cycle. CTO technical bar.
```

Why this works: Every score has evidence or explicit gap with a diagnosis code. Fatal flaw names the person and the mechanism. Next action has a date, a specific ask, and closes the EB gap. Outcome is measurable.
