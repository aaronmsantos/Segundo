# Segundo

**Open-source sales AI operating system.**
Learns your methodology. Remembers your deals. Gets smarter every quarter.

```
npx segundo init
```

---

## What It Does

Segundo is a portable sales AI that plugs into any company's stack. It learns your sales methodology, remembers your deals, studies your call recordings, and tells you what to do next.

**Not a chatbot.** An operating system for closing deals.

### Core Capabilities

| Capability | What It Does |
|---|---|
| **Deal Intelligence** | MEDDPICC scoring, risk detection, next-best-action per deal |
| **Pre-Call Briefs** | Auto-generated prep combining CRM data, past calls, and competitive intel |
| **Post-Call Processing** | Transcribe, extract intel, update deal memory, draft follow-up |
| **Pipeline Review** | Portfolio-level health check, ranked by risk x ACV |
| **Corpus Mining** | Pattern extraction from call recordings. What wins, what loses, why. |
| **Voice-Calibrated Drafts** | Emails and DMs that sound like you, not like AI |
| **Morning Briefing** | Daily priorities + stale follow-ups + deal actions due today |

### Architecture

```
config/           YAML configuration (company, identity, voice, connectors)
engine/           Core runtime (AI service, event bus, model router, DI container)
skills/           Prompt-as-code plugins (SKILL.md + plugin.json per skill)
methodologies/    Pluggable deal qualification (MEDDPICC, MEDDIC, BANT, custom)
memory/           Deal memory + pattern memory + references
templates/        Starter templates (deal memory, battle cards, win formula)
data/             Corpus, competitive intel, working state
```

## Quick Start

### 1. Install

```bash
git clone https://github.com/your-username/segundo.git
cd segundo
npm install
```

### 2. Configure

```bash
npx segundo init
# or edit config/company.yaml directly
```

Set your company name, ICP, methodology, and sales stages:

```yaml
# config/company.yaml
company:
  name: "Acme Corp"
  product: "Revenue optimization platform"
methodology:
  framework: meddpicc  # or meddic, bant, sandler, custom
```

### 3. Connect Your Stack

Add credentials to `.env` (copy from `.env.example`):

```bash
cp .env.example .env
# Add your Salesforce, Gong, Slack, and Anthropic API keys
```

### 4. Run

```bash
npx segundo brief                        # Morning briefing
npx segundo inspect --deal "Acme Corp"   # Deal health check
npx segundo review                       # Full pipeline review
npx segundo prep --deal "Acme Corp"      # Pre-call brief
```

## Methodology Framework

Segundo ships with **MEDDPICC** as the default methodology, plus stubs for MEDDIC, BANT, and custom frameworks.

Each methodology defines:
- **Factors** with scoring criteria (green/yellow/red)
- **Gap moves** - recommended actions when a factor is weak
- **Stage gates** - which factors must be green before advancing

Switch methodologies in one line:

```yaml
methodology:
  framework: bant  # swap from meddpicc to bant
```

Or build your own in `methodologies/custom/`.

## Skills

Skills are prompt-as-code plugins. Each skill is a markdown file (`SKILL.md`) with `{{config}}` template slots that get filled from your YAML configuration.

### Included Skills (15)

| Skill | Purpose |
|---|---|
| `deal-inspector` | MEDDPICC deal health audit with control mapping |
| `champion-audit` | 6-test champion validation framework |
| `pre-call-brief` | Intelligence brief from CRM + calls + competitive intel |
| `post-call` | 4-stage post-call chain (transcribe, extract, update, follow-up) |
| `discovery-planner` | Discovery call question framework |
| `commercial-closer` | Agreement principles + pricing strategy |
| `sales-email` | Voice-calibrated email drafting |
| `pipeline-review` | Portfolio-level deal review ranked by risk |
| `account-research` | Company research + ICP scoring |
| `corpus-miner` | Call recording pattern extraction |
| `voice-critique` | Email/DM quality check against your voice profile |
| `propose-next-move` | Single best action for any deal |
| `morning-brief` | Daily briefing with priorities |
| `fact-checker` | Verify claims against source data |
| `enablement-packager` | New rep onboarding bundle |

### Writing Custom Skills

```
skills/my-skill/
  plugin.json     # Metadata + dependencies
  SKILL.md        # Prompt template with {{slots}}
```

See [docs/skills.md](docs/skills.md) for the full guide.

## Memory Architecture

Segundo maintains two types of memory:

- **Deal Memory** - per-deal intelligence that travels with the rep. Stakeholders, scores, call history, next actions. Stored in `memory/deals/`.
- **Pattern Memory** - company-scoped insights that stay when reps leave. Win/loss patterns, objection win rates, competitive positioning. Stored in `memory/patterns/`.

When you leave a company, export your deal memory. Pattern memory stays behind for the next person.

## Learning Loop

```
Corpus Ingest -> Win/Loss Analysis -> Score Calibration -> Methodology Refinement
     ^                                                          |
     +-------------- New Call Recordings <----------------------+
```

Feed Segundo your call recordings. It extracts patterns: what moves win deals, what objections are fatal, where reps leak pipeline. Over time, it calibrates scoring thresholds and surfaces company-specific playbook moves.

## Configuration Reference

| File | Purpose |
|---|---|
| `config/company.yaml` | Company profile, ICP, methodology, deal stages, forecasting rules |
| `config/identity.yaml` | Agent personality, user profile, experience level |
| `config/voice.yaml` | Email/DM writing style, banned words, sign-off conventions |
| `config/connectors.yaml` | CRM, call recording, email, and chat API credentials |

## Tech Stack

- **Runtime**: Node.js 18+ / TypeScript / ESM
- **AI**: Anthropic Claude (with ModelRouter for cost optimization)
- **Database**: Prisma + SQLite (portable, no server required)
- **Architecture**: Event-driven pub/sub, dependency injection (TSyringe)

## License

MIT

## Author

Built by [Aaron Santos](https://github.com/aaronsantos-ai) - a sales professional who builds his own tools.
