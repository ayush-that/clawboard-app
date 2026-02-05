"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type CostDataPoint = {
  date: string;
  tokens: number;
  cost: number;
  model: string;
};

type UsageBySession = {
  sessionKey: string;
  displayName: string;
  channel: string;
  totalTokens: number;
  contextTokens: number;
  updatedAt: number;
};

type ModelBreakdown = {
  model: string;
  tokens: number;
  cost: number;
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
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    try {
      const res = await fetch("/api/openclaw/usage");
      const json = (await res.json()) as Partial<UsageSummary> & {
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(json.message ?? json.error ?? "Request failed");
      }
      setData({
        totalTokens: json.totalTokens ?? 0,
        totalCost: json.totalCost ?? 0,
        modelBreakdown: Array.isArray(json.modelBreakdown)
          ? json.modelBreakdown
          : [],
        dailyCosts: Array.isArray(json.dailyCosts) ? json.dailyCosts : [],
        sessions: Array.isArray(json.sessions) ? json.sessions : [],
      });
      setError(null);
    } catch (error) {
      console.error("Failed to load usage data:", error);
      setError("Failed to load usage data. Check gateway connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  if (loading) {
    return null;
  }

  if (error && !data) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-4 p-4 md:p-6">
        <h2 className="text-xl font-semibold">Usage Analytics</h2>
        <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <span>{error}</span>
          <Button
            className="ml-4 h-7 px-2.5 text-xs"
            onClick={fetchUsage}
            size="sm"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-4 p-4 md:p-6">
        <h2 className="text-xl font-semibold">Usage Analytics</h2>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              Unable to fetch usage data
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Usage Analytics</h2>
        <Button onClick={fetchUsage} size="sm" variant="outline">
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <span>{error}</span>
          <Button
            className="ml-4 h-7 px-2.5 text-xs"
            onClick={fetchUsage}
            size="sm"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      ) : null}

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Tokens</p>
            <p className="mt-1 text-lg font-semibold">
              {formatTokens(data.totalTokens)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Cost</p>
            <p className="mt-1 text-lg font-semibold">
              ${data.totalCost.toFixed(4)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Sessions</p>
            <p className="mt-1 text-lg font-semibold">{data.sessions.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily costs */}
      {data.dailyCosts.length > 0 ? (
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 text-sm font-medium">Daily Breakdown</h3>
            <Separator className="mb-3" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Tokens</th>
                    <th className="pb-2 font-medium">Cost</th>
                    <th className="pb-2 font-medium">Model</th>
                  </tr>
                </thead>
                <tbody>
                  {data.dailyCosts.map((d) => (
                    <tr
                      className="border-b border-border/50"
                      key={`${d.date}-${d.model}`}
                    >
                      <td className="py-2">{d.date}</td>
                      <td className="py-2">{formatTokens(d.tokens)}</td>
                      <td className="py-2">${d.cost.toFixed(4)}</td>
                      <td className="py-2">
                        <Badge className="text-xs" variant="outline">
                          {d.model}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Sessions */}
      {data.sessions.length > 0 ? (
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 text-sm font-medium">By Session</h3>
            <Separator className="mb-3" />
            <div className="space-y-2">
              {data.sessions.map((s) => (
                <div
                  className="flex items-center justify-between rounded-md p-2 hover:bg-muted/50"
                  key={s.sessionKey}
                >
                  <span className="text-sm">
                    {s.displayName || s.sessionKey}
                  </span>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{formatTokens(s.totalTokens)} tokens</span>
                    <span>{formatTimeAgo(s.updatedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};
