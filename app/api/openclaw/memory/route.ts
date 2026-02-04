import type { NextRequest } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { addMemory, queryMemory } from "@/lib/openclaw/client";
import { getGatewayConfig } from "@/lib/openclaw/settings";

export const GET = async (request: NextRequest) => {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const session = await auth();
  const cfg = await getGatewayConfig(session?.user?.id);
  const memories = await queryMemory(query, cfg);
  return Response.json(memories);
};

export const POST = async (request: NextRequest) => {
  try {
    const body = (await request.json()) as { text: string };
    const session = await auth();
    const cfg = await getGatewayConfig(session?.user?.id);
    const result = await addMemory(body.text, cfg);
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { success: false, response: String(error) },
      { status: 500 }
    );
  }
};
