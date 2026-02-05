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
    const gatewayUrl = settings?.openclawGatewayUrl?.trim() ?? "";

    return {
      gatewayUrl,
      gatewayToken: settings?.openclawGatewayToken ?? "",
      isConfigured: gatewayUrl.length > 0,
    };
  } catch {
    return { gatewayUrl: "", gatewayToken: "", isConfigured: false };
  }
}
