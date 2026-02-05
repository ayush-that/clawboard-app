import type { GatewaySettings } from "./core";
import { invokeTool } from "./core";
import type { OpenClawConfig, SkillData } from "./types";

type ConfigGetResult = {
  config: Record<string, unknown>;
  hash: string;
};

export const getConfig = async (
  cfg?: GatewaySettings
): Promise<OpenClawConfig> => {
  try {
    const result = await invokeTool<ConfigGetResult>(
      "config_get",
      { action: "json" },
      cfg
    );
    const raw = JSON.stringify(result.config ?? {}, null, 2);
    const configObj = result.config ?? {};
    return {
      agent: configObj.agent as OpenClawConfig["agent"],
      gateway: configObj.gateway as OpenClawConfig["gateway"],
      channels: configObj.channels as OpenClawConfig["channels"],
      raw,
      hash: result.hash ?? "",
    };
  } catch {
    return { raw: "{}", hash: "" };
  }
};

export const patchConfig = async (
  patch: Record<string, unknown>,
  hash: string,
  cfg?: GatewaySettings
): Promise<{ success: boolean }> => {
  await invokeTool("config_patch", { patch, hash }, cfg);
  return { success: true };
};

export const extractSkillsFromConfig = (
  config: OpenClawConfig
): SkillData[] => {
  const skills: SkillData[] = [];
  try {
    const raw = JSON.parse(config.raw) as Record<string, unknown>;

    // Extract from skills section if present
    const skillsSection = raw.skills as Record<string, unknown> | undefined;
    if (skillsSection && typeof skillsSection === "object") {
      for (const [name, value] of Object.entries(skillsSection)) {
        const skill = value as Record<string, unknown>;
        skills.push({
          name,
          description: (skill.description as string) ?? "",
          enabled: (skill.enabled as boolean) ?? true,
          source: (skill.source as string) ?? "installed",
          path: skill.path as string | undefined,
        });
      }
    }

    // Extract from tools section as fallback
    const toolsSection = raw.tools as Record<string, unknown> | undefined;
    if (
      toolsSection &&
      typeof toolsSection === "object" &&
      skills.length === 0
    ) {
      for (const [name, value] of Object.entries(toolsSection)) {
        if (typeof value === "object" && value !== null) {
          skills.push({
            name,
            description: "",
            enabled: true,
            source: "config",
          });
        }
      }
    }
  } catch {
    // parse error — return empty
  }
  return skills;
};
