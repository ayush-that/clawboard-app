import { extractSkillsFromConfig, getConfig } from "./config";
import type { GatewaySettings } from "./core";
import type { SkillData } from "./types";

export const getInstalledSkills = async (
  cfg?: GatewaySettings
): Promise<SkillData[]> => {
  const config = await getConfig(cfg);
  return extractSkillsFromConfig(config);
};
