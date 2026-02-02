import { getAgentStatus } from "@/lib/openclaw/client";

export const GET = async () => {
  const status = await getAgentStatus();
  return Response.json(status);
};
