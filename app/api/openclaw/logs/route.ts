import { getRecentLogs } from "@/lib/openclaw/client";

export async function GET() {
  const logs = await getRecentLogs();
  return Response.json(logs);
}
