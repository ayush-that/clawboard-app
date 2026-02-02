import { getCostData } from "@/lib/openclaw/client";

export const GET = async () => {
  const costs = await getCostData();
  return Response.json(costs);
};
