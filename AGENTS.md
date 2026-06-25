# Segundo Repo Operating Contract

## Product Goal

Segundo is a local-first GTM/sales AI OS for Aaron, his colleagues, and another company to inspect deals, prepare calls, package follow-up, and learn from sales motion. The repo must stay interview-demo ready: deterministic, minimal, runnable from a fresh clone, and useful without hidden SaaS dependencies for the core demo path.

## Prime Directive

Ship the smallest working change that improves the GTM OS. Keep every change measurable, config-first, locally runnable, and easy for the next operator to verify. Do not revert or overwrite work you did not make.

## Commands

```bash
npm install
npx prisma generate
npm run build
npm run dev -- help
npm run dev -- brief
npm run inspect -- --deal "Acme"
npm run review
```

Use `npm run build` as the minimum pre-handoff gate. If a `test` script or focused Vitest tests are added, run them before handoff and document the exact command.

## Repo Layout

```text
config/           YAML product, identity, voice, and connector config
engine/           TypeScript runtime, orchestration, integrations, deal logic
skills/           Prompt-as-code skills; each skill owns SKILL.md + plugin.json
methodologies/    MEDDPICC, MEDDIC, BANT, and custom methodology JSON
templates/        Starter operating artifacts and sales templates
prisma/           SQLite schema and generated client contract
scripts/          CLI entrypoints
docs/             Human-facing product and architecture docs
data/             Local runtime state; generated/sensitive paths are gitignored
memory/           Local deal and pattern memory when present
dist/             Generated build output; do not hand-edit
node_modules/     Installed dependencies; do not hand-edit
tests/            Focused Vitest tests when behavior needs coverage
```

## Coding Rules

- Stay on Node.js 18+ / TypeScript / ESM unless the repo deliberately migrates.
- Prefer local files, SQLite, YAML, JSON, and markdown before adding services.
- Keep connectors optional; the demo must run without Salesforce, Gong, Slack, Gmail, or any other SaaS account.
- Put secrets only in `.env`; keep `.env.example` documented with names, not real values.
- Keep command outputs deterministic enough for demos and tests.
- Do not add broad abstractions, placeholder services, or core-path TODOs.
- Keep skill changes self-contained: update both `SKILL.md` and `plugin.json` when the skill contract changes.
- Keep methodology changes schema-shaped and reviewable; no ad hoc scoring rules hidden in prose.

## Test And Verification Rules

- Run `npm run build` before final handoff for TypeScript or CLI changes.
- Add focused tests under `tests/` for scoring, parsing, routing, or persistence behavior that can regress.
- Prefer JSON, YAML, and markdown fixture tests over brittle full-console snapshots.
- Do not require real customer data, live SaaS credentials, or network calls for core tests.
- If verification cannot run, report the exact command, failure, and smallest fix.

## Data And Privacy Boundaries

- Treat CRM exports, call transcripts, emails, Slack content, deal notes, and customer names as sensitive by default.
- Keep raw or generated working data in gitignored local paths: `data/state/`, `data/corpus/`, `data/working/`, `.env`, `*.db`, and `*.db-journal`.
- Commit only sanitized fixtures, templates, schemas, and docs.
- Never print secrets or raw customer records in logs, tests, README examples, or final summaries.
- For demos, prefer synthetic companies and small local fixtures that prove the workflow without exposing real accounts.

## Next-Upgrade Discipline

Every build handoff ends with at most three next upgrades and marks the single highest-leverage one. Upgrades must be runnable, scoped, and tied to interview-demo readiness or real GTM usefulness.
