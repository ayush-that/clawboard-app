import type { NextRequest } from "next/server";
import { getSessionMessages } from "@/lib/openclaw/client";

export const GET = async (request: NextRequest) => {
  const key = request.nextUrl.searchParams.get("key") ?? "";
  if (!key) {
    return Response.json([], { status: 400 });
  }
  const messages = await getSessionMessages(key);
  return Response.json(messages);
};
