import type { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { ChatSDKError } from "@/lib/errors";
import { getConfig, patchConfig } from "@/lib/openclaw/client";
import { getGatewayConfig } from "@/lib/openclaw/settings";

const patchConfigSchema = z.object({
  patch: z.record(z.unknown()),
  hash: z.string().min(1),
});

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
    console.error("GET /api/openclaw/config failed:", error);
    return Response.json({ error: "Gateway unreachable" }, { status: 502 });
  }
};

export const PATCH = async (request: NextRequest) => {
  try {
    const raw = await request.json();
    const parsed = patchConfigSchema.safeParse(raw);
    if (!parsed.success) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return new ChatSDKError("unauthorized:auth").toResponse();
    }

    const cfg = await getGatewayConfig(session.user.id);
    if (!cfg.isConfigured) {
      return new ChatSDKError("bad_request:openclaw_config").toResponse();
    }

    const result = await patchConfig(parsed.data.patch, parsed.data.hash, cfg);
    return Response.json(result);
  } catch (error) {
    console.error("PATCH /api/openclaw/config failed:", error);
    return Response.json({ error: "Gateway unreachable" }, { status: 502 });
  }
};
