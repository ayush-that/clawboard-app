import { getUsageSummary } from "@/lib/openclaw/client";

export const GET = async () => {
  const summary = await getUsageSummary();
  return Response.json(summary);
};
