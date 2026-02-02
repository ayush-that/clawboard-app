"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type WebhookLogProps = {
  events: Array<{
    source: string;
    payloadSummary: string;
    timestamp: string;
    actionTaken: string;
  }>;
};

const sourceColors: Record<string, string> = {
  github: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  slack: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  cron: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  webhook: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  telegram: "bg-sky-500/20 text-sky-400 border-sky-500/30",
};

const defaultColor = "bg-muted text-muted-foreground border-border";

const formatTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const WebhookLog = ({ events = [] }: WebhookLogProps) => (
  <Card className="w-full border-border/50 bg-card/80 backdrop-blur-sm">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg">Webhook Activity</CardTitle>
        <Badge className="font-mono text-xs" variant="secondary">
          {events.length} events
        </Badge>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {events.map((event, index) => (
          <div
            className="rounded-lg border border-border/50 bg-background/50 p-3"
            key={`${event.source}-${index}`}
          >
            <div className="flex items-center gap-2">
              <Badge
                className={`text-xs ${sourceColors[event.source] ?? defaultColor}`}
                variant="outline"
              >
                {event.source}
              </Badge>
              <span className="font-mono text-xs text-muted-foreground">
                {formatTime(event.timestamp)}
              </span>
            </div>
            <p className="mt-1.5 font-mono text-sm">{event.payloadSummary}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {event.actionTaken}
            </p>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);
