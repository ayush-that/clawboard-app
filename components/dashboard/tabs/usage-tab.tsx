"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

type CostDataPoint = {
  date: string;
  tokens: number;
  cost: number;
  model: string;
};

type ModelBreakdown = {
  model: string;
  tokens: number;
  cost: number;
};

type UsageBySession = {
  sessionKey: string;
  displayName: string;
  channel: string;
  totalTokens: number;
  contextTokens: number;
  updatedAt: number;
};

type UsageSummary = {
  totalTokens: number;
  totalCost: number;
  modelBreakdown: ModelBreakdown[];
  dailyCosts: CostDataPoint[];
  sessions: UsageBySession[];
};

const formatTokens = (tokens: number): string => {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return String(tokens);
};

const formatTimeAgo = (ts: number): string => {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) {
    return "just now";
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  return `${Math.floor(hours / 24)}d ago`;
};

export const UsageTab = () => {
  const [data, setData] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await fetch("/api/openclaw/usage");
        const json = (await res.json()) as UsageSummary;
        setData(json);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-sm text-muted-foreground">
          Loading usage analytics...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-sm text-muted-foreground">
          Unable to fetch usage data
        </p>
      </div>
    );
  }

  const maxTokens = Math.max(...data.modelBreakdown.map((m) => m.tokens), 1);

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-lg font-semibold">Usage Analytics</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-md border border-border/30 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Total Tokens
          </p>
          <p className="mt-1 font-mono text-lg font-semibold">
            {formatTokens(data.totalTokens)}
          </p>
        </div>
        <div className="rounded-md border border-border/30 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Total Cost
          </p>
          <p className="mt-1 font-mono text-lg font-semibold">
            ${data.totalCost.toFixed(4)}
          </p>
        </div>
        <div className="rounded-md border border-border/30 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Sessions
          </p>
          <p className="mt-1 font-mono text-lg font-semibold">
            {data.sessions.length}
          </p>
        </div>
      </div>

      {/* Model breakdown */}
      {data.modelBreakdown.length > 0 ? (
        <div>
          <h3 className="mb-2 text-sm font-medium">By Model</h3>
          <div className="space-y-2">
            {data.modelBreakdown.map((m) => (
              <div
                className="rounded-md border border-border/30 p-3"
                key={m.model}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono text-sm">{m.model}</span>
                  <div className="flex gap-3 font-mono text-xs text-muted-foreground">
                    <span>{formatTokens(m.tokens)} tokens</span>
                    <span>${m.cost.toFixed(4)}</span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{
                      width: `${(m.tokens / maxTokens) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Daily costs */}
      {data.dailyCosts.length > 0 ? (
        <div>
          <h3 className="mb-2 text-sm font-medium">Daily Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Tokens</th>
                  <th className="pb-2 font-medium">Cost</th>
                  <th className="pb-2 font-medium">Model</th>
                </tr>
              </thead>
              <tbody>
                {data.dailyCosts.map((d) => (
                  <tr className="border-b border-border/10" key={d.date}>
                    <td className="py-2 font-mono">{d.date}</td>
                    <td className="py-2 font-mono">{formatTokens(d.tokens)}</td>
                    <td className="py-2 font-mono">${d.cost.toFixed(4)}</td>
                    <td className="py-2">
                      <Badge className="font-mono text-xs" variant="outline">
                        {d.model}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* Sessions */}
      {data.sessions.length > 0 ? (
        <div>
          <h3 className="mb-2 text-sm font-medium">By Session</h3>
          <div className="space-y-1">
            {data.sessions.map((s) => (
              <div
                className="flex items-center justify-between rounded-md border border-border/30 p-3"
                key={s.sessionKey}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">
                    {s.displayName || s.sessionKey}
                  </span>
                  <Badge className="text-xs" variant="outline">
                    {s.channel}
                  </Badge>
                </div>
                <div className="flex gap-3 font-mono text-xs text-muted-foreground">
                  <span>{formatTokens(s.totalTokens)} tokens</span>
                  <span>{formatTimeAgo(s.updatedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
