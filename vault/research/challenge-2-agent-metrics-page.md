---
title: "Research — Challenge 2: Agent Performance Metrics Page"
type: research
status: done
tags: [nasiko, research, hackathon, challenge-2, observability, ai/created]
slug: challenge-2-agent-metrics-page
created: 2026-05-16
updated: 2026-05-16
---

# Research — Challenge 2: Agent Performance Metrics Page

> **Plan consumption:** Aggregation and Nasiko/Phoenix reads are implemented in **Next.js Route Handlers** (server), not a new FastAPI `/metrics/agents` endpoint. See [[../plans/challenge-2-agent-metrics-page#Decision]].

## Question

What's the minimum data path and UI surface to ship a per-agent metrics page (avg latency, success/error count, uptime %, 24h latency chart) inside the Nasiko web UI in under 24h, demo-ready?

## Why now

Triggered by [[../decisions/0002-hackathon-pick-challenge-2|ADR 0002]] which selected Challenge 2 for the Titan Builder Challenge. Feature spec: [[../features/challenge-2-agent-metrics-page]]. Hackathon overview: [[../features/hackathon-titan-builder-challenge]].

Phase A spike evidence: [[../sessions/2026-05-16-challenge-2-agent-metrics-page]].

## Sources consulted

### Code and docs (desk)

- `app/api/routes/observability_routes.py` — Phoenix proxy routes including `GET /agent/{agent_id}/stats`
- `app/api/handlers/observability_handler.py` — handler → `ObservabilityService`
- `app/service/observability_service.py` — `_get_project_id`, `get_agent_project_stats`, GraphQL to Phoenix
- `app/utils/observability/injector.py` — `bootstrap_tracing(project_name=agent_name)` on deploy
- `app/api/auth.py` — Bearer JWT via auth service `POST /auth/validate`
- `app/repository/base_repository.py` — Fernet / env (unrelated to metrics path)
- `agent-gateway/registry/registry.py` — Kong routes for `nasiko-web` on port 4000, `/app/` strip
- `agent-gateway/chat-history-service/` — conversation store (not primary metrics source)
- `cli/groups/images_group.py` — full monorepo expects `web/Dockerfile` (absent in this fork)
- `HOW_TO_RUN_AGENT.md` — Flutter bundle, Kong URL patch at container start
- `docker-compose.local.yml` — `nasiko-web` image `karannasiko/nasiko-web:oss`
- [[../architecture/overview]], [[../architecture/services-and-ports]], [[../reference/sample-agents]]

### Live spike (Phase A, 2026-05-16)

- Repo glob — no `web/`, no `.dart` / `.tsx` sources in fork
- `docker exec nasiko-web` — `main.dart.js`, `flutter.js`, `config.js` (compiled Flutter)
- `docker exec nasiko-backend printenv PHOENIX_SERVICE_URL` → `http://phoenix-observability:6006`
- `curl http://localhost:6006/v1/projects` — projects API reachable from host
- `curl http://localhost:9100/api/v1/observability/agent/translator/stats?...` — route exists, 401 without valid JWT
- `strings main.dart.js` — `access_token`, `nasiko-credentials-*` localStorage pattern
- `curl http://localhost:8000/api/v1/healthcheck`, `http://localhost:9100/health` — stack up

## Findings

### Data source for latency / success / errors

- **Confirmed:** Phoenix is the trace source; backend exposes it under `/api/v1/observability/*` (Kong: `/api/v1/observability/...`).
- **Confirmed:** Backend reaches Phoenix internally at `PHOENIX_SERVICE_URL` (compose: `http://phoenix-observability:6006`), not browser-only.
- **Confirmed:** Project lookup is REST `GET {PHOENIX}/v1/projects/{project_name}` in `observability_service._get_project_id`.
- **Confirmed:** Per-agent project name equals **registry `agent_id` / deploy `agent_name`** — same string used in `bootstrap_tracing(project_name=agent_name)` (`app/utils/observability/injector.py`).
- **Confirmed:** Existing stats endpoint: `GET /api/v1/observability/agent/{agent_id}/stats?start_time=<ISO>` returns trace count, latency percentiles, cost summary (GraphQL rollup). Good input for a new `/metrics/agents` aggregator.
- **Likely:** Success vs error counts must be derived from trace/span status or session outcomes in Phoenix GraphQL (not a single field on stats endpoint today) — aggregator will extend queries or post-process sessions.
- **Confirmed (2026-05-16):** After deploying translator ZIP, registry returns `agentId` **`a2a-translator`** via `/api/agents` (not display name `Translator Agent`). Phoenix project name for observability calls should use this id — verify project exists in Phoenix UI after traffic.

### Data source for uptime %

- **Confirmed:** Kong exposes `GET /agents/{name}/health` per agent.
- **Confirmed:** No built-in 24h health history in repo — plan adds `health_poller` + in-memory ring buffer.
- **Confirmed (ADR 0002):** Uptime % = `successful health checks / expected health checks` over 24h (poll-interval based), not request success rate.

### UI stack

- **Confirmed:** Running UI is **compiled Flutter** in Docker image `nasiko-web` (`main.dart.js`, nginx :4000, Kong `/app/`).
- **Confirmed:** This fork has **no** `web/` React source and **no** Flutter Dart source — cannot add a route inside the main shell without upstream web repo.
- **Confirmed:** Runtime config in container `config.js` sets same-origin `apiBaseUrl`, `routerUrl`, `agentsBaseUrl` from `window.location.origin`.
- **Likely:** Hackathon judges accept a **sibling** metrics app at `/app/metrics/` on same origin (demo: login → open metrics URL). Confirm with organizers if required.
- **Plan consumption (not research pick):** New **Next.js 15** app at `web/metrics-dashboard/` (dev port **3003**), Kong route `/app/metrics/`, **Recharts** — see [[../plans/challenge-2-agent-metrics-page#Decision]].

### Auth for a new page

- **Confirmed:** API routes use `Authorization: Bearer <token>` validated via `nasiko-auth-service` (`app/api/auth.py`).
- **Confirmed:** Flutter app persists credentials in `localStorage` key `nasiko-credentials-{email}-{username}.json` with `access_token` field (from compiled `main.dart.js` strings).
- **Confirmed:** Metrics Next app reads that JSON and sends Bearer to Next `/api/*` routes (server forwards to Nasiko).

### Aggregation

- **Confirmed:** Rollup runs on the **server** (not in the browser).
- **Plan (2026-05-16):** **Next** `GET /api/metrics` Route Handler — calls Nasiko observability (+ optional `@arizeai/phoenix-client`), returns dashboard JSON. Browser only calls Next `/api/*`.
- **Superseded for happy path:** FastAPI `GET /metrics/agents` (still valid fallback per plan Rollback).
- **Confirmed:** Response shape unchanged — `avg_latency_ms`, `success`, `error`, `uptime_pct`, `series_24h[]`.

### Demo data

- **Confirmed:** Sample agents under `agents/` can drive Phoenix traces after deploy.
- **Likely:** Default compose traffic is too sparse for a rich 24h chart — plan includes `scripts/synthetic_load.py` in Phase E.
- **Confirmed (2026-05-16):** Registry `agentId` for deployed translator ZIP is **`a2a-translator`** ([[../reference/metrics-dashboard-dev]]). Phoenix project name after traffic still TBD.

## Options surfaced

### UI delivery

| # | Option | Pros | Cons | Spike result |
|---|--------|------|------|----------------|
| 1 | React in monorepo `web/` | Matches brief | **No source in fork** | Ruled out |
| 2 | Flutter page in `nasiko-web` | Native shell integration | **No Dart source in fork** | Ruled out |
| 3 | Standalone Vite on odd port | Fast dev | Poor demo / CORS | Ruled out |
| 4 | **Next.js app `web/metrics-dashboard/` + Kong `/app/metrics/`** | Matches brief; same origin + auth | Not embedded inside Flutter nav | **Plan choice (B1–B3 done)** |

### Aggregation

| # | Option | Pros | Cons | Spike result |
|---|--------|------|------|----------------|
| 1 | Next `/api/metrics` → Nasiko (+ optional phoenix-client) | Official SDK optional; reuses Nasiko ACLs | Second server layer (Next) | **Current plan** |
| 1b | FastAPI `/metrics/agents` | Single Python backend | New Nasiko code | Fallback only |
| 2 | Client Phoenix GraphQL | No new API | CORS; heavy UI | Ruled out |
| 3 | Mongo background rollups | Fast reads | Too much infra for 24h | Ruled out |

## Open questions (for Execute — not blocking Plan)

- [x] Registry agent id after deploy — **`a2a-translator`**
- [ ] Phoenix project `a2a-translator` visible at :6006 after agent traffic (spike saw only `default`)
- [ ] Judges OK with `/app/metrics/` sibling route vs in-Flutter menu link
- [ ] Whether `scripts/synthetic_load.py` ships in main PR or fork-only branch
- [ ] Exact GraphQL/filter for success vs error counts from Phoenix traces

## Risks & unknowns

| ID | Risk | Status after spike | Mitigation |
|----|------|-------------------|------------|
| R1 | UI discovery rabbit hole | **Closed** — React micro-frontend path viable | No Challenge 1 fallback |
| R2 | Phoenix not per-agent | **Low** — project name = `agent_id` in code | Filter by attribute if deploy name mismatches |
| R3 | Flat demo charts | Open | `synthetic_load.py` + Phase E |
| R4 | No health history | Open | `health_poller` in Phase B (plan) |
| R5 | Backend unhealthy in compose | Observed `unhealthy` label but healthcheck 200 | Monitor during Execute |

## Related

- [[../decisions/0002-hackathon-pick-challenge-2]]
- [[../plans/challenge-2-agent-metrics-page]]
- [[../sessions/2026-05-16-challenge-2-agent-metrics-page]]
- [[../features/challenge-2-agent-metrics-page]]
- [[../features/hackathon-titan-builder-challenge]]
- [[../architecture/overview]]
- [[../reference/phased-development-workflow]]
- [[../reference/metrics-dashboard-dev]]

## Log

- 2026-05-16 — B1–C6 complete; UI verified — see [[../reference/metrics-dashboard-dev]]
- 2026-05-16 — B1–B3 implementation + live agent list documented in [[../reference/metrics-dashboard-dev]]
- 2026-05-16 — Plan updated: Next Route Handlers + Nasiko API (see [[../plans/challenge-2-agent-metrics-page]])
- 2026-05-16 — Research **completed** (`status: done`): Findings refreshed from Phase A spike; open questions trimmed to Execute-only; Plan consumed this note
- 2026-05-16 — Phase A spike outcomes merged from [[../sessions/2026-05-16-challenge-2-agent-metrics-page]]
- 2026-05-16 — Research drafted; status set to `active`
