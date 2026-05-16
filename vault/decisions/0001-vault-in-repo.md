---
title: ADR 0001 — Obsidian Vault in Repository
type: decision
status: accepted
tags: [nasiko, adr, documentation]
created: 2026-05-16
updated: 2026-05-16
---

# ADR 0001 — Obsidian Vault in Repository

## Status

Accepted

## Context

Nasiko is a large microservices repo. Code and `docs/` explain how to run the system but not always **why** choices were made or **what** is planned. Cursor agents need durable, linkable context for feature work.

## Decision

Maintain an Obsidian-compatible vault at `vault/` in the same git repo as the code:

- Plain Markdown + `[[wiki-links]]`
- Cursor rules in `.cursor/rules/` for vault conventions and sync with implementation
- `.cursorignore` excludes `.obsidian/` and secrets from AI context

## Consequences

### Positive

- Single clone gives code + knowledge graph
- Cursor and Obsidian can both edit the same files
- ADRs and feature specs version with code in PRs

### Negative

- Contributors must avoid committing secrets into vault notes
- `.obsidian/` workspace state may differ per developer (git may track or ignore — prefer local-only)

### Neutral

- `docs/` remains official user-facing docs; vault is for team/agent-oriented depth

## Related

- [[../index]]
- `.cursor/rules/obsidian-knowledge-base.mdc`
- `.cursor/rules/knowledge-base-sync.mdc`

## Log

- 2026-05-16 — ADR accepted when vault was populated
