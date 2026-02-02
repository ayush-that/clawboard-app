"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

type TaskItem = {
  name: string;
  status: "success" | "failed" | "running";
  startedAt: string;
  duration: number;
  result?: string;
};

const statusConfig: Record<string, { color: string; label: string }> = {
  success: { color: "text-emerald-400", label: "Success" },
  failed: { color: "text-red-400", label: "Failed" },
  running: { color: "text-yellow-400", label: "Running" },
};

const formatDuration = (ms: number): string => {
  if (ms === 0) {
    return "in progress";
  }
  if (ms < 1000) {
    return `${ms}ms`;
  }
  if (ms < 60_000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  return `${(ms / 60_000).toFixed(1)}m`;
};

const formatTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

export const SessionsTab = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/openclaw/tasks?timeRange=24h");
        const json = (await res.json()) as TaskItem[];
        setTasks(json);
      } catch {
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-sm text-muted-foreground">Loading sessions...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-sm text-muted-foreground">No recent sessions</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Sessions</h2>
        <span className="text-xs text-muted-foreground">
          {tasks.length} entries
        </span>
      </div>
      {tasks.map((task) => {
        const config = statusConfig[task.status] ?? statusConfig.success;
        return (
          <div
            className="flex items-start gap-3 rounded-md border border-border/30 p-3"
            key={`${task.name}-${task.startedAt}`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-mono text-sm font-medium">
                  {task.name}
                </span>
                <Badge
                  className={`shrink-0 text-xs ${config.color}`}
                  variant="outline"
                >
                  {config.label}
                </Badge>
              </div>
              <div className="mt-0.5 flex gap-3 font-mono text-xs text-muted-foreground">
                <span>{formatTime(task.startedAt)}</span>
                <span>{formatDuration(task.duration)}</span>
              </div>
              {task.result ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {task.result}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};
