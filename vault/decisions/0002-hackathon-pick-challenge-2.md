---
title: "ADR 0002 — Hackathon Pick: Challenge 2 (Agent Performance Metrics Page)"
type: decision
status: accepted
tags: [nasiko, adr, hackathon, buildathon]
created: 2026-05-16
updated: 2026-05-16
---

# ADR 0002 — Hackathon Pick: Challenge 2 (Agent Performance Metrics Page)

## Status

Accepted

## Context

The Nasiko Titan Builder Challenge offers two tracks in a 24-hour buildathon (see [[../features/hackathon-titan-builder-challenge]]):

| # | Track | Brief estimate |
|---|-------|----------------|
| 1 | [[../features/challenge-1-logging-dashboard|Logging Dashboard]] — table + level filter | 4–6 h |
| 2 | [[../features/challenge-2-agent-metrics-page|Agent Performance Metrics Page]] — per-agent KPIs + 24h chart | 5–7 h |

Only one needs to be completed for the award track. Both share two real unknowns:

- **UI stack ambiguity:** brief says React/TS, but the running UI is Flutter (`nasiko-web`). See [[../features/hackathon-titan-builder-challenge#Web UI stack note]].
- **Data plumbing:** Challenge 1's "platform logs" source is open (Docker stdout vs Mongo vs new collector); Challenge 2 can lean on Phoenix traces already exposed under `/observability/*`.

A 24h budget leaves significant slack vs either estimate, so the deciding factors are demo impact and data-source clarity, not raw hours.

## Decision

Build **Challenge 2 — Agent Performance Metrics Page**.

Scope for the submission:

- Per-agent KPI cards: avg response time, success count, error count, uptime %
- One 24h chart per selected agent (latency line chart, Recharts)
- Agent selector sourced from the registry
- No-data state for agents with zero traffic
- Server-side rollup (Next Route Handlers → Nasiko API + optional Phoenix client) so the browser stays thin — see [[../plans/challenge-2-agent-metrics-page]]

**Uptime formula (locked):** `uptime % = successful health checks / expected health checks over 24h` (poll-interval based, not request success rate). Documented in the PR description so judges have a clear definition.

**Fallback trigger:** if the H0–2 spike finds that a new React page can't be reached from the logged-in shell (i.e. the Flutter image owns the entire `/app/` surface and there is no React mount point in the fork), pivot to Challenge 1. Decision made at H2, not later.

## Reasoning

Demo impact at constant cost. Charts and KPI cards are visceral on stage ("1.2s avg, 99.2% uptime, error spike at 14:00") in a way a filtered log table is not. Both tracks pay the same Flutter-vs-React tax, so Challenge 1 isn't actually the safer pick — it just looks cheaper on paper.

Data source is already there. Phoenix is exposed through `/observability/*` per [[../architecture/overview]] and `app/api/routes/observability_routes.py`. Challenge 1's data source is explicitly open in its spec, which is a rabbit hole inside a 24h window.

Time fits with margin. 5–7h estimate vs 24h budget leaves ~17h of slack for the spike, polish, demo prep, and the PR — enough that we can afford an H0–2 spike before committing code.

## Consequences

### Positive

- Stronger live demo (visual KPIs + chart) than a log table
- Reuses existing Phoenix data path; less new backend surface
- Server-side rollup keeps the frontend small and easy to test
- Locked uptime formula removes a recurring judge question

### Negative

- Charting adds a JS dependency (Recharts) and bundle weight; mitigated by picking one library only
- Per-agent Phoenix project naming is not pinned in OSS; the spike must confirm it on a running sample agent
- Slightly higher estimate than Challenge 1, so less buffer if the spike drags

### Neutral

- Challenge 1 remains a documented fallback, not a parallel track
- Flutter-vs-React decision is deferred to the H0–2 spike, not pre-committed

## Plan (24h budget)

1. **H0–2** — Spike: locate UI source (fork `web/` vs Flutter image), confirm Phoenix project-per-agent naming with one sample agent running, lock React-new-page vs Flutter-in-place
2. **H2–6** — Backend: `/metrics/agents` endpoint returning `{ agent, avg_latency_ms, success, error, uptime_pct, series_24h[] }`
3. **H6–12** — Frontend: agent selector, four KPI cards, one Recharts 24h latency chart, no-data state
4. **H12–16** — Polish: empty/error/loading states, dark-mode parity with `/app/`, screenshots for the PR
5. **H16–20** — Demo prep: run [[../reference/sample-agents|sample agents]], drive traffic so charts look alive, record 60s walkthrough
6. **H20–24** — Buffer: open PR to `Nasiko-Labs/nasiko` main, complete fork + star + PR participation checklist

## Open items resolved here

- **Uptime definition** — health-poll interval based (see Decision)
- **Charting library** — Recharts (smallest bundle that satisfies the brief)
- **Aggregation location** — server-side rollup, not client-side

## Open items still deferred to spike

- React-new-page vs Flutter-in-place (H0–2)
- Per-agent Phoenix project naming convention (H0–2)

## Related

- [[../features/hackathon-titan-builder-challenge]]
- [[../features/challenge-2-agent-metrics-page]]
- [[../features/challenge-1-logging-dashboard]] (fallback)
- [[../architecture/overview]]
- [[../reference/sample-agents]]
- [[_index]]

## Log

- 2026-05-16 — Plan refines implementation: Next `/api/metrics` proxies Nasiko (ADR intent unchanged: server-side aggregation)
- 2026-05-16 — ADR accepted; Challenge 2 selected for 24h buildathon
