# Account Research

Research a company and score it against your ICP. Outputs a structured dossier.

## When to Use
- New prospect identified, need to qualify
- User says "research [company]"
- Pre-meeting research for a new account

## Process

### Step 1: Gather Intel
Research the company across available sources:
- Company website (product, pricing, team)
- LinkedIn (headcount, growth, key hires)
- News (funding, acquisitions, launches)
- Job postings (what they're building, tech stack)
- Financial data if public (revenue, growth rate)

### Step 2: ICP Score
Score against `config/company.yaml` ICP definition:

| Factor | Weight | Score |
|---|---|---|
| Segment match | 20% | [0-10] |
| Vertical match | 20% | [0-10] |
| Geo match | 15% | [0-10] |
| ACV potential in range | 15% | [0-10] |
| Growth signals | 15% | [0-10] |
| Tech stack fit | 15% | [0-10] |

**ICP Score: [X]/100**

| Score | Verdict |
|---|---|
| 80+ | Strong fit. Pursue aggressively. |
| 60-79 | Good fit. Worth a sequence. |
| 40-59 | Marginal. Only if inbound or partner-referred. |
| <40 | Poor fit. Pass or deprioritize. |

### Step 3: Identify Entry Points
- Who is the likely champion? (title, LinkedIn profile)
- Who is the likely EB? (CFO, VP, etc.)
- Any warm connections? (mutual contacts, shared companies)
- Any trigger events? (funding, new hire, expansion, mandate)

### Step 4: Build Dossier

## Output Format
```
ACCOUNT RESEARCH: [Company]
DATE: [Today]
ICP SCORE: [X]/100 - [Verdict]

COMPANY SNAPSHOT
- Industry: [X]
- Headcount: [X]
- Revenue: [X] (if known)
- HQ: [Location]
- Funding: [Stage/amount]

KEY PEOPLE
- [Name] ([Title]) - likely [champion/EB/user]

TRIGGER EVENTS
- [Event]: [relevance to {{company.name}}]

RISKS
- [Why this might not work]

RECOMMENDED APPROACH
[How to get in the door]
```

## Never Do
- Never fabricate company data
- Never guess revenue without a source
- Never recommend pursuing a <40 ICP score account without flagging the risk
