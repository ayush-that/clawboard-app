import { auth } from "@/app/(auth)/auth";
import { getRecentLogs } from "@/lib/openclaw/client";
import { getGatewayConfig } from "@/lib/openclaw/settings";

export async function GET() {
  const session = await auth();
  const cfg = await getGatewayConfig(session?.user?.id);
  const logs = await getRecentLogs(cfg);
  return Response.json(logs);
}
