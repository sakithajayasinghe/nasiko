# Platform Logs page

> Nasiko Titan Builder Challenge — Challenge 1 submission.
>
> Per the brief: a new page in the Nasiko web UI showing recent platform logs,
> with a filter for log level (INFO / WARNING / ERROR).
>
> Lives on the same Next.js dashboard as Challenge 2, at the sub-route `/logs`.

## What it does

Opens at `http://localhost:3003/logs` in dev (or `/app/metrics/logs/` once the
metrics container is mounted behind Kong). The page shows the most recent
platform activity with these columns:

- **Time** — readable local timestamp
- **Level** — INFO / WARNING / ERROR (color-coded badge)
- **Service** — `agent:<agentId>` or `registry`
- **Message** — short human-readable summary
- **Session** — short ID for joinable rows
- **Latency** — when available

Filter chips select one or more levels; the search box matches against message,
service, agent, and session text. Clicking a row with structured detail
expands a JSON view.

## Where the data comes from (and where it doesn't)

This page **synthesizes log rows from existing Nasiko observability data** —
not from a separate log pipeline. No Nasiko API changes were made for this
challenge.

For every observability session the dashboard already pulls via
`/api/v1/observability/session/list`:

- A `Request received` **INFO** row is emitted at `start_time`.
- At `end_time`, one of three rows:
  - **INFO** "Completed — …" for successful sessions.
  - **WARNING** "Slow response (Ns)" when the session's p50 latency exceeds 5 s.
  - **ERROR** "Request failed — …" when the existing failure detector flags it
    (`isSessionError` in `lib/rollup.ts` matches error keywords in the output
    or in annotation labels).

For every agent visible to the user via `/api/v1/registry/user/agents`:

- One **INFO** "Agent online · *Name*" row at the snapshot time. Clicking the
  row expands tags and the agent description.

A future iteration can also tail Docker container stdout for full
infrastructure-level logs; we didn't ship that because it requires Docker
socket access from the Next process and wouldn't run in a clean judging
environment. The future-work hook is captured in
[ADR 0003](../vault/decisions/0003-challenge-1-synthesized-event-log.md).

## Filter and search

Filter chips are mutually combinable. Clicking a chip toggles it; if you
deactivate everything, the dashboard re-enables all levels rather than show
nothing.

Search runs entirely client-side over the loaded rows — fast and works while
offline once the page is open.

## API contract

### `GET /api/logs?window=24h`

Bearer required (forwards your Nasiko `access_token`).

Response shape:

```json
{
  "window": "24h",
  "generated_at": "2026-05-17T12:00:00.000Z",
  "total": 142,
  "source_counts": { "sessions": 124, "registry": 18 },
  "logs": [
    {
      "id": "sess:abc-123:end",
      "ts": "2026-05-17T11:58:02.000Z",
      "level": "INFO",
      "service": "agent:a2a-translator",
      "message": "Completed — Bonjour, comment allez-vous?",
      "agent_id": "a2a-translator",
      "session_id": "abc-123",
      "latency_ms": 1421
    }
  ]
}
```

Rows are sorted newest first and capped at 500 entries to keep payloads small.

## Local development

The logs page reuses the same auth flow as the metrics page — see
[docs/metrics-page.md](metrics-page.md) for the dev-token paste workaround on
port 3003.

```bash
cd web/metrics-dashboard
npm run dev
# open http://localhost:3003/logs
```

If you want to populate the page with real-looking traffic before recording the
demo, drive a 30-minute background load with the synthetic-load script
documented under Challenge 2 demo prep:

```bash
python scripts/synthetic_load.py \
  --token "$ACCESS_TOKEN" \
  --agent "$AGENT" \
  --rate-per-min 6 \
  --duration-min 30
```

## Tests

```bash
cd web/metrics-dashboard
npm run test     # includes lib/logs.test.ts
```

Coverage in `lib/logs.test.ts` exercises:
- Session → start + end rows
- Slow-response WARNING downgrade at the 5s threshold
- Errored session ERROR row
- Registry → one INFO per agent
- Newest-first ordering across mixed sources
- `maxRows` cap
- Level filter and free-text search
- `countByLevel` aggregate

## Acceptance criteria (Challenge 1 spec)

1. **New page reachable from the logged-in web app** — `/logs` route on the
   same origin as the metrics dashboard.
2. **Table with multiple log lines and timestamps** — see the columns above.
3. **Filter to INFO / ERROR / WARNING (and show all)** — chip toggles in the
   toolbar; "All" chip reactivates every level.
4. **Readable formatting (not raw JSON only)** — color-coded level badges,
   readable timestamps, plain-language messages; structured details available
   on row click but not in your face.
5. **Solution in fork; PR to main before submission** — see the
   [hackathon submission checklist](../vault/features/hackathon-titan-builder-challenge.md).

## Related

- ADR: `vault/decisions/0003-challenge-1-synthesized-event-log.md`
- Feature: `vault/features/challenge-1-logging-dashboard.md`
- Dev guide: `vault/reference/metrics-dashboard-dev.md`
- Companion page: `docs/metrics-page.md`
