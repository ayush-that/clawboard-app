"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type SessionInfo = {
  key: string;
  channel: string;
  displayName: string;
  model: string;
  totalTokens: number;
  contextTokens: number;
  updatedAt: number;
  lastChannel: string;
};

type SessionMessage = {
  role: string;
  content: Array<{ type: string; text?: string; thinking?: string }>;
  model?: string;
  usage?: {
    input: number;
    output: number;
    totalTokens: number;
    cost?: { total?: number };
  };
  timestamp: number;
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

const formatTimeAgo = (ts: number): string => {
  const diff = Date.now() - ts;
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

const roleBadgeVariant = (
  role: string
): "default" | "secondary" | "outline" => {
  if (role === "user") {
    return "default";
  }
  if (role === "assistant") {
    return "secondary";
  }
  return "outline";
};

const LoadingSkeleton = () => (
  <div className="mx-auto w-full max-w-3xl space-y-4 p-4 md:p-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-4 w-16" />
    </div>
    {Array.from({ length: 3 }).map((_, i) => (
      <Skeleton className="h-20 w-full rounded-lg" key={`skel-${String(i)}`} />
    ))}
  </div>
);

export const SessionsTab = () => {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch("/api/openclaw/sessions");
        const json = (await res.json()) as SessionInfo[];
        setSessions(json);
      } catch {
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const loadMessages = async (key: string) => {
    setSelectedKey(key);
    setLoadingMessages(true);
    try {
      const res = await fetch(
        `/api/openclaw/sessions/messages?key=${encodeURIComponent(key)}`
      );
      const json = (await res.json()) as SessionMessage[];
      setMessages(json);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  // Message viewer
  if (selectedKey) {
    const session = sessions.find((s) => s.key === selectedKey);
    return (
      <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
        <div className="mb-4 flex items-center gap-3">
          <Button
            onClick={() => {
              setSelectedKey(null);
              setMessages([]);
            }}
            size="sm"
            variant="ghost"
          >
            &larr; Back
          </Button>
          <h2 className="text-base font-semibold">
            {session?.displayName ?? selectedKey}
          </h2>
          {session ? (
            <Badge className="text-xs" variant="outline">
              {session.channel}
            </Badge>
          ) : null}
        </div>

        {loadingMessages ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton
                className="h-24 w-full rounded-lg"
                key={`msg-skel-${String(i)}`}
              />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">
                No messages in this session
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const textParts = msg.content
                ?.filter((c) => c.type === "text" && c.text)
                .map((c) => c.text)
                .join("\n");

              return (
                <Card key={`${msg.role}-${msg.timestamp}`}>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge
                        className="text-xs"
                        variant={roleBadgeVariant(msg.role)}
                      >
                        {msg.role}
                      </Badge>
                      {msg.model ? (
                        <span className="font-mono text-xs text-muted-foreground">
                          {msg.model}
                        </span>
                      ) : null}
                      {msg.timestamp ? (
                        <span className="font-mono text-xs text-muted-foreground">
                          {new Date(msg.timestamp).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false,
                          })}
                        </span>
                      ) : null}
                      {msg.usage ? (
                        <span className="font-mono text-xs text-muted-foreground">
                          {formatTokens(msg.usage.totalTokens)} tokens
                        </span>
                      ) : null}
                    </div>
                    <Separator className="mb-2" />
                    {textParts ? (
                      <p className="whitespace-pre-wrap text-sm">{textParts}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        (no text content)
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Session list
  if (sessions.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">No sessions found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Sessions</h2>
        <span className="text-xs text-muted-foreground">
          {sessions.length} sessions
        </span>
      </div>
      <div className="space-y-2">
        {sessions.map((session) => (
          <Card
            className="cursor-pointer transition-colors hover:bg-muted/50"
            key={session.key}
          >
            <button
              className="w-full p-4 text-left"
              onClick={() => {
                loadMessages(session.key);
              }}
              type="button"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="truncate font-mono text-sm font-medium">
                    {session.displayName || session.key}
                  </span>
                  <Badge className="shrink-0 text-xs" variant="outline">
                    {session.channel || session.lastChannel}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">&rarr;</span>
              </div>
              <div className="mt-1.5 flex gap-3 font-mono text-xs text-muted-foreground">
                <span>{session.model}</span>
                <span>{formatTokens(session.totalTokens)} tokens</span>
                <span>{formatTimeAgo(session.updatedAt)}</span>
              </div>
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
};
