"use client";

import { formatCount, formatLatencyMs, formatPercent } from "@/lib/format";
import type { AgentMetricsResponse } from "@/lib/types";

type Props = {
  metrics: AgentMetricsResponse | null;
  loading?: boolean;
};

export function KpiCards({ metrics, loading }: Props) {
  const items = [
    {
      label: "Avg response time",
      value: loading ? "…" : formatLatencyMs(metrics?.avg_latency_ms),
      hint: "P50 latency (24h)",
    },
    {
      label: "Success",
      value: loading ? "…" : formatCount(metrics?.success),
      hint: "Traces / sessions",
    },
    {
      label: "Errors",
      value: loading ? "…" : formatCount(metrics?.error),
      hint: "Failed sessions",
    },
    {
      label: "Uptime",
      value: loading ? "…" : formatPercent(metrics?.uptime_pct),
      hint: metrics?.source?.uptime
        ? `${metrics.source.uptime.successful_checks}/${metrics.source.uptime.recorded_checks} checks`
        : "Health polls",
    },
  ];

  return (
    <div className="kpi-grid">
      {items.map((item) => (
        <article key={item.label} className="kpi-card">
          <p className="kpi-card__label">{item.label}</p>
          <p className="kpi-card__value">{item.value}</p>
          <p className="kpi-card__hint">{item.hint}</p>
        </article>
      ))}
    </div>
  );
}
