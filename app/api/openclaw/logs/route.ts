import { auth } from "@/app/(auth)/auth";
import { ChatSDKError } from "@/lib/errors";
import { getRecentLogs } from "@/lib/openclaw/client";
import { getGatewayConfig } from "@/lib/openclaw/settings";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new ChatSDKError("unauthorized:auth").toResponse();
  }

  const cfg = await getGatewayConfig(session.user.id);
  if (!cfg.isConfigured) {
    return new ChatSDKError("bad_request:openclaw_config").toResponse();
  }

  try {
    const logs = await getRecentLogs(cfg);
    return Response.json(logs);
  } catch (error) {
    return Response.json(
      { error: "Gateway unreachable", message: String(error) },
      { status: 502 }
    );
  }
}
