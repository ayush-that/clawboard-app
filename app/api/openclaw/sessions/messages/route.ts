import type { NextRequest } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getSessionMessages } from "@/lib/openclaw/client";
import { getGatewayConfig } from "@/lib/openclaw/settings";

export const GET = async (request: NextRequest) => {
  const key = request.nextUrl.searchParams.get("key") ?? "";
  if (!key) {
    return Response.json([], { status: 400 });
  }
  const session = await auth();
  const cfg = await getGatewayConfig(session?.user?.id);
  const messages = await getSessionMessages(key, cfg);
  return Response.json(messages);
};
