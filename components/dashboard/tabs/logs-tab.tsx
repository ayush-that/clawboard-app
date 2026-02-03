"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type LogEntry = {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  source: string;
  content: string;
};

const levelColors: Record<string, string> = {
  info: "text-blue-400",
  warn: "text-yellow-400",
  error: "text-red-400",
  debug: "text-muted-foreground",
};

const LEVELS = ["all", "info", "warn", "error", "debug"] as const;

export const LogsTab = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/openclaw/logs");
      const json = (await res.json()) as LogEntry[];
      setLogs(json);
      requestAnimationFrame(() => {
        if (autoScrollRef.current) {
          scrollToBottom();
        }
      });
    } catch {
      // keep existing logs on error
    } finally {
      setLoading(false);
    }
  }, [scrollToBottom]);

  const autoScrollRef = useRef(autoScroll);
  autoScrollRef.current = autoScroll;

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => {
      clearInterval(interval);
    };
  }, [fetchLogs]);

  const filteredLogs =
    filter === "all" ? logs : logs.filter((l) => l.level === filter);
  const displayLogs = [...filteredLogs].reverse();

  if (loading) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <Skeleton className="h-4 w-16" />
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                className="h-7 w-12 rounded-md"
                key={`skel-${String(i)}`}
              />
            ))}
          </div>
        </div>
        <div className="flex-1 space-y-1 p-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton className="h-4 w-full" key={`log-skel-${String(i)}`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Logs</h2>
          <Badge className="text-xs" variant="outline">
            {filteredLogs.length}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {LEVELS.map((level) => (
              <Button
                className="h-7 px-2.5 text-xs"
                key={level}
                onClick={() => {
                  setFilter(level);
                }}
                size="sm"
                variant={filter === level ? "default" : "ghost"}
              >
                {level}
              </Button>
            ))}
          </div>
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
            <input
              checked={autoScroll}
              className="accent-primary"
              onChange={(e) => {
                setAutoScroll(e.target.checked);
              }}
              type="checkbox"
            />
            Auto-scroll
          </label>
        </div>
      </div>

      {/* Log stream */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden bg-black/20 p-3 font-mono text-xs"
        ref={scrollRef}
      >
        {displayLogs.length === 0 ? (
          <div className="flex items-center justify-center p-12">
            <p className="text-muted-foreground">No log entries</p>
          </div>
        ) : (
          displayLogs.map((entry) => (
            <div
              className="min-w-0 rounded px-1 py-0.5 hover:bg-white/5"
              key={`${entry.timestamp}-${entry.source}-${entry.content.slice(0, 20)}`}
            >
              <span className="text-muted-foreground">
                {new Date(entry.timestamp).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })}
              </span>{" "}
              <span className={levelColors[entry.level] ?? "text-foreground"}>
                {entry.level.padEnd(5)}
              </span>{" "}
              <span className="text-purple-400">[{entry.source}]</span>{" "}
              <span
                className={`break-all ${levelColors[entry.level] ?? "text-foreground"}`}
              >
                {entry.content.length > 500
                  ? `${entry.content.slice(0, 500)}...`
                  : entry.content}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
