"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type StatusData = {
  uptime: string;
  model: string;
  tokensToday: number;
  costToday: number;
  activeChannels: string[];
  lastActivity: string;
  status: "online" | "offline" | "degraded";
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

const formatTimeAgo = (isoDate: string): string => {
  const diff = Date.now() - new Date(isoDate).getTime();
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
    <div className="flex items-center gap-3">
      <Skeleton className="h-3 w-3 rounded-full" />
      <Skeleton className="h-5 w-32" />
    </div>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton
          className="h-20 w-full rounded-lg"
          key={`skel-${String(i)}`}
        />
      ))}
    </div>
    <Skeleton className="h-16 w-full rounded-lg" />
  </div>
);

export const StatusTab = () => {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/openclaw/status");
        const json = (await res.json()) as StatusData;
        setData(json);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 15_000);
    return () => {
      clearInterval(interval);
    };
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
              Unable to reach gateway
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <span
          className={`h-3 w-3 rounded-full ${
            data.status === "online"
              ? "bg-emerald-500"
              : data.status === "degraded"
                ? "bg-yellow-500"
                : "bg-red-500"
          }`}
        />
        <h2 className="text-base font-semibold">Agent Status</h2>
        <Badge
          className="text-xs"
          variant={data.status === "online" ? "default" : "destructive"}
        >
          {data.status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Uptime</p>
            <p className="mt-1 text-lg font-semibold">{data.uptime}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Last Activity</p>
            <p className="mt-1 text-lg font-semibold">
              {formatTimeAgo(data.lastActivity)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Tokens Today</p>
            <p className="mt-1 text-lg font-semibold">
              {formatTokens(data.tokensToday)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Cost Today</p>
            <p className="mt-1 text-lg font-semibold">
              ${(data.costToday ?? 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Model</p>
            <Badge className="text-xs" variant="secondary">
              {data.model}
            </Badge>
          </div>
          <Separator />
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">
              Active Channels
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.activeChannels.map((channel) => (
                <Badge className="text-xs" key={channel} variant="outline">
                  {channel}
                </Badge>
              ))}
              {data.activeChannels.length === 0 && (
                <span className="text-xs text-muted-foreground">None</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
