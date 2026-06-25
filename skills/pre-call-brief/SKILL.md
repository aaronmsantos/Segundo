# Pre-Call Brief

Generate a scannable, one-page pre-call brief that surfaces only what the rep does not already know: gaps, surprises, landmines, and a verbatim opening line. Merges deal-state intelligence with discovery planning into a single artifact the rep reads in under 5 minutes.

## When to Use

- Before any scheduled prospect or customer call
- User says "prep", "brief me", "call brief", "what do I need to know"
- Calendar event approaching for a known deal

---

## Pre-Flight

| Condition | Action |
|---|---|
| Call is **>2 hours away** AND no discovery plan exists | Run discovery-planner skill first, then return here to build the brief |
| Call is **<2 hours away** | Skip discovery-planner. Run this skill only. Speed over thoroughness. |
| Discovery plan already exists | Load it as input. Do not regenerate. |

---

## Never Do

1. Never produce a brief longer than one printed page
2. Never include information the rep already knows cold. Only surface surprises, gaps, and landmines.
3. Never skip competitive landmines -- even if no competitor is named, check for incumbents and status-quo risk
4. Never end without a suggested opening line -- verbatim, for this specific call
5. Never pull from memory older than 14 days without flagging the entry as `[STALE]`
6. Never plan a call without at least one question that locates the decision process
7. Never plan a discovery call without at least one Level 3 strategic question (see Strategic Ladder below)
8. Never end the brief with "good luck" or any generic encouragement. End with a specific opening line.
9. Never cite a reference customer you cannot verify from deal memory or CRM
10. Never include internal strategy notes -- this brief might be screen-shared accidentally

---

## Step 1: Load Context

Fast, targeted reads only. Do not scan entire deal files.

1. **Deal memory**: Read header + last 2 dated entries from deal memory file
2. **Meeting context**: Pull today's meeting details from the deal memory Next Steps section or calendar event
3. **Competitor snapshot**: Grab 1-2 sentence summary for each known competitor from competitive intel
4. **CRM data**: Pull ACV, stage, close date, days in stage, last activity from CRM connector
5. **Attendee context**: For each known attendee, pull role, title, last interaction, and known priorities
6. **Stale check**: Flag any data point sourced from >14 days ago as `[STALE]`

If any data source is unavailable, note it as `[NO DATA]` and proceed. Never block the brief on a missing source.

---

## Step 2: Classify Call Type

Classify the upcoming call to route the brief correctly.

| Call Type | When | Primary Objective |
|---|---|---|
| **Discovery** | First or second meeting; problem space unknown | Uncover pain, map stakeholders, locate decision process |
| **Technical Demo** | Prospect wants to see the product | Prove technical fit against stated requirements |
| **Architecture Walkthrough** | Post-demo deep dive with technical stakeholders | Validate integration feasibility, surface blockers |
| **Business Case Review** | Building or presenting ROI/value justification | Quantify impact, get EB alignment on metrics |
| **Negotiation / Close** | Terms, pricing, contract redlines | Advance paper process, resolve final objections |
| **Executive Briefing** | C-level or VP-level sponsor meeting | Align on strategic value, secure executive sponsorship |
| **Check-in / Nurture** | No active evaluation; relationship maintenance | Stay top-of-mind, surface latent triggers |
| **Pricing / Commercial** | Dedicated pricing or packaging discussion | Anchor value before revealing numbers, understand budget |
| **SE Scoping Call** | Joint call with Solutions Engineer | Define technical requirements, scope implementation |

### Routing Rules

- **Negotiation / Close** calls: Route to the `commercial-closer` skill for negotiation-specific prep. Append its output to this brief.
- **SE Scoping** calls: Verify a scoping document exists or is in progress. If not, flag: `[ACTION NEEDED] Generate scoping doc before this call.`
- **Discovery** calls: Enforce the Strategic Ladder check (Step 4c). Every discovery call needs at least one Level 3 question.

