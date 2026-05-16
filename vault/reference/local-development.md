---
title: Local Development
type: reference
status: active
tags: [nasiko, reference, dev]
created: 2026-05-16
updated: 2026-05-16
---

# Local Development

Quick runbook for running Nasiko on your machine. Full detail: `docs/getting-started.md` and `README.md`.

## Prerequisites

- Docker & Docker Compose
- Python 3.12+
- ~4 GB RAM

## Bootstrap

```bash
cd nasiko
cp .nasiko-local.env.example .nasiko-local.env
# Edit .nasiko-local.env — see [[reference/environment-variables]]

pip install uv
uv sync

docker compose -f docker-compose.local.yml --env-file .nasiko-local.env up -d
```

## Verify

```bash
docker compose -f docker-compose.local.yml --env-file .nasiko-local.env ps
curl http://localhost:8000/api/v1/healthcheck
curl http://localhost:9100/health
open http://localhost:9100/app/
```

## First login

Credentials are written at `orchestrator/superuser_credentials.json` (gitignored). Use **Access Key** + **Access Secret** at `/app/`.

Do not copy credential values into this vault.

## First agent

1. Web: **Add Agent** → **Upload ZIP** → `agents/a2a-translator.zip`
2. Wait for **Active** in **Your Agents**
3. Test: `curl http://localhost:9100/agents/translator/health`

Or CLI:

```bash
export NASIKO_API_URL=http://localhost:9100
nasiko login
nasiko agent upload-directory ./agents/a2a-translator --name translator
```

## Observability

- Phoenix: http://localhost:6006
- Platform observability in web UI
- CLI: `nasiko observability sessions`

## Related

- [[reference/environment-variables]]
- [[reference/cli-cheatsheet]]
- [[reference/troubleshooting]]
- [[architecture/services-and-ports]]

## Log

- 2026-05-16 — Runbook distilled from getting-started and README
