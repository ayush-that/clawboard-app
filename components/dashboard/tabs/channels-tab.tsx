"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

type ChannelItem = {
  name: string;
  type: string;
  enabled: boolean;
  settings: Record<string, unknown>;
};

const channelIcons: Record<string, string> = {
  telegram: "T",
  webhook: "W",
  cron: "C",
  discord: "D",
  slack: "S",
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
      };
      setChannels(json.channels);
      setHash(json.hash);
    } catch {
      setChannels([]);
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
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-sm text-muted-foreground">Loading channels...</p>
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-12">
        <p className="text-sm text-muted-foreground">No channels configured</p>
        <p className="text-xs text-muted-foreground">
          Add channels in your{" "}
          <code className="rounded bg-muted px-1 py-0.5">openclaw.json</code>{" "}
          config to connect Telegram, Discord, webhooks, and more.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Channels</h2>
        <span className="text-xs text-muted-foreground">
          {channels.length} configured
        </span>
      </div>

      <div className="space-y-2">
        {channels.map((ch) => (
          <div className="rounded-md border border-border/30" key={ch.name}>
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
                  className={`flex h-8 w-8 items-center justify-center rounded-md bg-muted font-mono text-sm font-bold ${
                    channelColors[ch.type] ?? "text-foreground"
                  }`}
                >
                  {channelIcons[ch.type] ?? ch.type.charAt(0).toUpperCase()}
                </span>
                <div>
                  <span className="font-mono text-sm font-medium">
                    {ch.name}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
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
              <div className="border-t border-border/30 p-4">
                <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                  Channel Settings (JSON)
                </p>
                <textarea
                  className="w-full rounded-md border border-border/50 bg-background px-3 py-2 font-mono text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  onChange={(e) => {
                    setEditJson(e.target.value);
                  }}
                  rows={10}
                  value={editJson}
                />
                <div className="mt-3 flex items-center gap-3">
                  <button
                    className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    disabled={saving}
                    onClick={() => {
                      handleSave(ch.name);
                    }}
                    type="button"
                  >
                    {saving ? "Saving..." : "Save Channel"}
                  </button>
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
          </div>
        ))}
      </div>
    </div>
  );
};