---

## Step 3: Set Call Objectives

Define exactly 3 objectives in priority order.

| Priority | Label | Definition |
|---|---|---|
| 1 | **MUST achieve** | The call fails without this. Tied to the single biggest methodology gap or deal blocker. |
| 2 | **SHOULD achieve** | Materially advances the deal. Worth spending 30% of the call on. |
| 3 | **NICE to have** | Bonus intel or relationship-building. Only pursue if time allows. |

Rules:
- Each objective must be specific and measurable. "Build rapport" is not an objective. "Confirm [Name] owns the budget sign-off" is.
- At least one objective must address the weakest {{methodology.framework}} factor.
- If this is a discovery call, the MUST objective should always involve locating the decision process or quantifying pain.

---

## Step 4: Build Question Stack

Questions are prioritized by methodology gaps. The biggest gap gets the first questions.

### Question Design Rules

1. Open-ended first, closed follow-up second
2. Never ask something Google could answer
3. One question per turn -- do not stack multiple questions
4. Prefer operational and financial questions over feature questions
5. Locate the decision process early -- before pitch mode takes over
6. A good discovery question makes the prospect **do math or tell a story**, not answer yes/no
7. Frame questions around their world, not your product
8. Silence after asking is a feature, not a bug

### {{methodology.framework}} Question Bank

Questions organized by the 8 MEDDPICC factors. All examples are generic B2B SaaS -- adapt to the specific deal context.

#### Pain (I - Implicate the Pain)

1. "Walk me through how you handle [process] today -- start to finish, who touches it?"
2. "When [process] breaks down, what does that cost you in hours, dollars, or missed deadlines?"
3. "If nothing changes in the next 12 months, what is the business impact?"

#### Metrics (M)

1. "How do you measure success for [initiative] today? What are the actual numbers?"
2. "If we could cut [time/cost] by [X]%, what would that mean for your team's capacity?"
3. "What does your leadership team track to know if this area is healthy or not?"

#### Economic Buyer (E)

1. "Who ultimately signs off on a purchase like this? Have they weighed in yet?"
2. "When your team brought in [last vendor], what did the approval process look like?"
3. "What does [EB name] care most about this quarter -- cost reduction, growth, risk mitigation?"

#### Decision Criteria (D)

1. "What are the top 3 things your team needs to see before choosing a vendor?"
2. "Have you built a formal evaluation framework, or is it more informal right now?"
3. "If two vendors scored equally on features, what would be the tiebreaker?"

#### Decision Process (D)

1. "Can you walk me through what happens between 'we like this' and 'we sign the contract'?"
2. "How many people need to say yes before this moves forward? Who are they?"
3. "What has killed or stalled similar purchases in the past?"

#### Paper Process (P)

1. "Once a decision is made, how long does it typically take to get through legal and procurement?"
2. "Are there any compliance reviews, security audits, or vendor assessments we should plan for?"
3. "Who on your side handles the contract redlines -- is it legal, procurement, or the business owner?"

#### Champion (C)

1. "Who internally is pushing hardest for this to happen? What is their personal stake?"
2. "If we were not in the room, how would you describe the case for this to your leadership?"
3. "What would make you look good if this project succeeds? What is the win for you personally?"

#### Competition (C)

1. "Are you looking at other solutions right now, or is this between us and doing nothing?"
2. "What has your team seen so far that impressed them -- from us or anyone else?"
3. "If you had to play devil's advocate against choosing us, what would you say?"

---

## Step 4b: Control Mapping Lens

Tag each question in the stack with a control bucket.

| Tag | Meaning | Action |
|---|---|---|
| **[D] Direct** | Rep controls the outcome | Pre-plan your response if the answer is unfavorable |
| **[I] Influence** | Rep can shape but not decide | Identify which asset (one-pager, ROI model, reference call) helps the champion carry this internally |
| **[U] Uncontrolled** | External force (budget freeze, reorg, competitor lock-in) | Surface early. Do not let an uncontrolled risk lurk until close. |

