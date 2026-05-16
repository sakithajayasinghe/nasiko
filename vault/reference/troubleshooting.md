---
title: Troubleshooting
type: reference
status: active
tags: [nasiko, reference, troubleshooting]
created: 2026-05-16
updated: 2026-05-16
---

# Troubleshooting

Common local issues. See also README **Troubleshooting** section for platform-specific fixes.

## Services not healthy

```bash
docker compose -f docker-compose.local.yml --env-file .nasiko-local.env ps
docker compose -f docker-compose.local.yml --env-file .nasiko-local.env logs -f
```

Check [[architecture/services-and-ports]] for expected ports.

## Cannot sign in

- Confirm stack is up: `curl http://localhost:9100/health`
- Read keys from `orchestrator/superuser_credentials.json` (not from vault)
- Verify `JWT_SECRET` and `USER_CREDENTIALS_ENCRYPTION_KEY` are set in `.nasiko-local.env`

## Agent stuck in Setting Up or Failed

- Inspect backend and worker logs in compose output
- Confirm `K8S_ENABLED` / build pipeline matches your setup
- Validate `AgentCard.json` and Dockerfile in the ZIP
- Retry with known-good `agents/a2a-translator.zip`

## Router returns low confidence or wrong agent

- Enrich `examples` and `capabilities` in AgentCard
- Set `OPENAI_API_KEY` (or provider matching `ROUTER_LLM_PROVIDER`)
- See [[architecture/query-routing]]

## Agent reachable on wrong port

Use Kong routes only: `http://localhost:9100/agents/{name}/...` — not random container ports.

## Phoenix shows no traces

- Confirm agent integrates Phoenix SDK
- Check `PHOENIX_*` endpoints in env
- Open http://localhost:6006 after traffic

## Related

- [[reference/local-development]]
- [[reference/environment-variables]]

## Log

- 2026-05-16 — Initial troubleshooting note
