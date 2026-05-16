---
title: CLI Cheatsheet
type: reference
status: active
tags: [nasiko, reference, cli]
created: 2026-05-16
updated: 2026-05-16
---

# CLI Cheatsheet

Install from repo root: `uv sync` (includes CLI). Standalone: `cd cli && pip install -e .`

## Setup

```bash
export NASIKO_API_URL=http://localhost:9100
nasiko login          # uses superuser credentials file
nasiko status
```

## Agents

```bash
nasiko agent upload-directory ./my-agent --name my-agent
nasiko agent upload-zip agent.zip --name packaged-agent
nasiko agent list
nasiko agent get --name my-agent
```

## GitHub

```bash
nasiko github repos
nasiko github clone owner/repo --branch main
```

## Observability

```bash
nasiko observability sessions
```

## Infrastructure (K8s)

```bash
nasiko setup bootstrap --provider digitalocean --region nyc3
```

## Code layout

- CLI package: `cli/`
- Command groups: `cli/groups/`, `cli/commands/`
- Binary build: `cli/BINARY_BUILD_GUIDE.md`

## Related

- [[reference/local-development]]
- [[architecture/agent-deployment-flow]]

## Log

- 2026-05-16 — Commands from README CLI section
