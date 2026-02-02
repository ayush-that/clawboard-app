"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

type DebugData = {
  gatewayUrl: string;
  connected: boolean;
  statusText: string;
  sessionCount: number;
  timestamp: string;
};

export const DebugTab = () => {
  const [data, setData] = useState<DebugData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDebug = async () => {
      try {
        const res = await fetch("/api/openclaw/debug");
        const json = (await res.json()) as DebugData;
        setData(json);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDebug();
    const interval = setInterval(fetchDebug, 15_000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-sm text-muted-foreground">Loading debug info...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-sm text-muted-foreground">
          Unable to fetch debug info
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">Debug Info</h2>
        <Badge variant={data.connected ? "default" : "destructive"}>
          {data.connected ? "connected" : "disconnected"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-border/30 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Gateway URL
          </p>
          <p className="mt-1 font-mono text-sm">{data.gatewayUrl}</p>
        </div>

        <div className="rounded-md border border-border/30 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Active Sessions
          </p>
          <p className="mt-1 font-mono text-sm">{data.sessionCount}</p>
        </div>

        <div className="rounded-md border border-border/30 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Last Check
          </p>
          <p className="mt-1 font-mono text-sm">
            {new Date(data.timestamp).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })}
          </p>
        </div>

        <div className="rounded-md border border-border/30 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Connection
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${data.connected ? "bg-emerald-500" : "bg-red-500"}`}
            />
            <span className="font-mono text-sm">
              {data.connected ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {data.statusText ? (
        <div className="rounded-md border border-border/30 p-4">
          <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
            Raw Status
          </p>
          <pre className="whitespace-pre-wrap font-mono text-xs text-muted-foreground">
            {data.statusText}
          </pre>
        </div>
      ) : null}
    </div>
  );
};
