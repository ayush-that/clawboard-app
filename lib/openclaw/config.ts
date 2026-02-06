import type { GatewaySettings } from "./core";
import { chatConfigGet, chatConfigPatch } from "./core";
import type { OpenClawConfig, SkillData } from "./types";

// --- Config cache (LLM config generation takes ~45s, cache for 2 min) ---

let cachedConfig: OpenClawConfig | null = null;
let cacheTimestamp = 0;
const CONFIG_CACHE_TTL = 120_000; // 2 minutes

export const clearConfigCache = () => {
  cachedConfig = null;
  cacheTimestamp = 0;
};

export const getConfig = async (
  cfg?: GatewaySettings
): Promise<OpenClawConfig> => {
  const now = Date.now();
  if (cachedConfig && now - cacheTimestamp < CONFIG_CACHE_TTL) {
    return cachedConfig;
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

  cachedConfig = config;
  cacheTimestamp = now;
  return config;
};

export const patchConfig = async (
  patch: Record<string, unknown>,
  _hash: string,
  cfg?: GatewaySettings
): Promise<{ success: boolean }> => {
  const result = await chatConfigPatch(patch, cfg);
  // Invalidate cache after patching so next read gets fresh data
  clearConfigCache();
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
