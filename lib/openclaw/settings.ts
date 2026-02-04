import "server-only";

import { getUserSettings } from "@/lib/db/queries";

export type GatewayConfig = {
  gatewayUrl: string;
  gatewayToken: string;
};

export async function getGatewayConfig(
  userId?: string
): Promise<GatewayConfig> {
  if (userId) {
    try {
      const settings = await getUserSettings(userId);
      if (settings) {
        return {
          gatewayUrl:
            settings.openclawGatewayUrl ||
            process.env.OPENCLAW_GATEWAY_URL ||
            "http://localhost:18789",
          gatewayToken:
            settings.openclawGatewayToken ||
            process.env.OPENCLAW_GATEWAY_TOKEN ||
            "",
        };
      }
    } catch {
      // fall through to env vars
    }
  }

  return {
    gatewayUrl: process.env.OPENCLAW_GATEWAY_URL || "http://localhost:18789",
    gatewayToken: process.env.OPENCLAW_GATEWAY_TOKEN || "",
  };
}
