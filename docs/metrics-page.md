# Agent Performance Metrics Page

> Nasiko Titan Builder Challenge — Challenge 2 submission.
>
> Per-agent latency, success/error counts, uptime %, and a 24h chart, served from
> a sibling Next.js app at `/app/metrics/`.

## What it does

A logged-in user opens `/app/metrics/`, selects one of their deployed agents,
and sees:

- **Typical response time** — p50 latency over the last 24 hours, with a small
  inline sparkline showing the 24-hour trend right inside the KPI card
- **Successful / failed requests** — session outcomes over the last 24 hours
- **Availability** — health-poll based rolling 24-hour uptime
- **Estimated cost** — AI usage cost over the last 24 hours, with a tiny
  prompt-vs-completion split bar (when Phoenix reports both halves)
- **User feedback** — *only renders when annotations exist*. Aggregates the
  mean score and label distribution from
  `session_annotation_summaries` (e.g. thumbs-up / thumbs-down ratings).
  The label distribution renders as a stacked sentiment bar with tonal colors
  inferred from common label keywords.
- **Avg steps per request** — *only renders when sessions report `num_traces`*.
  Mean orchestration depth = total spans/traces ÷ sessions in window. A proxy
  for tool-call complexity.
- **Traffic chart** — stacked bars per hour, green for successful requests and
  red for failed ones. The tooltip on hover shows the bucket's total, the
  success/error split, and the typical response time for context.

The traffic chart was chosen over a single latency line because for many agents
response time is stable across the day — a flat line under-sells real activity.
A stacked bar of requests-per-hour makes traffic patterns and error spikes
visible at a glance, while the sparkline inside the latency KPI card keeps the
"is response time drifting?" answer one glance away.

The dashboard auto-refreshes every 60 seconds when the toggle is on, and the
toolbar's "Updated Xs ago" pill reflects the time since the last successful fetch.

## Architecture

```
Browser ──▶ Next.js page (/app/metrics/)
              │
              ▼
         Next Route Handlers  (web/metrics-dashboard/app/api/*)
              │
              ├──▶ Nasiko API  /api/v1/registry/user/agents       (agent list)
              ├──▶ Nasiko API  /api/v1/observability/agent/{id}/stats
              ├──▶ Nasiko API  /api/v1/observability/session/list
              └──▶ Kong         /agents/agent-{id}/                 (uptime poll)
                                  │
                                  ▼
                              Phoenix  (trace store)
```

The browser only talks to Next; Next forwards the user's bearer token to Nasiko.
No API keys live in the browser, no CORS to Phoenix, no client-side aggregation.

Why Next.js: the running Nasiko UI is a compiled Flutter bundle with no editable
source in the fork, so we ship a sibling app at the same origin under `/app/metrics/`.
This also lets us add lightweight Route Handlers for server-side aggregation
without touching the Python backend on the happy path.

## Uptime formula

```
uptime_pct = successful_health_checks / expected_health_checks_24h * 100
```

- The dashboard polls Kong `GET /agents/agent-{agentId}/` every 60 seconds.
- "Expected" = 1440 checks per 24 hours (one per minute).
- "Successful" = checks that returned `2xx`.
- The buffer is in-memory; the dashboard reports `recorded_checks` so judges and
  operators can see how warm the buffer is. A fresh deploy reports `recorded` <
  `expected`, which is honest rather than misleading.

Why poll-based, not request-success: the brief talks about availability
(is the agent reachable), not error rate. Two different signals. Request errors
are surfaced separately in the **Errors** KPI card.

## API contracts

### `GET /api/health`

Public; returns a small JSON blob with `nasikoApiUrl` and gateway/backend status.
Useful for `docker compose ps` style sanity checks.

### `GET /api/agents`

Bearer required. Proxies `GET /api/v1/registry/user/agents` and normalizes the
shape:

```json
{
  "agents": [
    { "agentId": "a2a-translator", "name": "Translator Agent", "description": "…", "tags": ["…"] }
  ],
  "statusCode": 200,
  "message": "Retrieved N accessible agents for authenticated user"
}
```

### `GET /api/metrics?agent={agentId}&window=24h`

Bearer required.

```json
{
  "agent": "a2a-translator",
  "window": "24h",
  "avg_latency_ms": 1210,
  "success": 142,
  "error": 3,
  "uptime_pct": 99.2,
  "series_24h": [
    { "ts": "2026-05-16T10:00:00Z", "latency_ms": 1100, "success": 12, "error": 0 },
    { "ts": "2026-05-16T11:00:00Z", "latency_ms": null, "success": null, "error": null }
  ],
  "source": {
    "trace_count": 145,
    "latency_ms_p50": 1210,
    "latency_ms_p99": 4300,
    "session_count": 145,
    "uptime": {
      "successful_checks": 1430,
      "recorded_checks": 1442,
      "expected_checks_24h": 1440,
      "poll_interval_minutes": 1,
      "current_health": true
    }
  },
  "no_data": false
}
```

