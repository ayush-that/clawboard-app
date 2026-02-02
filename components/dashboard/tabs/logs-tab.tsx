"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";

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

const levelBadgeVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  info: "default",
  warn: "secondary",
  error: "destructive",
  debug: "outline",
};

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
      // Defer scroll to after React renders the new logs
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

  // Use a ref for autoScroll so the fetch callback doesn't need it as a dep
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

  // Show logs in chronological order (oldest first) for a terminal feel
  const displayLogs = [...filteredLogs].reverse();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-sm text-muted-foreground">Loading logs...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border/30 px-4 py-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Logs</h2>
          <Badge className="text-xs" variant="outline">
            {filteredLogs.length}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {["all", "info", "warn", "error", "debug"].map((level) => (
              <button
                className={`rounded px-2 py-0.5 text-xs transition-colors ${
                  filter === level
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                key={level}
                onClick={() => {
                  setFilter(level);
                }}
                type="button"
              >
                {level}
              </button>
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
        className="flex-1 overflow-y-auto bg-black/20 p-2 font-mono text-xs"
        ref={scrollRef}
      >
        {displayLogs.length === 0 ? (
          <div className="flex items-center justify-center p-12">
            <p className="text-muted-foreground">No log entries</p>
          </div>
        ) : (
          displayLogs.map((entry) => (
            <div
              className="flex gap-2 py-0.5 hover:bg-white/5"
              key={`${entry.timestamp}-${entry.source}-${entry.content.slice(0, 20)}`}
            >
              <span className="shrink-0 text-muted-foreground">
                {new Date(entry.timestamp).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })}
              </span>
              <Badge
                className="shrink-0 px-1 py-0 text-xs"
                variant={levelBadgeVariant[entry.level] ?? "outline"}
              >
                {entry.level.padEnd(5)}
              </Badge>
              <span className="shrink-0 text-purple-400">[{entry.source}]</span>
              <span className={levelColors[entry.level] ?? "text-foreground"}>
                {entry.content}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
