import type { NextRequest } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { ChatSDKError } from "@/lib/errors";
import { getUsageSummary } from "@/lib/openclaw/client";
import { getGatewayConfig } from "@/lib/openclaw/settings";

export const GET = async (_request: NextRequest) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new ChatSDKError("unauthorized:auth").toResponse();
    }

    const cfg = await getGatewayConfig(session.user.id);
    if (!cfg.isConfigured) {
      return new ChatSDKError("bad_request:openclaw_config").toResponse();
    }

    const summary = await getUsageSummary(cfg);
    return Response.json(summary);
  } catch (error) {
    console.error("GET /api/openclaw/usage failed:", error);
    return Response.json({ error: "Gateway unreachable" }, { status: 502 });
  }
};
