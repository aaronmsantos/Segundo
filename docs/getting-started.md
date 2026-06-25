# Getting Started with Segundo

Get from zero to your first deal inspection in 15 minutes.

## Prerequisites

- Node.js 18+
- An Anthropic API key ([get one here](https://console.anthropic.com/))
- Optional: Salesforce, Gong, Gmail, or Slack credentials

## Step 1: Install (2 min)

```bash
git clone https://github.com/your-username/segundo.git
cd segundo
npm install
npx prisma generate
```

## Step 2: Configure Your Company (5 min)

Edit `config/company.yaml`:

```yaml
company:
  name: "Your Company"
  product: "What you sell in one sentence"
  icp:
    segments: [mid-market, enterprise]
    verticals: [saas, fintech]
    geo: [na, emea]
    min_acv: 25000
    max_acv: 500000

methodology:
  framework: meddpicc  # or meddic, bant, custom
  deal_stages:
    - { name: "Prospecting", probability: 5 }
    - { name: "Discovery", probability: 15, gates: [pain, metrics] }
    - { name: "Validating", probability: 35, gates: [champion, economic_buyer] }
    - { name: "Negotiating", probability: 65, gates: [paper_process] }
    - { name: "Closing", probability: 90, gates: [decision_process] }
```

## Step 3: Set Your Identity (2 min)

Edit `config/identity.yaml`:

```yaml
agent:
  name: "Segundo"
  posture: direct

user:
  name: "Your Name"
  role: "Account Executive"
  experience: mid
```

## Step 4: Add API Keys (2 min)

```bash
cp .env.example .env
```

At minimum, add your Anthropic key:
```
ANTHROPIC_API_KEY=sk-ant-...
```

## Step 5: Create Your First Deal (2 min)

Create `memory/deals/deal_acme.md`:

```markdown
## Overview
- **Company**: Acme Corp
- **Stage**: Discovery
- **ACV**: $50,000
- **Close Date**: 2026-09-30

## Stakeholders
- **Champion**: Jane Doe (VP Engineering) - met twice, engaged
- **Economic Buyer**: John Smith (CFO) - identified, not engaged

## Compelling Events
1. Current vendor contract expires Oct 31

## MEDDPICC Scores
- Metrics: Yellow (estimated savings, not confirmed)
- Economic Buyer: Yellow (identified, no direct meeting)
- Decision Criteria: Green (confirmed on call 2)
- Decision Process: Red (unknown)
- Paper Process: Red (not discussed)
- Identified Pain: Green (Jane articulated in own words)
- Champion: Yellow (3 of 4 criteria met, no EB access)
- Competition: Yellow (incumbent identified, position unclear)
```

## Step 6: Run Your First Inspection (2 min)

```bash
npx segundo inspect --deal "Acme"
```

You should see a full MEDDPICC scorecard with risk assessment, control map, and next-best-action.

## What's Next

- **Connect your CRM**: Edit `config/connectors.yaml` and add Salesforce or HubSpot credentials
- **Import call recordings**: Drop transcripts in `data/corpus/` and run `npx segundo mine`
- **Customize your voice**: Complete `templates/voice-profile.md` and update `config/voice.yaml`
- **Add more skills**: See `docs/skills.md` for how to write custom skills
- **Set up the morning brief**: Run `npx segundo brief` daily

## Troubleshooting

**"No config found"**: Make sure you're in the segundo directory and `config/company.yaml` exists.

**"ANTHROPIC_API_KEY not set"**: Add your key to `.env`.

**Import errors**: Run `npm install` and `npx prisma generate`.
