# Methodology Guide

Segundo uses pluggable sales methodologies to score deals. MEDDPICC is the default, but you can switch to MEDDIC, BANT, or build your own.

## Choosing a Methodology

| Methodology | Factors | Best For |
|---|---|---|
| **MEDDPICC** | 8 | Enterprise sales, complex buying processes, $50K+ ACV |
| **MEDDIC** | 6 | Mid-market, shorter cycles, less procurement complexity |
| **BANT** | 4 | SMB, transactional sales, quick qualification |
| **Custom** | Any | Your own framework |

## Switching Methodologies

Edit `config/company.yaml`:

```yaml
methodology:
  framework: meddic  # changed from meddpicc
```

All skills automatically adapt. `{{methodology.framework}}` slots update throughout.

## How Methodologies Work

Each methodology is a directory under `methodologies/`:

```
methodologies/meddpicc/
  methodology.json    # Factor definitions, scoring, thresholds
  gap-moves.json      # Recommended actions per factor per score
  README.md           # Documentation for users
```

### methodology.json

Defines factors, weights, scoring levels, and thresholds:

```json
{
  "id": "meddpicc",
  "name": "MEDDPICC",
  "factors": [
    {
      "id": "metrics",
      "name": "Metrics",
      "description": "Is the business impact quantified?",
      "weight": 1,
      "levels": {
        "green": "Prospect confirmed specific numbers",
        "yellow": "We estimated but prospect hasn't validated",
        "red": "No quantification exists"
      }
    }
  ],
  "scoring": {
    "points": { "green": 10, "yellow": 5, "red": 0 },
    "max_score": 80,
    "thresholds": {
      "commit": { "min": 70 },
      "best_case": { "min": 50 },
      "pipeline": { "min": 30 },
      "at_risk": { "min": 0 }
    }
  }
}
```

### gap-moves.json

Maps weak scores to specific actions:

```json
{
  "metrics": {
    "red": {
      "move": "Ask the champion to quantify the current cost of the problem",
      "question": "What does this problem cost your team in hours/dollars per month?"
    },
    "yellow": {
      "move": "Get the prospect to validate your estimates on a call",
      "question": "We estimated $X impact. Does that match what you're seeing?"
    }
  }
}
```

## Building a Custom Methodology

1. Create `methodologies/custom/methodology.json` with your factors
2. Define scoring criteria for each factor (green/yellow/red)
3. Set thresholds for forecast categories
4. Optionally add `gap-moves.json` for coaching recommendations
5. Update `config/company.yaml` to `framework: custom`

### Example: SPICED Framework

```json
{
  "id": "spiced",
  "name": "SPICED",
  "factors": [
    { "id": "situation", "name": "Situation", "description": "Current state understood?" },
    { "id": "pain", "name": "Pain", "description": "Pain identified and quantified?" },
    { "id": "impact", "name": "Impact", "description": "Business impact of pain established?" },
    { "id": "critical_event", "name": "Critical Event", "description": "Time-bound trigger exists?" },
    { "id": "decision", "name": "Decision", "description": "Process and criteria mapped?" }
  ]
}
```

3. Optionally create `methodologies/my-methodology/gap-moves.json` with recommended actions for yellow/red scores on each factor.

4. Activate it:
   ```yaml
   methodology:
     active: my-methodology
   ```

## Methodology JSON Schema Reference

### Root Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier, matches directory name |
| `name` | string | Yes | Display name |
| `version` | string | Yes | Semver version |
| `description` | string | Yes | One-line description |
| `factors` | array | Yes | Array of factor objects |
| `scoring` | object | Yes | Scoring configuration |

### Factor Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique factor identifier (snake_case) |
| `name` | string | Yes | Display name |
| `description` | string | Yes | The question this factor answers |
| `weight` | number | Yes | Score multiplier (default: 1) |
| `levels` | object | Yes | Green/yellow/red level definitions |

### Levels Object

| Field | Type | Description |
|-------|------|-------------|
| `green` | string | What confirmed looks like |
| `yellow` | string | What partially known looks like |
| `red` | string | What unknown or at-risk looks like |

### Scoring Object

| Field | Type | Description |
|-------|------|-------------|
| `points` | object | `{ green: number, yellow: number, red: number }` |
| `max_score` | number | Maximum possible score |
| `thresholds` | object | Forecast category thresholds |

## Gap Moves

Gap moves are optional but recommended. They're defined in a separate `gap-moves.json` file alongside the methodology.

### Structure
```json
{
  "id": "methodology-gap-moves",
  "methodology": "methodology-id",
  "moves": {
    "factor_id": {
      "yellow": {
        "diagnosis": "Why this factor is yellow",
        "moves": ["Action 1", "Action 2"],
        "anti_patterns": ["What NOT to do"]
      },
      "red": {
        "diagnosis": "Why this factor is red",
        "moves": ["Action 1", "Action 2"],
        "anti_patterns": ["What NOT to do"]
      }
    }
  }
}
```

### Writing Good Gap Moves

- **Moves should be specific actions**, not vague advice. "Follow up" is bad. "Ask the champion to schedule a 20-minute intro with the EB, framed around business outcomes" is good.
- **Include anti-patterns** -- common mistakes that feel productive but don't close gaps.
- **Each move should close exactly one gap**. If it doesn't advance the factor toward green, it doesn't belong.