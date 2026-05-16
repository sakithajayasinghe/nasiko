---
title: How to Write a Cursor Rule
type: reference
status: active
tags: [nasiko, cursor-rules, reference]
created: 2026-05-16
updated: 2026-05-16
---

# How to Write a Cursor Rule

Persisted research from 2026-05-16 on Cursor's `.mdc` rule format and current best practices. Used as the basis for the `phased-development` rule family.

## File location and naming

- Path: `.cursor/rules/<kebab-name>.mdc`
- One concern per file; split rather than grow past ~500 lines
- Folder grouping is allowed for larger rule sets: `.cursor/rules/<area>/<kebab-name>.mdc`

## Frontmatter

```yaml
---
description: <when this rule should apply — be specific>
globs: <comma-separated minimatch patterns>     # optional
alwaysApply: <true | false>                     # optional, default false
---
```

Keep `description` under ~200 characters. The agent reads it when deciding whether to load the rule, so be concrete: name the scenarios, not "code style".

## Activation modes (four)

| Mode | Frontmatter shape | When it loads |
|------|-------------------|---------------|
| **Always** | `alwaysApply: true` | Every chat/agent request. Use for short, foundational instructions only — every token is paid on every request. |
| **Auto-attached** | `globs:` set, `alwaysApply: false` | When a file matching the glob is in context. Use recursive globs (`**/*.ts`, not `*.ts`). |
| **Agent-requested** | `description:` only, no `globs`, no `alwaysApply` | The agent loads it when the description matches the task. Description quality is everything here. |
| **Manual** | None of the above (or all empty) | Only when the user types `@rule-name`. |

## Best practices (2026)

- 5–8 rules total is the sweet spot. One Always-on base, 3–4 auto-attached, 1–2 manual/agent-requested.
- Always-on rules should be short. Long Always rules waste tokens on every request.
- Use recursive glob patterns for subdirectories (`**/Chart.yaml`, not `Chart.yaml`).
- Test each rule: open a relevant file, ask Cursor to do something the rule covers, check it followed.
- Rules apply to chat and agent. They do **not** apply to inline edits (Cmd/Ctrl+K) or Tab autocomplete.
- Audit quarterly. Prune rules that aren't earning their tokens.

## Common pitfalls

- Vague descriptions on agent-requested rules ("Error handling rules") — the agent can't tell when to load them
- Glob patterns without `**/` — they only match the top level
- Single mega-rule with everything in it — split by concern
- Stripping frontmatter while editing — Cursor needs it to know the activation mode

## Phased-workflow design notes (this repo)

Decisions taken when authoring `phased-development.mdc` and friends:

- **One Always orchestrator** that just states the phase gate and points at three detail rules. Keeps the always-on token cost small.
- **Three agent-requested detail rules** (`phase-research`, `phase-plan`, `phase-execute`) with rich descriptions naming the trigger phrases ("research", "plan", "implement"). The agent loads only the phase it needs.
- **No globs** on the phase rules — they're task-driven, not file-driven. The existing `obsidian-knowledge-base.mdc` already auto-attaches on `vault/**/*.md` to enforce vault conventions when the agent writes the persisted notes.

## Sources

- [Cursor Docs — Rules](https://cursor.com/docs/rules)
- [Cursor Docs — Plan Mode](https://cursor.com/docs/agent/plan-mode)
- [Cursor Blog — Agent best practices](https://cursor.com/blog/agent-best-practices)
- [Cursor Rules: Complete .mdc Guide & 15 Templates (2026)](https://www.vibecodingacademy.ai/blog/cursor-rules-complete-guide)
- [Cursor Rules: Write .cursor/rules That Work (2026) — TECHSY](https://techsy.io/en/blog/cursor-rules-guide)
- [awesome-cursor-rules-mdc reference (GitHub)](https://github.com/sanjeed5/awesome-cursor-rules-mdc/blob/main/cursor-rules-reference.md)
- [Comprehensive Cursor Rules Best Practices Guide — Lambda Curry](https://www.lambdacurry.dev/blog/comprehensive-cursor-rules-best-practices-guide)

## Related

- [[phased-development-workflow]]
- [[../index]]

## Log

- 2026-05-16 — Research findings persisted from web search + existing repo rules
