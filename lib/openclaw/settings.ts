import "server-only";

import { getUserSettings } from "@/lib/db/queries";

export type GatewayConfig = {
  gatewayUrl: string;
  gatewayToken: string;
  isConfigured: boolean;
};

export async function getGatewayConfig(userId: string): Promise<GatewayConfig> {
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

    return {
      gatewayUrl,
      gatewayToken,
      isConfigured: gatewayUrl.length > 0,
    };
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
