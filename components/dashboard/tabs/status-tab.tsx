"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

type StatusData = {
  uptime: string;
  model: string;
  tokensToday: number;
  costToday: number;
  activeChannels: string[];
  lastActivity: string;
  status: "online" | "offline" | "degraded";
};

const statusColors: Record<string, string> = {
  online: "bg-emerald-500",
  offline: "bg-red-500",
  degraded: "bg-yellow-500",
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
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-sm text-muted-foreground">Loading status...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-sm text-muted-foreground">Unable to reach gateway</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-3">
        <span
          className={`h-3 w-3 rounded-full ${statusColors[data.status] ?? statusColors.offline}`}
        />
        <h2 className="text-lg font-semibold">Agent Status</h2>
        <Badge
          className="font-mono text-xs"
          variant={data.status === "online" ? "default" : "destructive"}
        >
          {data.status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Uptime
          </p>
          <p className="font-mono text-sm font-medium">{data.uptime}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Last Activity
          </p>
          <p className="font-mono text-sm font-medium">
            {formatTimeAgo(data.lastActivity)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Tokens Today
          </p>
          <p className="font-mono text-sm font-medium">
            {formatTokens(data.tokensToday)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Cost Today
          </p>
          <p className="font-mono text-sm font-medium">
            ${(data.costToday ?? 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs uppercase tracking-wider text-muted-foreground">
          Model
        </p>
        <Badge className="font-mono text-xs" variant="secondary">
          {data.model}
        </Badge>
      </div>

      <div>
        <p className="mb-1.5 text-xs uppercase tracking-wider text-muted-foreground">
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
    </div>
  );
};
