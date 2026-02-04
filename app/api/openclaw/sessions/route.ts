import { auth } from "@/app/(auth)/auth";
import { getSessionsList } from "@/lib/openclaw/client";
import { getGatewayConfig } from "@/lib/openclaw/settings";

export const GET = async () => {
  const session = await auth();
  const cfg = await getGatewayConfig(session?.user?.id);
  const sessions = await getSessionsList(cfg);
  return Response.json(sessions);
};
