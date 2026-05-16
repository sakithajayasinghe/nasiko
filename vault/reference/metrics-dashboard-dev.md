---
title: Metrics Dashboard — Dev Guide
type: reference
status: active
tags: [nasiko, reference, hackathon, challenge-2, nextjs]
created: 2026-05-16
updated: 2026-05-16
---

# Metrics Dashboard — Dev Guide

Implementation reference for **Challenge 2** (`web/metrics-dashboard/`). Plan: [[../plans/challenge-2-agent-metrics-page]]. Code README: `web/metrics-dashboard/README.md`.

**Status (2026-05-16):** API (B1–B7) + UI (C1–C6) **working** on http://localhost:3003. User-verified end-to-end.

## Local URLs

| What | URL |
|------|-----|
| **Metrics UI (dev)** | http://localhost:3003 |
| Main Nasiko UI | http://localhost:9100/app/ |
| Kong / Nasiko API | http://localhost:9100 |
| Phoenix UI | http://localhost:6006 |

Production target: same host at `/app/metrics/` via Kong (Phase D — compose TBD).

## Quick start (UI)

```bash
cd web/metrics-dashboard
cp .env.example .env.local   # NASIKO_API_URL=http://localhost:9100
npm install
npm run dev
```

1. Ensure Nasiko stack is up (`docker compose -f docker-compose.local.yml up -d`)
2. Sign in at http://localhost:9100/app/ and deploy/use an agent (e.g. translator)
3. Open http://localhost:3003
4. **Paste JWT** on the sign-in screen (see Auth below)
5. Select agent → view KPIs + chart → **Refresh** as needed

## Environment

| Variable | Where | Description |
|----------|--------|-------------|
| `NASIKO_API_URL` | Server (`.env.local`) | Kong gateway — default `http://localhost:9100` |
| `NEXT_PUBLIC_NASIKO_APP_URL` | Client | Link to main app — default `http://localhost:9100/app/` |

## Auth flow

### Production / Kong (same origin)

When served at `http://localhost:9100/app/metrics/` (planned):

1. Sign in at `/app/` → JWT in `localStorage` key `nasiko-credentials-{email}-{username}.json` → `access_token`
2. Metrics page reads token automatically → calls `/api/agents` and `/api/metrics` with `Authorization: Bearer …`

### Local dev (port 3003 — **current**)

`localStorage` is **per origin**. Token on `:9100` is **not** visible on `:3003`.

**Workaround:** On the metrics sign-in screen, paste `access_token` from:

- DevTools → Application → Local Storage → `http://localhost:9100` → key `nasiko-credentials-…` → field `access_token`

Stored in `sessionStorage` as `nasiko-metrics-dev-token` for the browser session.

**Do not** call Nasiko or Phoenix directly from the browser — only Next `/api/*` routes.

## UI (Phase C)

| Component | File | Behavior |
|-----------|------|----------|
| Dashboard shell | `components/MetricsDashboard.tsx` | Auth, load agents/metrics, states |
| Agent selector | (toolbar) | `GET /api/agents` |
| KPI cards | `components/KpiCards.tsx` | Latency, success, errors, uptime |
| 24h chart | `components/LatencyChart.tsx` | Recharts line — `series_24h` |
| Styles | `components/metrics-dashboard.css`, `app/globals.css` | Dark theme |

States: loading, auth required, error + retry, no agents, no trace data (`no_data`).

## API routes (Phase B)

### `GET /api/health` — no auth

```bash
curl http://localhost:3003/api/health
```

### `GET /api/agents` — Bearer required

```bash
curl http://localhost:3003/api/agents \
  -H "Authorization: Bearer <access_token>"
```

Proxies `GET /api/v1/registry/user/agents`. Use response `agentId` (e.g. `a2a-translator`), not display `name`.

### `GET /api/metrics` — Bearer required

```bash
curl "http://localhost:3003/api/metrics?agent=a2a-translator&window=24h" \
  -H "Authorization: Bearer <access_token>"
```

**Upstream:** Nasiko observability stats + session list + Kong health probe.

**Response fields:**

| Field | Source |
|-------|--------|
| `avg_latency_ms` | Session P50 avg, else Phoenix `latency_ms_p50` |
| `success` / `error` | Session rollup (`lib/rollup.ts`) |
| `uptime_pct` | Health buffer (`lib/uptime.ts`) — Kong `/agents/agent-{agentId}/` |
| `series_24h` | 24 hourly buckets from sessions |
| `source.uptime` | Poll metadata (checks recorded, expected 24h) |
| `no_data` | Phoenix project missing — chat with agent first |

### Smoke test (B7)

```bash
export NASIKO_BEARER_TOKEN="<access_token>"
cd web/metrics-dashboard && npm run smoke
```

### Unit tests

```bash
cd web/metrics-dashboard && npm run test
```

## Agent ID vs Kong path

| Concept | Example |
|---------|---------|
| Registry `agentId` | `a2a-translator` |
| UI label | `Translator Agent` |
| Docker / Kong path | `/agents/agent-a2a-translator` |
| Phoenix project | `a2a-translator` |

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| HTML 500 from `/api/*` | `rm -rf web/metrics-dashboard/.next && npm run dev` |
| `no_data: true` | Chat with agent once; confirm Phoenix project at :6006 |
| Chat **401 Missing Authentication header** | Remove placeholder `OPENROUTER_API_KEY` from `.nasiko-local.env`; **redeploy** agent |
| Metrics 401 | Paste fresh token on :3003 sign-in screen |
| Empty chart buckets | Normal until more sessions; use Refresh after traffic |

## Code layout

| Path | Status |
|------|--------|
| `app/page.tsx` | Done — renders `MetricsDashboard` |
| `components/MetricsDashboard.tsx` | Done — C1–C5 |
| `components/KpiCards.tsx` | Done — C3 |
| `components/LatencyChart.tsx` | Done — C4 (Recharts) |
| `lib/auth-client.ts` | Done — token read / dev paste |
| `lib/api-client.ts` | Done — browser → `/api/*` |
| `lib/nasiko.ts` | Done — server → Nasiko |
| `lib/rollup.ts` | Done — B5 |
| `lib/uptime.ts` | Done — B6 |
| `lib/rollup.test.ts` | Done — B7 |
| `scripts/smoke-api.sh` | Done — B7 |

## Implementation progress

| Phase | Status |
|-------|--------|
| A — Spike | Done |
| B1–B7 — API layer | Done |
| C1–C6 — UI | Done, verified |
| D — Kong route, `docs/metrics-page.md`, polish | Next |
| E — Demo prep | Pending |
| F — PR / submission | Pending |

## Related

- [[../plans/challenge-2-agent-metrics-page]]
- [[../features/challenge-2-agent-metrics-page]]
- [[../sessions/2026-05-16-challenge-2-agent-metrics-page]]
- [[local-development]]
- [[sample-agents]]

## Log

- 2026-05-16 — **C1–C6 verified working** on :3003; auth paste flow documented
- 2026-05-16 — B5–B7: rollup, uptime, vitest, smoke script
- 2026-05-16 — B4 metrics API + Phoenix `a2a-translator` project
- 2026-05-16 — Created; B1–B3 and `a2a-translator` agent list
