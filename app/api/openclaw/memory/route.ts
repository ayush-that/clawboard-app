import type { NextRequest } from "next/server";
import { addMemory, queryMemory } from "@/lib/openclaw/client";

export const GET = async (request: NextRequest) => {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const memories = await queryMemory(query);
  return Response.json(memories);
};

export const POST = async (request: NextRequest) => {
  try {
    const body = (await request.json()) as { text: string };
    const result = await addMemory(body.text);
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { success: false, response: String(error) },
      { status: 500 }
    );
  }
};
