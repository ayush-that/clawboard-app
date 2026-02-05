import { auth } from "@/app/(auth)/auth";
import { ChatSDKError } from "@/lib/errors";
import { getErrors } from "@/lib/openclaw/client";
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
    const errors = await getErrors(cfg);
    return Response.json(errors);
  } catch (error) {
    console.error("GET /api/openclaw/errors failed:", error);
    return Response.json({ error: "Gateway unreachable" }, { status: 502 });
  }
};
