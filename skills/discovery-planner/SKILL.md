# Discovery Planner

Build a targeted discovery question set based on what you already know and what you need to learn.

## When to Use
- Preparing for a first or second call with a prospect
- User says "discovery", "what should I ask"
- Deal has red/yellow {{methodology.framework}} factors that discovery can address

## Process

### Step 1: Assess Current Knowledge
1. Load deal memory if it exists
2. Identify what's already known (green factors)
3. Identify gaps (red/yellow factors)
4. Prioritize: which gaps are blocking stage advancement?

### Step 2: Build Question Set
For each gap, generate 2-3 questions in this hierarchy:

**Current State Questions** (understand their world)
- "Walk me through how [process] works today"
- "How many [units] are you processing per [period]?"
- "Who owns [function] on your team?"

**Pain Questions** (find the hurt)
- "What happens when [current process] breaks down?"
- "How much time does your team spend on [manual task]?"
- "What's the cost when [risk scenario] occurs?"

**Impact Questions** (quantify the consequences)
- "If you could eliminate [pain], what would that free up?"
- "What's the dollar impact of [problem] over the last 12 months?"
- "Who else in the org feels this?"

**Future State Questions** (plant the vision)
- "If you had [capability], how would that change [process]?"
- "What would success look like 12 months from now?"
- "What would need to be true for you to move forward?"

### Step 3: Sequence the Questions
Order matters:
1. Start with current state (non-threatening, builds rapport)
2. Move to pain (they feel heard)
3. Escalate to impact (they feel urgency)
4. Close with future state (they see the path)

### Step 4: Add Traps
"Trap" questions that naturally lead to {{company.name}}'s strengths:
- Questions about scale that expose current tool limitations
- Questions about growth plans that create future urgency
- Questions about compliance/risk that highlight consequences of inaction

## Output Format
```
DISCOVERY PLAN: [Company] | [Call #]

KNOWN (skip these topics):
- [Already confirmed facts]

GAPS TO CLOSE:
1. [Methodology factor]: [specific question]
2. [Methodology factor]: [specific question]

QUESTION SEQUENCE (20 min):
Opening: [rapport question]
1. [Current state question] -> listen for [signal]
2. [Pain question] -> listen for [signal]
3. [Impact question] -> listen for [signal]
4. [Future state question] -> listen for [signal]
Closing: [next step question]

TRAPS:
- "[Question that leads to our strength]"
```

## Never Do
- Never ask questions you already know the answer to (waste of time)
- Never list more than 8 questions (you won't get through them all)
- Never include leading questions that name {{company.name}} features
