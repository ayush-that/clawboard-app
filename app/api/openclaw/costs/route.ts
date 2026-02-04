import { auth } from "@/app/(auth)/auth";
import { getCostData } from "@/lib/openclaw/client";
import { getGatewayConfig } from "@/lib/openclaw/settings";

export const GET = async () => {
  const session = await auth();
  const cfg = await getGatewayConfig(session?.user?.id);
  const costs = await getCostData(cfg);
  return Response.json(costs);
};
