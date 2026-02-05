import type { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { ChatSDKError } from "@/lib/errors";
import { addMemory, queryMemory } from "@/lib/openclaw/client";
import { getGatewayConfig } from "@/lib/openclaw/settings";

const addMemorySchema = z.object({
  text: z.string().min(1),
});

export const GET = async (request: NextRequest) => {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const session = await auth();
  if (!session?.user?.id) {
    return new ChatSDKError("unauthorized:auth").toResponse();
  }

  const cfg = await getGatewayConfig(session.user.id);
  if (!cfg.isConfigured) {
    return new ChatSDKError("bad_request:openclaw_config").toResponse();
  }

  try {
    const memories = await queryMemory(query, cfg);
    return Response.json(memories);
  } catch (error) {
    console.error("GET /api/openclaw/memory failed:", error);
    return Response.json({ error: "Gateway unreachable" }, { status: 502 });
  }
};

export const POST = async (request: NextRequest) => {
  try {
    const raw = await request.json();
    const parsed = addMemorySchema.safeParse(raw);
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

    const result = await addMemory(parsed.data.text, cfg);
    return Response.json(result);
  } catch (error) {
    console.error("POST /api/openclaw/memory failed:", error);
    return Response.json({ error: "Gateway unreachable" }, { status: 502 });
  }
};
