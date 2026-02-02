import type { NextRequest } from "next/server";
import { queryMemory } from "@/lib/openclaw/client";

export const GET = async (request: NextRequest) => {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const memories = await queryMemory(query);
  return Response.json(memories);
};
