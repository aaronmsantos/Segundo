---
name: morning-brief
description: Use on the first user message of a new calendar day. Generates a priority briefing covering yesterday's outcomes, today's calendar, pipeline alerts, overdue items, and open action items. Eliminates the 2-3 minutes of "where were we" at every session start.
---

# Morning Brief

First message of the day triggers this skill. Pre-loads full context so the user walks in at 100%.

---

## Pre-Flight

Check if this is the first message of a new calendar day:
- Compare today's date vs last session's last activity timestamp
- If today > last: this is a new day, invoke the skill
- Else: skip, let normal flow continue

If the user explicitly asks for a briefing ("morning brief", "catch me up", "what did I miss"), invoke regardless of time-of-day check.

---

## Step 1 : Load or Generate the Brief

Check for a pre-generated brief file at `{{config.brief_path}}/brief-YYYY-MM-DD.md`.

- If file exists (scheduled job ran overnight): load and read into working memory.
- If file does not exist (job missed, first-time setup, early start): proceed to Step 2 for live generation.

---

## Step 2 : Gather from Data Sources

Pull from these 6 configurable data sources. Each maps to a `{{config}}` slot so teams can wire their own systems:

### Source 1: Last Session Outcomes
- Location: `{{config.session_log_path}}`
- Extract: Top 1-3 outcomes shipped or decisions made in the previous session
- If no session log exists, note "No prior session data available" and move on

### Source 2: Deal State Changes
- Location: `{{config.crm}}` (CRM API or local deal state cache)
- Extract: Any deal that changed stage, close date, or amount overnight
- Flag deals that moved backward (stage regression = immediate attention)
- Flag deals where close date is now in the past (slipped deals)

### Source 3: Scheduled Task Outputs
- Location: `{{config.scheduled_task_output_path}}`
- Extract: Results from any overnight automated jobs (data syncs, report generation, monitoring alerts)
- Summarize pass/fail status; surface failures prominently

### Source 4: Today's Calendar
- Location: `{{config.calendar}}` (Calendar API)
- Extract: All meetings and calls for today, ordered chronologically
- For each meeting: title, time, attendees, and prep status (see Step 3 below)
- Flag back-to-back meetings with no prep gap

### Source 5: Communication Backlog
- Location: `{{config.email}}`, `{{config.messaging}}` (email and messaging APIs)
- Extract: Unread messages requiring response, grouped by urgency
- Priority: anything from a customer, prospect, or manager surfaces first
- Count only; do not reproduce message content in the brief unless specifically configured

### Source 6: Open Action Items
- Location: `{{config.action_items_path}}` or CRM task list
- Extract: All open items assigned to the user, sorted by due date
- Flag overdue items (due date < today) with days overdue count

---

## Step 3 : Pipeline Health Snapshot

After gathering raw data, synthesize a pipeline health section:

### Deals Requiring Attention Today
- Any deal with a meeting scheduled today (cross-reference Source 2 + Source 4)
- Any deal stalled 7+ days without activity (velocity alert)
- Any deal with close date within 7 days and incomplete next steps
- Any deal where a key stakeholder has gone silent (no activity 14+ days)

### Meeting Prep Status
For each meeting on today's calendar:
- Check if a pre-call brief exists at `{{config.briefing_path}}/`
- If brief exists: mark "PREPPED" with brief date
- If no brief: mark "NEEDS PREP" and flag the meeting time so the user knows the deadline
- If meeting is in < 60 minutes and no brief exists: mark "URGENT - NO PREP"

### Velocity Alerts
Scan all active deals for:
- Stage duration exceeding `{{config.stage_duration_threshold_days}}` (default: 14 days)
- No CRM activity logged in `{{config.inactivity_threshold_days}}` (default: 7 days)
- Close date pushed more than twice (pattern of slipping)
- Champion or Economic Buyer contact not engaged in 21+ days

