"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type LogEntry = {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  source: string;
  content: string;
};

const renderInlineMarkdown = (text: string): ReactNode => {
  const parts: ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*)|(`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null = null;
  let key = 0;

  match = regex.exec(text);
  while (match !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      parts.push(
        <strong className="font-bold" key={key++}>
          {match[2]}
        </strong>
      );
    } else if (match[4]) {
      parts.push(
        <code
          className="rounded bg-white/10 px-1 py-0.5 font-mono text-[0.85em]"
          key={key++}
        >
          {match[4]}
        </code>
      );
    }
    lastIndex = match.index + match[0].length;
    match = regex.exec(text);
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

const levelColors: Record<string, string> = {
  info: "text-blue-400",
  warn: "text-yellow-400",
  error: "text-red-400",
  debug: "text-muted-foreground",
};

const LEVELS = ["All", "Info", "Warn", "Error", "Debug"] as const;

export const LogsTab = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState<string>("All");
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/openclaw/logs");
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message ?? json.error ?? "Request failed");
      }
      setLogs(Array.isArray(json) ? json : []);
      setError(null);
      requestAnimationFrame(() => {
        if (autoScrollRef.current) {
          scrollToBottom();
        }
      });
    } catch (error) {
      console.error("Failed to load logs:", error);
      setError("Failed to load logs. Check gateway connection.");
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
    filter === "All"
      ? logs
      : logs.filter((l) => l.level === filter.toLowerCase());
  const displayLogs = [...filteredLogs].reverse();

  if (loading) {
    return null;
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-var(--spacing-14))] w-full max-w-4xl flex-col p-4 md:p-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between pb-3">
        <h2 className="text-xl font-semibold">Logs</h2>
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

      {error ? (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <span>{error}</span>
          <Button
            className="ml-4 h-7 px-2.5 text-xs"
            onClick={fetchLogs}
            size="sm"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      ) : null}

      {/* Log stream */}
      <div
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden rounded-lg border border-border bg-black/20 p-3 text-xs"
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
                {renderInlineMarkdown(
                  entry.content.length > 500
                    ? `${entry.content.slice(0, 500)}...`
                    : entry.content
                )}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
