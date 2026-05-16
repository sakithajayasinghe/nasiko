#!/usr/bin/env python3
"""
Synthetic load generator for the Nasiko Agent Metrics dashboard demo (Challenge 2).

What this does
--------------
Drives chat traffic against a deployed Nasiko agent so the metrics dashboard's
24h chart and KPI cards are populated for the demo:

  - sends N requests per minute for T minutes
  - default chat path: POST {KONG}/agents/agent-{agent_id}/chat  (override with --chat-url)
  - optional error injection so the Errors KPI / chart bucket is non-zero (E3)
  - prints per-request status + a final summary

Usage
-----
  python scripts/synthetic_load.py \
    --token "$ACCESS_TOKEN" \
    --agent a2a-translator \
    --rate-per-min 6 \
    --duration-min 30 \
    --error-rate 0.05

  # Or burst a short error window (helps E3 — visible spike in chart):
  python scripts/synthetic_load.py \
    --token "$ACCESS_TOKEN" \
    --agent a2a-translator \
    --rate-per-min 30 \
    --duration-min 2 \
    --error-rate 1.0 \
    --label "error-burst"

Notes
-----
- The default chat URL pattern is a guess that matches Nasiko's Kong layout
  (`/agents/agent-{agent_id}/`). If your agent expects a different sub-path
  (e.g. `/messages`, `/invoke`, A2A `tasks/send`), pass `--chat-url` with the
  full URL or `--chat-path` with the suffix.
- Errors are produced by sending an intentionally malformed payload.
- Ctrl-C exits cleanly and prints the summary so far.
"""

from __future__ import annotations

import argparse
import json
import random
import signal
import sys
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

DEFAULT_BASE_URL = "http://localhost:9100"
DEFAULT_PROMPTS = [
    "Translate 'Hello, how are you?' into French.",
    "Translate 'I would like a coffee, please' into Japanese.",
    "Translate 'The weather is beautiful today' into Spanish.",
    "Translate 'Where is the train station?' into German.",
    "Translate 'Thank you very much for your help' into Italian.",
    "Translate 'See you tomorrow morning' into Portuguese.",
    "Translate 'Can I have the bill, please?' into Korean.",
    "Translate 'I love reading books about history' into Mandarin.",
]


@dataclass
class Stats:
    sent: int = 0
    success: int = 0
    errors: int = 0
    latencies_ms: list[float] = field(default_factory=list)
    started_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        prog="synthetic_load.py",
        description="Generate demo traffic for the Nasiko Agent Metrics dashboard.",
    )
    p.add_argument("--token", required=True, help="Nasiko access_token (Bearer).")
    p.add_argument(
        "--agent",
        required=True,
        help='Registry agentId, e.g. "a2a-translator" (NOT the display name).',
    )
    p.add_argument(
        "--base-url",
        default=DEFAULT_BASE_URL,
        help=f"Kong gateway base URL (default {DEFAULT_BASE_URL}).",
    )
    p.add_argument(
        "--chat-url",
        default=None,
        help="Full URL for chat requests. Overrides --base-url and --chat-path.",
    )
    p.add_argument(
        "--chat-path",
        default="/chat",
        help='Sub-path under /agents/agent-{agent}. Default "/chat".',
    )
    p.add_argument(
        "--rate-per-min",
        type=float,
        default=6.0,
        help="Requests per minute (default 6 — ~1 every 10s).",
    )
    p.add_argument(
        "--duration-min",
        type=float,
        default=30.0,
        help="How long to run, in minutes (default 30).",
    )
    p.add_argument(
        "--error-rate",
        type=float,
        default=0.0,
        help="Probability [0..1] of injecting a malformed payload (default 0).",
    )
    p.add_argument(
        "--timeout-sec",
        type=float,
        default=30.0,
        help="HTTP timeout per request (default 30).",
    )
    p.add_argument(
        "--label",
        default=None,
        help="Optional label printed with each request (e.g. 'error-burst').",
    )
    p.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the request that would be made and exit.",
    )
    return p.parse_args()


def build_chat_url(args: argparse.Namespace) -> str:
    if args.chat_url:
        return args.chat_url
    base = args.base_url.rstrip("/")
    path = args.chat_path if args.chat_path.startswith("/") else f"/{args.chat_path}"
    return f"{base}/agents/agent-{args.agent}{path}"


