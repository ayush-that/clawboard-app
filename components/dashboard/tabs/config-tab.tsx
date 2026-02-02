"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

type ConfigData = {
  agent?: { model?: string };
  gateway?: { auth?: { mode?: string } };
  channels?: Record<string, unknown>;
  raw: string;
  hash: string;
};

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

        // Try to extract SOUL.md content from raw config
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
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-sm text-muted-foreground">Loading config...</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-sm text-muted-foreground">Unable to fetch config</p>
      </div>
    );
  }

  const channelNames = config.channels ? Object.keys(config.channels) : [];

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Configuration</h2>
        <button
          className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          disabled={saving}
          onClick={handleSave}
          type="button"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {saveResult ? (
        <p
          className={`text-xs ${saveResult.startsWith("Error") ? "text-red-400" : "text-emerald-400"}`}
        >
          {saveResult}
        </p>
      ) : null}

      {/* Model */}
      <div className="rounded-md border border-border/30 p-4">
        <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
          Model
        </p>
        <input
          className="w-full rounded-md border border-border/50 bg-background px-3 py-2 font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          onChange={(e) => {
            setModel(e.target.value);
          }}
          placeholder="e.g. anthropic/claude-opus-4-6"
          type="text"
          value={model}
        />
      </div>

      {/* Gateway Auth */}
      <div className="rounded-md border border-border/30 p-4">
        <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
          Gateway Auth
        </p>
        <Badge className="font-mono text-xs" variant="outline">
          {config.gateway?.auth?.mode ?? "none"}
        </Badge>
      </div>

      {/* Channels */}
      {channelNames.length > 0 ? (
        <div className="rounded-md border border-border/30 p-4">
          <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
            Configured Channels
          </p>
          <div className="flex flex-wrap gap-1.5">
            {channelNames.map((ch) => (
              <Badge className="text-xs" key={ch} variant="outline">
                {ch}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      {/* SOUL.md */}
      <div className="rounded-md border border-border/30 p-4">
        <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
          SOUL.md (Agent Personality)
        </p>
        <textarea
          className="w-full rounded-md border border-border/50 bg-background px-3 py-2 font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          onChange={(e) => {
            setSoulMd(e.target.value);
          }}
          placeholder="Define your agent's personality and goals..."
          rows={8}
          value={soulMd}
        />
      </div>

      {/* Raw config */}
      <div className="rounded-md border border-border/30 p-4">
        <button
          className="flex w-full items-center justify-between text-left"
          onClick={() => {
            setShowRaw(!showRaw);
          }}
          type="button"
        >
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Raw Config (read-only)
          </p>
          <span className="text-xs text-muted-foreground">
            {showRaw ? "Hide" : "Show"}
          </span>
        </button>
        {showRaw ? (
          <pre className="mt-2 max-h-96 overflow-auto rounded bg-muted p-3 font-mono text-xs">
            {config.raw}
          </pre>
        ) : null}
      </div>
    </div>
  );
};
