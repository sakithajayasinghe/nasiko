---
title: Nasiko Platform Overview
type: architecture
status: active
tags: [nasiko, architecture]
created: 2026-05-16
updated: 2026-05-16
---

# Nasiko Platform Overview

High-level map of the control plane. Detail lives in code (`README.md`) and linked notes as they are added.

## Major components

| Component | Path | Role |
|-----------|------|------|
| App API | `app/` | Registry, agents, operations, observability routes |
| Agent gateway | `agent-gateway/` | Kong, router, chat history |
| CLI | `cli/` | Deploy, K8s, agent management |
| Agents | `agents/` | Sample A2A agents |
| Orchestrator | `orchestrator/` | Docker/registry helpers |

## Related

- [[index]]
- [[decisions/_index]]

## Log

- 2026-05-16 — Stub overview; expand with diagrams and flows as subsystems are documented
