import type { NextRequest } from "next/server";
import { getConfig, patchConfig } from "@/lib/openclaw/client";

export const GET = async () => {
  const config = await getConfig();
  return Response.json(config);
};

export const PATCH = async (request: NextRequest) => {
  try {
    const body = (await request.json()) as {
      patch: Record<string, unknown>;
      hash: string;
    };
    const result = await patchConfig(body.patch, body.hash);
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
};
