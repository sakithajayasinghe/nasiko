import { authHeaders } from "@/lib/auth-client";
import type { AgentMetricsResponse, MetricsAgentOption } from "@/lib/types";

export class MetricsApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "MetricsApiError";
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    return {} as T;
  }
  return JSON.parse(text) as T;
}

export async function fetchAgents(
  token: string,
): Promise<MetricsAgentOption[]> {
  const response = await fetch("/api/agents", {
    headers: authHeaders(token),
    cache: "no-store",
  });
  const body = await parseJson<{
    agents?: MetricsAgentOption[];
    error?: string;
  }>(response);

  if (!response.ok) {
    throw new MetricsApiError(body.error ?? "Failed to load agents", response.status);
  }
  return body.agents ?? [];
}

export async function fetchAgentMetrics(
  token: string,
  agentId: string,
  window = "24h",
): Promise<AgentMetricsResponse> {
  const url = `/api/metrics?agent=${encodeURIComponent(agentId)}&window=${encodeURIComponent(window)}`;
  const response = await fetch(url, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  const body = await parseJson<AgentMetricsResponse & { error?: string }>(response);

  if (!response.ok) {
    throw new MetricsApiError(body.error ?? "Failed to load metrics", response.status);
  }
  return body;
}
