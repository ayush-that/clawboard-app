import type { NextRequest } from "next/server";
import { getRecentTasks } from "@/lib/openclaw/client";

export const GET = async (request: NextRequest) => {
  const timeRange = request.nextUrl.searchParams.get("range") ?? "24h";
  const tasks = await getRecentTasks(timeRange);
  return Response.json(tasks);
};