- `series_24h` is always 24 buckets, oldest first. Empty hours are `null`
  (not absent) so the chart can show gaps honestly.
- `no_data: true` indicates Phoenix has no project for this agent yet
  (no traffic since the agent was deployed). The UI renders a clear empty
  state with a "Chat with the agent" call to action rather than zeros.

## Local development

1. Bring up the Nasiko stack: `docker compose -f docker-compose.local.yml up -d`
2. Sign in at `http://localhost:9100/app/` and deploy an agent (e.g. translator)
3. Start the metrics app:
   ```bash
   cd web/metrics-dashboard
   cp .env.example .env.local   # NASIKO_API_URL=http://localhost:9100
   npm install
   npm run dev                  # http://localhost:3003
   ```
4. On `:3003`, paste the `access_token` from `localStorage`
   (`nasiko-credentials-{email}-{username}.json` on `http://localhost:9100`).
5. To get the demo charts non-flat, run the synthetic load script:
   ```bash
   python scripts/synthetic_load.py \
     --token "$ACCESS_TOKEN" \
     --agent a2a-translator \
     --duration-min 30 \
     --rate-per-min 6
   ```

See `vault/reference/metrics-dashboard-dev.md` for the full dev guide.

## Tests

```bash
cd web/metrics-dashboard
npm run test                 # vitest — lib/rollup.test.ts
npm run smoke                # bash smoke test (needs NASIKO_BEARER_TOKEN)
```

## Accessibility

- Skip-to-content link before the dashboard
- All KPI cards expose an `aria-label` with their label and value, so screen
  readers don't have to stitch them together
- The status pill is `aria-live="polite"` so refresh changes are announced
- Error banner is `role="alert"` / `aria-live="assertive"`
- Auto-refresh toggle has an `aria-describedby` hint
- `prefers-reduced-motion` disables the loading pulse and chart skeleton shimmer
- Every interactive element has a visible focus ring (`:focus-visible`)

## File layout

| Path | Purpose |
|------|---------|
| `web/metrics-dashboard/app/page.tsx` | Page entry — renders `<MetricsDashboard />` |
| `web/metrics-dashboard/app/layout.tsx` | Root layout, dark theme |
| `web/metrics-dashboard/app/globals.css` | Theme tokens, focus styles |
| `web/metrics-dashboard/app/api/health/route.ts` | `GET /api/health` |
| `web/metrics-dashboard/app/api/agents/route.ts` | `GET /api/agents` |
| `web/metrics-dashboard/app/api/metrics/route.ts` | `GET /api/metrics` |
| `web/metrics-dashboard/components/MetricsDashboard.tsx` | Top-level UI shell |
| `web/metrics-dashboard/components/KpiCards.tsx` | KPI cards (5 always + 2 conditional Tier-B) |
| `web/metrics-dashboard/components/LatencySparkline.tsx` | Small 24h area chart inside the latency KPI card |
| `web/metrics-dashboard/components/CostSplit.tsx` | Prompt vs completion mini-bar inside the cost KPI card |
| `web/metrics-dashboard/components/FeedbackBar.tsx` | Label-distribution stacked bar inside the feedback KPI card |
| `web/metrics-dashboard/components/TrafficChart.tsx` | Main panel: stacked success/error bars per hour |
| `web/metrics-dashboard/components/metrics-dashboard.css` | Dashboard styles |
| `web/metrics-dashboard/lib/nasiko.ts` | Server-side Nasiko fetch helper |
| `web/metrics-dashboard/lib/rollup.ts` | Sessions → KPIs + 24h bucket logic |
| `web/metrics-dashboard/lib/uptime.ts` | Poll-based uptime ring buffer |
| `web/metrics-dashboard/lib/auth.ts` | Bearer header forwarding |
| `web/metrics-dashboard/lib/rollup.test.ts` | Vitest unit tests for rollup |
| `web/metrics-dashboard/scripts/smoke-api.sh` | End-to-end smoke against running stack |
| `scripts/synthetic_load.py` | Demo traffic generator |

## Out of scope

- No FastAPI `metrics_routes.py` on the happy path — Next Route Handlers are
  the aggregator. A FastAPI fallback is documented in the plan's Rollback section.
- No browser-side Phoenix calls; no API keys in the client.
- Windows other than 24h are not exposed; the constant is centralized in
  `lib/metrics.ts` if you want to extend.

## Related

- ADR: `vault/decisions/0002-hackathon-pick-challenge-2.md`
- Plan: `vault/plans/challenge-2-agent-metrics-page.md`
- Research: `vault/research/challenge-2-agent-metrics-page.md`
- Dev guide: `vault/reference/metrics-dashboard-dev.md`
