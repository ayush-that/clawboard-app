import { getConfig, patchConfig } from "./config";
import type { GatewaySettings } from "./core";
import type { ChannelConfig, OpenClawConfig } from "./types";

const extractChannelsFromConfig = (config: OpenClawConfig): ChannelConfig[] => {
  const channels: ChannelConfig[] = [];
  try {
    const raw = JSON.parse(config.raw) as Record<string, unknown>;
    const channelsSection = raw.channels as Record<string, unknown> | undefined;
    if (channelsSection && typeof channelsSection === "object") {
      for (const [name, value] of Object.entries(channelsSection)) {
        if (typeof value === "object" && value !== null) {
          const ch = value as Record<string, unknown>;
          channels.push({
            name,
            type: (ch.type as string) ?? name,
            enabled: (ch.enabled as boolean) ?? true,
            settings: ch,
          });
        } else {
          channels.push({
            name,
            type: name,
            enabled: true,
            settings: { value },
          });
        }
      }
    }
  } catch {
    // parse error
  }
  return channels;
};

export const getChannels = async (
  cfg?: GatewaySettings
): Promise<ChannelConfig[]> => {
  try {
    const config = await getConfig(cfg);
    return extractChannelsFromConfig(config);
  } catch {
    return [];
  }
};

export const updateChannel = async (
  name: string,
  settings: Record<string, unknown>,
  hash: string,
  cfg?: GatewaySettings
): Promise<{ success: boolean }> => {
  try {
    await patchConfig({ channels: { [name]: settings } }, hash, cfg);
    return { success: true };
  } catch {
    return { success: false };
  }
};
