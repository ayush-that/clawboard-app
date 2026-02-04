"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type SettingsData = {
  openclawGatewayUrl: string;
  openclawGatewayToken: string;
  tamboApiKey: string;
};

const LoadingSkeleton = () => (
  <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-9 w-28 rounded-md" />
    </div>
    {Array.from({ length: 3 }).map((_, i) => (
      <Skeleton className="h-24 w-full rounded-lg" key={`skel-${String(i)}`} />
    ))}
  </div>
);

export const SettingsTab = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<string | null>(null);
  const [gatewayUrl, setGatewayUrl] = useState("");
  const [gatewayToken, setGatewayToken] = useState("");
  const [tamboApiKey, setTamboApiKey] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const json = (await res.json()) as SettingsData;
        setGatewayUrl(json.openclawGatewayUrl ?? "");
        setGatewayToken(json.openclawGatewayToken ?? "");
        setTamboApiKey(json.tamboApiKey ?? "");
      } catch {
        // leave defaults
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveResult(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          openclawGatewayUrl: gatewayUrl || null,
          openclawGatewayToken: gatewayToken || null,
          tamboApiKey: tamboApiKey || null,
        }),
      });
      const json = (await res.json()) as { success?: boolean; error?: string };
      if (json.success) {
        setSaveResult("Settings saved successfully.");
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

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Settings</h2>
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

      <Card>
        <CardContent className="p-4">
          <p className="mb-1 text-xs text-muted-foreground">
            OpenClaw Gateway URL
          </p>
          <p className="mb-2 text-xs text-muted-foreground/60">
            The base URL for your OpenClaw gateway. Leave blank to use the
            server default.
          </p>
          <Input
            onChange={(e) => {
              setGatewayUrl(e.target.value);
            }}
            placeholder="http://localhost:18789"
            value={gatewayUrl}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="mb-1 text-xs text-muted-foreground">
            OpenClaw Gateway Token
          </p>
          <p className="mb-2 text-xs text-muted-foreground/60">
            Auth token for the OpenClaw gateway. Leave blank if not required.
          </p>
          <Input
            onChange={(e) => {
              setGatewayToken(e.target.value);
            }}
            placeholder="Bearer token"
            type="password"
            value={gatewayToken}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="mb-1 text-xs text-muted-foreground">Tambo API Key</p>
          <p className="mb-2 text-xs text-muted-foreground/60">
            API key for Tambo AI integration. Leave blank to use the server
            default.
          </p>
          <Input
            onChange={(e) => {
              setTamboApiKey(e.target.value);
            }}
            placeholder="tambo_..."
            type="password"
            value={tamboApiKey}
          />
        </CardContent>
      </Card>
    </div>
  );
};
