import type { NextRequest } from "next/server";
import { auth } from "@/app/(auth)/auth";
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
  const cfg = await getGatewayConfig(session?.user?.id);
  const result = await triggerWebhook(message, cfg);
  return Response.json(result);
};
