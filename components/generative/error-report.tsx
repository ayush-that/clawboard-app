"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ErrorReportProps = {
  errors: Array<{
    message: string;
    skill: string;
    timestamp: string;
    severity: "critical" | "warning" | "info";
    resolved: boolean;
  }>;
};

const severityConfig: Record<string, { color: string; bg: string }> = {
  critical: { color: "text-red-400", bg: "bg-red-500/20 border-red-500/30" },
  warning: {
    color: "text-yellow-400",
    bg: "bg-yellow-500/20 border-yellow-500/30",
  },
  info: { color: "text-blue-400", bg: "bg-blue-500/20 border-blue-500/30" },
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

export const ErrorReport = ({ errors = [] }: ErrorReportProps) => {
  const unresolvedCount = errors.filter((e) => !e.resolved).length;

  return (
    <Card className="w-full border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Error Report</CardTitle>
          <div className="flex gap-2">
            {unresolvedCount > 0 ? (
              <Badge className="font-mono text-xs" variant="destructive">
                {unresolvedCount} unresolved
              </Badge>
            ) : null}
            <Badge className="font-mono text-xs" variant="secondary">
              {errors.length} total
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {errors.map((error, index) => {
            const config =
              severityConfig[error.severity] ?? severityConfig.info;
            return (
              <div
                className={`rounded-lg border p-3 ${config.bg} ${
                  error.resolved ? "opacity-60" : ""
                }`}
                key={`${error.skill}-${index}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`text-xs ${config.color}`}
                      variant="outline"
                    >
                      {error.severity}
                    </Badge>
                    <Badge className="font-mono text-xs" variant="outline">
                      {error.skill}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {error.resolved ? (
                      <span className="text-xs text-emerald-400">resolved</span>
                    ) : null}
                    <span className="font-mono text-xs text-muted-foreground">
                      {formatTimeAgo(error.timestamp)}
                    </span>
                  </div>
                </div>
                <p className="mt-2 font-mono text-sm">{error.message}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
