"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

type TaskItem = {
  name: string;
  status: "success" | "failed" | "running";
  startedAt: string;
  duration: number;
  result?: string;
};

const statusColors: Record<string, "default" | "destructive" | "secondary"> = {
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
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-sm text-muted-foreground">Loading tasks...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-sm text-muted-foreground">
          No recent task executions
        </p>
      </div>
    );
  }

  const successCount = tasks.filter((t) => t.status === "success").length;
  const failedCount = tasks.filter((t) => t.status === "failed").length;
  const runningCount = tasks.filter((t) => t.status === "running").length;

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <div className="flex gap-2 text-xs">
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

      {/* Timeline */}
      <div className="space-y-1">
        {tasks.map((task, idx) => (
          <button
            className="flex w-full items-start gap-3 rounded-md border border-border/30 p-3 text-left transition-colors hover:bg-muted/30"
            key={`${task.startedAt}-${task.name}`}
            onClick={() => {
              setExpanded(expanded === idx ? null : idx);
            }}
            type="button"
          >
            <span
              className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${statusDots[task.status] ?? "bg-muted"}`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{task.name}</span>
                  <Badge
                    className="text-xs"
                    variant={statusColors[task.status] ?? "secondary"}
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
                <p className="mt-2 rounded bg-muted/50 p-2 font-mono text-xs text-muted-foreground">
                  {task.result}
                </p>
              ) : null}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
