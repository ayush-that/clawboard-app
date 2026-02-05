import type { NextRequest } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { ChatSDKError } from "@/lib/errors";
import { getSessionMessages } from "@/lib/openclaw/client";
import { getGatewayConfig } from "@/lib/openclaw/settings";

export const GET = async (request: NextRequest) => {
  const key = request.nextUrl.searchParams.get("key") ?? "";
  if (!key) {
    return Response.json([], { status: 400 });
  }
  const session = await auth();
  if (!session?.user?.id) {
    return new ChatSDKError("unauthorized:auth").toResponse();
  }

  const cfg = await getGatewayConfig(session.user.id);
  if (!cfg.isConfigured) {
    return new ChatSDKError("bad_request:openclaw_config").toResponse();
  }

  try {
    const messages = await getSessionMessages(key, cfg);
    return Response.json(messages);
  } catch (error) {
    console.error("GET /api/openclaw/sessions/messages failed:", error);
    return Response.json({ error: "Gateway unreachable" }, { status: 502 });
  }
};