### Control Mapping Rules

- For every **[U]** question: surface the risk in the first half of the call. Surprises at close kill deals.
- For every **[I]** question: define what asset you can build to help the champion sell internally (deck, ROI calculator, executive summary, reference call).
- For every **[D]** question: pre-plan your response path for both good and bad answers.

---

## Step 4c: Strategic Ladder Lens

Three-level question hierarchy. Every call plan must include at least one Level 3 question.

| Level | Focus | Example |
|---|---|---|
| **L1 -- Functional** | How does the process work today? | "Walk me through how your team handles [workflow] from start to finish." |
| **L2 -- Business Impact** | What does it cost when it breaks? | "When [process] fails, what is the downstream impact on revenue or headcount?" |
| **L3 -- Strategic** | How does this connect to company-level goals? | "How does solving this connect to what your CEO talked about on the last earnings call?" |

### Value Pyramid Mapping

The Strategic Ladder maps to a 6-level Value Pyramid. Higher is more powerful.

| Pyramid Level | Definition | Ladder Level |
|---|---|---|
| **6. Goals** | The executive's #1 outcome this year | L3 |
| **5. Strategies** | How the org plans to reach the goal | L3 |
| **4. Initiatives** | Specific projects funded to execute strategies | L2-L3 |
| **3. Obstacles** | What blocks the initiatives | L2 |
| **2. Needs** | Capabilities required to clear the obstacles | L1-L2 |
| **1. Wins** | Tactical quick wins that prove value | L1 |

### Dragging Questions Up the Pyramid

When the question stack is too bottom-heavy (L1+L2 outnumber L3 by 4-to-1 or more), drag questions up:

| From | To | Add this follow-up |
|---|---|---|
| Needs (2) | Obstacles (3) | "What happens if this does not get solved in the next 6 months?" |
| Obstacles (3) | Initiatives (4) | "Which internal project or initiative does this block?" |
| Initiatives (4) | Strategies (5) | "How does this connect to your CFO's top priorities this year?" |
| Strategies (5) | Goals (6) | "What is the single biggest outcome your [EB title] needs to deliver this year?" |

### Ladder Balance Check

After building the question stack, count questions by level:
- **L1 count**: [n]
- **L2 count**: [n]
- **L3 count**: [n] -- must be >= 1

If L3 = 0, drag at least one question up before finalizing the brief.

---

## Step 5: Anticipate Objections

Identify the top 3 most likely objections for this specific call. Do not list generic objections -- tailor to the deal context, call type, and attendees.

### Objection Response Framework

For each objection:

1. **Acknowledge**: Validate the concern without agreeing with the premise
2. **Reframe**: Shift from cost/risk framing to impact/opportunity framing
3. **Evidence**: Cite a specific proof point (metric, reference, case study)
4. **Redirect**: Tie back to their stated priority or pain

Example structure:
```
OBJECTION: "We do not have budget for this right now."
-> Acknowledge: "Budget timing is real -- I hear that."
-> Reframe: "The question is whether the cost of waiting is higher than the cost of acting."
-> Evidence: "[Reference company] quantified [X] in waste per quarter before they moved."
-> Redirect: "You mentioned [initiative] is a priority for Q3 -- does that have its own budget line?"
```

---

## Step 6: Define Success Criteria

Define what success looks like before the call starts, so the rep can self-assess immediately after.

| Outcome | Definition |
|---|---|
| **WIN** | All 3 objectives achieved. Clear next step with date and owner committed. |
| **PARTIAL** | MUST objective achieved. 1-2 others missed. Next step exists but may be vague. |
| **MISS** | MUST objective not achieved. No committed next step. |
| **RECOVERY** | Call went sideways. Define the specific follow-up action within 24 hours to recover (email, champion call, asset delivery). |

