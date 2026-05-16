---
title: Nasiko Titan Builder Challenge (Hackathon)
type: feature
status: active
tags: [nasiko, hackathon, buildathon, feature]
created: 2026-05-16
updated: 2026-05-16
---

# Nasiko Titan Builder Challenge

Official award track from **Nasiko** (award partner). Participants build during the **24H buildathon**; the Nasiko team judges and presents the award **live on stage**.

## Pick one challenge

| # | Name | Est. time | Feature spec | Pick |
|---|------|-----------|----------------|------|
| 1 | [[challenge-1-logging-dashboard|Simple Logging Dashboard]] | 4–6 h | [[challenge-1-logging-dashboard]] | fallback |
| 2 | [[challenge-2-agent-metrics-page|Agent Performance Metrics Page]] | 5–7 h | [[challenge-2-agent-metrics-page]] | **selected** |

You only need to **complete one** challenge for the award track (unless organizers say otherwise).

**Decision:** Challenge 2 selected for the 24h buildathon — see [[../decisions/0002-hackathon-pick-challenge-2]] for reasoning, locked formulas, and the H0–24 plan. Challenge 1 remains a documented fallback if the H0–2 spike rules out reaching a new React page from the logged-in shell.

## Participation checklist

- [ ] **Fork** [Nasiko on GitHub](https://github.com/Nasiko-Labs/nasiko)
- [ ] **Star** the repo (mandatory for giveaways)
- [ ] **Build** your solution during the 24H buildathon
- [ ] **PR** to the main repo before submission deadline

### Git workflow (from quickstart)

1. Fork → clone your fork
2. Create a feature branch
3. Commit and push to your fork
4. Open PR to `Nasiko-Labs/nasiko` **main**

See also: `Nasiko Quickstart Guide.md`, [[../reference/local-development|local development]].

## Local setup (required to build & demo)

```bash
cp .nasiko-local.env.example .nasiko-local.env
uv sync
docker compose -f docker-compose.local.yml --env-file .nasiko-local.env up -d
```

Dashboard: http://localhost:9100/app/

## Web UI stack note

| Source | Stack |
|--------|--------|
| Challenge brief | React / TypeScript |
| This repo’s running UI | Flutter web in Docker image `nasiko-web` (`HOW_TO_RUN_AGENT.md`) |

`web/` source is referenced in `cli/groups/images_group.py` (`web/Dockerfile`) but may live in another branch or repo snapshot. **Before coding:** locate where the hackathon expects UI changes (fork’s `web/`, separate frontend repo, or new page module). Align with organizers if the brief assumes React but your fork only ships the Flutter image.

## Backend / data hints (both challenges)

| Area | Location |
|------|----------|
| Observability API (sessions, traces, spans) | `app/api/routes/observability_routes.py` |
| Phoenix proxy / metrics | `app/api/handlers/` (observability handler) |
| Agent registry & health | `app/api/routes/`, Kong `/agents/{name}/health` |
| Platform logs | Docker: `docker compose ... logs`; may need new API for structured platform logs |

## Related

- [[../index]]
- [[challenge-1-logging-dashboard]]
- [[challenge-2-agent-metrics-page]]
- [[../reference/local-development]]

## Log

- 2026-05-16 — Challenge 2 selected; see [[../decisions/0002-hackathon-pick-challenge-2]]
- 2026-05-16 — Hackathon overview documented from builder brief + quickstart guide
