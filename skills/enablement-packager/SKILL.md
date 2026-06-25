---
name: enablement-packager
description: Use when the user says "package this", "send this to the team", "zip it up", "create a guide for", "distribute this", "enablement session" prep, or any variant of packaging AI agents, tools, or sales playbooks for non-technical teammates. Also invoke when preparing for a team rollout, training session, or distributing battle cards and methodology guides.
---

# Enablement Packager

Repeatable process for packaging and distributing AI agents, tools, and sales playbooks to non-technical teammates. Run this every time something leaves the lab and goes to a human who did not build it.

---

## Pre-Flight

Confirm before packaging:

| Question | Why It Matters |
|----------|---------------|
| Who is the recipient? (1 person, small team, all-hands?) | Determines guide detail level and distribution channel |
| What is their technical level? (non-technical default for sales/CS) | Determines jargon threshold and step granularity |
| What platform are they on? | Determines launcher format and common failure modes |
| Is this a first-time distribution or an update? | Updates need changelog + migration notes, not full onboarding |
| What type of package? (AI agent, tool, playbook) | Routes to the correct packaging flow below |

Platform detection: ask the recipient or default to `{{config.default_platform}}`. Support macOS, Windows, and Linux.

---

## Package Type A: AI Agent Distribution

### Step 1: Content Checklist

Before zipping anything, verify the package is complete:

**Skill files:**
- [ ] All skill SKILL.md files present and up to date
- [ ] Skill descriptions accurately reflect current behavior (no stale triggers)
- [ ] No skills reference files or paths that will not exist on the recipient machine
- [ ] Trigger phrases documented so the recipient knows what to type

**Knowledge files:**
- [ ] All knowledge files current (check modification dates)
- [ ] No internal-only references (CRM IDs, personal notes, draft content)
- [ ] Competitive intel redacted if going to external recipients
- [ ] File sizes reasonable (no oversized corpus files in a getting-started package)

**System prompt / agent configuration:**
- [ ] Reflects the latest agent behavior
- [ ] Persona/name section correct for the recipient's context
- [ ] No placeholder text or TODO comments
- [ ] No hardcoded file paths specific to the builder's machine

**CLAUDE.md or equivalent config:**
- [ ] Present in the root of the package folder
- [ ] All paths are relative, not absolute
- [ ] No references to the builder's personal directories

---

### Step 2: Non-Technical Guide

Write a guide that a non-technical user can follow without asking for help.

**Structure:**
1. **What you can do** -- lead with capability, not setup. Sell the value before the work.
2. **How to install** -- max 3 steps. Link to any prerequisite downloads.
3. **How to use it** -- the 3-5 most valuable capabilities, with exact trigger phrases or commands.
4. **Troubleshooting** -- the 3 most common failures (see platform-specific list below).
5. **Where to get help** -- `{{config.support_contact}}` (team channel, DM, or email).

**Writing rules:**
- No terminal jargon after the install step. "Open a folder", not "cd into the directory."
- Every step has exactly one action. Do not combine.
- Include a screenshot or screen recording if the UI has any ambiguity.
- Lead with "Here is what you will be able to do:" -- the recipient decides if setup is worth it based on this section alone.

**Platform-Specific Failure Modes:**

*macOS:*
1. Opening files inside the zip without extracting -- fix: "Right-click the .zip > Open With > Archive Utility first"
2. Launcher blocked by Gatekeeper -- fix: "Right-click the .command file > Open > click Open in the dialog"
3. Tool not installed -- fix: include direct download link as step 0

*Windows:*
1. Opening files inside the zip without extracting -- fix: "Right-click the .zip > Extract All"
2. PowerShell execution policy blocking scripts -- fix: "Right-click > Run as Administrator" or include a .bat launcher
3. Path length issues with deeply nested folders -- fix: extract to a short path like `C:\Tools\`

*Linux:*
1. Launcher not marked executable -- fix: include `chmod +x` in the guide or ship a Makefile
2. Missing dependencies -- fix: include a dependency check script
3. Different shell defaults -- fix: use `#!/usr/bin/env bash` in launchers

---

### Step 3: Launcher Creation

Create a launcher file so non-technical users can start the tool without opening a terminal.

**macOS (.command file):**
```bash
#!/bin/bash
cd "$(dirname "$0")/{{agent_folder}}"
claude
```
- Use `$(dirname "$0")` for portability -- no absolute paths
- Name it obviously: `Open {{Agent Name}}.command`
- `chmod 755` before zipping
- Include Gatekeeper note in the guide

**Windows (.bat file):**
```batch
@echo off
cd /d "%~dp0{{agent_folder}}"
claude
```
- `%~dp0` resolves to the script's own directory
- Name it: `Open {{Agent Name}}.bat`

**Linux (.sh file):**
```bash
#!/usr/bin/env bash
cd "$(dirname "$0")/{{agent_folder}}"
claude
```
- Name it: `open-{{agent-name}}.sh`
- `chmod +x` before zipping

