---
name: fact-checker
description: Use before any ship of human-facing artifacts (markdown, HTML, PDF, email drafts, messaging drafts) that contain named people, dates with day-of-week, statistics, quotes, product claims, or customer references. Auto-invokes before any artifact goes to a customer, prospect, partner, or internal stakeholder. Catches 5 correction categories that destroy credibility when missed.
---

# Fact-Checker

Run BEFORE any human-facing artifact ships. One wrong name or fabricated stat can undo months of relationship building. This skill exists because AI-generated content confidently produces plausible-sounding falsehoods that pass casual review.

---

## Pre-Flight

Before reading the artifact: identify what is being shipped. Only invoke on human-facing artifacts:
- Emails (outbound to customers, prospects, partners)
- Messaging drafts (Slack, Teams, LinkedIn DMs)
- PDFs and slide decks
- Markdown reports and summaries
- HTML dashboards or pages
- Proposals, SOWs, and contract summaries
- Internal reports that reference external entities

Do NOT invoke on:
- Code changes and commit messages
- Pure tool outputs and logs
- Internal scratch notes not leaving the system
- Configuration files

---

## Step 1 : Extract All Verifiable Claims

Scan the artifact and extract every instance of:

### 1a. Named People
- Full names, first names, titles, roles
- Extract: the name as written, the context it appears in, and any title/role attached

### 1b. Dates and Time References
- Explicit dates (June 15, 2026; 06/15/26; next Tuesday)
- Day-of-week + date combinations (verify the day matches the date)
- Relative time references ("last quarter", "3 months ago") -- compute the actual date range

### 1c. Numbers and Statistics
- Revenue figures, percentages, growth rates
- Customer counts, user counts, transaction volumes
- ROI claims, cost savings, time savings
- Pricing figures, contract values, discount percentages

### 1d. Quotes and Attributions
- Direct quotes (anything in quotation marks attributed to a person)
- Paraphrased statements ("According to [person]...")
- Testimonials or customer voice references

### 1e. Product and Feature Claims
- Product names, feature names, capability statements
- Integration claims ("works with X", "connects to Y")
- Roadmap references ("coming in Q3", "planned for next release")

### 1f. Entity References
- Company names (customers, prospects, partners, competitors)
- Product names (yours and others)
- Industry terms, regulatory references, standard names

---

## Step 2 : Cross-Reference Against Source Data

For each extracted claim, verify against the appropriate source:

### Names
- Cross-reference against `{{config.crm}}` contact records
- Check spelling, title accuracy, and current role (people change jobs)
- Verify the person is associated with the correct company
- Flag any name that does not appear in any source system

### Dates
- Verify day-of-week matches the calendar date (compute programmatically -- do not guess)
- Cross-reference event dates against `{{config.calendar}}` and deal timeline
- Verify "last quarter" / "this year" references against actual date math
- Flag future dates that have already passed

### Numbers and Statistics
- Cross-reference deal values against `{{config.crm}}` opportunity records
- Verify percentage claims by checking the underlying math (X/Y = Z%)
- Check customer counts against `{{config.crm}}` account records
- For industry statistics: require a named source (report name, publication, URL)
- Flag any number that cannot be traced to a specific source

### Product Features
- Cross-reference against `{{config.product_catalog}}` or product documentation
- Verify integration claims against actual supported integrations list
- Flag roadmap items presented as current capabilities
- Flag deprecated features presented as available

### Customer References
- Cross-reference against `{{config.approved_references}}` (approved reference list)
- Verify the customer has given permission to be named
- Check that any quoted outcome (revenue increase, time saved) matches the approved case study
- Flag customers under NDA or with restricted reference rights

### Entity References
- Verify company names are spelled correctly and current (companies rebrand, merge, get acquired)
- Verify competitor product names are accurate and current
- Flag any company or product that cannot be verified as existing

---

## Step 3 : Classify Issues by Severity

Each issue gets one severity level:

### HIGH -- Factually Wrong
Will damage credibility if shipped. Requires fix before proceeding.
- Wrong person name or title
- Date that does not match the day of week
- Statistic that contradicts source data
- Product feature that does not exist
- Customer reference without permission
- Company name that is misspelled or refers to the wrong entity

### MEDIUM -- Unverifiable
Cannot be confirmed from available sources. Should be sourced, reworded, or removed.
- Statistic with no traceable source
- Quote that cannot be attributed to a specific conversation or document
- Product claim that may be accurate but is not in the catalog
- Customer outcome that is not in an approved case study

### LOW -- Stylistic / Formatting
Not factually wrong but could cause confusion or look unprofessional.
- Inconsistent date formats within the document
- Name spelled differently in two places
- Title that is slightly outdated but person is in the same role
- Rounding differences in statistics

---

## Step 4 : Generate Fix Suggestions

For each issue, provide:

```
ISSUE #{n}
Severity: {HIGH | MEDIUM | LOW}
Category: {name | date | statistic | quote | product | entity}
Location: {line number or section reference in the artifact}
Found: "{exact text as it appears in the artifact}"
Problem: {what is wrong and why}
Suggested Fix: "{corrected text}"
Source: {where the correct information was verified}
```

---

## Step 5 : Verdict and User Confirmation

### If no issues found:
```
FACT-CHECK: CLEAN
All {N} verifiable claims checked against source data. No issues found.
Artifact is clear to ship.
```

### If issues found:
```
FACT-CHECK: {count} ISSUE(S) FOUND
HIGH: {count} (must fix before shipping)
MEDIUM: {count} (recommend fixing or removing)
LOW: {count} (optional fixes)

{Issue details from Step 4}

Action required: Confirm fixes or override before proceeding.
```

### Blocking Rule
- If any HIGH severity issues exist: the artifact MUST NOT ship until the user confirms fixes or explicitly overrides with a reason
- MEDIUM issues: recommend fixing but do not block
- LOW issues: note and move on

---

## Step 6 : Log the Check

Append to `{{config.log_path}}/fact-check-audit.log`:
- Timestamp (ISO 8601)
- Artifact identifier (path, subject line, or description)
- Total claims checked
- Issues found by severity (HIGH/MEDIUM/LOW counts)
- User action taken (fixed / overridden / blocked)
- Time to complete check

---

## Configuration Slots

| Slot | Description | Example |
|------|-------------|---------|
| `{{config.crm}}` | CRM for contact and deal verification | Salesforce, HubSpot |
| `{{config.calendar}}` | Calendar for date verification | Google Calendar, Outlook |
| `{{config.product_catalog}}` | Product feature and capability source | Docs site, internal wiki |
| `{{config.approved_references}}` | Approved customer reference list | Reference spreadsheet, CRM field |
| `{{config.log_path}}` | Logging directory | `data/state/` |

---

## Never-Do List

- Never ship an artifact that has unresolved HIGH severity issues
- Never bypass the check to save time -- the cost of a wrong name in a CEO email is catastrophic
- Never claim a statistic is sourced when the source cannot be named
- Never assume an unattributed quote is "obviously" from someone -- verify or remove
- Never mark an issue as LOW to avoid blocking a ship -- severity must reflect actual risk
- Never auto-fix issues without showing the user what changed -- confirmation is mandatory
- Never skip the check on "small" artifacts -- a 2-line Slack message can contain a wrong name just as easily as a 20-page proposal

---

## Integration

- Pairs with any pre-ship or review checklist skill (code-level pre-ship is complementary, not a substitute)
- Should run before any artifact delivery skill (email send, message post, file share)
- Upstream of any partner or executive communication drafting -- where credibility stakes are highest
- Can be invoked standalone: "fact-check this" with an artifact path or pasted content