After the call, compare against these criteria. If MISS or RECOVERY, trigger the post-call skill with a recovery flag.

---

## Step 7: Output Format

The final brief must fit on one page. Use this exact structure.

```
PRE-CALL BRIEF: [Company] | [Call Type] | [Date/Time]
ATTENDEES: [Name] ([Title]) -- [one-line context: last interaction or known priority]

SNAPSHOT
- [Stage] | [ACV] | [Close Date] | [Days in Stage]
- What they want from this call: [their likely agenda]
- What we need from this call: [our primary objective]

OBJECTIVES
1. MUST: [specific, measurable objective]
2. SHOULD: [specific, measurable objective]
3. NICE: [specific, measurable objective]

QUESTION STACK (by priority)
[Gap]  [Control]  [Level]  Q1: [question]
[Gap]  [Control]  [Level]  Q2: [question]
[Gap]  [Control]  [Level]  Q3: [question]
[Gap]  [Control]  [Level]  Q4: [question]
[Gap]  [Control]  [Level]  Q5: [question]

STRATEGIC LADDER CHECK
L1: [count] -- e.g., "[example question from stack]"
L2: [count] -- e.g., "[example question from stack]"
L3: [count] -- e.g., "[example question from stack]"
Highest pyramid level reached: [Goals / Strategies / Initiatives / etc.]

CONTROL MAP SUMMARY
Direct: [what to act on immediately after call]
Influence: [what needs champion action + specific asset to build]
Uncontrolled: [external risks to surface in first half of call]

MEDDPICC GAPS (red/yellow only)
[Factor]: [gap description] -> ask: "[specific question from stack]"
[Factor]: [gap description] -> ask: "[specific question from stack]"

COMPETITIVE LANDMINES
[Competitor]: [their likely angle] -> kill: "[one-line response]"
[Status Quo]: [inertia risk] -> kill: "[one-line response]"

OBJECTION PREP
1. [Objection] -> [Acknowledge + Reframe + Evidence in one line]
2. [Objection] -> [Acknowledge + Reframe + Evidence in one line]
3. [Objection] -> [Acknowledge + Reframe + Evidence in one line]

LAST TOUCH: [Date] -- [what happened + commitments made]

OPENING LINE
"[Verbatim suggested opener for this specific call, referencing the last interaction or a known priority]"
```

---

## Few-Shot Examples

### BAD Example

```
PRE-CALL BRIEF: Acme Corp | Discovery | Jun 24
ATTENDEES: Sarah Chen (VP Ops)

SNAPSHOT
- Stage 1 | $85K | Sep 30
- They want to see a demo
- We need to qualify

OBJECTIVES
1. MUST: Build rapport
2. SHOULD: Show value
3. NICE: Get next steps

QUESTION STACK
Q1: Tell us about your current challenges?
Q2: What are your priorities?
Q3: How is your team structured?

MEDDPICC GAPS
Pain: Unknown
Champion: Unknown
Decision Process: Unknown

COMPETITIVE LANDMINES
None identified

OPENING LINE
"Hi Sarah, thanks for taking the time today. We are excited to show you what we can do."
```

**Why this fails:**
- Objectives are vague and unmeasurable ("build rapport" is not an objective)
- Questions are generic -- Google could answer Q3
- No control tags, no strategic ladder check
- "None identified" on competitive landmines is lazy -- at minimum, status quo is always a competitor
- Opening line is boilerplate that could apply to any call with any company
- No specific methodology gaps surfaced
- No objection prep at all

### GOOD Example

