/**
 * B5: Roll up Phoenix sessions + project stats into dashboard KPIs and hourly series.
 */

import type {
  AgentMetricsResponse,
  MetricsHourlyPoint,
  MetricsSourceMeta,
  NasikoAgentProjectStats,
  NasikoObservabilitySession,
} from "@/lib/types";

const ERROR_OUTPUT_PATTERN =
  /\b(error|401|403|500|failed|failure)\b|sorry,\s*an error/i;

export function hourStartIso(tsMs: number): string {
  const d = new Date(tsMs);
  d.setUTCMinutes(0, 0, 0);
  return d.toISOString();
}

export function buildHourlyBuckets(hours: number, now = Date.now()): string[] {
  const keys: string[] = [];
  for (let i = hours - 1; i >= 0; i--) {
    keys.push(hourStartIso(now - i * 60 * 60 * 1000));
  }
  return keys;
}

function sessionOutputText(session: NasikoObservabilitySession): string {
  const raw = session.last_output;
  if (typeof raw === "string") {
    return raw;
  }
  return raw?.value ?? "";
}

export function isSessionError(session: NasikoObservabilitySession): boolean {
  const output = sessionOutputText(session);
  if (typeof output === "string" && ERROR_OUTPUT_PATTERN.test(output)) {
    return true;
  }
  const summaries = session.session_annotation_summaries ?? [];
  for (const summary of summaries) {
    const name = (summary.name ?? "").toLowerCase();
    if (name.includes("error") || name.includes("fail")) {
      return true;
    }
    for (const lf of summary.label_fractions ?? []) {
      const label = (lf.label ?? "").toLowerCase();
      if (label.includes("error") || label.includes("fail")) {
        return (lf.fraction ?? 0) > 0.5;
      }
    }
  }
  return false;
}

export function parseSessionStartMs(session: NasikoObservabilitySession): number | null {
  const raw = session.start_time;
  if (!raw) {
    return null;
  }
  const ms = Date.parse(raw);
  return Number.isFinite(ms) ? ms : null;
}

export type RollupCounts = { success: number; error: number };

export function rollupSessionCounts(
  sessions: NasikoObservabilitySession[],
): RollupCounts {
  let success = 0;
  let error = 0;
  for (const session of sessions) {
    const traces = session.num_traces ?? 0;
    if (traces <= 0) {
      continue;
    }
    if (isSessionError(session)) {
      error += traces;
    } else {
      success += traces;
    }
  }
  return { success, error };
}

export function buildSeries24h(
  sessions: NasikoObservabilitySession[],
  hours: number,
  now = Date.now(),
): MetricsHourlyPoint[] {
  const bucketKeys = buildHourlyBuckets(hours, now);
  const buckets = new Map<
    string,
    { latencySum: number; latencyN: number; success: number; error: number }
  >();

  for (const key of bucketKeys) {
    buckets.set(key, { latencySum: 0, latencyN: 0, success: 0, error: 0 });
  }

  const windowStart = now - hours * 60 * 60 * 1000;

  for (const session of sessions) {
    const startMs = parseSessionStartMs(session);
    if (startMs == null || startMs < windowStart || startMs > now) {
      continue;
    }
    const key = hourStartIso(startMs);
    const bucket = buckets.get(key);
    if (!bucket) {
      continue;
    }

    const traces = session.num_traces ?? 0;
    const failed = isSessionError(session);
    if (failed) {
      bucket.error += traces;
    } else {
      bucket.success += traces;
    }

    const latency = session.trace_latency_ms_p50;
    if (latency != null && Number.isFinite(latency) && traces > 0) {
      bucket.latencySum += latency;
      bucket.latencyN += 1;
    }
  }

  return bucketKeys.map((ts) => {
    const b = buckets.get(ts)!;
    const hasActivity = b.success > 0 || b.error > 0;
    return {
      ts,
      latency_ms:
        b.latencyN > 0 ? Math.round(b.latencySum / b.latencyN) : null,
      success: hasActivity ? b.success : null,
      error: hasActivity ? b.error : null,
    };
  });
}

export function averageLatencyFromSessions(
  sessions: NasikoObservabilitySession[],
): number | null {
  let sum = 0;
  let n = 0;
  for (const session of sessions) {
    const latency = session.trace_latency_ms_p50;
    if (latency != null && Number.isFinite(latency) && (session.num_traces ?? 0) > 0) {
      sum += latency;
      n += 1;
    }
  }
  if (n === 0) {
    return null;
  }
  return Math.round(sum / n);
}

export type BuildAgentMetricsInput = {
  agentId: string;
  window: string;
  hours: number;
  project: NasikoAgentProjectStats;
  sessions: NasikoObservabilitySession[];
  uptimePct: number | null;
  uptimeMeta?: MetricsSourceMeta["uptime"];
  now?: number;
};

export function buildAgentMetrics(input: BuildAgentMetricsInput): AgentMetricsResponse {
  const { agentId, window, hours, project, sessions, uptimePct, now = Date.now() } =
    input;

  const sessionCounts = rollupSessionCounts(sessions);
  const traceCount = project.trace_count ?? 0;
  const success =
    sessionCounts.success + sessionCounts.error > 0
      ? sessionCounts.success
      : traceCount;
  const error =
    sessionCounts.success + sessionCounts.error > 0 ? sessionCounts.error : 0;

  const avgFromSessions = averageLatencyFromSessions(sessions);
  const avgLatencyMs =
    avgFromSessions ??
    (project.latency_ms_p50 != null && Number.isFinite(project.latency_ms_p50)
      ? Math.round(project.latency_ms_p50)
      : null);

  return {
    agent: agentId,
    window,
    avg_latency_ms: avgLatencyMs,
    success,
    error,
    uptime_pct: uptimePct,
    series_24h: buildSeries24h(sessions, hours, now),
    source: {
      trace_count: traceCount,
      latency_ms_p50: project.latency_ms_p50 ?? null,
      latency_ms_p99: project.latency_ms_p99 ?? null,
      session_count: sessions.length,
      ...(input.uptimeMeta ? { uptime: input.uptimeMeta } : {}),
    },
  };
}
