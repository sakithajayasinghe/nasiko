---
title: Sample Agents
type: reference
status: active
tags: [nasiko, reference, agents, a2a]
created: 2026-05-16
updated: 2026-05-16
---

# Sample Agents

Bundled under `agents/` for learning and smoke tests. Protocol: **A2A v1** (`agent_protocol_version` in AgentCard).

## Catalog

| Agent | Directory | ZIP | Purpose |
|-------|-----------|-----|---------|
| Translator | `agents/a2a-translator/` | `agents/a2a-translator.zip` | Language translation (first-agent tutorial) |
| Compliance checker | `agents/a2a-compliance-checker/` | — | Document policy compliance |
| GitHub agent | `agents/a2a-github-agent/` | — | GitHub repo operations |

## AgentCard (routing)

Router uses `capabilities`, `tags`, `examples`, and `endpoints` from each agent's `AgentCard.json`. Keep examples close to real user queries.

Minimal shape:

```json
{
  "name": "translator",
  "description": "...",
  "capabilities": ["translation"],
  "tags": ["nlp"],
  "examples": ["translate this to French"],
  "agent_protocol_version": "a2a-v1",
  "endpoints": { "/health": "Health check" }
}
```

## Webhook agent template

Scaffold for custom agents: `app/utils/templates/a2a-webhook-agent/`

## AgentCard generator

Utility: `app/utils/agentcard_generator/` — see `ARCHITECTURE.md` in that folder.

## Test via Kong

```bash
curl http://localhost:9100/agents/translator/health
curl "http://localhost:9100/router/route?query=translate this to French"
```

## Related

- [[architecture/query-routing]]
- [[architecture/agent-deployment-flow]]
- `HOW_TO_RUN_AGENT.md`

## Log

- 2026-05-16 — Agent catalog from repo agents/ directory
