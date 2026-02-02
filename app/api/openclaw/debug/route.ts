import { getDebugInfo } from "@/lib/openclaw/client";

export const GET = async () => {
  const info = await getDebugInfo();
  return Response.json(info);
};
