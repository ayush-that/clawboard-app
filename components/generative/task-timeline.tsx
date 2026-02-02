"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TaskTimelineProps = {
  tasks: Array<{
    name: string;
    status: "success" | "failed" | "running";
    startedAt: string;
    duration: number;
    result?: string;
  }>;
  timeRange: "1h" | "6h" | "24h" | "7d";
};

const statusConfig: Record<
  string,
  { color: string; bg: string; label: string }
> = {
  success: {
    color: "text-emerald-400",
    bg: "bg-emerald-500",
    label: "Success",
  },
  failed: { color: "text-red-400", bg: "bg-red-500", label: "Failed" },
  running: { color: "text-yellow-400", bg: "bg-yellow-500", label: "Running" },
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
    hour12: false,
  });
};

export const TaskTimeline = ({
  tasks = [],
  timeRange = "24h",
}: TaskTimelineProps) => {
  const successCount = tasks.filter((t) => t.status === "success").length;
  const failedCount = tasks.filter((t) => t.status === "failed").length;
  const runningCount = tasks.filter((t) => t.status === "running").length;

  return (
    <Card className="w-full border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Task Timeline</CardTitle>
          <Badge className="font-mono text-xs" variant="secondary">
            {timeRange}
          </Badge>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="text-emerald-400">{successCount} passed</span>
          <span className="text-red-400">{failedCount} failed</span>
          <span className="text-yellow-400">{runningCount} running</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          {/* Timeline line */}
          <div className="absolute top-0 bottom-0 left-3 w-px bg-border" />

          {tasks.map((task, index) => {
            const config = statusConfig[task.status] ?? statusConfig.success;
            return (
              <div
                className="relative flex items-start gap-4 py-2.5"
                key={`${task.name}-${index}`}
              >
                {/* Status dot */}
                <div
                  className={`relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${config.bg} ${
                    task.status === "running" ? "animate-pulse" : ""
                  }`}
                />

                {/* Task info */}
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
                  <div className="text-muted-foreground mt-0.5 flex gap-3 font-mono text-xs">
                    <span>{formatTime(task.startedAt)}</span>
                    <span>{formatDuration(task.duration)}</span>
                  </div>
                  {task.result ? (
                    <p className="text-muted-foreground mt-1 text-xs">
                      {task.result}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
