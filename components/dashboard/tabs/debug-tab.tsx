"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type DebugData = {
  gatewayUrl: string;
  connected: boolean;
  statusText: string;
  sessionCount: number;
  timestamp: string;
};

const LoadingSkeleton = () => (
  <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-6">
    <div className="flex items-center gap-3">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-5 w-20 rounded-full" />
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton
          className="h-20 w-full rounded-lg"
          key={`skel-${String(i)}`}
        />
      ))}
    </div>
  </div>
);

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
    return <LoadingSkeleton />;
  }

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              Unable to fetch debug info
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold">Debug</h2>
        <Badge variant={data.connected ? "default" : "destructive"}>
          {data.connected ? "connected" : "disconnected"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Gateway URL</p>
            <p className="mt-1 truncate font-mono text-sm">{data.gatewayUrl}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Active Sessions</p>
            <p className="mt-1 font-mono text-lg font-semibold">
              {data.sessionCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Last Check</p>
            <p className="mt-1 font-mono text-sm">
              {new Date(data.timestamp).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Connection</p>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${data.connected ? "bg-emerald-500" : "bg-red-500"}`}
              />
              <span className="font-mono text-sm">
                {data.connected ? "Online" : "Offline"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {data.statusText ? (
        <Card>
          <CardContent className="p-4">
            <p className="mb-3 text-xs text-muted-foreground">Raw Status</p>
            <Separator className="mb-3" />
            <pre className="whitespace-pre-wrap font-mono text-xs text-muted-foreground">
              {data.statusText}
            </pre>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};
