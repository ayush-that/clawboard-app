"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { GlobeIcon, MessageIcon, RouteIcon, TerminalIcon } from "@/lib/icons";

type ChannelItem = {
  name: string;
  type: string;
  enabled: boolean;
  settings: Record<string, unknown>;
};

const channelIcons: Record<string, ReactNode> = {
  telegram: <MessageIcon size={14} />,
  webhook: <RouteIcon size={14} />,
  cron: <TerminalIcon size={14} />,
  discord: <GlobeIcon size={14} />,
  slack: <GlobeIcon size={14} />,
};

const channelColors: Record<string, string> = {
  telegram: "text-blue-400",
  webhook: "text-emerald-400",
  cron: "text-amber-400",
  discord: "text-indigo-400",
  slack: "text-pink-400",
};

export const ChannelsTab = () => {
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editJson, setEditJson] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<string | null>(null);

  const fetchChannels = useCallback(async () => {
    try {
      const res = await fetch("/api/openclaw/channels");
      const json = (await res.json()) as {
        channels: ChannelItem[];
        hash: string;
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(json.message ?? json.error ?? "Request failed");
      }
      setChannels(Array.isArray(json.channels) ? json.channels : []);
      setHash(json.hash ?? "");
      setError(null);
    } catch (error) {
      console.error("Failed to load channels:", error);
      setError("Failed to load channels. Check gateway connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const handleExpand = (name: string) => {
    if (expanded === name) {
      setExpanded(null);
      setEditJson("");
      setSaveResult(null);
    } else {
      setExpanded(name);
      const ch = channels.find((c) => c.name === name);
      setEditJson(JSON.stringify(ch?.settings ?? {}, null, 2));
      setSaveResult(null);
    }
  };

  const handleSave = async (name: string) => {
    setSaving(true);
    setSaveResult(null);
    try {
      const settings = JSON.parse(editJson) as Record<string, unknown>;
      const res = await fetch("/api/openclaw/channels", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, settings, hash }),
      });
      const json = (await res.json()) as {
        success: boolean;
        error?: string;
      };
      if (json.success) {
        setSaveResult("Saved. Gateway may restart.");
        await fetchChannels();
      } else {
        setSaveResult(`Error: ${json.error ?? "Unknown error"}`);
      }
    } catch (error) {
      setSaveResult(`Error: ${String(error)}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return null;
  }

  if (error && channels.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-4 p-4 md:p-6">
        <h2 className="text-xl font-semibold">Channels</h2>
        <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <span>{error}</span>
          <Button
            className="ml-4 h-7 px-2.5 text-xs"
            onClick={fetchChannels}
            size="sm"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-4 p-4 md:p-6">
        <h2 className="text-xl font-semibold">Channels</h2>
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
            <p className="text-sm text-muted-foreground">
              No channels configured
            </p>
            <p className="text-xs text-muted-foreground">
              Add channels in your{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                openclaw.json
              </code>{" "}
              config to connect Telegram, Discord, webhooks, and more.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Channels</h2>
        <span className="text-xs text-muted-foreground">
          {channels.length} configured
        </span>
      </div>

      {error ? (
        <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <span>{error}</span>
          <Button
            className="ml-4 h-7 px-2.5 text-xs"
            onClick={fetchChannels}
            size="sm"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      ) : null}

      {channels.map((ch) => (
        <Card key={ch.name}>
          {/* Channel header */}
          <button
            className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/30"
            onClick={() => {
              handleExpand(ch.name);
            }}
            type="button"
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-md bg-muted ${
                  channelColors[ch.type] ?? "text-foreground"
                }`}
              >
                {channelIcons[ch.type] ?? <GlobeIcon size={14} />}
              </span>
              <div>
                <span className="text-sm font-medium">{ch.name}</span>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <Badge className="text-xs" variant="outline">
                    {ch.type}
                  </Badge>
                  <Badge
                    className="text-xs"
                    variant={ch.enabled ? "default" : "secondary"}
                  >
                    {ch.enabled ? "enabled" : "disabled"}
                  </Badge>
                </div>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {expanded === ch.name ? "Collapse" : "Edit"}
            </span>
          </button>

          {/* Expanded editor */}
          {expanded === ch.name ? (
            <div className="px-4 pb-4">
              <Separator className="mb-4" />
              <p className="mb-2 text-xs text-muted-foreground">
                Channel Settings (JSON)
              </p>
              <Textarea
                className="font-mono text-xs"
                onChange={(e) => {
                  setEditJson(e.target.value);
                }}
                rows={10}
                value={editJson}
              />
              <div className="mt-3 flex items-center gap-3">
                <Button
                  disabled={saving}
                  onClick={() => {
                    handleSave(ch.name);
                  }}
                  size="sm"
                >
                  {saving ? "Saving..." : "Save Channel"}
                </Button>
                {saveResult ? (
                  <span
                    className={`text-xs ${
                      saveResult.startsWith("Error")
                        ? "text-red-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {saveResult}
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}
        </Card>
      ))}
    </div>
  );
};
