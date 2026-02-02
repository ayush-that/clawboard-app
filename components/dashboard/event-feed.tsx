"use client";

import { useEffect, useState } from "react";

type SSEEvent = {
  type: string;
  data: string;
  timestamp: string;
};

const eventTypeColors: Record<string, string> = {
  task_complete: "text-emerald-400",
  webhook_received: "text-blue-400",
  cron_triggered: "text-amber-400",
  error: "text-red-400",
  memory_updated: "text-purple-400",
  connected: "text-muted-foreground",
};

export const EventFeed = () => {
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource("/api/openclaw/events");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data) as SSEEvent;
      if (data.type === "connected" || data.type === "ping") {
        setConnected(true);
        return;
      }
      setEvents((prev) => [data, ...prev].slice(0, 20));
    };

    eventSource.onerror = () => {
      setConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="border-t border-border/50">
      <div className="flex items-center gap-2 px-4 py-2">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            connected ? "bg-emerald-500" : "bg-red-500"
          }`}
        />
        <span className="text-xs font-medium text-muted-foreground">
          Live Events
        </span>
      </div>
      <div className="max-h-32 overflow-y-auto px-4 pb-2">
        {events.length === 0 ? (
          <p className="py-2 text-center text-xs text-muted-foreground">
            Waiting for events...
          </p>
        ) : (
          events.map((event, i) => (
            <div
              className="flex items-start gap-2 py-1"
              key={`${event.timestamp}-${i}`}
            >
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                {new Date(event.timestamp).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })}
              </span>
              <span
                className={`text-xs ${eventTypeColors[event.type] ?? "text-foreground"}`}
              >
                {event.data}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
