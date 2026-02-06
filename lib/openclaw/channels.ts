import { getConfig, patchConfig } from "./config";
import type { GatewaySettings } from "./core";
import type { ChannelConfig, OpenClawConfig } from "./types";

export const extractChannelsFromConfig = (
  config: OpenClawConfig
): ChannelConfig[] => {
  const channels: ChannelConfig[] = [];
  const raw = JSON.parse(config.raw) as Record<string, unknown>;
  const channelsSection = raw.channels as Record<string, unknown> | undefined;

  if (!channelsSection || typeof channelsSection !== "object") {
    return channels;
  }

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

  return channels;
};

export const getChannels = async (
  cfg?: GatewaySettings
): Promise<ChannelConfig[]> => {
  const config = await getConfig(cfg);
  return extractChannelsFromConfig(config);
};

export const updateChannel = async (
  name: string,
  settings: Record<string, unknown>,
  hash: string,
  cfg?: GatewaySettings
): Promise<{ success: boolean }> => {
  return await patchConfig({ channels: { [name]: settings } }, hash, cfg);
};
