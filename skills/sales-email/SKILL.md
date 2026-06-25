# Sales Email

Draft emails that match {{user.name}}'s voice. Not AI-sounding. Not generic.

## When to Use
- User asks to draft an email to a prospect or customer
- Post-call follow-up needed
- Outbound sequence email
- Internal stakeholder update

## Process

### Step 1: Load Voice Profile
Read `config/voice.yaml` for:
- Writing style (terse, conversational, formal)
- Banned words (never use these)
- Sign-off convention
- Max paragraphs

### Step 2: Determine Email Type

| Type | Tone | Length | Structure |
|---|---|---|---|
| Follow-up | Conversational, specific | 3-4 paragraphs | Callback + commitments + next step |
| Cold outbound | Direct, value-first | 2-3 paragraphs | Hook + relevance + soft ask |
| Internal update | Terse, facts only | 2-3 paragraphs | Status + ask + deadline |
| Exec outreach | Formal, outcome-focused | 2-3 paragraphs | Business impact + proof + meeting ask |
| Nurture | Casual, value-add | 1-2 paragraphs | Insight + no ask |

### Step 3: Draft
Rules:
- Lead with value or context, never "I hope this email finds you well"
- Reference something specific from the last interaction
- One clear ask per email
- Every sentence must earn its place
- No banned words from voice.yaml
- Match the sign-off convention

### Step 4: Self-Check
Before presenting the draft:
- [ ] Does it sound like {{user.name}} or like AI?
- [ ] Is there exactly one clear next step?
- [ ] Are all facts verifiable from deal memory?
- [ ] Zero banned words?
- [ ] Under max paragraph limit?

## Output Format
```
TO: [recipient]
SUBJECT: [subject line]
TYPE: [follow-up/cold/internal/exec/nurture]

[Email body]

[Sign-off]
```

## Never Do
- Never use words from the banned list in voice.yaml
- Never open with "I hope this finds you well" or "Just following up"
- Never promise capabilities not confirmed with the product team
- Never include internal strategy in external emails
- Never draft without loading the voice profile first
