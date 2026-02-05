import { auth } from "@/app/(auth)/auth";
import { ChatSDKError } from "@/lib/errors";
import { getSessionsList } from "@/lib/openclaw/client";
import { getGatewayConfig } from "@/lib/openclaw/settings";

export const GET = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return new ChatSDKError("unauthorized:auth").toResponse();
  }

  const cfg = await getGatewayConfig(session.user.id);
  if (!cfg.isConfigured) {
    return new ChatSDKError("bad_request:openclaw_config").toResponse();
  }

  try {
    const sessions = await getSessionsList(cfg);
    return Response.json(sessions);
  } catch (error) {
    console.error("GET /api/openclaw/sessions failed:", error);
    return Response.json({ error: "Gateway unreachable" }, { status: 502 });
  }
};
