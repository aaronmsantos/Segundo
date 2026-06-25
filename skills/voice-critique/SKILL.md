# Voice Critique

Check if a draft email or DM matches {{user.name}}'s voice profile. Catch AI-sounding text before it ships.

## When to Use
- User asks "does this sound like me?"
- Before sending any AI-drafted email
- Quality check on outbound sequences

## Process

### Step 1: Load Voice Profile
Read `config/voice.yaml` for:
- Style preference (terse, conversational, formal)
- Banned words list
- Sign-off convention
- Max paragraph count

### Step 2: Analyze the Draft
Check against these dimensions:

**Authenticity** (0-10): Does this sound like a human wrote it?
- Red flags: "I hope this finds you well", "I wanted to reach out", "leverage", "synergy"
- Green flags: Specific references, natural rhythm, personality

**Brevity** (0-10): Is every sentence earning its place?
- Count paragraphs vs max
- Flag filler sentences
- Flag redundant points

**Clarity** (0-10): Is the ask obvious in 5 seconds?
- One clear CTA?
- Buried asks?
- Vague next steps?

**Voice Match** (0-10): Does it match the configured style?
- Check against banned words
- Check tone against style setting
- Check sign-off

### Step 3: Rewrite Suggestions
For each issue found, provide:
- The problematic text
- Why it fails
- A rewritten alternative

## Output Format
```
VOICE CRITIQUE

Authenticity: [X]/10
Brevity: [X]/10
Clarity: [X]/10
Voice Match: [X]/10
OVERALL: [X]/40

ISSUES:
1. [Line]: "[problematic text]"
   Problem: [why]
   Fix: "[rewritten]"

BANNED WORDS FOUND: [list or "none"]

VERDICT: [Ship / Revise / Rewrite]
```

## Never Do
- Never approve a draft with banned words present
- Never critique without offering a fix
- Never add formality unless voice.yaml says formal
