import { describe, expect, it } from "vitest";
import {
  buildAgentMetrics,
  buildSeries24h,
  isSessionError,
  rollupSessionCounts,
} from "@/lib/rollup";
import type {
  NasikoAgentProjectStats,
  NasikoObservabilitySession,
} from "@/lib/types";

const NOW = Date.parse("2026-05-16T14:30:00.000Z");

describe("isSessionError", () => {
  it("detects error text in last_output", () => {
    expect(
      isSessionError({
        last_output: { value: "Sorry, an error occurred while processing" },
      }),
    ).toBe(true);
  });

  it("treats normal output as success", () => {
    expect(
      isSessionError({
        last_output: { value: "Hola — translation complete." },
      }),
    ).toBe(false);
  });
});

describe("rollupSessionCounts", () => {
  it("sums traces into success and error buckets", () => {
    const sessions: NasikoObservabilitySession[] = [
      { num_traces: 2, last_output: { value: "ok" } },
      {
        num_traces: 1,
        last_output: { value: "Error code: 401 - Missing Authentication header" },
      },
    ];
    expect(rollupSessionCounts(sessions)).toEqual({ success: 2, error: 1 });
  });
});

describe("buildSeries24h", () => {
  it("fills hourly buckets for session activity", () => {
    const sessions: NasikoObservabilitySession[] = [
      {
        start_time: "2026-05-16T13:15:00.000Z",
        num_traces: 2,
        trace_latency_ms_p50: 1000,
        last_output: { value: "done" },
      },
      {
        start_time: "2026-05-16T13:45:00.000Z",
        num_traces: 1,
        trace_latency_ms_p50: 2000,
        last_output: { value: "Error: failed" },
      },
    ];

    const series = buildSeries24h(sessions, 24, NOW);
    expect(series).toHaveLength(24);

    const active = series.filter((p) => p.success != null || p.error != null);
    expect(active.length).toBeGreaterThanOrEqual(1);

    const hour13 = series.find((p) => p.ts === "2026-05-16T13:00:00.000Z");
    expect(hour13?.success).toBe(2);
    expect(hour13?.error).toBe(1);
    expect(hour13?.latency_ms).toBe(1500);
  });
});

describe("buildAgentMetrics", () => {
  it("merges stats and sessions into dashboard shape", () => {
    const project: NasikoAgentProjectStats = {
      trace_count: 4,
      latency_ms_p50: 3595,
      latency_ms_p99: 4977.8,
    };
    const sessions: NasikoObservabilitySession[] = [
      {
        agent_id: "a2a-translator",
        start_time: "2026-05-16T13:00:00.000Z",
        num_traces: 3,
        trace_latency_ms_p50: 3000,
        last_output: { value: "ok" },
      },
      {
        agent_id: "a2a-translator",
        start_time: "2026-05-16T13:30:00.000Z",
        num_traces: 1,
        trace_latency_ms_p50: 4000,
        last_output: { value: "Error code: 500" },
      },
    ];

    const metrics = buildAgentMetrics({
      agentId: "a2a-translator",
      window: "24h",
      hours: 24,
      project,
      sessions,
      uptimePct: 100,
      uptimeMeta: {
        successful_checks: 1,
        recorded_checks: 1,
        expected_checks_24h: 288,
        poll_interval_minutes: 5,
        current_health: true,
      },
      now: NOW,
    });

    expect(metrics.agent).toBe("a2a-translator");
    expect(metrics.success).toBe(3);
    expect(metrics.error).toBe(1);
    expect(metrics.avg_latency_ms).toBe(3500);
    expect(metrics.uptime_pct).toBe(100);
    expect(metrics.series_24h).toHaveLength(24);
    expect(metrics.source?.trace_count).toBe(4);
  });
});
