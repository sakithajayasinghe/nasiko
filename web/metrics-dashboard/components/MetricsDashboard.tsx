"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchAgentMetrics, fetchAgents, MetricsApiError } from "@/lib/api-client";
import {
  clearDevAccessToken,
  getAccessTokenFromStorage,
  setDevAccessToken,
} from "@/lib/auth-client";
import type { AgentMetricsResponse, MetricsAgentOption } from "@/lib/types";
import { KpiCards } from "@/components/KpiCards";
import { LatencyChart } from "@/components/LatencyChart";
import "./metrics-dashboard.css";

const NASIKO_APP_URL =
  process.env.NEXT_PUBLIC_NASIKO_APP_URL ?? "http://localhost:9100/app/";

type LoadState = "idle" | "loading" | "ready" | "error" | "auth";

export function MetricsDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [agents, setAgents] = useState<MetricsAgentOption[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [metrics, setMetrics] = useState<AgentMetricsResponse | null>(null);
  const [state, setState] = useState<LoadState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [devTokenInput, setDevTokenInput] = useState("");

  const resolveToken = useCallback(() => {
    const t = getAccessTokenFromStorage();
    setToken(t);
    return t;
  }, []);

  useEffect(() => {
    resolveToken();
  }, [resolveToken]);

  const loadAgents = useCallback(async (accessToken: string) => {
    const list = await fetchAgents(accessToken);
    setAgents(list);
    if (list.length > 0) {
      setSelectedAgentId((prev) =>
        prev && list.some((a) => a.agentId === prev) ? prev : list[0].agentId,
      );
    }
    return list;
  }, []);

  const loadMetrics = useCallback(
    async (accessToken: string, agentId: string) => {
      if (!agentId) {
        setMetrics(null);
        return;
      }
      const data = await fetchAgentMetrics(accessToken, agentId, "24h");
      setMetrics(data);
      setLastUpdated(new Date());
    },
    [],
  );

  const loadMetricsForAgent = useCallback(
    async (accessToken: string, agentId: string) => {
      setState("loading");
      setErrorMessage(null);
      try {
        await loadMetrics(accessToken, agentId);
        setState("ready");
      } catch (err) {
        if (err instanceof MetricsApiError && err.status === 401) {
          setState("auth");
          setErrorMessage("Session expired. Sign in again or paste a new token.");
          return;
        }
        setState("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to load metrics",
        );
      }
    },
    [loadMetrics],
  );

  const refresh = useCallback(async () => {
    const accessToken = resolveToken();
    if (!accessToken) {
      setState("auth");
      return;
    }

    setState("loading");
    setErrorMessage(null);

    try {
      const list = await loadAgents(accessToken);
      const agentId =
        selectedAgentId && list.some((a) => a.agentId === selectedAgentId)
          ? selectedAgentId
          : (list[0]?.agentId ?? "");

      if (!agentId) {
        setMetrics(null);
        setState("ready");
        return;
      }

      await loadMetrics(accessToken, agentId);
      setState("ready");
    } catch (err) {
      if (err instanceof MetricsApiError && err.status === 401) {
        setState("auth");
        setErrorMessage("Session expired. Sign in again or paste a new token.");
        return;
      }
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to load data");
    }
  }, [loadAgents, loadMetrics, resolveToken, selectedAgentId]);

  useEffect(() => {
    if (!token) {
      setState("auth");
      return;
    }
    void refresh();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDevTokenSave = () => {
    if (!devTokenInput.trim()) {
      return;
    }
    setDevAccessToken(devTokenInput.trim());
    setToken(devTokenInput.trim());
    setState("loading");
  };

  const handleDevTokenClear = () => {
    clearDevAccessToken();
    setDevTokenInput("");
    setToken(null);
    setState("auth");
  };

  if (state === "auth") {
    return (
      <main className="dashboard">
        <header className="dashboard__header">
          <p className="dashboard__eyebrow">Nasiko · Titan Builder Challenge</p>
          <h1 className="dashboard__title">Agent Metrics</h1>
        </header>
        <div className="state-box">
          <h2>Sign in required</h2>
          <p>
            Open the main Nasiko app on the <strong>same host</strong> as this page
            so your session token is available, or paste a JWT for local dev on port
            3003.
          </p>
          <p>
            <a href={NASIKO_APP_URL}>Sign in at {NASIKO_APP_URL}</a>
          </p>
          <div className="auth-panel">
            <label htmlFor="dev-token">Dev token (local port 3003 only)</label>
            <input
              id="dev-token"
              type="password"
              placeholder="Paste access_token from nasiko-credentials-*.json"
              value={devTokenInput}
              onChange={(e) => setDevTokenInput(e.target.value)}
            />
            <small>
              From DevTools → Application → Local Storage on{" "}
              <code>localhost:9100</code>, key <code>nasiko-credentials-…</code>, field{" "}
              <code>access_token</code>.
            </small>
            <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
              <button type="button" className="btn btn--primary" onClick={handleDevTokenSave}>
                Use token
              </button>
              <button type="button" className="btn" onClick={handleDevTokenClear}>
                Clear
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const emptyAgents = state === "ready" && agents.length === 0;
  const noData = metrics?.no_data === true;

  return (
    <main className="dashboard">
      <header className="dashboard__header">
        <p className="dashboard__eyebrow">Nasiko · Titan Builder Challenge</p>
        <h1 className="dashboard__title">Agent Metrics</h1>
        <p className="dashboard__subtitle">
          Per-agent latency, reliability, and uptime over the last 24 hours.
        </p>
      </header>

      <div className="toolbar">
        <div className="field">
          <label htmlFor="agent-select">Agent</label>
          <select
            id="agent-select"
            value={selectedAgentId}
            disabled={state === "loading" || agents.length === 0}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedAgentId(id);
              if (token && id) {
                void loadMetricsForAgent(token, id);
              }
            }}
          >
            {agents.length === 0 ? (
              <option value="">No agents deployed</option>
            ) : (
              agents.map((agent) => (
                <option key={agent.agentId} value={agent.agentId}>
                  {agent.name}
                </option>
              ))
            )}
          </select>
        </div>
        <button
          type="button"
          className="btn btn--primary"
          disabled={state === "loading" || !selectedAgentId}
          onClick={() => void refresh()}
        >
          {state === "loading" ? "Refreshing…" : "Refresh"}
        </button>
        <a className="btn" href={NASIKO_APP_URL}>
          Main app
        </a>
      </div>

      {state === "error" && errorMessage && (
        <div className="state-box state-box--error" style={{ marginBottom: "1rem" }}>
          <h2>Could not load metrics</h2>
          <p>{errorMessage}</p>
          <button type="button" className="btn btn--primary" onClick={() => void refresh()}>
            Retry
          </button>
        </div>
      )}

      {emptyAgents && (
        <div className="state-box" style={{ marginBottom: "1rem" }}>
          <h2>No agents yet</h2>
          <p>Deploy an agent in the main Nasiko UI, then refresh this page.</p>
        </div>
      )}

      {noData && metrics?.message && (
        <div className="state-box" style={{ marginBottom: "1rem" }}>
          <h2>No trace data</h2>
          <p>{metrics.message}</p>
        </div>
      )}

      <KpiCards metrics={metrics} loading={state === "loading"} />

      <LatencyChart
        series={metrics?.series_24h ?? []}
        loading={state === "loading"}
      />

      {lastUpdated && (
        <p className="footer-meta">
          Last updated {lastUpdated.toLocaleString()} · Window {metrics?.window ?? "24h"}
          {metrics?.agent ? ` · ${metrics.agent}` : ""}
        </p>
      )}
    </main>
  );
}
