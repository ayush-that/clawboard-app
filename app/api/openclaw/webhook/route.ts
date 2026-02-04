import type { NextRequest } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { ChatSDKError } from "@/lib/errors";
import { triggerWebhook } from "@/lib/openclaw/client";
import { getGatewayConfig } from "@/lib/openclaw/settings";

export const POST = async (request: NextRequest) => {
  const body = (await request.json()) as { message?: string };
  const message = body.message ?? "";

  if (!message) {
    return Response.json(
      { success: false, response: "Missing message field" },
      { status: 400 }
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return new ChatSDKError("unauthorized:auth").toResponse();
  }

  const cfg = await getGatewayConfig(session.user.id);
  if (!cfg.isConfigured) {
    return new ChatSDKError("bad_request:openclaw_config").toResponse();
  }

  const result = await triggerWebhook(message, cfg);
  return Response.json(result);
};
