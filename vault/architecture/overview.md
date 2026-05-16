---
title: Nasiko Platform Overview
type: architecture
status: active
tags: [nasiko, architecture]
created: 2026-05-16
updated: 2026-05-16
---

# Nasiko Platform Overview

Nasiko is an **AI agent developer control plane**: registry, deployment, intelligent routing, auth, and observability for containerized agents behind Kong.

## System diagram

```mermaid
flowchart TB
  subgraph UI["User interfaces"]
    Web["Web UI /app/"]
    CLI["CLI nasiko"]
    Desktop["Desktop app"]
  end

  Kong["Kong Gateway :9100"]

  subgraph Core["Core platform"]
    API["FastAPI Backend :8000"]
    Auth["Auth :8082"]
    Registry["Kong Registry :8080"]
  end

  subgraph Intel["Intelligence"]
    Router["Router :8081"]
    Chat["Chat History :8083"]
  end

  subgraph Agents["AI agents (dynamic)"]
    A1["translator"]
    A2["compliance-checker"]
    A3["github-agent"]
    An["..."]
  end

  subgraph Infra["Infrastructure"]
    Mongo[(MongoDB)]
    Redis[(Redis)]
    Phoenix["Phoenix :6006"]
    BuildKit["BuildKit / K8s"]
  end

  UI --> Kong
  Kong --> API
  Kong --> Router
  Kong --> Auth
  Kong --> Agents
  API --> Mongo
  API --> Redis
  API --> BuildKit
  Router --> Agents
  Chat --> Mongo
  Agents --> Phoenix
  Registry --> Kong
```

## Component responsibilities

| Component | Path | Responsibility |
|-----------|------|----------------|
| FastAPI backend | `app/` | Agent registry, upload, K8s orchestration, GitHub OAuth, build pipeline |
| Agent gateway | `agent-gateway/` | Kong, router, chat-history, plugins |
| CLI | `cli/` | Deploy, agents, K8s bootstrap, GitHub helpers |
| Orchestrator | `orchestrator/` | Superuser init, Docker/registry helpers |
| Worker | `worker/` | K8s build worker |
| Sample agents | `agents/` | A2A reference implementations |

## Data flows (summary)

| Flow | Path | Detail |
|------|------|--------|
| Deploy agent | CLI/Web → API → Redis → build → registry → K8s → Kong | [[architecture/agent-deployment-flow]] |
| Route query | User → Kong → Router → LangChain → agent | [[architecture/query-routing]] |
| Observe | Agent → Phoenix SDK → UI + Phoenix UI | [[reference/local-development#observability]] |

## Key entrypoints in code

- API routes: `app/api/routes/`
- Router: `agent-gateway/router/src/main.py`
- Agent registry: `agent-gateway/router/src/core/agent_registry.py`
- Upload service: `app/service/agent_upload_service.py`
- Local compose: `docker-compose.local.yml`

## Related

- [[architecture/services-and-ports]]
- [[reference/sample-agents]]
- [[index]]

## Log

- 2026-05-16 — Expanded with mermaid diagram and code pointers
