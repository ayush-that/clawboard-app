import { cacheDel, cacheGet, cacheSet } from "@/lib/redis/cache";
import type { GatewaySettings } from "./core";
import { chatConfigGet, chatConfigPatch } from "./core";
import type { OpenClawConfig, SkillData } from "./types";

// --- Config cache (LLM config generation takes ~45s, cache in Redis for 2 min) ---

const CONFIG_CACHE_KEY = "openclaw:config";
const CONFIG_CACHE_TTL_SECONDS = 120; // 2 minutes

// In-memory fallback if Redis is unavailable
let fallbackConfig: OpenClawConfig | null = null;
let fallbackTimestamp = 0;

export const clearConfigCache = async () => {
  fallbackConfig = null;
  fallbackTimestamp = 0;
  try {
    await cacheDel(CONFIG_CACHE_KEY);
  } catch {
    // Redis unavailable — in-memory already cleared
  }
};

export const getConfig = async (
  cfg?: GatewaySettings
): Promise<OpenClawConfig> => {
  // Try Redis first
  try {
    const cached = await cacheGet<OpenClawConfig>(CONFIG_CACHE_KEY);
    if (cached) {
      fallbackConfig = cached;
      fallbackTimestamp = Date.now();
      return cached;
    }
  } catch {
    // Redis unavailable — try in-memory fallback
    const now = Date.now();
    if (
      fallbackConfig &&
      now - fallbackTimestamp < CONFIG_CACHE_TTL_SECONDS * 1000
    ) {
      return fallbackConfig;
    }
  }

  const configObj = await chatConfigGet(cfg);
  const raw = JSON.stringify(configObj, null, 2);
  const config: OpenClawConfig = {
    agent: configObj.agents as OpenClawConfig["agent"],
    gateway: configObj.gateway as OpenClawConfig["gateway"],
    channels: configObj.channels as OpenClawConfig["channels"],
    raw,
    hash: String(
      (configObj.meta as Record<string, unknown>)?.lastTouchedAt ?? ""
    ),
  };

  // Cache in Redis (and keep in-memory fallback)
  fallbackConfig = config;
  fallbackTimestamp = Date.now();
  try {
    await cacheSet(CONFIG_CACHE_KEY, config, CONFIG_CACHE_TTL_SECONDS);
  } catch {
    // Redis unavailable — in-memory fallback is already set
  }

  return config;
};

export const patchConfig = async (
  patch: Record<string, unknown>,
  _hash: string,
  cfg?: GatewaySettings
): Promise<{ success: boolean }> => {
  const result = await chatConfigPatch(patch, cfg);
  // Invalidate cache after patching so next read gets fresh data
  await clearConfigCache();
  return result;
};

export const extractSkillsFromConfig = (
  config: OpenClawConfig
): SkillData[] => {
  const skills: SkillData[] = [];
  const raw = JSON.parse(config.raw) as Record<string, unknown>;

  // OpenClaw stores skills under skills.entries
  const skillsSection = raw.skills as Record<string, unknown> | undefined;
  const entries =
    (skillsSection?.entries as Record<string, unknown> | undefined) ??
    skillsSection;

  if (!entries || typeof entries !== "object") {
    return skills;
  }

  for (const [name, value] of Object.entries(entries)) {
    // Skip meta keys
    if (name === "install" || name === "entries") {
      continue;
    }
    if (typeof value === "object" && value !== null) {
      const skill = value as Record<string, unknown>;
      skills.push({
        name,
        description: (skill.description as string) ?? "",
        enabled: (skill.enabled as boolean) ?? true,
        source: (skill.source as string) ?? "installed",
        path: skill.path as string | undefined,
      });
    } else {
      skills.push({
        name,
        description: "",
        enabled: true,
        source: "config",
      });
    }
  }

  return skills;
};
