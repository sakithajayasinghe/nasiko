---
title: "Challenge 2 — Agent Performance Metrics Page"
type: feature
status: active
tags: [nasiko, hackathon, challenge-2, web-ui, observability]
created: 2026-05-16
updated: 2026-05-16
---

# Challenge 2 — Agent Performance Metrics Page

Part of [[hackathon-titan-builder-challenge|Titan Builder Challenge]]. **Skills:** React, charting libraries · **Time:** 5–7 hours.

> **Phase notes:** Research: [[../research/challenge-2-agent-metrics-page]] (**done**) · Plan: [[../plans/challenge-2-agent-metrics-page]] (**active**) · Execution: [[../sessions/2026-05-16-challenge-2-agent-metrics-page]] · Dev guide: [[../reference/metrics-dashboard-dev]]
>
> **Build progress:** B1–C6 done. Next: **Phase D** polish + Kong `/app/metrics/` route.
> Decision: [[../decisions/0002-hackathon-pick-challenge-2]]

## Problem

Users need **per-agent performance visibility** in the web UI—latency, reliability, and availability—over a recent window, not only raw Phoenix traces.

## Goals

New **metrics page** in Nasiko web UI showing **per-agent**:

| Metric | Description |
|--------|-------------|
| Average response time | Mean latency over window |
| Success / error count | Outcome tallies |
| Uptime percentage | Availability over window |

**Charts** for the **last 24 hours** (simple charts acceptable—line/bar).

## Non-goals

- Full SRE dashboard (alerts, SLO burn rates) unless time permits
- Cross-tenant analytics
- Replacing Phoenix UI entirely

## Acceptance criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | New metrics page in web UI | [x] http://localhost:3003 |
| 2 | Per deployed agent (selector) | [x] Dropdown from registry |
| 3 | Avg response time, success, error, uptime % | [x] KPI cards |
| 4 | Chart covering last 24h | [x] Recharts latency line |
| 5 | Solution in fork; **PR to main** | [ ] Phase F |

## Architecture (from plan)

```text
Browser → Next page → Next /api/agents|metrics (server) → Nasiko API (Bearer forwarded)
                      → optional @arizeai/phoenix-client → Phoenix
```

| Layer | Path |
|-------|------|
| UI | `web/metrics-dashboard/` (Next.js + Recharts) |
| Server API | `/api/health` ✅ · `/api/agents` ✅ · `/api/metrics` ✅ (rollup + uptime) |
| Nasiko (called by Next) | `/api/v1/registry/user/agents`, `/api/v1/observability/agent/{agentId}/stats` |
| Dev port | http://localhost:3003 |
| Uptime | Kong `/agents/agent-{agentId}/` (see `lib/uptime.ts`) |
| Auth (dev :3003) | Paste JWT on sign-in screen — [[../reference/metrics-dashboard-dev#Auth flow]] |
| Main app (unchanged) | `nasiko-web` Flutter at `/app/` |

**Uptime:** `successful health checks / expected checks` over 24h (locked in ADR 0002).

## UI sketch

```
┌──────────────────────────────────────────────┐
│ Agent Metrics (24h)     [Agent ▼ Translator Agent] │
├──────────────────────────────────────────────┤
│ Avg response: 1.2s │ Success: 142 │ Errors: 3 │
│ Uptime: 99.2%                                │
│ [═══════════ chart: latency 24h ═══════════] │
└──────────────────────────────────────────────┘
```

## Suggested chart libraries (if React)

- Recharts, Chart.js, or Nivo — pick one; keep bundle small

## Tasks

See [[../plans/challenge-2-agent-metrics-page#Task breakdown]] — Phase B (Next API), Phase C (UI).

## Open questions

- [x] `getTraces()` not needed — session list + stats sufficient (B5)
- [x] Registry agent id — `a2a-translator`
- [x] Phoenix project `a2a-translator` after agent traffic
- [ ] Judges OK with `/app/metrics/` sibling route

## Related

- [[hackathon-titan-builder-challenge]]
- [[challenge-1-logging-dashboard]]
- [[../architecture/query-routing]]
- [[../reference/local-development#observability]]
- `app/api/routes/observability_routes.py`

## Log

- 2026-05-16 — **C1–C6 UI verified working** on port 3003
- 2026-05-16 — B1–B7 API complete; [[../reference/metrics-dashboard-dev]] updated
- 2026-05-16 — B1–B3 complete; dev guide added
- 2026-05-16 — Plan revised: Next Route Handlers call Nasiko API (see plan Decision)
- 2026-05-16 — Research + Plan notes drafted; 6-phase task breakdown locked
- 2026-05-16 — Challenge 2 spec added from hackathon brief