### Overdue Action Items
Pull from Source 6 and highlight:
- Items overdue by 1-3 days: standard flag
- Items overdue by 4-7 days: elevated flag
- Items overdue by 7+ days: critical flag with recommendation to close, delegate, or reschedule

---

## Step 4 : Format and Deliver

### 3-Line Summary (always lead with this)

```
GOOD MORNING. Yesterday: {top 1 outcome shipped or decision made}.
Today: {next calendar event + time} -- {prep status}. {count} deals need attention.
{one-line momentum assessment or key risk to watch}.
```

### Full Brief Structure (render below the summary)

```
## Pipeline Alerts
- [STALLED] {Deal Name} -- {days} days no activity, stage: {current stage}
- [SLIPPED] {Deal Name} -- close date was {old date}, now past due
- [VELOCITY] {Deal Name} -- in stage {X} for {N} days (threshold: {T})
- [SILENT] {Deal Name} -- {contact name} ({role}) last engaged {date}

## Today's Calendar
- {time} | {meeting title} | {attendees} | {PREPPED / NEEDS PREP / URGENT}
- {time} | {meeting title} | {attendees} | {PREPPED / NEEDS PREP / URGENT}

## Overdue Items ({count})
- [{days} overdue] {item description} -- assigned {date}
- [{days} overdue] {item description} -- assigned {date}

## Open Action Items ({count})
- {item} -- due {date}
- {item} -- due {date}

## Overnight Updates
- {Source 3 summaries: job name + pass/fail}
- {Source 5: unread count by channel/sender priority}
```

---

## Step 5 : Log the Resume

Append to `{{config.log_path}}/morning-brief.log`:
- Timestamp (ISO 8601)
- Whether brief was loaded from file or regenerated live
- Data sources successfully reached (list which of the 6 responded)
- User's first message topic (one word tag)
- Pipeline alert count

---

## Configuration Slots

| Slot | Description | Example |
|------|-------------|---------|
| `{{config.brief_path}}` | Directory for pre-generated briefs | `data/state/morning-briefs/` |
| `{{config.session_log_path}}` | Previous session outcomes | `data/state/session.log` |
| `{{config.crm}}` | CRM connection (API or local cache) | Salesforce, HubSpot, Pipedrive |
| `{{config.calendar}}` | Calendar API | Google Calendar, Outlook |
| `{{config.email}}` | Email integration | Gmail, Outlook |
| `{{config.messaging}}` | Team messaging | Slack, Teams |
| `{{config.action_items_path}}` | Task/action item store | `data/state/actions.json` |
| `{{config.briefing_path}}` | Pre-call brief storage | `data/briefings/` |
| `{{config.log_path}}` | Logging directory | `data/state/` |
| `{{config.scheduled_task_output_path}}` | Overnight job results | `data/state/cron-output/` |
| `{{config.stage_duration_threshold_days}}` | Days before stage duration alert fires | `14` |
| `{{config.inactivity_threshold_days}}` | Days before inactivity alert fires | `7` |

---

## Never-Do List

- Never hallucinate events, statistics, or entity names in the brief
- Never reference data from a source that failed to load -- note the failure instead
- Never skip the skill on a new day to save a tool call -- the ramp-up cost is always higher
- Never include items older than 24 hours in the "yesterday" section
- Never fabricate calendar events or meeting attendees
- Never assume a deal's current state without checking the CRM -- stale cache is worse than no data
- Never surface confidential compensation, HR, or personal calendar items in team-visible briefs
- Never greet with a brief that contains stale pipeline data older than the overnight refresh window

---

## Integration

- Can be triggered by a scheduled job (cron, cloud scheduler) to pre-generate the brief before the user's first session
- Pairs with an evening debrief or insights skill for full daily bookending
- Upstream of any first-message-of-day skill invocations -- this loads context before other skills fire
- The pre-call brief check (Step 3) works with any call-prep or briefing skill in the system
- Pipeline alerts feed into deal coaching and next-move recommendation skills
