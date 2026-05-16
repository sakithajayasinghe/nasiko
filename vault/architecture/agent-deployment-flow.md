---
title: Agent Deployment Flow
type: architecture
status: active
tags: [nasiko, architecture, agents, deployment]
created: 2026-05-16
updated: 2026-05-16
---

# Agent Deployment Flow

End-to-end path from upload to a routable agent behind Kong.

## Sequence

```mermaid
sequenceDiagram
  participant U as User (Web/CLI)
  participant API as FastAPI Backend
  participant R as Redis Stream
  participant B as Build (BuildKit/K8s)
  participant K8s as Kubernetes
  participant KR as Kong Registry
  participant Kong as Kong :9100

  U->>API: Upload ZIP / directory
  API->>R: Enqueue build job
  R->>B: Build container image
  B->>K8s: Deploy agent workload
  K8s->>KR: Register service
  KR->>Kong: Create /agents/{name}/ route
  U->>Kong: Query agent or use router
```

## Agent package requirements

Every deployable agent needs at minimum:

- `AgentCard.json` — capabilities, examples, endpoints (routing input)
- `Dockerfile`
- `pyproject.toml`
- `src/main.py` — FastAPI entry with `/health`

See [[reference/sample-agents]] and `README.md#-agent-development`.

## Status lifecycle (UI)

| Status | Meaning |
|--------|---------|
| Setting Up | Upload received; image build in progress |
| Active | Running; reachable via Kong |
| Failed | Build or deploy error — check logs |

Typical local time: **1–2 minutes** after upload.

## Code touchpoints

| Step | Location |
|------|----------|
| Upload API | `app/service/agent_upload_service.py` |
| Upload tracking | `app/service/agent_upload_tracking_service.py` |
| K8s build worker | `worker/k8s_build_worker.py` |
| Docker helpers | `orchestrator/docker_utils.py` |
| Registry | `orchestrator/registry_manager.py` |

## CLI equivalents

```bash
nasiko agent upload-directory ./agents/a2a-translator --name translator
nasiko agent upload-zip agents/a2a-translator.zip --name translator
nasiko agent list
```

## Related

- [[architecture/query-routing]]
- [[reference/local-development]]
- [[reference/troubleshooting#agent-stuck-in-setting-up-or-failed]]

## Log

- 2026-05-16 — Flow documented from README data-flow section
