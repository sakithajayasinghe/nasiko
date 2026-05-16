---
title: Services and Ports
type: architecture
status: active
tags: [nasiko, architecture, ports]
created: 2026-05-16
updated: 2026-05-16
---

# Services and Ports

Default local ports from `.nasiko-local.env.example`. Override via `NASIKO_PORT_*` env vars.

## User-facing

| Port | Service | URL / usage |
|------|---------|-------------|
| 9100 | Kong proxy | **Primary entry** — `http://localhost:9100` |
| 9100 | Web app | `http://localhost:9100/app/` |
| 9100 | Agent routes | `http://localhost:9100/agents/{name}/...` |
| 9100 | Router | `http://localhost:9100/router/route?query=...` |
| 9100 | Backend API (via Kong) | `http://localhost:9100/api/...` |
| 6006 | Phoenix UI | `http://localhost:6006` (also via platform) |

## Internal / admin

| Port | Service | Purpose |
|------|---------|---------|
| 8000 | FastAPI backend | Direct API (`/api/v1/healthcheck`) |
| 8081 | Router | LangChain routing engine |
| 8082 | Auth | JWT, GitHub OAuth |
| 8083 | Chat history | Conversation persistence |
| 8080 | Kong registry | Service discovery, auto-registration |
| 9101 | Kong Admin API | Gateway config |
| 9102 | Kong Manager | Kong GUI |
| 27017 | MongoDB | Agent metadata, users, chat |
| 6379 | Redis | Sessions, queues, pub/sub |

## Kong route patterns

| Pattern | Target |
|---------|--------|
| `/agents/{name}/` | Deployed agent container |
| `/api/` | Backend API |
| `/router/` | Router service |
| `/auth/` | Auth service |
| `/app/` | Web dashboard |
| `/n8n/` | N8N workflows (if enabled) |
| `/` | Redirect to `/app/` |

See also `agent-gateway/README.md` for standalone Kong development.

## Related

- [[reference/local-development]]
- [[reference/environment-variables]]
- [[architecture/overview]]

## Log

- 2026-05-16 — Port table added from env example and README
