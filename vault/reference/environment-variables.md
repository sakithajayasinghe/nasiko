---
title: Environment Variables
type: reference
status: active
tags: [nasiko, reference, env]
created: 2026-05-16
updated: 2026-05-16
---

# Environment Variables

Reference for `.nasiko-local.env` (from `.nasiko-local.env.example`). **Never paste secret values into vault notes.**

## Required for local bootstrap

| Variable | Purpose |
|----------|---------|
| `MONGO_ROOT_USER` / `MONGO_ROOT_PASSWORD` | MongoDB admin |
| `MONGO_AUTH_DB` / `MONGO_CHAT_DB` | DB names |
| `JWT_SECRET` | Auth tokens |
| `USER_CREDENTIALS_ENCRYPTION_KEY` | Base64 encryption key for stored credentials |
| `KONG_DB_NAME` / `KONG_DB_USER` / `KONG_DB_PASSWORD` | Kong Postgres |

## Platform

| Variable | Default / notes |
|----------|-----------------|
| `NASIKO_REGISTRY_URL` | Docker image registry prefix |
| `NASIKO_VERSION` | Image tag |
| `AUTH_MODE` | `simple` for local |
| `K8S_ENABLED` | `false` for local compose |
| `AGENTS_NETWORK` / `APP_NETWORK` | Docker networks |

## Ports (`NASIKO_PORT_*`)

See [[architecture/services-and-ports]] — all prefixed `NASIKO_PORT_` in env file.

## API keys (optional)

| Variable | Used by |
|----------|---------|
| `OPENAI_API_KEY` | Agents + default router |
| `OPENROUTER_API_KEY` | Router / agents |
| `MINIMAX_API_KEY` | Router / agents |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth |

## Router LLM

| Variable | Example |
|----------|---------|
| `ROUTER_LLM_PROVIDER` | `openai`, `openrouter`, `minimax` |
| `ROUTER_LLM_MODEL` | `gpt-4o-mini`, `MiniMax-M2.7` |

## Phoenix

| Variable | Purpose |
|----------|---------|
| `PHOENIX_BASE_URL` | UI |
| `PHOENIX_GRPC_ENDPOINT` | OTLP gRPC |
| `PHOENIX_HTTP_ENDPOINT` | OTLP HTTP |

## Superuser (optional override)

`SUPERUSER_EMAIL`, `SUPERUSER_USERNAME`, `SUPERUSER_PASSWORD` — otherwise auto-generated to `orchestrator/superuser_credentials.json`.

## Related

- [[reference/local-development]]
- [[architecture/query-routing]]

## Log

- 2026-05-16 — Variable catalog from .nasiko-local.env.example
