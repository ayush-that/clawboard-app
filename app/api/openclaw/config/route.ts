import type { NextRequest } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { ChatSDKError } from "@/lib/errors";
import { getConfig, patchConfig } from "@/lib/openclaw/client";
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
    const config = await getConfig(cfg);
    return Response.json(config);
  } catch (error) {
    return Response.json(
      { error: "Gateway unreachable", message: String(error) },
      { status: 502 }
    );
  }
};

export const PATCH = async (request: NextRequest) => {
  try {
    const body = (await request.json()) as {
      patch: Record<string, unknown>;
      hash: string;
    };
    const session = await auth();
    if (!session?.user?.id) {
      return new ChatSDKError("unauthorized:auth").toResponse();
    }

    const cfg = await getGatewayConfig(session.user.id);
    if (!cfg.isConfigured) {
      return new ChatSDKError("bad_request:openclaw_config").toResponse();
    }

    const result = await patchConfig(body.patch, body.hash, cfg);
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: "Gateway unreachable", message: String(error) },
      { status: 502 }
    );
  }
};
