"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

type ConfigData = {
  agent?: { model?: string };
  gateway?: { auth?: { mode?: string } };
  channels?: Record<string, unknown>;
  raw: string;
  hash: string;
};

const LoadingSkeleton = () => (
  <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-9 w-28 rounded-md" />
    </div>
    {Array.from({ length: 3 }).map((_, i) => (
      <Skeleton className="h-24 w-full rounded-lg" key={`skel-${String(i)}`} />
    ))}
  </div>
);

export const ConfigTab = () => {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [model, setModel] = useState("");
  const [soulMd, setSoulMd] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/openclaw/config");
        const json = (await res.json()) as ConfigData;
        setConfig(json);
        setModel(json.agent?.model ?? "");

        try {
          const raw = JSON.parse(json.raw) as Record<string, unknown>;
          const soul = raw.soul as string | undefined;
          setSoulMd(soul ?? "");
        } catch {
          // no soul in config
        }
      } catch {
        setConfig(null);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    if (!config) {
      return;
    }
    setSaving(true);
    setSaveResult(null);
    try {
      const patch: Record<string, unknown> = {};

      if (model && model !== config.agent?.model) {
        patch.agent = { model };
      }

      if (soulMd) {
        patch.soul = soulMd;
      }

      if (Object.keys(patch).length === 0) {
        setSaveResult("No changes to save");
        setSaving(false);
        return;
      }

      const res = await fetch("/api/openclaw/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patch, hash: config.hash }),
      });
      const json = (await res.json()) as { success: boolean; error?: string };
      if (json.success) {
        setSaveResult("Config saved successfully. Gateway may restart.");
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
    return <LoadingSkeleton />;
  }

  if (!config) {
    return (
      <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              Unable to fetch config
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const channelNames = config.channels ? Object.keys(config.channels) : [];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Configuration</h2>
        <div className="flex items-center gap-3">
          {saveResult ? (
            <span
              className={`text-xs ${saveResult.startsWith("Error") ? "text-red-400" : "text-emerald-400"}`}
            >
              {saveResult}
            </span>
          ) : null}
          <Button disabled={saving} onClick={handleSave} size="sm">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Model */}
      <Card>
        <CardContent className="p-4">
          <p className="mb-2 text-xs text-muted-foreground">Model</p>
          <Input
            onChange={(e) => {
              setModel(e.target.value);
            }}
            placeholder="e.g. anthropic/claude-opus-4-6"
            value={model}
          />
        </CardContent>
      </Card>

      {/* Gateway Auth */}
      <Card>
        <CardContent className="p-4">
          <p className="mb-2 text-xs text-muted-foreground">Gateway Auth</p>
          <Badge className="text-xs" variant="outline">
            {config.gateway?.auth?.mode ?? "none"}
          </Badge>
        </CardContent>
      </Card>

      {/* Channels */}
      {channelNames.length > 0 ? (
        <Card>
          <CardContent className="p-4">
            <p className="mb-2 text-xs text-muted-foreground">
              Configured Channels
            </p>
            <div className="flex flex-wrap gap-1.5">
              {channelNames.map((ch) => (
                <Badge className="text-xs" key={ch} variant="outline">
                  {ch}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* SOUL.md */}
      <Card>
        <CardContent className="p-4">
          <p className="mb-2 text-xs text-muted-foreground">
            SOUL.md (Agent Personality)
          </p>
          <Textarea
            onChange={(e) => {
              setSoulMd(e.target.value);
            }}
            placeholder="Define your agent's personality and goals..."
            rows={8}
            value={soulMd}
          />
        </CardContent>
      </Card>

      {/* Raw config */}
      <Card>
        <CardContent className="p-4">
          <button
            className="flex w-full items-center justify-between text-left"
            onClick={() => {
              setShowRaw(!showRaw);
            }}
            type="button"
          >
            <p className="text-xs text-muted-foreground">
              Raw Config (read-only)
            </p>
            <span className="text-xs text-muted-foreground">
              {showRaw ? "Hide" : "Show"}
            </span>
          </button>
          {showRaw ? (
            <>
              <Separator className="my-3" />
              <pre className="max-h-96 overflow-auto rounded-md bg-muted p-3 font-mono text-xs">
                {config.raw}
              </pre>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};
