"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatHourLabel, formatLatencyMs } from "@/lib/format";
import type { MetricsHourlyPoint } from "@/lib/types";

type Props = {
  series: MetricsHourlyPoint[];
  loading?: boolean;
};

type ChartRow = {
  label: string;
  latency_ms: number | null;
};

export function LatencyChart({ series, loading }: Props) {
  const data: ChartRow[] = series.map((point) => ({
    label: formatHourLabel(point.ts),
    latency_ms: point.latency_ms,
  }));

  const hasPoints = data.some((d) => d.latency_ms != null);

  if (loading) {
    return (
      <section className="panel">
        <h2 className="panel__title">Latency (24h)</h2>
        <p style={{ color: "var(--muted)" }}>Loading chart…</p>
      </section>
    );
  }

  if (!hasPoints) {
    return (
      <section className="panel">
        <h2 className="panel__title">Latency (24h)</h2>
        <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
          No hourly latency yet. Chat with this agent to generate traces — buckets
          fill as sessions arrive.
        </p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2 className="panel__title">Latency (24h)</h2>
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
            />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text)",
              }}
              formatter={(value: number) => [formatLatencyMs(value), "Latency"]}
              labelFormatter={(label) => `Hour ${label}`}
            />
            <Line
              type="monotone"
              dataKey="latency_ms"
              stroke="var(--accent)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--accent)" }}
              connectNulls={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
