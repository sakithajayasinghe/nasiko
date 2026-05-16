---
title: Plans Index
type: reference
status: active
tags: [nasiko, plans]
created: 2026-05-16
updated: 2026-05-16
---

# Plans

Implementation plans from the **Plan phase** of the [[../reference/phased-development-workflow|phased development workflow]]. One note per feature. Use `vault/templates/plan.md`.

Naming: `<kebab-slug>.md` matching the research note slug.

Each plan must link back to its research note (`research:` in frontmatter and a Research basis section).

## Status legend

- `draft` — still being designed, gate to Execute is closed
- `active` — locked, ready to execute against
- `done` — execution session(s) closed all acceptance criteria
- `superseded` — replaced mid-flight; link forward

## Notes

| Note | Slug | Status |
|------|------|--------|
| [[challenge-2-agent-metrics-page]] | challenge-2-agent-metrics-page | active — B1–C6 done, Phase D next |

## Log

- 2026-05-16 — Plan + dev guide synced to **B1–C6** (UI verified on :3003)
- 2026-05-16 — Plan + [[../reference/metrics-dashboard-dev]] synced to B1–B3 implementation
- 2026-05-16 — Plan revised: Next Route Handlers → Nasiko API (FastAPI metrics optional fallback)
- 2026-05-16 — Plan added: Challenge 2 agent metrics page (6 phases / 33 tasks / 24h)
- 2026-05-16 — Plans folder created
