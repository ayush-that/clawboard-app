import type { NextRequest } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getConfig, patchConfig } from "@/lib/openclaw/client";
import { getGatewayConfig } from "@/lib/openclaw/settings";

export const GET = async () => {
  const session = await auth();
  const cfg = await getGatewayConfig(session?.user?.id);
  const config = await getConfig(cfg);
  return Response.json(config);
};

export const PATCH = async (request: NextRequest) => {
  try {
    const body = (await request.json()) as {
      patch: Record<string, unknown>;
      hash: string;
    };
    const session = await auth();
    const cfg = await getGatewayConfig(session?.user?.id);
    const result = await patchConfig(body.patch, body.hash, cfg);
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
};
