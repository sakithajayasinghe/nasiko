/** Shapes from Nasiko `GET /api/v1/registry/user/agents` (SimpleUserAgentsResponse). */

export type NasikoSimpleUserAgent = {
  agent_id: string;
  name: string;
  icon_url?: string | null;
  tags?: string[];
  description?: string | null;
};

export type NasikoSimpleUserAgentsResponse = {
  data: NasikoSimpleUserAgent[];
  status_code: number;
  message: string;
};

/** Normalized agent for the metrics UI dropdown. */
export type MetricsAgentOption = {
  agentId: string;
  name: string;
  description?: string | null;
  tags: string[];
};

/** Nasiko `GET /api/v1/observability/agent/{id}/stats` → `data.project`. */
export type NasikoAgentProjectStats = {
  trace_count?: number;
  latency_ms_p50?: number | null;
  latency_ms_p99?: number | null;
  cost_summary?: {
    total?: { cost?: number };
    prompt?: { cost?: number };
    completion?: { cost?: number };
  };
  span_annotation_names?: string[];
  id?: string;
};

export type NasikoAgentStatsResponse = {
  data: {
    project: NasikoAgentProjectStats;
  };
};

/** Nasiko `GET /api/v1/observability/session/list` session node (snake_case). */
export type NasikoObservabilitySession = {
  agent_id?: string;
  session_id?: string;
  num_traces?: number;
  start_time?: string;
  end_time?: string;
  trace_latency_ms_p50?: number | null;
  trace_latency_ms_p99?: number | null;
  last_output?: { value?: string } | string | null;
  session_annotation_summaries?: Array<{
    name?: string;
    mean_score?: number | null;
    label_fractions?: Array<{ label?: string; fraction?: number }>;
  }>;
};

export type NasikoObservabilitySessionsResponse = {
  data: {
    sessions: NasikoObservabilitySession[];
    total_agents?: number;
    successful_agents?: number;
  };
};

export type MetricsSourceMeta = {
  trace_count: number;
  latency_ms_p50: number | null;
  latency_ms_p99: number | null;
  session_count?: number;
  uptime?: {
    successful_checks: number;
    recorded_checks: number;
    expected_checks_24h: number;
    poll_interval_minutes: number;
    current_health: boolean;
  };
};

export type MetricsHourlyPoint = {
  ts: string;
  latency_ms: number | null;
  success: number | null;
  error: number | null;
};

/** Dashboard JSON from `GET /api/metrics` (B4 contract; B5–B6 fill series/uptime). */
export type AgentMetricsResponse = {
  agent: string;
  window: string;
  avg_latency_ms: number | null;
  success: number;
  error: number;
  uptime_pct: number | null;
  series_24h: MetricsHourlyPoint[];
  source?: MetricsSourceMeta;
  /** True when Phoenix project missing or no traces in window. */
  no_data?: boolean;
  message?: string;
};