---

### Step 4: Zip and Verify

**Build the zip:**
```
zip -r "{{AgentName}}-v{{version}}.zip" {{AgentFolder}}/ -x "*.DS_Store" -x "__MACOSX/*" -x "*.pyc" -x "node_modules/*"
```

**Verify before sending -- always:**
1. Unzip the .zip into a fresh temp folder (not the same directory as the source)
2. Confirm all expected files are present (run the content checklist from Step 1)
3. Try launching via the platform launcher file
4. Run one capability end-to-end
5. Confirm no absolute paths resolve incorrectly

NEVER SKIP VERIFICATION. What works in the source folder can silently break in a zip due to path issues, missing files, or OS-specific handling.

---

### Step 5: Distribution

**Delivery format:**
- 1:1 rollout: attach the .zip to a direct message (not a public channel)
- Team rollout: post in the team channel with the guide as a threaded reply
- Large org rollout: shared drive folder with the .zip + guide + changelog

**Message template:**
```
Hey {{name}} -- here is {{Agent Name}}.

What it does:
- {{capability 1}}
- {{capability 2}}
- {{capability 3}}

Instructions in the zip. Takes ~{{setup_time}} to set up. DM me if anything breaks.
```

**Post-distribution follow-up:**
- Expect "cannot find X" messages within 24h -- almost always the zip-not-extracted issue
- Check in after 48h: "Did you get a chance to try it?"
- Track who activated vs who got stuck -- that is your adoption funnel
- Collect feedback after 1 week: what works, what is confusing, what is missing

---

## Package Type B: Sales Playbook Distribution

For distributing battle cards, competitive intel packages, methodology guides, or deal playbooks to teammates who will consume (not build) them.

### Step 1: Content Audit

- [ ] All content is current (no stale win/loss data, outdated pricing, old competitor info)
- [ ] Competitive intel has a "last verified" date on every claim
- [ ] No internal system references that recipients cannot access
- [ ] Format is recipient-friendly (PDF or HTML for read-only, markdown for editable)

### Step 2: Package Structure

```
{{PlaybookName}}/
  README.md              -- what this is, when to use it, how to navigate
  battle-cards/          -- per-competitor one-pagers
  methodology/           -- framework guides (qualification, discovery, negotiation)
  templates/             -- reusable email templates, call scripts, objection handles
  references/            -- case studies, proof points, customer quotes (approved only)
  CHANGELOG.md           -- what changed since last version (for updates)
```

### Step 3: Freshness Tagging

Every piece of content gets a freshness tag:
- **FRESH** (updated within 30 days): ship as-is
- **AGING** (30-90 days): ship with a note that a refresh is planned
- **STALE** (90+ days): do not ship -- refresh first or remove

---

### Step 4: Distribution Index

Create an index file listing:
- Every file in the package with a one-line description
- Recommended reading order for first-time recipients
- Quick-reference lookup ("I am going against competitor X" -> battle-cards/competitor-x.pdf)

---

## Version and Changelog (Both Package Types)

**Versioning:**
- Major version (2.0.0): new capabilities, breaking changes, or significant content overhaul
- Minor version (1.1.0): new content additions, non-breaking improvements
- Patch version (1.0.1): typo fixes, minor corrections

**Changelog format:**
```
## v{{version}} -- {{date}}
### Added
- {{new capability or content}}
### Changed
- {{what was updated and why}}
### Fixed
- {{what was corrected}}
### Removed
- {{what was dropped and why}}
```

For updates (not first-time distributions): include the changelog in the distribution message so recipients know what is new without opening the zip.

---

## Configuration Slots

| Slot | Description | Example |
|------|-------------|---------|
| `{{config.default_platform}}` | Default recipient platform | `mac` |
| `{{config.distribution_channel}}` | Primary distribution method | `slack`, `email`, `shared_drive` |
| `{{config.support_contact}}` | Where recipients go for help | `#team-tools` channel |
| `{{config.verify_path}}` | Temp directory for zip verification | `/tmp/verify/` |

---

## Never-Do List

- Never ship without verifying the zip by unzipping to a fresh directory
- Never assume technical fluency -- write the guide for the least technical person on the team
- Never use absolute paths in any file that will be distributed -- they break on every other machine
- Never skip the launcher -- non-technical users will not open a terminal
- Never ship outdated knowledge files -- stale intel in the package is worse than no package at all
- Never distribute competitive intel to external recipients without explicit approval
- Never bundle personal notes, CRM credentials, or API keys in a distribution package
- Never skip the content checklist because "it is just a small update" -- small updates break things too
- Never ship a playbook with STALE-tagged content -- refresh or remove first

---

## Integration

- Pairs with any build or agent-creation workflow -- this is the last mile after building
- Can be triggered after a playbook refresh or competitive intel update
- Works with any team communication tool for distribution (Slack, Teams, email, shared drive)
- Upstream of adoption tracking -- the distribution message is the start of the funnel
