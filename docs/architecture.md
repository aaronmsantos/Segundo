# Architecture

Segundo is an AI-powered sales methodology engine. It scores deals, surfaces risks, recommends actions, and learns from outcomes. This document covers how the pieces fit together.

## System Overview

```
+------------------+     +------------------+     +------------------+
|   Connectors     |---->|     Engine        |---->|     Skills       |
| (CRM, Gong, etc) |     | (Score, Analyze)  |     | (Inspect, Brief) |
+------------------+     +------------------+     +------------------+
                                |
                          +-----+-----+
                          |           |
                    +-----v---+ +----v------+
                    |  Memory  | |  Learning  |
                    | (MD+SQL) | |   Loop     |
                    +----------+ +-----------+
```

## Architecture Layers

### 1. Engine
The scoring and analysis core. Given a deal's current state and a methodology definition, the engine:
- Evaluates each factor against evidence in memory
- Assigns green/yellow/red scores with diagnosis codes
- Calculates the aggregate score and forecast category
- Identifies the fatal flaw and blind spots
- Recommends the single best next action
- Surfaces applicable gap moves

The engine is methodology-agnostic. It reads whatever methodology JSON is active and scores against those factors.

### 2. Memory
Deal state persistence using a dual-store approach:

**Markdown files** (`memory/deals/deal_*.md`):
- Human-readable, git-friendly, editable in any text editor
- Source of truth for deal narrative and history
- Activity log is append-only (newest at top)
- Survives system changes -- it's just text
**SQLite database** (via Prisma ORM):
- Queryable: "show me all deals where champion is red"
- Supports aggregation, filtering, and cross-deal analysis
- Schema defined in `prisma/schema.prisma`
- Lives at `data/state/memory.db` (gitignored)

The dual-store design means you get the best of both: human readability and machine queryability. When they conflict, the markdown file wins.

### 3. Skills
Pluggable capabilities that define how to perform specific tasks. Each skill has its own instructions, trigger conditions, and output format. Skills are invoked by the engine based on user intent.

See [Skills Guide](./skills.md) for details.

### 4. Connectors
Bridges to external systems (CRM, call recording, email). Handle authentication, data sync, and writeback.

See [Connectors Guide](./connectors.md) for details.

### 5. Learning Loop
Pattern extraction from closed deals:

- **Win analysis**: When a deal closes won, extract what worked -- which methodology factors were green earliest, what moves accelerated the deal, what the champion did.
- **Loss analysis**: When a deal closes lost, extract what failed -- which factors were red at death, what signals were missed, what the fatal flaw was.
- **Pattern library**: Accumulated win/loss patterns become templates, battle cards, and gap move refinements.
- **Feedback loop**: As patterns accumulate, the methodology's gap moves and level descriptions become more specific to your sales motion.