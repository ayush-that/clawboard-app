import { auth } from "@/app/(auth)/auth";
import { getUsageSummary } from "@/lib/openclaw/client";
import { getGatewayConfig } from "@/lib/openclaw/settings";

export const GET = async () => {
  const session = await auth();
  const cfg = await getGatewayConfig(session?.user?.id);
  const summary = await getUsageSummary(cfg);
  return Response.json(summary);
};
