"use client";

import { formatCount, formatLatencyMs, formatPercent } from "@/lib/format";
import type { AgentMetricsResponse } from "@/lib/types";

type Props = {
  metrics: AgentMetricsResponse | null;
  loading?: boolean;
  noData?: boolean;
};

export function KpiCards({ metrics, loading, noData }: Props) {
  const showPlaceholders = loading || noData || metrics == null;
  const placeholder = loading ? "…" : "—";

  const items = [
    {
      key: "latency",
      label: "Avg response time",
      value: showPlaceholders ? placeholder : formatLatencyMs(metrics?.avg_latency_ms),
      hint: noData
        ? "No traces in window"
        : metrics?.source?.session_count
          ? `P50 across ${metrics.source.session_count.toLocaleString()} sessions`
          : "P50 latency over 24h",
      tone: "neutral" as const,
    },
    {
      key: "success",
      label: "Success",
      value: showPlaceholders ? placeholder : formatCount(metrics?.success),
      hint: noData ? "Awaiting traffic" : "Successful sessions · 24h",
      tone: "good" as const,
    },
    {
      key: "errors",
      label: "Errors",
      value: showPlaceholders ? placeholder : formatCount(metrics?.error),
      hint: noData ? "Awaiting traffic" : "Failed sessions · 24h",
      tone: (metrics?.error ?? 0) > 0 ? ("bad" as const) : ("neutral" as const),
    },
    {
      key: "uptime",
      label: "Uptime",
      value: showPlaceholders ? placeholder : formatPercent(metrics?.uptime_pct),
      hint: metrics?.source?.uptime
        ? `${metrics.source.uptime.successful_checks}/${metrics.source.uptime.recorded_checks} health checks`
        : noData
          ? "Waiting on first health poll"
          : "Health poll rolling 24h",
      tone: "neutral" as const,
    },
  ];

  return (
    <div className="kpi-grid" role="list" aria-label="Key performance indicators">
      {items.map((item) => (
        <article
          key={item.key}
          className="kpi-card"
          role="listitem"
          data-tone={item.tone}
          aria-busy={loading || undefined}
        >
          <p className="kpi-card__label">{item.label}</p>
          <p
            className="kpi-card__value"
            aria-label={`${item.label}: ${item.value}`}
          >
            {item.value}
          </p>
          <p className="kpi-card__hint">{item.hint}</p>
        </article>
      ))}
    </div>
  );
}
