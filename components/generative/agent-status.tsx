"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AgentStatusProps = {
  uptime: string;
  model: string;
  tokensToday: number;
  costToday: number;
  activeChannels: string[];
  lastActivity: string;
  status: "online" | "offline" | "degraded";
};

const statusColors: Record<string, string> = {
  online: "bg-emerald-500",
  offline: "bg-red-500",
  degraded: "bg-yellow-500",
};

const formatTokens = (tokens: number): string => {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return String(tokens);
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

export const AgentStatus = ({
  uptime = "N/A",
  model = "unknown",
  tokensToday = 0,
  costToday = 0,
  activeChannels = [],
  lastActivity = new Date().toISOString(),
  status = "offline",
}: AgentStatusProps) => (
  <Card className="w-full border-border/50 bg-card/80 backdrop-blur-sm">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${statusColors[status] ?? statusColors.offline}`}
          />
          Agent Status
        </CardTitle>
        <Badge
          className="font-mono text-xs"
          variant={status === "online" ? "default" : "destructive"}
        >
          {status}
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wider">
            Uptime
          </p>
          <p className="font-mono text-sm font-medium">{uptime}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wider">
            Last Activity
          </p>
          <p className="font-mono text-sm font-medium">
            {formatTimeAgo(lastActivity)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wider">
            Tokens Today
          </p>
          <p className="font-mono text-sm font-medium">
            {formatTokens(tokensToday)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wider">
            Cost Today
          </p>
          <p className="font-mono text-sm font-medium">
            ${costToday.toFixed(2)}
          </p>
        </div>
      </div>

      <div>
        <p className="text-muted-foreground mb-1.5 text-xs uppercase tracking-wider">
          Model
        </p>
        <Badge className="font-mono text-xs" variant="secondary">
          {model}
        </Badge>
      </div>

      <div>
        <p className="text-muted-foreground mb-1.5 text-xs uppercase tracking-wider">
          Active Channels
        </p>
        <div className="flex flex-wrap gap-1.5">
          {activeChannels.map((channel) => (
            <Badge className="text-xs" key={channel} variant="outline">
              {channel}
            </Badge>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);