def build_payload(prompt: str, *, bad: bool) -> bytes:
    if bad:
        # Deliberately malformed: missing required fields, wrong types.
        # This should cause the agent to return a 4xx/5xx and Phoenix to record
        # an errored span — which is what E3 needs.
        return json.dumps({"message": None, "messages": "not-an-array"}).encode("utf-8")

    body = {
        "message": prompt,
        "messages": [{"role": "user", "content": prompt}],
        "input": prompt,
    }
    return json.dumps(body).encode("utf-8")


def send_one(
    *,
    url: str,
    token: str,
    payload: bytes,
    timeout: float,
) -> tuple[int, float, Optional[str]]:
    """Returns (status_code, elapsed_ms, error_message)."""
    req = urllib.request.Request(
        url,
        data=payload,
        method="POST",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    )
    start = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            resp.read()  # drain body
            elapsed = (time.perf_counter() - start) * 1000.0
            return resp.status, elapsed, None
    except urllib.error.HTTPError as e:
        elapsed = (time.perf_counter() - start) * 1000.0
        return e.code, elapsed, e.reason
    except urllib.error.URLError as e:
        elapsed = (time.perf_counter() - start) * 1000.0
        return 0, elapsed, str(e.reason)
    except Exception as e:  # pragma: no cover
        elapsed = (time.perf_counter() - start) * 1000.0
        return -1, elapsed, repr(e)


def print_summary(stats: Stats) -> None:
    duration = (datetime.now(timezone.utc) - stats.started_at).total_seconds()
    avg = (sum(stats.latencies_ms) / len(stats.latencies_ms)) if stats.latencies_ms else 0.0
    p50 = (
        sorted(stats.latencies_ms)[len(stats.latencies_ms) // 2]
        if stats.latencies_ms
        else 0.0
    )
    print()
    print("== synthetic_load summary ==")
    print(f"  duration:   {duration:.1f}s")
    print(f"  sent:       {stats.sent}")
    print(f"  success:    {stats.success}")
    print(f"  errors:     {stats.errors}")
    print(f"  avg ms:     {avg:.0f}")
    print(f"  p50 ms:     {p50:.0f}")


def main() -> int:
    args = parse_args()

    if args.rate_per_min <= 0:
        print("rate-per-min must be > 0", file=sys.stderr)
        return 2
    if args.duration_min <= 0:
        print("duration-min must be > 0", file=sys.stderr)
        return 2
    if not 0.0 <= args.error_rate <= 1.0:
        print("error-rate must be in [0, 1]", file=sys.stderr)
        return 2

    url = build_chat_url(args)
    interval_sec = 60.0 / args.rate_per_min
    total_requests = int(round(args.rate_per_min * args.duration_min))

    label = f" [{args.label}]" if args.label else ""
    print(f"synthetic_load → {url}")
    print(
        f"  rate={args.rate_per_min}/min  duration={args.duration_min}min  "
        f"error-rate={args.error_rate}  total≈{total_requests}{label}"
    )
    if args.dry_run:
        sample = build_payload(DEFAULT_PROMPTS[0], bad=False)
        print(f"  (dry-run) sample payload: {sample.decode()}")
        return 0

    stats = Stats()

    def handle_sigint(_signum, _frame):
        print_summary(stats)
        sys.exit(0)

    signal.signal(signal.SIGINT, handle_sigint)

    deadline = time.monotonic() + args.duration_min * 60.0
    next_send = time.monotonic()

    while time.monotonic() < deadline:
        now = time.monotonic()
        sleep_for = max(0.0, next_send - now)
        if sleep_for > 0:
            time.sleep(sleep_for)

        prompt = random.choice(DEFAULT_PROMPTS)
        inject_error = random.random() < args.error_rate
        payload = build_payload(prompt, bad=inject_error)
        status, elapsed_ms, err = send_one(
            url=url, token=args.token, payload=payload, timeout=args.timeout_sec
        )

        stats.sent += 1
        stats.latencies_ms.append(elapsed_ms)
        ok = 200 <= status < 400 and not inject_error
        if ok:
            stats.success += 1
        else:
            stats.errors += 1

        ts = datetime.now(timezone.utc).strftime("%H:%M:%S")
        marker = "✓" if ok else "✗"
        kind = "ERR" if inject_error else "OK "
        suffix = f" — {err}" if err else ""
        print(
            f"{ts} {marker} {kind} status={status} {elapsed_ms:6.0f}ms{label}{suffix}"
        )

        next_send += interval_sec
        # If we've drifted (e.g. slow agent), don't pile up: realign to now.
        if next_send < time.monotonic() - interval_sec:
            next_send = time.monotonic() + interval_sec

    print_summary(stats)
    return 0


if __name__ == "__main__":
    sys.exit(main())