```
PRE-CALL BRIEF: Acme Corp | Discovery | Jun 24, 2:00 PM
ATTENDEES: Sarah Chen (VP Ops) -- owns the consolidation initiative per Q1 board deck
            Mike Torres (Dir Engineering) -- evaluated Nexus Platform last year, did not buy

SNAPSHOT
- Stage 1 | $85K | Sep 30 | 12 days in stage
- What they want: Understand if we can replace their 3-vendor stack with one platform
- What we need: Confirm Sarah has budget authority and map the decision process

OBJECTIVES
1. MUST: Get Sarah to describe the decision process -- who approves, what timeline, what kills it
2. SHOULD: Quantify the cost of the current 3-vendor stack (hours, dollars, error rate)
3. NICE: Identify if Mike's failed Nexus eval left evaluation criteria we can reference

QUESTION STACK
[Decision Process]  [D]  [L2]  Q1: "Last time your team brought in a new platform, what did the approval process look like from first meeting to signature?"
[Pain]              [D]  [L2]  Q2: "You mentioned running three separate systems -- when something breaks between them, what does that cost your team in hours per month?"
[Economic Buyer]    [I]  [L3]  Q3: "How does consolidating this stack connect to what your CFO is prioritizing this fiscal year?"
[Competition]       [U]  [L1]  Q4: "Mike, I know you looked at Nexus Platform last year -- what made you decide not to move forward?"
[Champion]          [I]  [L2]  Q5: "If this works, what does it mean for your team specifically, Sarah? What changes for you?"

STRATEGIC LADDER CHECK
L1: 1 -- "What made you decide not to move forward with Nexus?"
L2: 3 -- "What does the approval process look like?" / "What does it cost in hours?" / "What changes for you?"
L3: 1 -- "How does this connect to CFO priorities?"
Highest pyramid level reached: Strategies

CONTROL MAP SUMMARY
Direct: Q1 (decision process) -- if vague, push for specific names and dates before call ends
Influence: Q3 (CFO alignment) -- if Sarah confirms link, offer to build an executive summary she can forward; Q5 (champion) -- if personal win is clear, reinforce it in follow-up
Uncontrolled: Q4 (prior failed eval) -- if Nexus left political scar tissue, surface it now, not at close

MEDDPICC GAPS (red/yellow only)
Decision Process [RED]: No visibility into approval chain -> ask Q1
Economic Buyer [YELLOW]: Sarah may or may not hold budget -> ask Q3
Competition [YELLOW]: Prior Nexus eval outcome unknown -> ask Q4

COMPETITIVE LANDMINES
Nexus Platform: May still have internal advocates from last year's eval -> kill: "What specifically did not work about that approach? We want to make sure we are solving the actual problem, not just replacing the vendor."
Status Quo: 3-vendor stack is painful but functional -- inertia is real -> kill: "You have lived with this for 18 months. What changed that made you take this call now?"

OBJECTION PREP
1. "We looked at something like this before and it did not work out" -> Validate the experience, then ask what specifically failed -- scope, timing, or fit -- and show how this engagement is structured differently
2. "We do not have budget approved yet" -> Reframe to cost of inaction: "What is the monthly cost of running three systems?" and offer to co-build the business case
3. "We need to involve more people before we go further" -> Welcome it: "Who else should be in the room? Let us map out the right group now so we do not lose momentum."

LAST TOUCH: Jun 12 -- Sarah responded to outbound. Said "consolidation is a priority but timeline is fuzzy." No commitment beyond this meeting.

OPENING LINE
"Sarah, you mentioned consolidation is a priority but the timeline is still taking shape -- I want to use this time to figure out whether we are the right fit and, if so, what the path forward actually looks like. Mike, glad you are here too -- your experience evaluating platforms last year will keep us honest. Where should we start?"
```

**Why this works:**
- Objectives are specific and measurable -- you will know if Q1 was answered
- Questions are tagged with methodology gap, control bucket, and strategic level
- Competitive landmines include the status quo, not just named vendors
- Opening line references the last interaction, names both attendees, sets the frame, and hands control to the prospect
- MEDDPICC gaps are only red/yellow -- no wasted space on green factors
- Control map tells the rep what to do with each type of answer
- Strategic Ladder confirms at least one L3 question exists
