import type { NextRequest } from "next/server";
import { triggerWebhook } from "@/lib/openclaw/client";

export const POST = async (request: NextRequest) => {
  const body = (await request.json()) as { message?: string };
  const message = body.message ?? "";

  if (!message) {
    return Response.json(
      { success: false, response: "Missing message field" },
      { status: 400 }
    );
  }

  const result = await triggerWebhook(message);
  return Response.json(result);
};
