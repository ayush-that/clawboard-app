"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type TaskItem = {
  name: string;
  status: "success" | "failed" | "running";
  startedAt: string;
  duration: number;
  result?: string;
};

const statusVariant: Record<string, "default" | "destructive" | "secondary"> = {
  success: "default",
  failed: "destructive",
  running: "secondary",
};

const statusDots: Record<string, string> = {
  success: "bg-emerald-500",
  failed: "bg-red-500",
  running: "bg-yellow-500 animate-pulse",
};

const formatDuration = (ms: number): string => {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
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
  <div className="mx-auto w-full max-w-3xl space-y-4 p-4 md:p-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-20" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
    {Array.from({ length: 4 }).map((_, i) => (
      <Skeleton className="h-16 w-full rounded-lg" key={`skel-${String(i)}`} />
    ))}
  </div>
);

export const TasksTab = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/openclaw/tasks?range=24h");
      const json = (await res.json()) as TaskItem[];
      setTasks(json);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 10_000);
    return () => {
      clearInterval(interval);
    };
  }, [fetchTasks]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (tasks.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              No recent task executions
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const successCount = tasks.filter((t) => t.status === "success").length;
  const failedCount = tasks.filter((t) => t.status === "failed").length;
  const runningCount = tasks.filter((t) => t.status === "running").length;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Tasks</h2>
        <div className="flex gap-2">
          {successCount > 0 ? (
            <Badge variant="default">{successCount} passed</Badge>
          ) : null}
          {failedCount > 0 ? (
            <Badge variant="destructive">{failedCount} failed</Badge>
          ) : null}
          {runningCount > 0 ? (
            <Badge variant="secondary">{runningCount} running</Badge>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        {tasks.map((task, idx) => (
          <Card
            className="cursor-pointer transition-colors hover:bg-muted/50"
            key={`${task.startedAt}-${task.name}`}
          >
            <button
              className="w-full p-4 text-left"
              onClick={() => {
                setExpanded(expanded === idx ? null : idx);
              }}
              type="button"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusDots[task.status] ?? "bg-muted"}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{task.name}</span>
                      <Badge
                        className="text-xs"
                        variant={statusVariant[task.status] ?? "secondary"}
                      >
                        {task.status}
                      </Badge>
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span className="font-mono">
                        {formatDuration(task.duration)}
                      </span>
                      <span>{formatTimeAgo(task.startedAt)}</span>
                    </div>
                  </div>
                  {expanded === idx && task.result ? (
                    <pre className="mt-3 rounded-md bg-muted/50 p-3 font-mono text-xs text-muted-foreground">
                      {task.result}
                    </pre>
                  ) : null}
                </div>
              </div>
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
};
