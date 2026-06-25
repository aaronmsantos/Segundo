# Skills Guide

Skills are modular capabilities that Segundo can invoke. Each skill is a self-contained unit with its own instructions, trigger conditions, and output format.

## What Skills Do

A skill tells the AI engine **how** to perform a specific task. The deal-inspector skill knows how to score deals. The morning-brief skill knows how to summarize pipeline status. Skills are where domain expertise lives.

## Directory Structure

Each skill lives in its own directory under `skills/`:

```
skills/
  deal-inspector/
    SKILL.md          # Instructions, process, examples
    plugin.json       # Metadata, triggers, dependencies
  morning-brief/
    SKILL.md
    plugin.json
  my-custom-skill/
    SKILL.md
    plugin.json
```

## SKILL.md Format

The SKILL.md file is the skill's instruction manual. It has two parts: frontmatter and body.

### Frontmatter

```yaml
---
name: deal-inspector
description: Score and inspect deals using the active methodology. Trigger when user mentions a deal name, asks about deal health, or says "inspect" or "score".
---
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Skill identifier (matches directory name) |
| `description` | Yes | What this skill does and when to trigger it |
### Body

The body contains the skill's process, organized as sections:

1. **When to Use** -- Conditions that trigger this skill
2. **Process** -- Step-by-step instructions the AI follows
3. **Output Format** -- Expected structure of the result
4. **Never Do** -- Explicit anti-patterns to avoid
5. **Examples** -- Good and bad output examples for calibration

### Example SKILL.md

```markdown
---
name: post-call
description: Process a call transcript, extract deal intel, update memory, and draft follow-up. Trigger after any call when a transcript is provided.
---

# Post-Call Processor

## When to Use
- User provides a call transcript or recording
- User says "post-call" or "process this call"

## Process

### Step 1: Extract Intel
Read the transcript. Extract:
- New stakeholders mentioned
- Pain points discussed
- Decision criteria revealed
- Next steps agreed
- Objections raised

### Step 2: Update Deal Memory
Append extracted intel to the deal memory file. New dated entry at top of the Activity Log.

### Step 3: Re-Score Methodology
Run a methodology score with the new intel. Note any factors that changed.

### Step 4: Draft Follow-Up
Draft a follow-up email summarizing the call and confirming next steps.

## Output Format
Deal update summary + methodology score delta + draft email.

## Never Do
- Never fabricate intel that wasn't in the transcript
- Never overwrite existing deal memory -- always append

## Examples
[Include a good example and a bad example with explanations]
```
## plugin.json Format

The plugin.json file provides metadata about the skill:

```json
{
  "name": "post-call",
  "version": "1.0.0",
  "description": "Process call transcripts and update deal memory",
  "triggers": [
    "post-call",
    "process this call",
    "transcript",
    "call summary"
  ],
  "dependencies": {
    "skills": ["deal-inspector"],
    "connectors": []
  },
  "config": {
    "auto_draft_followup": {
      "type": "boolean",
      "default": true,
      "description": "Automatically draft a follow-up email after processing"
    }
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Must match directory name and SKILL.md frontmatter |
| `version` | Yes | Semver version |
| `description` | Yes | Short description |
| `triggers` | Yes | Keywords/phrases that activate this skill |
| `dependencies` | No | Other skills or connectors this skill requires |
| `config` | No | Configurable options with types and defaults |

## Trigger System

Segundo decides which skill to invoke based on:

1. **Explicit trigger**: User says a trigger keyword (e.g., "inspect", "post-call")
2. **Context match**: User's intent matches the skill description
3. **Priority**: When multiple skills match, the most specific match wins

Skills with overlapping triggers should have distinct descriptions so the engine can disambiguate.

## Built-In Skills

| Skill | Purpose |
|-------|---------|
| `deal-inspector` | Score deals using the active methodology |
| `morning-brief` | Morning pipeline summary across all deals |
| `fact-checker` | Verify claims against deal memory |
| `enablement-packager` | Package deal intel for team sharing |