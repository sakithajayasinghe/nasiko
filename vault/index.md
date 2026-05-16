---
title: Nasiko Knowledge Base
type: reference
status: active
tags: [nasiko, index]
created: 2026-05-16
updated: 2026-05-16
---

# Nasiko Knowledge Base

**Why this vault exists:** capture architecture intent, feature specs, and decisions that are hard to infer from code alone. **Code + `docs/`** stay canonical for runtime behavior.

| Tool | Open | Use for |
|------|------|---------|
| Cursor | Repository root (parent of `vault/`) | Code + AI edits to vault |
| Obsidian | `vault/` folder | Graph, reading, manual notes |

## Architecture

| Note | Topic |
|------|--------|
| [[architecture/overview]] | Platform map and component table |
| [[architecture/services-and-ports]] | Ports, URLs, Kong routes |
| [[architecture/agent-deployment-flow]] | Upload → build → K8s → Kong |
| [[architecture/query-routing]] | LangChain router and AgentCard matching |

## Reference (runbooks)

| Note | Topic |
|------|--------|
| [[reference/local-development]] | Docker compose, first login, health checks |
| [[reference/environment-variables]] | `.nasiko-local.env` (names only) |
| [[reference/cli-cheatsheet]] | `nasiko` CLI commands |
| [[reference/sample-agents]] | Bundled example agents |
| [[reference/metrics-dashboard-dev]] | Challenge 2 metrics UI — **B1–C6 done**, port 3003 |
| [[reference/troubleshooting]] | Common failures |
| [[reference/phased-development-workflow]] | Research → Plan → Execute workflow |
| [[reference/cursor-rules-how-to]] | Cursor `.mdc` rule conventions |

## Hackathon (Titan Builder Challenge)

| Note | Topic |
|------|--------|
| [[features/hackathon-titan-builder-challenge]] | Rules, submission, pick Challenge 1 or 2 |
| [[features/challenge-1-logging-dashboard]] | Platform logs table + level filter |
| [[features/challenge-2-agent-metrics-page]] | Per-agent metrics + 24h charts |

## Work tracking

| Note | Topic |
|------|--------|
| [[features/_index]] | Feature specs (active / done) |
| [[research/_index]] | Research phase notes |
| [[plans/_index]] | Plan phase notes |
| [[sessions/README]] | Execution session logs |
| [[decisions/_index]] | ADRs |
| [[decisions/0001-vault-in-repo]] | Why the vault lives in this repo |
| [[decisions/0002-hackathon-pick-challenge-2]] | Hackathon pick: Challenge 2 |

## Templates

- [[templates/feature]] — copy for new features
- [[templates/research]] — copy for Research phase notes
- [[templates/plan]] — copy for Plan phase notes
- [[templates/execution]] — copy for Execute phase session notes
- `vault/templates/adr.md` — copy for new ADRs

## Canonical repo docs (do not duplicate fully)

- `README.md` — quick start, architecture ASCII, agent dev
- `docs/getting-started.md` — first agent walkthrough
- `agent-gateway/README.md` — Kong standalone dev
- `cli/BINARY_BUILD_GUIDE.md` — CLI binary builds
- `HOW_TO_RUN_AGENT.md` — running agents locally

## Log

- 2026-05-16 — Challenge 2 metrics UI **verified** (B1–C6); see [[reference/metrics-dashboard-dev]]
- 2026-05-16 — [[reference/metrics-dashboard-dev]] — B1–B3 docs; verified `agentId` `a2a-translator`
- 2026-05-16 — Challenge 2 **plan revised**: Next `/api/metrics` + Nasiko API ([[plans/challenge-2-agent-metrics-page]])
- 2026-05-16 — Challenge 2 research marked **done** ([[research/challenge-2-agent-metrics-page]]); Phase A findings merged
- 2026-05-16 — Challenge 2 task breakdown: research + plan persisted ([[plans/challenge-2-agent-metrics-page]]); method ref [[reference/task-breakdown-method]]
- 2026-05-16 — Phased dev workflow added: research/, plans/, sessions/ + Cursor rules ([[reference/phased-development-workflow]])
- 2026-05-16 — Hackathon pick: Challenge 2 ([[decisions/0002-hackathon-pick-challenge-2]])
- 2026-05-16 — Hackathon Titan Builder Challenge (2 tracks) documented
- 2026-05-16 — Vault populated from README and project structure
- 2026-05-16 — Vault initialized for codebase + feature development
