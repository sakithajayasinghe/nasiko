"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { formatHourLabel, formatLatencyMs } from "@/lib/format";
import type { MetricsHourlyPoint } from "@/lib/types";

type Props = {
  series: MetricsHourlyPoint[];
  loading?: boolean;
  noData?: boolean;
};

type ChartRow = {
  label: string;
  ts: string;
  latency_ms: number | null;
  success: number | null;
  error: number | null;
};

function formatBucketRange(iso: string): string {
  const start = new Date(iso);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const startLabel = start.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const endLabel = end.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${startLabel} – ${endLabel}`;
}

function ChartTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }
  const row = payload[0].payload as ChartRow;
  const hasLatency = row.latency_ms != null && Number.isFinite(row.latency_ms);
  return (
    <div className="chart-tooltip" role="tooltip">
      <p className="chart-tooltip__time">{formatBucketRange(row.ts)}</p>
      <dl className="chart-tooltip__rows">
        <div>
          <dt>Latency (p50)</dt>
          <dd>{hasLatency ? formatLatencyMs(row.latency_ms) : "no data"}</dd>
        </div>
        <div>
          <dt>Success</dt>
          <dd>{row.success != null ? row.success.toLocaleString() : "—"}</dd>
        </div>
        <div>
          <dt>Errors</dt>
          <dd className={row.error && row.error > 0 ? "chart-tooltip__err" : ""}>
            {row.error != null ? row.error.toLocaleString() : "—"}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function LatencyChart({ series, loading, noData }: Props) {
  const data: ChartRow[] = series.map((point) => ({
    label: formatHourLabel(point.ts),
    ts: point.ts,
    latency_ms: point.latency_ms,
    success: point.success,
    error: point.error,
  }));

  const hasPoints = data.some((d) => d.latency_ms != null);

  if (loading) {
    return (
      <section className="panel" aria-busy="true">
        <h2 className="panel__title">Latency (24h)</h2>
        <p className="panel__hint">Loading chart…</p>
        <div className="chart-skeleton" aria-hidden="true" />
      </section>
    );
  }

  if (noData || !hasPoints) {
    return (
      <section className="panel">
        <h2 className="panel__title">Latency (24h)</h2>
        <p className="panel__hint">
          No hourly latency yet for this agent. Send the agent a message to start
          generating traces — each hour fills its own bucket as sessions arrive.
        </p>
      </section>
    );
  }

  return (
    <section className="panel" aria-label="24 hour latency line chart">
      <h2 className="panel__title">Latency (24h)</h2>
      <p className="sr-only">
        Hourly p50 latency for the last 24 hours, with success and error counts per
        bucket. Use a screen reader&apos;s table mode to read individual values, or hover
        any point with the keyboard for details.
      </p>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              interval="preserveStartEnd"
              minTickGap={28}
            />
            <YAxis
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(Number(v) / 1000).toFixed(1)}s`}
              width={44}
              label={{
                value: "Latency",
                angle: -90,
                position: "insideLeft",
                offset: 12,
                style: { fill: "var(--muted)", fontSize: 11 },
              }}
            />
            <Tooltip
              cursor={{ stroke: "var(--border)", strokeDasharray: "3 3" }}
              content={<ChartTooltip />}
            />
            <Line
              type="monotone"
              dataKey="latency_ms"
              name="Latency (p50)"
              stroke="var(--accent)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--accent)" }}
              activeDot={{ r: 5 }}
              connectNulls={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="chart-legend" aria-hidden="true">
        Each point is one hourly bucket · Latency in milliseconds (Y axis shown in seconds)
      </p>
    </section>
  );
}
