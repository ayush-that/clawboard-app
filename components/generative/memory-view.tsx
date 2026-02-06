"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTimeAgo } from "@/lib/format-utils";

type MemoryViewProps = {
  memories: Array<{
    key: string;
    summary: string;
    timestamp: string;
    relevance: number;
  }>;
  query: string;
};

const RelevanceBar = ({ value }: { value: number }) => (
  <div className="flex items-center gap-1.5">
    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${Math.round(value * 100)}%` }}
      />
    </div>
    <span className="font-mono text-xs text-muted-foreground">
      {Math.round(value * 100)}%
    </span>
  </div>
);

export const MemoryView = ({ memories = [], query = "" }: MemoryViewProps) => (
  <Card className="w-full border-border/50 bg-card/80 backdrop-blur-sm">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg">Agent Memory</CardTitle>
        {query ? (
          <Badge className="font-mono text-xs" variant="secondary">
            query: {query}
          </Badge>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">
        {memories.length} memories found
      </p>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {memories.map((memory) => (
          <div
            className="rounded-lg border border-border/50 bg-background/50 p-3"
            key={memory.key}
          >
            <div className="flex items-start justify-between gap-2">
              <Badge className="shrink-0 font-mono text-xs" variant="outline">
                {memory.key}
              </Badge>
              <RelevanceBar value={memory.relevance} />
            </div>
            <p className="mt-2 text-sm leading-relaxed">{memory.summary}</p>
            <p className="mt-1.5 font-mono text-xs text-muted-foreground">
              {formatTimeAgo(memory.timestamp)}
            </p>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);
