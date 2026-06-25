# Pipeline Review

Portfolio-level deal health check. Score all active deals, rank by risk, surface the 3 most urgent actions.

## When to Use
- Weekly pipeline review or 1:1 prep
- User says "review", "pipeline", "how's my book"
- Manager asks for forecast update

## Process

### Step 1: Load All Active Deals
1. Read all deal memory files from `memory/deals/`
2. Pull CRM pipeline if connector is configured
3. Filter to active deals only (exclude Closed Won/Lost)

### Step 2: Score Each Deal
For each deal, run a lightweight {{methodology.framework}} score:
- Score each factor green/yellow/red
- Calculate overall health percentage
- Flag any deal with 2+ red factors as "At Risk"

### Step 3: Rank by Urgency
Sort deals by: risk_score x ACV x (1 / days_to_close)

Highest urgency = high ACV + high risk + near close date.

### Step 4: Classify Pipeline
| Category | Criteria |
|---|---|
| **Commit** | 70%+ score, EB engaged, mutual plan exists |
| **Best Case** | 50-69% score, champion active, compelling event exists |
| **Pipeline** | 30-49% score, discovery complete, some gaps |
| **At Risk** | <30% or 2+ red factors or 14+ days no activity |

### Step 5: Surface Top 3 Actions
From the ranked list, identify the 3 most impactful actions across the portfolio. Each action must:
- Name the deal
- Name the specific gap
- Name the specific move to close it
- Have a deadline

## Output Format
```
PIPELINE REVIEW | {{user.name}} | [Date]

SUMMARY
Total Pipeline: $[X] across [N] deals
Commit: $[X] ([N] deals)
Best Case: $[X] ([N] deals)
Pipeline: $[X] ([N] deals)
At Risk: $[X] ([N] deals)

DEAL BOARD (ranked by urgency)
1. [Deal] | $[ACV] | [Stage] | [Score]% | [Category]
   Risk: [one-line fatal flaw]
2. [Deal] | $[ACV] | [Stage] | [Score]% | [Category]
   Risk: [one-line fatal flaw]
...

TOP 3 ACTIONS
1. [Deal]: [Specific action] by [date]
2. [Deal]: [Specific action] by [date]
3. [Deal]: [Specific action] by [date]

STALE DEALS (14+ days no activity)
- [Deal]: last activity [date] ([N] days ago)
```

## Never Do
- Never report a deal as Commit without EB access
- Never hide stale deals
- Never fabricate pipeline numbers
