# Corpus Miner

Extract patterns from call recordings. What moves win deals, what objections are fatal, where reps leak pipeline.

## When to Use
- Periodic corpus refresh (monthly or quarterly)
- User says "mine the corpus", "what patterns", "win/loss analysis"
- After a batch of new recordings are ingested

## Process

### Step 1: Scope the Mining
Determine what to mine:
- **Full refresh**: All recordings in `data/corpus/`
- **Delta refresh**: Only new recordings since last mining run
- **Targeted query**: Specific pattern (e.g., "all calls where pricing was discussed")

### Step 2: Extract Patterns
For each recording/transcript, extract:

**Win Patterns** (from won deals)
- What moves appeared in won cycles?
- At what stage did each move happen?
- What was the sequence?

**Loss Patterns** (from lost deals)
- What was missing in lost cycles?
- What objections appeared?
- Where did deals stall?

**Objection Library**
- What objections surface most frequently?
- Win rate per objection type
- Best responses (from calls where objection was overcome)

**Competitor Intel**
- Which competitors are mentioned?
- In what context?
- How are they positioned by the prospect?

### Step 3: Aggregate and Rank
Rank patterns by:
- Frequency (how often does this appear?)
- Impact (does this correlate with winning or losing?)
- Actionability (can a rep do something about this?)

### Step 4: Generate Playbook Updates
From the top patterns, generate:
- Updated win-move checklist
- Updated objection handling guide
- Updated competitor positioning
- Calibrated scoring thresholds

## Output Format
```
CORPUS MINING REPORT | [Date]
SCOPE: [full/delta/targeted] | [N] recordings analyzed

WIN PATTERNS (top 5)
1. [Pattern]: [frequency]% of won deals | [description]
2. ...

LOSS PATTERNS (top 5)
1. [Pattern]: [frequency]% of lost deals | [description]
2. ...

OBJECTION WIN RATES
| Objection | Win Rate | Volume |
|---|---|---|
| [Type] | [X]% | [N] |

COMPETITOR MENTIONS
| Competitor | Frequency | Context |
|---|---|---|
| [Name] | [N] calls | [Summary] |

RECOMMENDED PLAYBOOK UPDATES
1. [Specific update]
2. [Specific update]
```

## Never Do
- Never extrapolate from <5 data points
- Never attribute a pattern without citing the source calls
- Never share individual rep performance data in team-visible outputs
