---
title: "Execution — Challenge 2 — 2026-05-16"
type: session
status: active
tags: [nasiko, execution, session, hackathon, challenge-2]
slug: challenge-2-agent-metrics-page
plan: "[[../plans/challenge-2-agent-metrics-page]]"
created: 2026-05-16
updated: 2026-05-16
---

# Execution — Challenge 2 — 2026-05-16

## Plan link

Plan: [[../plans/challenge-2-agent-metrics-page]] · status: active · dated 2026-05-16

## Goal for this session

Ship Challenge 2 metrics dashboard through **Phase C** (demo-ready UI on port 3003).

- [x] A1–A5 — Spike / discovery
- [x] B1–B7 — Next API layer (`/api/health`, `/api/agents`, `/api/metrics` + rollup + uptime)
- [x] C1–C6 — UI (selector, KPIs, Recharts, states, dark theme)

## Timeline log

- `12:45` — Phase A spike
- `18:30`–`20:15` — B1–B3 scaffold + agents API; verified `a2a-translator`
- `20:30`–`21:00` — B4 `/api/metrics`; Phoenix project created after agent chats
- `21:00`–`21:30` — Agent 401 fix (placeholder `OPENROUTER_API_KEY` in container; redeploy)
- `21:30`–`22:00` — B5–B7 rollup, uptime, vitest, smoke script
- `22:00`–`23:00` — **Phase C:** `MetricsDashboard` UI — user confirmed **working at this level**
- `23:00` — Vault docs updated for B1–C6 complete state

## Decisions made mid-flight

- Next Route Handlers → Nasiko API; FastAPI metrics demoted to fallback
- Registry **`agentId`** (`a2a-translator`) for metrics/observability and Phoenix project name
- **No** `env_utils` placeholder filter — env-only fix + agent container recreate is enough
- **Port 3003 dev auth:** paste JWT on metrics page (`sessionStorage`) — `localStorage` not shared with `:9100`
- B5 uses **session list** rollup (not `getTraces()`); sufficient for demo
- B6 uptime: Kong path `/agents/agent-{agentId}/`; in-memory health buffer per dev server

## Acceptance criteria status

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Metrics page in web UI | [x] http://localhost:3003 (Kong `/app/metrics/` TBD) |
| 2 | Per-agent selector | [x] Dropdown from `/api/agents` |
| 3 | KPIs: latency, success, error, uptime | [x] Verified live |
| 4 | 24h chart | [x] Recharts from `series_24h` |
| 5 | `GET /api/metrics` contract | [x] B4–B7 |
| 6 | Rollup unit test | [x] `npm run test` |
| 7 | Uptime formula in docs | [ ] Phase D — `docs/metrics-page.md` |
| 8 | Demo video | [ ] Phase E |
| 9 | PR to main + screenshots | [ ] Phase F |

## Tests & verification

### API (curl)

```bash
curl http://localhost:3003/api/health
curl http://localhost:3003/api/agents -H "Authorization: Bearer <token>"
curl "http://localhost:3003/api/metrics?agent=a2a-translator&window=24h" -H "Authorization: Bearer <token>"
```

### UI (manual — passed)

1. `npm run dev` → http://localhost:3003
2. Paste `access_token` on sign-in screen (from `localhost:9100` credentials key)
3. Select **Translator Agent** → KPIs + 24h chart populate
4. **Refresh** reloads metrics

### Unit tests

```bash
cd web/metrics-dashboard && npm run test && npm run build
```

## Known issues / ops notes

- **`.next` cache:** if API returns HTML 500, `rm -rf .next && npm run dev`
- **Agent LLM 401:** blank placeholder `OPENROUTER_API_KEY` in `.nasiko-local.env`; **redeploy** agent after env change
- **Phoenix:** project `a2a-translator` appears after first successful chat

## Follow-ups

- Phase D: Kong `/app/metrics/`, `docs/metrics-page.md`, screenshots
- Phase E: synthetic load, demo video
- Phase F: PR submission

## Related

- [[../plans/challenge-2-agent-metrics-page]]
- [[../research/challenge-2-agent-metrics-page]]
- [[../reference/metrics-dashboard-dev]]
- [[../decisions/0002-hackathon-pick-challenge-2]]

## End-of-session summary

**B1–C6 complete and verified.** Metrics dashboard at http://localhost:3003 shows agent selector, four KPI cards, and 24h latency chart backed by Nasiko observability + session rollup + Kong health uptime. **Next:** Phase D (Kong route, judge-facing docs, polish) and submission prep.
