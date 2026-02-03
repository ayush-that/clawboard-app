"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

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

const LoadingSkeleton = () => (
  <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-6">
    <Skeleton className="h-5 w-36" />
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton
          className="h-20 w-full rounded-lg"
          key={`skel-${String(i)}`}
        />
      ))}
    </div>
    <Skeleton className="h-32 w-full rounded-lg" />
  </div>
);

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
    return <LoadingSkeleton />;
  }

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
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

  const maxTokens = Math.max(...data.modelBreakdown.map((m) => m.tokens), 1);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-6">
      <h2 className="text-base font-semibold">Usage Analytics</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
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

      {/* Model breakdown */}
      {data.modelBreakdown.length > 0 ? (
        <Card>
          <CardContent className="space-y-4 p-4">
            <h3 className="text-sm font-medium">By Model</h3>
            <Separator />
            {data.modelBreakdown.map((m) => (
              <div key={m.model}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm">{m.model}</span>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{formatTokens(m.tokens)} tokens</span>
                    <span>${m.cost.toFixed(4)}</span>
                  </div>
                </div>
                <Progress
                  className="h-2"
                  value={(m.tokens / maxTokens) * 100}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

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
                    <tr className="border-b border-border/50" key={d.date}>
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {s.displayName || s.sessionKey}
                    </span>
                    <Badge className="text-xs" variant="outline">
                      {s.channel}
                    </Badge>
                  </div>
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
