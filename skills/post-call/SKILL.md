# Post-Call Pipeline

Process a completed call: transcribe, extract intel, update deal memory, draft follow-up. Optional coaching layer.

## When to Use
- After any prospect or customer call
- User says "just had a call with X", "process the X call", "update memory for X"
- User drops a transcript or audio file
- User asks for post-call coaching or debrief

## Input Options
- Audio file (local recording, use configured transcription service)
- Transcript file (VTT, TXT, or SRT)
- CRM call recording (pull from configured call recording platform)
- Manual notes (user provides key points)

## Never Do
- Never update deal memory without extracting intel first -- raw transcripts are not intel
- Never draft a follow-up that does not reference something specific from the call
- Never skip methodology scoring on a substantive prospect call
- Never lose action items -- every commitment by either side gets captured
- Never replace existing deal memory -- always append with dated entries
- Never assume intent from silence. If a topic was not discussed, mark it as UNADDRESSED, not inferred

## Process

### Step 1: Transcription
If audio provided, transcribe using configured transcription service. If transcript provided, parse into structured format. Extract: speaker identification, timestamps, topic segments.

### Step 2: Intel Extraction
Extract from the call content:

**{{methodology.framework}} Signals:**
For each methodology factor, extract any new intel:
- Metrics: any numbers, costs, volumes, savings mentioned
- Economic Buyer: any mentions of who decides, who signs, budget holders
- Decision Criteria: any evaluation criteria, requirements, must-haves
- Decision Process: any process steps, timelines, approvals mentioned
- Paper Process: procurement, legal, security review mentions
- Identified Pain: pains articulated, consequences described, urgency signals
- Champion: advocacy signals, internal selling mentions, access offers
- Competition: competitor mentions, comparisons, incumbent references

**Stakeholder Intel:**
- New names mentioned (who are they, what role)
- Sentiment shifts (who got more engaged, who went quiet)
- Power dynamics revealed (who deferred to whom)

**Action Items:**
- Commitments made by {{user.name}} (follow-ups, materials to send, intros to make)
- Commitments made by the prospect (internal reviews, stakeholder intros, timeline confirmations)
- Unresolved questions (topics raised but not answered)

**Objections Raised:**
- What was the objection
- How it was handled (or not)
- Is it resolved or open

**Competitive Mentions:**
- Which competitors were named
- What was said about them
- Any comparison points raised

**Tone and Momentum:**
- Overall sentiment (positive/neutral/negative)
- Energy level compared to previous calls
- Any warning signs (delayed responses, hedging language, new concerns)

### Step 3: Deal State Update
Update the deal memory file with:
- Date header: [Date] -- [Call type] with [attendees]
- {{methodology.framework}} score changes (only factors with new intel)
- New stakeholders discovered
- Action items with owners and dates
- Key quotes worth preserving (verbatim, attributed)
- Next step confirmed on the call

Format: always append at the top of the deal memory, never replace. Preserve the full history below.

### Step 4: Follow-Up Draft
Generate a follow-up email using the sales-email skill patterns:

- If next step was confirmed: use 3-takeaway structure (Framework 2)
  1. Context anchor referencing the call
  2. Three key takeaways from the conversation
  3. Confirmed next step with date
  4. Single CTA

- If no next step confirmed: use seed-plant structure (Framework 1)
  1. Reference the call warmly
  2. Share one piece of value discussed
  3. Propose a specific next step with date

Apply voice profile from voice.yaml before delivering.

### Step 5 (Optional): Coaching Layer
If user requests coaching, score the call against {{methodology.framework}}:

**Call Effectiveness Scorecard:**
| Dimension | Score | Evidence |
|-----------|-------|----------|
| Questions asked vs. statements made | ratio | count |
| Methodology gaps addressed | count / total gaps | which ones |
| New intel captured | count | list |
| Prospect talk time vs. rep talk time | ratio | estimate |
| Next step secured | yes/no | what it is |
| Objections handled vs. deflected | count | list |

**Coaching Notes:**
- What went well (specific moments with evidence)
- What to improve (specific missed opportunities)
- Questions you should have asked but did not
- Moments where the prospect gave a signal that was not explored

### Step 6: Gap-Move Audit
After processing, audit the deal against standard advancement moves:
1. Multi-thread (3+ external stakeholders in last 14 days)
2. Compelling-event-uncover (dated deadline + consequence)
3. Proof-point-drop (reference customer with metrics)
4. Technical-validator (prospect engineer in working session within 30 days)

Flag the weakest with a specific next step.

## Output Format

```
POST-CALL SUMMARY: [Company] | [Call Type] | [Date]
ATTENDEES: [Names + roles]

INTEL EXTRACTED
{{methodology.framework}} updates:
  [Factor] [old -> new score]: [evidence]
  ...

New stakeholders: [names + roles + context]

Action items:
  [Owner]: [action] by [date]
  ...

Key quotes:
  "[quote]" -- [speaker]

Objections: [status: resolved/open]
  [objection]: [how handled]

Competitive mentions: [competitors + context]

DEAL STATE CHANGE
Next step: [what + when + who]
Stage movement: [if any]
Risk change: [if any]

FOLLOW-UP DRAFT
[email draft]
```

## Integration
- Feeds deal-inspector with fresh intel for re-scoring
- Triggers sales-email for follow-up drafting
- Updates deal memory for all downstream skills
- Optional coaching layer invoked with --coach flag
