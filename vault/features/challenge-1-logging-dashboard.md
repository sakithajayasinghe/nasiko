---
title: "Challenge 1 — Simple Logging Dashboard"
type: feature
status: active
tags: [nasiko, hackathon, challenge-1, web-ui]
created: 2026-05-16
updated: 2026-05-16
---

# Challenge 1 — Simple Logging Dashboard

Part of [[hackathon-titan-builder-challenge|Titan Builder Challenge]]. **Skills:** React / TypeScript · **Time:** 4–6 hours.

## Problem

Operators need a **single place in Nasiko’s web UI** to read recent **platform logs** without shelling into Docker or raw log files.

## Goals

- New **page** in the Nasiko web UI
- **Table** of recent platform logs
- Columns include **timestamp** (readable)
- **Filter by log level:** `INFO`, `ERROR`, `WARNING`

## Non-goals

- Full log aggregation platform (ELK/Loki) unless minimal stub is enough for demo
- Real-time streaming (nice-to-have; not stated in brief)
- Agent-specific trace UI (see Challenge 2 / existing observability)

## Acceptance criteria

| # | Criterion |
|---|-----------|
| 1 | New route/page reachable from logged-in web app |
| 2 | Table shows multiple log lines with timestamps |
| 3 | User can filter to INFO only, ERROR only, WARNING only (and show all) |
| 4 | Readable formatting (not raw JSON blob only) |
| 5 | Solution in fork; **PR to main** before submission |

## Affected code (investigate first)

| Layer | Path / note |
|-------|-------------|
| Web UI | `web/` (if present in fork) or Flutter `nasiko-web` image source |
| Web entry (compose) | `docker-compose.local.yml` → service `nasiko-web` |
| Backend (if new API needed) | `app/api/routes/` — e.g. new `logs` router |
| Existing observability | `app/api/routes/observability_routes.py` — sessions/traces, **not** platform stdout logs |

### Data source options

1. **New backend endpoint** — tail/aggregate service logs from Mongo, Redis, or file collector
2. **Proxy Docker logs** — dev-only; weak for production PR
3. **Reuse Phoenix** — only if log events are exported as spans (may not match “platform logs”)

Document the chosen approach in this note’s Log when decided.

## UI sketch

```
┌─────────────────────────────────────────────┐
│ Platform Logs          [Level ▼ All] [Refresh]│
├──────────┬────────┬──────────────────────────┤
│ Time     │ Level  │ Message                  │
├──────────┼────────┼──────────────────────────┤
│ 14:02:01 │ ERROR  │ Build worker failed ...  │
│ 14:01:55 │ INFO   │ Agent translator Active  │
└──────────┴────────┴──────────────────────────┘
```

## Tasks

- [ ] Locate web UI source and routing pattern in fork
- [ ] Confirm log data source with team or spike backend endpoint
- [ ] Implement table + level filter
- [ ] Wire auth (same as rest of `/app/`)
- [ ] Test against local compose stack
- [ ] Open PR with screenshots / short demo notes

## Open questions

- Does “platform logs” mean all compose services, backend only, or agent-gateway?
- Is React/TS mandatory if OSS UI is Flutter? (see [[hackathon-titan-builder-challenge#Web UI stack note]])
- Pagination and max row count for “recent”?

## Related

- [[hackathon-titan-builder-challenge]]
- [[challenge-2-agent-metrics-page]]
- [[../architecture/overview]]
- [[../reference/troubleshooting]]

## Log

- 2026-05-16 — Challenge 1 spec added from hackathon brief
