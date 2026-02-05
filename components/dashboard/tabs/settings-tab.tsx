"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type SettingsData = {
  openclawGatewayUrl: string;
  hasOpenclawGatewayToken: boolean;
  hasTamboApiKey: boolean;
  updatedAt: string | null;
};

type SecretAction = "unchanged" | "replace" | "clear";

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

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export const SettingsTab = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<string | null>(null);

  const [gatewayUrl, setGatewayUrl] = useState("");
  const [hasGatewayToken, setHasGatewayToken] = useState(false);
  const [hasTamboKey, setHasTamboKey] = useState(false);

  const [gatewayTokenInput, setGatewayTokenInput] = useState("");
  const [gatewayTokenAction, setGatewayTokenAction] =
    useState<SecretAction>("unchanged");
  const [tamboApiKeyInput, setTamboApiKeyInput] = useState("");
  const [tamboApiKeyAction, setTamboApiKeyAction] =
    useState<SecretAction>("unchanged");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const json = (await res.json()) as SettingsData;
        setGatewayUrl(json.openclawGatewayUrl ?? "");
        setHasGatewayToken(Boolean(json.hasOpenclawGatewayToken));
        setHasTamboKey(Boolean(json.hasTamboApiKey));
      } catch (error) {
        console.error("Failed to load settings:", error);
        setSaveResult("Error: Failed to load settings.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaveResult(null);

    const trimmedGatewayUrl = gatewayUrl.trim();
    if (!trimmedGatewayUrl) {
      setSaveResult("Error: OpenClaw Gateway URL is required.");
      return;
    }

    if (!isValidHttpUrl(trimmedGatewayUrl)) {
      setSaveResult(
        "Error: OpenClaw Gateway URL must be a valid http/https URL."
      );
      return;
    }

    if (
      gatewayTokenAction === "replace" &&
      gatewayTokenInput.trim().length === 0
    ) {
      setSaveResult(
        "Error: OpenClaw Gateway Token cannot be empty when replacing."
      );
      return;
    }

    if (
      tamboApiKeyAction === "replace" &&
      tamboApiKeyInput.trim().length === 0
    ) {
      setSaveResult("Error: Tambo API Key cannot be empty when replacing.");
      return;
    }

    const body: Record<string, string> = {
      openclawGatewayUrl: trimmedGatewayUrl,
    };

    if (gatewayTokenAction === "replace") {
      body.openclawGatewayToken = gatewayTokenInput.trim();
    } else if (gatewayTokenAction === "clear") {
      body.openclawGatewayToken = "";
    }

    if (tamboApiKeyAction === "replace") {
      body.tamboApiKey = tamboApiKeyInput.trim();
    } else if (tamboApiKeyAction === "clear") {
      body.tamboApiKey = "";
    }

    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as {
        success?: boolean;
        error?: string;
        settings?: {
          hasOpenclawGatewayToken: boolean;
          hasTamboApiKey: boolean;
          openclawGatewayUrl: string;
        };
      };

      if (!res.ok || !json.success) {
        setSaveResult(`Error: ${json.error ?? "Unknown error"}`);
        return;
      }

      setGatewayUrl(json.settings?.openclawGatewayUrl ?? trimmedGatewayUrl);
      setHasGatewayToken(Boolean(json.settings?.hasOpenclawGatewayToken));
      setHasTamboKey(Boolean(json.settings?.hasTamboApiKey));

      setGatewayTokenInput("");
      setTamboApiKeyInput("");
      setGatewayTokenAction("unchanged");
      setTamboApiKeyAction("unchanged");
      setSaveResult("Settings saved successfully.");
      router.refresh();
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
        <h2 className="text-xl font-semibold">Settings</h2>
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
        <CardContent className="space-y-2 p-4">
          <p className="text-xs text-muted-foreground">OpenClaw Gateway URL</p>
          <p className="text-xs text-muted-foreground/60">
            Base URL for your OpenClaw gateway. This value is required.
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
        <CardContent className="space-y-2 p-4">
          <p className="text-xs text-muted-foreground">
            OpenClaw Gateway Token
          </p>
          <p className="text-xs text-muted-foreground/60">
            Status: {hasGatewayToken ? "Stored" : "Not set"}
          </p>
          <Input
            onChange={(e) => {
              setGatewayTokenInput(e.target.value);
              setGatewayTokenAction(
                e.target.value.trim().length > 0 ? "replace" : "unchanged"
              );
            }}
            placeholder="Enter a new token to replace"
            type="password"
            value={gatewayTokenInput}
          />
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setGatewayTokenInput("");
                setGatewayTokenAction("clear");
              }}
              size="sm"
              type="button"
              variant="outline"
            >
              Clear Token
            </Button>
            <span className="text-xs text-muted-foreground">
              {gatewayTokenAction === "replace"
                ? "Will replace on save"
                : gatewayTokenAction === "clear"
                  ? "Will clear on save"
                  : "No token change"}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-4">
          <p className="text-xs text-muted-foreground">Tambo API Key</p>
          <p className="text-xs text-muted-foreground/60">
            Status: {hasTamboKey ? "Stored" : "Not set"}
          </p>
          <Input
            onChange={(e) => {
              setTamboApiKeyInput(e.target.value);
              setTamboApiKeyAction(
                e.target.value.trim().length > 0 ? "replace" : "unchanged"
              );
            }}
            placeholder="Enter a new key to replace"
            type="password"
            value={tamboApiKeyInput}
          />
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setTamboApiKeyInput("");
                setTamboApiKeyAction("clear");
              }}
              size="sm"
              type="button"
              variant="outline"
            >
              Clear API Key
            </Button>
            <span className="text-xs text-muted-foreground">
              {tamboApiKeyAction === "replace"
                ? "Will replace on save"
                : tamboApiKeyAction === "clear"
                  ? "Will clear on save"
                  : "No API key change"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
