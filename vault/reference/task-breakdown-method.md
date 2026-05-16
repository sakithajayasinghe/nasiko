---
title: Task Breakdown Method
type: reference
status: active
tags: [nasiko, planning, method, ai/created]
created: 2026-05-16
updated: 2026-05-16
---

# Task Breakdown Method

How we break a feature into tasks during the [[phased-development-workflow|Plan phase]]. Persisted research from 2026-05-16 on current WBS, agile, and AI-coding-agent decomposition practice. Used as the basis for the task breakdown in [[../plans/_index|plan notes]].

## Principles

1. **Deliverable-oriented, not activity-oriented.** Each task ends in a demonstrable artifact (a file, an endpoint that responds, a screen that renders). Avoid "investigate X" tasks unless they emit a written finding.
2. **Vertical slices over horizontal layers.** Prefer a thin end-to-end slice (data → API → UI) over completing one full layer at a time. Slices keep the demo alive and surface integration risk early.
3. **Atomic and INVEST-shaped.** Each task is Independent, Negotiable, Valuable, Estimable, Small, Testable. If you can't write its acceptance line in one sentence, split it.
4. **Size:** for a 24h hackathon, target 1–2h per task; for normal sprint work, the 8/80 rule (8–80h per work package) holds. Anything bigger is an epic — split first.
5. **One acceptance criterion per task.** Lives next to the task in the plan checklist. Execute phase ticks it with evidence.
6. **Verification baked in.** Each task names how we'll know it's done (unit test, smoke test, screenshot, manual check).
7. **Dependencies are explicit.** If task B blocks on A, the plan says so (`B (blocked by A)`).
8. **Cap at ~5–8 phases per feature.** More than that and the structure is hiding scope creep.

## Phase shape (recommended for non-trivial work)

| Letter | Phase | Purpose | Typical share |
|--------|-------|---------|---------------|
| A | Spike / Discovery | De-risk unknowns named in the research note | ~10% |
| B | Backend / Data | The data path that the UI will consume | ~25% |
| C | Frontend / UX | The visible feature | ~30% |
| D | Polish | States, errors, accessibility, dark mode | ~15% |
| E | Demo / Verify | Synthetic data, walkthrough, screenshots | ~10% |
| F | Submission / Ship | PR, docs, checklist | ~10% |

For a 24h hackathon, treat the percentages as hours-of-24. For longer features, anchor on absolute time estimates.

## Hackathon-specific rules

- **Demo-driven planning.** If a task doesn't make the live demo better or shorter, it's polish — defer it.
- **One-sentence rule.** If you can't pitch the core feature in one sentence, scope is too wide; cut before tasking.
- **Hour budget visible per phase.** Estimates in absolute hours, not story points; judges and teammates can sanity-check at a glance.
- **Buffer last.** Reserve the final 10–15% as buffer for surprises and PR friction.

## AI-coding-agent rules

When the Execute phase will be driven by an AI agent (Claude, Cursor, Aider, etc.):

- **Atomic = one file or one endpoint at a time.** Agents do best when the task names a path and a behavior.
- **Pre-write the test.** Include the test or check in the plan task; the agent runs it after the edit.
- **No silent scope expansion.** Plan tasks are the contract; mid-flight scope changes get logged under "Decisions made mid-flight" in the session note.

## Template stub for a plan's Task breakdown section

```
## Task breakdown

### Phase A — Spike (Hh–h, total Xh)
- [ ] A1 (S, ~30m) <task>
      ✓ <acceptance criterion>
      ↳ blocked by: —
- [ ] A2 (S, ~30m) <task>
      ✓ <acceptance criterion>

### Phase B — Backend (Hh–h, total Xh)
- [ ] B1 (M, ~1h) <task>
      ✓ <acceptance>
      ↳ blocked by: A2
...
```

Use S/M/L tags plus an absolute estimate. Keep acceptance lines testable.

## Sources

- [Work Breakdown Structure: The Ultimate Guide — ProjectManager](https://www.projectmanager.com/guides/work-breakdown-structure)
- [WBS in Traditional and Agile Life Cycles — MPUG](https://mpug.com/work-breakdown-structure-wbs-in-traditional-and-agile-life-cycles-with-ms-project)
- [Breaking Down Large Projects in Agile — AgileSherpas](https://www.agilesherpas.com/blog/agile-work-breakdown)
- [WBS Guide for Projects in 2026](https://work-management.org/project-management/work-breakdown-structure/)
- [WBS for Software Development — Medium](https://medium.com/@noah_henriksen/wbs-for-software-development-8ba193b089b8)
- [User Story Splitting: Vertical vs Horizontal Slice — Visual Paradigm](https://www.visual-paradigm.com/scrum/user-story-splitting-vertical-slice-vs-horizontal-slice/)
- [What is a Vertical Slice? — Monday](https://monday.com/blog/rnd/vertical-slice/)
- [How to Create Task Decomposition — OneUptime](https://oneuptime.com/blog/post/2026-01-30-task-decomposition/view)
- [LLM Agent Task Decomposition Strategies — apxml](https://apxml.com/courses/agentic-llm-memory-architectures/chapter-4-complex-planning-tool-integration/task-decomposition-strategies)
- [A Deep Dive into AI Coding Agents' Task Decomposition Architecture — Medium](https://medium.com/codex/a-deep-dive-into-ai-coding-agents-task-decomposition-architecture-bd42db97bab8)
- [My LLM coding workflow going into 2026 — Addy Osmani](https://addyosmani.com/blog/ai-coding-workflow/)
- [AI Hackathon Planning Template — AngelHack](https://angelhack.com/blog/ai-hackathon-planning-template/)
- [Hackathon planning kit](https://hackathon-planning-kit.org/)

## Related

- [[phased-development-workflow]]
- [[cursor-rules-how-to]]
- [[../plans/_index]]

## Log

- 2026-05-16 — Method captured from 2026 best-practice sources before drafting Challenge 2 task breakdown
