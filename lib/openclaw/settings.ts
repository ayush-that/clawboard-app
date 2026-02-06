import "server-only";

import { getUserSettings } from "@/lib/db/queries";

export type GatewayConfig = {
  gatewayUrl: string;
  gatewayToken: string;
  isConfigured: boolean;
};

const configCache = new Map<
  string,
  { config: GatewayConfig; expires: number }
>();

export function clearGatewayConfigCache(userId: string) {
  configCache.delete(userId);
}

export async function getGatewayConfig(userId: string): Promise<GatewayConfig> {
  const cached = configCache.get(userId);
  if (cached && Date.now() < cached.expires) {
    return cached.config;
  }

  try {
    const settings = await getUserSettings(userId);
    const gatewayUrl =
      settings?.openclawGatewayUrl?.trim() ||
      process.env.OPENCLAW_GATEWAY_URL?.trim() ||
      "";
    const gatewayToken =
      settings?.openclawGatewayToken ||
      process.env.OPENCLAW_GATEWAY_TOKEN ||
      "";

    const config: GatewayConfig = {
      gatewayUrl,
      gatewayToken,
      isConfigured: gatewayUrl.length > 0,
    };
    configCache.set(userId, { config, expires: Date.now() + 30_000 });
    return config;
  } catch {
    // DB failed — still try env vars as last resort
    const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL?.trim() || "";
    return {
      gatewayUrl,
      gatewayToken: process.env.OPENCLAW_GATEWAY_TOKEN || "",
      isConfigured: gatewayUrl.length > 0,
    };
  }
}
